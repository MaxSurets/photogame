import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import userMachine from '../services/apiclient'
import { useMachine } from '@xstate/react';

import { StateMachineContext } from '../services/StateMachineProvider'


export default function App() {
  const actor = StateMachineContext.useActorRef();
  const current = StateMachineContext.useSelector((snapshot) => snapshot.value)
  const username = StateMachineContext.useSelector((snapshot) => snapshot.context.username)


  const FetchNewUserButton = () => (
    <TouchableHighlight style={styles.button} onPress={() => actor.send({ type: 'START' })}>
      <Text style={styles.subtitle}>Start game</Text>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User App!</Text>
      {current === 'waiting' && <FetchNewUserButton />}

      {current === 'loading' && <ActivityIndicator />}

      {current === 'failure' && <Text style={styles.subtitle}>An error occurred :(</Text>}

      {current === 'success' && (
        <>
          <Text style={styles.joke}>{username}</Text>
          <FetchNewUserButton />
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 18
  },
  button: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  subtitle: {
    fontSize: 16
  },
  joke: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center'
  }

});