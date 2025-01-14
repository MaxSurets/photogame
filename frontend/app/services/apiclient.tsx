import { setup, fromPromise, assign } from 'xstate';
import { checkFirstTimeVisit } from '@/services/storage';
import { router } from 'expo-router';

import { connectWebSocket, makeRequest, startGame, disconnectWebSocket } from './ws-client';
import { createActor } from "xstate";


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
              actor.send({
                type: 'GET_PROMPT',
                prompt: message.prompt,
                round: message.round,
                uploadUrl: message.uploadUrl,
                callbackToken: message.callbackToken,
                players: message.players
              })
            } else if (message.action === 'vote') {
              actor.send({ type: 'UPLOADS_DONE', callbackToken: message.callbackToken })
            } else if (message.action === 'showResults') {
              actor.send({ type: 'VOTES_DONE', votes: message.results })
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
              if (message.round === 1) {
                actor.send({ type: 'PLAYER_START', conn: connection })
              }
              actor.send({
                type: 'GET_PROMPT',
                prompt: message.prompt,
                round: message.round,
                uploadUrl: message.uploadUrl,
                callbackToken: message.callbackToken,
                players: message.players
              })
            } else if (message.action === 'vote') {
              actor.send({ type: 'UPLOADS_DONE', callbackToken: message.callbackToken })
            } else if (message.action === 'showResults') {
              actor.send({ type: 'VOTES_DONE', votes: message.results })
            }
          } catch (err) {
            console.log('Error parsing message:', err);
          }
        };
        const waitForCallbackToken = async () => {
          while (!callbackToken) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          resolve({ connection, roomId, callbackToken });
        };
        waitForCallbackToken();
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
      callbackToken: string;
    }
  },
  actions: {
    navigate: (_, params: { to: string, id?: string | undefined }): any => {
      const { to, ...rest } = params
      console.log("Navigating to", params.to)
      router.replace({ pathname: params.to, params: rest })
    },
    assignVotes: assign(({ context, event }) => {
      console.log("Assigning votes", context, event)
      const players = context.players.map(player => player.id)
      console.log("Players", players)
      const votes_for_round = event.votes
      const scores = context.scores
      let final_scores = Object.assign({}, scores);

      for (const entry of votes_for_round) {
        if (!players.includes(entry.vote)) {
          console.warn(entry.vote, "not in players")
        }
        final_scores[entry.vote] += 1;
      }
      console.log("Final scores", final_scores)

      return {
        votes_for_round: votes_for_round,
        scores: final_scores
      }
    })
  },
  actors: {
    establishConnection: fromPromise(async ({ input }: { input: { players, isHost, username, roomNumber } }) => {
      try {
        console.log("Establishing connection", input)
        const res: any = await establish_connection(input.players, input.isHost, input.username, input.roomNumber);
        console.log("Connection established", res)
        return res;
      } catch (error) {
        console.log("Error establishing connection", error)
        throw error;
      }
    }),
    sendPlayers: fromPromise(async ({ input }: { input: { players, isHost, username, roomNumber, conn, callbackToken } }) => {
      try {
        console.log("Starting or joining game", input)

        await initiateGame(input.conn, input.callbackToken, input.players, input.isHost);
        return input.conn;
      } catch (error) {
        console.log("Error establishing connection", error)
        throw error;
      }
    }),
    upload: fromPromise(async ({ input }: { input: { conn, callbackToken } }) => {
      const body = { action: 'uploadedphoto', taskToken: input.callbackToken }
      console.log("Sending upload message", body)
      const string_body = JSON.stringify(body)
      const result = await input.conn.send(string_body)
      console.log("Result of finishing upload", result)
    }),
    vote: fromPromise(async ({ input }: { input: { conn, callbackToken, username, vote } }) => {
      const body = { action: 'vote', taskToken: input.callbackToken, voter: input.username, vote: input.vote }
      console.log("Sending vote message", body)
      const string_body = JSON.stringify(body)
      const result = await input.conn.send(string_body)
      console.log("Result of finishing vote", result)
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
    uploadUrl: '',
    callbackToken: '',
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
      entry: [{
        type: 'navigate',
        params: ({ context }) => ({ to: 'waiting_room/[id]', id: context.roomNumber })
      }],
      invoke: {
        id: 'establishConnection',
        src: 'establishConnection',
        input: ({ context: { players, isHost, username, roomNumber } }) => ({ players, isHost, username, roomNumber }),
        onDone: {
          actions: [
            assign({
              conn: ({ event }) => event.output.connection,
              roomNumber: ({ event }) => event.output.roomId,
              callbackToken: ({ event }) => event.output.callbackToken
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
        PLAYER_START: {
          target: 'game',
          actions: assign({
            conn: ({ event }) => event.conn
          }),
        },
      },
    },
    loading: {
      invoke: {
        id: 'start_game',
        src: 'sendPlayers',
        input: ({ context: { players, isHost, username, conn, callbackToken } }) => ({ players, isHost, username, conn, callbackToken }),
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
      entry: { type: 'navigate', params: { to: 'game' } },
      initial: 'waiting_for_prompt',
      states: {
        // display_scores: {
        //   after: {
        //     5000: 'waiting_for_prompt'
        //   }
        // },
        waiting_for_prompt: {
          on: {
            GET_PROMPT: {
              target: 'waiting_for_uploads',
              actions: assign({
                prompt: ({ event }) => event.prompt,
                uploadUrl: ({ event }) => event.uploadUrl,
                round: ({ event }) => event.round,
                callbackToken: ({ event }) => event.callbackToken,
                players: ({ event }) => event.players,
                scores: ({ context, event }) => {  // Initialize scores
                  if (Object.keys(context.scores).length > 0) {
                    return context.scores
                  }
                  const players = event.players.map(player => player.id)
                  let scores = {}
                  players.forEach(player => scores[player] = 0)
                  return scores
                }
              }),
            },
          },
        },
        waiting_for_uploads: {
          on: {
            UPLOAD: {
              target: 'uploading'
            },
            UPLOADS_DONE: {
              target: 'waiting_for_votes',
              actions: assign({
                callbackToken: ({ event }) => event.callbackToken
              }),
            },
          },
        },
        uploading: {
          invoke: {
            id: 'upload',
            src: 'upload',
            input: ({ context: { conn, callbackToken } }) => ({ conn, callbackToken }),
          },
          on: {
            UPLOADS_DONE: {
              target: 'waiting_for_votes',
              actions: assign({
                callbackToken: ({ event }) => event.callbackToken
              }),
            },
          }
        },
        waiting_for_votes: {
          on: {
            VOTE: {
              target: 'voting',
            },
            VOTES_DONE: {
              target: 'round_over',
              actions: { type: "assignVotes" }
            },
          },
        },
        voting: {
          invoke: {
            id: 'vote',
            src: 'vote',
            input: ({ context: { conn, callbackToken, username }, event: { vote } }) => ({ conn, callbackToken, username, vote }),
          },
          on: {
            VOTES_DONE: {
              target: 'round_over',
              actions: { type: 'assignVotes' }
            },
          },

        },
        round_over: {
          after: {
            5000: {
              target: 'waiting_for_prompt',
              guard: ({ context }) => {
                return context.round < context.maxRounds
              }
            },
            6000: {
              target: 'game_over',
              guard: ({ context }) => {
                return context.round >= context.maxRounds
              }
            },
          },
          // on: {
          //   NEXT_ROUND: [
          //     {
          //       target: 'waiting_for_prompt',
          //       guard: ({ context }) => {
          //         return context.round < context.maxRounds
          //       }
          //     },
          //     {
          //       target: 'game_over',
          //       guard: ({ context }) => {
          //         return context.round >= context.maxRounds
          //       }
          //     }
          //   ]
          // },
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

export const actor = createActor(stateMachine)