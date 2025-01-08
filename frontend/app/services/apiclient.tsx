import { setup, fromPromise, assign } from 'xstate';

function delayedReturn(value, delay): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

async function establish_connection(players, isHost): Promise<string> {
  // Starts the game by sending the players to the server
  return await delayedReturn(players, 1000);

}

const createUserMachine = (navigation) => {
  return setup({
    types: {
      context: {} as {
        isHost: boolean | unknown;
        username: string;
        error: unknown;
        roomNumber: number | undefined;
        players: { name: string }[];
        maxRounds: number;
        prompt: string;
        round: number;
        votes_for_round: { [key: string]: string }
        scores: { [key: string]: number }
      }
    },
    actions: {
      navigate: (_, params: { to: string }): any => {
        if (navigation.isReady()) {
          console.log("Navigating to", params.to)
          navigation.navigate(params.to)
        }
        else {
          console.log("Navigation not ready")
        }
      }
    },
    actors: {
      sendPlayers: fromPromise(async ({ input }: { input: { players, isHost } }): Promise<string> => {
        console.log("Starting/joining game", input)
        const conn = await establish_connection(input.players, input.isHost);

        return conn;
      }),
    },
    guards: {
      check_name: ({ context }) => {
        return context.username.length > 0
      }
    }
  }).createMachine({
    id: 'user',
    initial: 'start_screen',
    context: {
      isHost: undefined,
      username: '',
      error: undefined,
      roomNumber: undefined,
      players: [],
      maxRounds: 3,
      prompt: '',
      round: 0,
      votes_for_round: {},
      scores: {},

    },
    states: {
      start_screen: {
        entry: [{ type: 'navigate', params: { to: 'index' } }],
        on: {
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
      creating_room: {
        on: {
          CREATE: {
            target: 'waiting',
            actions: assign({
              username: ({ event }) => event.username,
            }),
          },
          BACK: {
            target: 'start_screen',
            actions: assign({
              isHost: undefined,
            })
          },
        },
      },
      joining_room: {
        on: {
          JOIN: {
            target: 'waiting',
            actions: assign({
              username: ({ event }) => event.username,
            }),
          },
          BACK: {
            target: 'start_screen',
            actions: assign({
              isHost: undefined,
            })
          },
        },
      },
      waiting: {
        entry: [{ type: 'navigate', params: { to: 'waiting_room' } }],
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
          input: ({ context: { players, isHost } }) => ({ players, isHost }),
          onDone: {
            target: 'game',
            actions: assign({ username: ({ event }) => event.output }),
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
        on: {
          RETRY: { target: 'loading' },
        },
      },
    }
  })
}

export default createUserMachine