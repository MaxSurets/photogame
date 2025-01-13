import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StateMachineMachineProvider } from "../services/StateMachineProvider";
import "../global.css";

export default function RootLayout() {
  return (
    // @ts-ignore
    <>
      <StateMachineMachineProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{title:"Game"}}/>
          <Stack.Screen name="/waiting_room" />
          <Stack.Screen name="/waiting_room/[id]" />
          <Stack.Screen name="game" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </StateMachineMachineProvider>
    </>
  );
}
