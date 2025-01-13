import { View, TextInput, Text } from "react-native";
import React, { useState } from "react";
import { actor } from '../services/StateMachineProvider'
import { useSelector } from '@xstate/react';
import Button from "@/components/Button";
import Info from "@/components/Info";
import TutorialModal from "@/components/TutorialModal";
import StyledModal from "@/components/StyledModal";
import UserModal from "@/components/UserModal";

export default function Index() {

  const isFirstVisit = useSelector(actor, (state) => state.context.isFirstVisit)
  const current = useSelector(actor, (snapshot) => snapshot.value)

  const [roomNumber, setRoomNumber] = useState<string>("");
  const [name, setName] = useState<string>("");

  console.log("Current", current)

  const joinRoomUsingNumber = async () => {
    // TODO: Check room number
    if (roomNumber === "") {
      alert("Please enter a room number")
      return
    }
    actor.send({ type: 'JOIN_ROOM', roomNumber: roomNumber })
  }

  return (
    <>
      <UserModal />
      <TutorialModal show={isFirstVisit} />

      <View className="flex-1 flex-col bg-[#25292e]">
        <View className="flex-col items-center justify-center h-full w-full">
          <View className="flex-row items-center justify-center bg-neutral-900 h-1/2 w-full">
            <Button
              label="Create Room 🪄"
              size="md"
              className="bg-neutral-800"
              onPress={() => actor.send({ type: 'CREATE_ROOM' })}
            />
          </View>

          <View className="flex-column items-center justify-center bg-neutral-800 h-1/2 w-full">
            <TextInput
              placeholder='Enter Room ID'
              onChangeText={setRoomNumber}
              className="input w-60"
            />
            <Button
              label="Join Room 🚀"
              size="md"
              className="bg-neutral-900"
              onPress={joinRoomUsingNumber}
            />
          </View>


        </View>

      </View>
    </>
  );
}
