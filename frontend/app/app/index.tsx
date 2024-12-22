import { View, StyleSheet, Platform, TextInput, Text } from "react-native";
import { useState, useRef } from "react";
import * as Clipboard from 'expo-clipboard';
// import { connectWebSocket } from "../services/apiclient"


import Button from "@/components/Button";

export default function Index() {
  const [roomNumber, setRoomNumber] = useState<string>("");


  let ws;

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(roomNumber);
  };


  const generateRoomNumber = () => {
    let roomNumber = Math.floor(Math.random() * 1000000)
    setRoomNumber(roomNumber.toString())
  }

  const joinRoomUsingNumber = async () => {
    // await connectWebSocket(roomNumber)
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
            onPress={generateRoomNumber}
          />
        </View>
        <Text style={{}}>--OR--</Text>
        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: "center", backgroundColor: "#fff", height: "50%", width: "100%" }}>
          <TextInput
            placeholder='Enter Room ID'
            style={{
              // Center text
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
