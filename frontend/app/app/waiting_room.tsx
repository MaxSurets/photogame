import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import userMachine from '../services/apiclient'
import { useMachine } from '@xstate/react';

export default function App() {
  const [current, send] = useMachine(userMachine)

  const { value, context: { username } } = current

  const FetchNewUserButton = () => (
    <TouchableHighlight style={styles.button} onPress={() => send({ type: 'START' })}>
      <Text style={styles.subtitle}>Start game</Text>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User App!</Text>
      {value === 'waiting' && <FetchNewUserButton />}

      {value === 'loading' && <ActivityIndicator />}

      {value === 'failure' && <Text style={styles.subtitle}>An error occurred :(</Text>}

      {value === 'success' && (
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