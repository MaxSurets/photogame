import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { StateMachineContext } from '../services/StateMachineProvider'
import Button from "@/components/Button";


export default function App() {
  const actor = StateMachineContext.useActorRef();
  const current = StateMachineContext.useSelector((snapshot) => snapshot.value)
  const username = StateMachineContext.useSelector((snapshot) => snapshot.context.username)
  const isHost = StateMachineContext.useSelector((snapshot) => snapshot.context.isHost)
  const players = StateMachineContext.useSelector((snapshot) => snapshot.context.players)


  const FetchNewUserButton = () => (
    <TouchableHighlight style={styles.button} onPress={() => actor.send({ type: 'START' })}>
      <Text style={styles.subtitle}>Start game</Text>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for users to join</Text>

      {/* Simulate player joining */}
      <Button
        label="Join"
        onPress={() => {
          let player = {username: `Player_${Math.floor(Math.random() * 10)}`}
          actor.send({ type: 'PLAYER_JOIN', player: player })
        }}
      />

      <Text style={styles.subtitle}>{players.length} players joined</Text>

      <Text style={styles.subtitle}>{players.toString()}</Text>

      {current === 'waiting' && <FetchNewUserButton />}

      {current === 'loading' && <ActivityIndicator />}

      {current === 'failure' && <Text style={styles.subtitle}>An error occurred :(</Text>}

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