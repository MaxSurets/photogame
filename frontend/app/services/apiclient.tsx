import { setup, fromPromise, assign } from 'xstate';
import { checkFirstTimeVisit } from '@/services/storage';
import { CommonActions } from '@react-navigation/native';


function delayedReturn(value, delay): Promise<object> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

function establish_connection(players, isHost, username): Promise<object> {
  // Starts the game by sending the players to the server
  return delayedReturn(players, 1000);

}

const createUserMachine = (navigation) => {
  return setup({
    types: {
      context: {} as {
        isHost: boolean | unknown;
        username: string;
        error: unknown;
        roomNumber: string;
        players: { name: string }[];
        maxRounds: number;
        prompt: string;
        round: number;
        votes_for_round: { [key: string]: string }
        scores: { [key: string]: number },
        conn: object;
        isFirstVisit: boolean;
      }
    },
    actions: {
      navigate: (_, params: { to: string, id?: string | undefined }): any => {
        const { to, ...rest } = params
        if (navigation.isReady()) {
          console.log("Navigating to", params.to)
          navigation.dispatch((state) => {
            const routes = [{ name: params.to, params: rest}];

            return CommonActions.reset({
              ...state,
              routes,
              index: 0,
            });
          });
        }
        else {
          console.log("Navigation not ready")
        }
      },

    },
    actors: {
      sendPlayers: fromPromise(async ({ input }: { input: { players, isHost, username } }) => {
        console.log("Starting or joining game", input)
        const conn = await establish_connection(input.players, input.isHost, input.username);

        return conn;
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
              roomNumber: "1234",  // TODO: Generate room number
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
              { type: 'navigate', params: { to: 'index' } },
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
          START: { target: 'loading' },
        },
      },
      loading: {
        invoke: {
          id: 'start_game',
          src: 'sendPlayers',
          input: ({ context: { players, isHost, username } }) => ({ players, isHost, username }),
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
}

export default createUserMachine