import { View, StyleSheet, Platform, TextInput, Text, Modal } from "react-native";
import { useState } from "react";
import * as Clipboard from 'expo-clipboard';
import { StateMachineContext } from '../services/StateMachineProvider'
import Button from "@/components/Button";

export default function Index() {

  const actor = StateMachineContext.useActorRef();
  const isHost = StateMachineContext.useSelector((state) => state.context.isHost)
  const current = StateMachineContext.useSelector((snapshot) => snapshot.value)

  const [roomNumber, setRoomNumber] = useState<string>("");
  const [name, setName] = useState<string>("");

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(roomNumber);
  };

  const generateRoomNumber = () => {
    let roomNumber = Math.floor(Math.random() * 1000000)
    setRoomNumber(roomNumber.toString())
  }

  const joinRoomUsingNumber = async () => {
    // TODO: Check room number
    actor.send({ type: 'JOIN_ROOM', roomNumber: roomNumber })
  }


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "column", alignItems: 'center', height: "100%", width: "100%", justifyContent: "center" }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center", backgroundColor: "#ffffff0d", height: "50%", width: "100%" }}>
          {/* <TextInput
            editable={false}
            value={roomNumber} /> */}
          {/* <Button
            label='Copy 🔗'
            onPress={copyToClipboard}
          /> */}
          <Button
            theme="primary"
            label="Create Room 🪄"
            onPress={() => actor.send({ type: 'CREATE_ROOM' })}
          />
        </View>

        {current === 'creating_room' && (
          <Modal>
            <View>
              <Text>Enter your name</Text>
              <TextInput
                onChangeText={setName}
                value={name}
                placeholder="ex: jiwonie11"
              />
              <Button
                theme="primary"
                label="Next"
                onPress={() => actor.send({ type: 'CREATE', username: name })}
              // TODO: Disable when username invalid
              />
              <Button
                theme="primary"
                label="Cancel"
                onPress={() => actor.send({ type: 'BACK' })}
              />
            </View>
          </Modal>
        )}


        <Text style={{}}>--OR--</Text>

        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: "center", backgroundColor: "#fff", height: "50%", width: "100%" }}>
          <TextInput
            placeholder='Enter Room ID'
            style={{
              textAlign: "center",
              padding: 10,
              borderColor: "gray"
            }}
          />
          <Button
            theme="primary"
            label="Join Room 🚀"
            onPress={joinRoomUsingNumber}
          />
        </View>

        {current === 'joining_room' && (
          <Modal>
            <View>
              <Text>Enter your name</Text>
              <TextInput
                onChangeText={setName}
                value={name}
                placeholder="ex: jiwonie11"
              />
              <Button
                theme="primary"
                label="Next"
                onPress={() => actor.send({ type: 'JOIN', username: name })}
              // TODO: Disable when username invalid
              />
              <Button
                theme="primary"
                label="Cancel"
                onPress={() => actor.send({ type: 'BACK' })}
              />
            </View>
          </Modal>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
