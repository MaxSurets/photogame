import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { actor } from "../services/StateMachineProvider";
import { useEffect } from "react"
import "../global.css";

export default function RootLayout() {

  useEffect(() => {
    actor.start()
  }, [actor])

  return (
    // @ts-ignore
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Game" }} />
        <Stack.Screen name="waiting_room/[id]" />
        <Stack.Screen name="game" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
