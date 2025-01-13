import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { actor } from '@/services/apiclient'
import { useSelector } from '@xstate/react';
import Button from "@/components/Button";
import { useLocalSearchParams } from 'expo-router';
import UserModal from "@/components/UserModal";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';


export default function App() {
  const current = useSelector(actor, (snapshot) => snapshot.value)
  const players = useSelector(actor, (snapshot) => snapshot.context.players)
  const isHost = useSelector(actor, (snapshot) => snapshot.context.isHost)
  const roomNumber = useSelector(actor, (snapshot) => snapshot.context.roomNumber)
  const { id } = useLocalSearchParams<{ id: string }>();

  const renderPlayers = (players) => {
    console.log("p", players)
    return (
      players.map((player: { username: string }, i) => {
        return (
          <View key={i} className="h-24 w-24 m-2 bg-neutral-700 outline outline-1 outline-neutral-600 rounded-xl flex-col justify-center items-center space-y-2">

            <FontAwesome name="user-o" size={24} color="black" />
            <Text className="text-white">{player.id}</Text>

          </View>
        )
      })
    )
  }

  useEffect(() => {
    if (current === 'start') {
      actor.send({ type: 'JOIN_ROOM', roomNumber: id })
    }
  }, [current]);

  return (
    <>
      <UserModal />


      <View className="flex-1 bg-neutral-800 items-center justify-center p-6 space-y-10">
        <View className='bouncing-dots' />

        <Text className="color-white text-3xl text-center font-semibold">Waiting for players</Text>
        <Text className="color-neutral-200 text-base text-center">The host will start the game soon. Share the link to this room with other players by pressing the button below.</Text>

        <View className="flex-row justify-center items-center bg-neutral-900 w-full p-4 rounded-xl space-x-3">
          <Text className="text-white text-lg">Room ID</Text>
          <TextInput
            aria-disabled
            value={roomNumber}
            onPress={async () => {
              console.log("Copying room ID")
              await Clipboard.setStringAsync(roomNumber)
            }}
            className="input w-20 text-lg"
          />
          <Button
            label="Share"
            size="sm"
            className="bg-neutral-800"
            icon={<FontAwesome name="share" size={16} color="white" />}
            onPress={async () => {
              if (await Sharing.isAvailableAsync()) {
                console.log("Sharing is available")
                await Sharing.shareAsync(roomNumber)
              } else {
                await Clipboard.setStringAsync(roomNumber)
              }
              console.log("Sharing link")

            }} />
        </View>

        {/* Simulate player joining */}
        <Button
          label="Join"
          onPress={() => {
            let player = { username: `Player_${Math.floor(Math.random() * 10)}` }
            actor.send({ type: 'PLAYER_JOIN', player: player })
          }}
        />


        {(current === 'waiting' && isHost === true) && <View>
          <Text className="text-white text-center mb-2">{players.length} players joined</Text>
          <View className="h-72 w-full flex-row flex-wrap justify-evenly items-center mx-auto overflow-y-scroll">
            {renderPlayers(players)}
          </View>
          <Button
            label="Start Game"
            size="lg"
            className="bg-neutral-900"
            onPress={() => actor.send({ type: 'HOST_START' })}
          />
        </View>}

        {current === 'loading' && <ActivityIndicator />}

        {current === 'failure' && <Text>An error occurred :(</Text>}


        {/* <LoadingDots bounceHeight={12} dots={1} colors={["#fff", "#fff", "#fff"]}/> */}


        <StatusBar style="auto" />
      </View>
    </>
  );
}
