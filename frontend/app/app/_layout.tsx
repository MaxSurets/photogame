import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StateMachineMachineProvider } from "../services/StateMachineProvider";

export default function RootLayout() {
  return (
    // @ts-ignore
    <>
      <StateMachineMachineProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </StateMachineMachineProvider>
    </>
  );
}
