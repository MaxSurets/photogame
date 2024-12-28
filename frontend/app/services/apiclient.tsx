import { setup, fromPromise, assign } from 'xstate';

function delayedReturn(value, delay): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

async function example(id): Promise<string> {
  return await delayedReturn('Hello World!', 1000);

}

const createUserMachine = (navigation) => {
  return setup({
    types: {
      context: {} as {
        isHost: boolean | unknown;
        username: string;
        error: unknown;
        roomNumber: number | undefined;
      }
    },
    actions: {
      navigate: (_, params: { to: string }): any => {
        console.log("Navigating to", params.to)
        navigation.navigate(params.to)
      }
    },
    actors: {
      fetchUser: fromPromise(async ({ input }: { input: { username } }): Promise<string> => {
        const user = await example(input.username);

        return user;
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
    },
    states: {
      start_screen: {
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
          START: { target: 'loading' },
        },
      },
      loading: {
        invoke: {
          id: 'getUser',
          src: 'fetchUser',
          input: ({ context: { username } }) => ({ username }),
          onDone: {
            target: 'success',
            actions: assign({ username: ({ event }) => event.output }),
          },
          onError: {
            target: 'failure',
            actions: assign({ error: ({ event }) => event.error }),
          },
        },
      },
      success: {},
      failure: {
        on: {
          RETRY: { target: 'loading' },
        },
      },
    }
  })
}

export default createUserMachine