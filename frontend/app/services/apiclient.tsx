import { setup, fromPromise, assign } from 'xstate';
import { checkFirstTimeVisit } from '@/services/storage';
import { router } from 'expo-router';

import { connectWebSocket, makeRequest, startGame, disconnectWebSocket } from './ws-client';
import { actor } from './StateMachineProvider';

function delayedReturn(value, delay): Promise<object> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

function establish_connection(players, isHost, username, roomNumber = null): Promise<object> {
  return new Promise(async (resolve, reject) => {
    try {
      let connection;
      let roomId = null;
      let callbackToken = null;

      if (isHost) {
        connection = await connectWebSocket(username);
        connection.onmessage = (event) => {
          console.log("Host event", event)
          try {
            const message = JSON.parse(event.data);
            if (message.room) {
              roomId = message.room;
              players.push({ id: username, connectionId: message.hostConnId });
            }
            if (message.action === 'playerJoined') {
              console.log("Player joined", message.player)
              actor.send({ type: 'PLAYER_JOIN', player: message.player })
            } else if (message.action === 'startRound') {
              actor.send({ type: 'GET_PROMPT', prompt: message.prompt, round: message.round, uploadUrl: message.uploadUrl })
            }
            if (message.callbackToken) {
              callbackToken = message.callbackToken;
            }
          } catch (err) {
            console.log('Error parsing message:', err);
          }
        };

        const waitForRoom = async () => {
          while (!roomId || !callbackToken) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          resolve({ connection, roomId, callbackToken });
        };
        waitForRoom();
      } else {
        if (!roomNumber) return reject(new Error('Room ID is required to join as a player.'));
        connection = await connectWebSocket(username, roomNumber);
        connection.onmessage = (event) => {
          console.log("Player event", event)
          try {
            const message = JSON.parse(event.data);
            if (message.callbackToken) {
              callbackToken = message.callbackToken;
            }
            if (message.action === 'startRound') {
              actor.send({ type: 'PLAYER_START' })
              actor.send({ type: 'GET_PROMPT', prompt: message.prompt, round: message.round, uploadUrl: message.uploadUrl })
            }
          } catch (err) {
            console.log('Error parsing message:', err);
          }
        };
        // const waitForCallbackToken = async () => {
        //   while (!callbackToken) {
        //     await new Promise((resolve) => setTimeout(resolve, 100));
        //   }
        //   resolve({ connection, callbackToken });
        // };
        // waitForCallbackToken();
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function initiateGame(connection, callbackToken, players, isHost) {
  if (!isHost) throw new Error('Only the host can start the game.');
  if (!callbackToken) throw new Error('Callback token is required to start the game.');
  console.log("players: ", players)
  if (!players || players.length < 1) throw new Error('More than one player is required to start the game.');
  await startGame(connection, callbackToken, players);
  return { success: true, message: 'Game started successfully.' };
}

const stateMachine = setup({
  types: {
    context: {} as {
      isHost: boolean | unknown;
      username: string;
      error: unknown;
      roomNumber: string;
      players: { id: string }[];
      maxRounds: number;
      prompt: string;
      round: number;
      votes_for_round: { [key: string]: string };
      scores: { [key: string]: number };
      conn: object;
      isFirstVisit: boolean;
      uploadUrl: string;
    }
  },
  actions: {
    navigate: (_, params: { to: string, id?: string | undefined }): any => {
      const { to, ...rest } = params
      console.log("Navigating to", params.to)
      router.replace({ pathname: params.to, params: rest })
    },
    upload: (context: { conn }, params): any => {
      context.conn.send(JSON.stringify({ action: 'uploadedphoto' }))
    }

  },
  actors: {
    establishConnection: fromPromise(async ({ input }: { input: { players, isHost, username, roomNumber } }) => {
      try {
        console.log("Establishing connection", input)
        const conn: any = await establish_connection(input.players, input.isHost, input.username, input.roomNumber);
        console.log("Connection established", conn)
        return conn;
      } catch (error) {
        console.log("Error establishing connection", error)
        throw error;
      }
    }),
    sendPlayers: fromPromise(async ({ input }: { input: { players, isHost, username, roomNumber, conn } }) => {
      try {
        console.log("Starting or joining game", input)

        await initiateGame(input.conn.connection, input.conn.callbackToken, input.players, input.isHost);
        return input.conn;
      } catch (error) {
        console.log("Error establishing connection", error)
        throw error;
      }
    }),
    checkFirstTimeVisit: fromPromise(async (): Promise<boolean> => {
      const isFirstVisit = await checkFirstTimeVisit();
      return isFirstVisit
    })
  },
  guards: {
    check_name: ({ context }) => {
      return context.username.length > 0
    }
  }
}).createMachine({
  id: 'user',
  context: {
    isHost: undefined,
    username: '',
    error: undefined,
    roomNumber: '',
    players: [],
    maxRounds: 3,
    prompt: '',
    round: 0,
    votes_for_round: {},
    scores: {},
    conn: {},
    isFirstVisit: false,
    uploadUrl: ''
  },
  initial: 'start',
  states: {
    start: {
      // entry: [{ type: 'navigate', params: { to: 'index' } }],
      invoke: {
        id: 'checkFirstTimeVisit',
        src: 'checkFirstTimeVisit',
        onDone: {
          actions: assign({
            isFirstVisit: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
      on: {
        SKIP_TUTORIAL: {
          // target: 'start',
          actions: assign({
            isFirstVisit: false,
          })
        },
        CREATE_ROOM: {
          target: 'creating_room',
          actions: assign({
            isHost: true,
          })
        },
        JOIN_ROOM: {
          target: 'joining_room',
          actions: assign({
            roomNumber: ({ event }) => event.roomNumber,
            isHost: false,
          }),
        },
      },
    },
    tutorial: {
      initial: 'one',
      states: {
        one: {
          on: {
            NEXT: 'two',
          }
        },
        two: {
          type: 'final',
        },
      },
      onDone: {
        target: 'start',
      },
      on: {
        SKIP: {
          target: 'start',
          actions: assign({
            isFirstVisit: false,
          })
        }
      }
    },
    creating_room: {
      on: {
        NEXT: {
          target: 'waiting',
          actions: assign({
            username: ({ event }) => event.username,
            roomNumber: "",  // TODO: Generate room number
          }),
        },
        BACK: {
          target: 'start',
          actions: assign({
            isHost: undefined,
          })
        },
      },
    },
    joining_room: {
      on: {
        NEXT: {
          target: 'waiting',
          actions: assign({
            username: ({ event }) => event.username,
          }),
        },
        BACK: {
          target: 'start',
          actions: [
            { type: 'navigate', params: { to: '' } },
            assign({ isHost: undefined, roomNumber: '' }),
          ]
        },
      },
    },
    waiting: {
      // entry: [{
      //   type: 'navigate',
      //   params: ({ context }) => ({ to: 'waiting_room/[id]', id: context.roomNumber })
      // }],
      invoke: {
        id: 'establishConnection',
        src: 'establishConnection',
        input: ({ context: { players, isHost, username, roomNumber } }) => ({ players, isHost, username, roomNumber }),
        onDone: {
          actions: [
            assign({
              conn: ({ event }) => event.output,
              roomNumber: ({ event }) => event.output.roomId
            }),
            {
              type: 'navigate',
              params: ({ context }) => ({ to: 'waiting_room/[id]', id: context.roomNumber })
            }
          ]
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
      on: {
        PLAYER_JOIN: {
          actions: assign({
            players: ({ context, event }) => {
              console.log("Player joined", event.player)
              console.log("Current players", context.players)
              return [...context.players, event.player]
            }
          })
        },
        HOST_START: { target: 'loading' },
        PLAYER_START: { target: 'game' },
      },
    },
    loading: {
      invoke: {
        id: 'start_game',
        src: 'sendPlayers',
        input: ({ context: { players, isHost, username, conn } }) => ({ players, isHost, username, conn }),
        onDone: {
          target: 'game',
          actions: assign({ conn: ({ event }) => event.output }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    game: {
      entry: [{ type: 'navigate', params: { to: 'game' } }],
      initial: 'waiting_for_prompt',
      states: {
        display_scores: {
          after: {
            5000: 'waiting_for_prompt'
          }
        },
        waiting_for_prompt: {
          on: {
            GET_PROMPT: {
              target: 'waiting_for_uploads',
              actions: assign({
                prompt: ({ event }) => event.prompt,
                uploadUrl: ({ event }) => event.uploadUrl,
                round: ({ context }) => context.round + 1,
              }),
            },
          },
        },
        waiting_for_uploads: {
          on: {
            UPLOADS_DONE: {
              target: 'waiting_for_votes',
            },
          },
        },
        waiting_for_votes: {
          on: {
            VOTES_DONE: {
              target: 'round_over',
              actions: assign({
                votes_for_round: ({ event }) => event.votes,
                scores: ({ event, context }) => {
                  const players = Object.values(context.players).map(player => player.name)
                  const votes_for_round = event.votes
                  const scores = context.scores
                  let final_scores = {}
                  for (const player of players) {
                    const votes_for_player = votes_for_round[player] ?? []
                    const player_score = scores[player] ?? 0
                    final_scores[player] = player_score + votes_for_player.length
                  }
                  return final_scores
                },
              }),
            },
          },
        },
        round_over: {
          on: {
            NEXT_ROUND: [
              {
                target: 'display_scores',
                guard: ({ context }) => {
                  return context.round < context.maxRounds
                }
              },
              {
                target: 'game_over',
                guard: ({ context }) => {
                  return context.round >= context.maxRounds
                }
              }
            ]
          },
        },
        game_over: {}
      },
    },
    failure: {
      // on: {
      //   RETRY: { target: 'asd' },
      // },
    },
  }
})

export default stateMachine