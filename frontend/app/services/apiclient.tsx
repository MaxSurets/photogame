import { setup, createActor, fromPromise, assign } from 'xstate';

const fetchUser = (userId: string) =>
  fetch(`https://example.com/${userId}`).then((response) => response.text());

function delayedReturn(value, delay): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

async function example(id): Promise<string> {
  return await delayedReturn("Hello World!", 1000);

}


const userMachine = setup({
  types: {
    context: {} as {
      userId: string;
      username: string;
      error: unknown;
    },
  },
  actors: {
    fetchUser: fromPromise(async ({ input }: { input: { userId } }): Promise<string> => {
      const user = await example(input.userId);

      return user;
    }),
  },
}).createMachine({
  id: 'user',
  initial: 'waiting',
  context: {
    userId: '42',
    username: "",
    error: undefined,
  },
  states: {
    waiting: {
      on: {
        START: { target: 'loading' },
      },
    },
    loading: {
      invoke: {
        id: 'getUser',
        src: 'fetchUser',
        input: ({ context: { userId } }) => ({ userId }),
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
  },
})

export default userMachine