import { View, StyleSheet, Platform, TextInput, Text, Modal } from "react-native";
import { useState } from "react";
import * as Clipboard from 'expo-clipboard';
import { StateMachineContext } from '../services/StateMachineProvider'
import Button from "@/components/Button";
import React from "react";


const renderSnapshotValue = (value) => {
    if (typeof value === "string") {
        return value;
    } else if (typeof value === "object") {
        let s = "";
        Object.keys(value).forEach(key => s += `${key}.${value[key]}`);
        return s;
    }
}

export default function Game() {

    const actor = StateMachineContext.useActorRef();

    const prompt = StateMachineContext.useSelector((state) => state.context.prompt)
    const round = StateMachineContext.useSelector((state) => state.context.round)
    const current = renderSnapshotValue(StateMachineContext.useSelector((snapshot) => snapshot.value))

    console.log("Current", current)


    const renderStep = () => {
        switch (current) {
            case "game.waiting_for_prompt":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white text-2xl">Waiting for prompt</Text>
                        <View className='bouncing-dots' />
                    </View>
                )
            case "game.waiting_for_uploads":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Placeholder for image picker component</Text>
                    </View>
                )
            case "game.waiting_for_votes":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Placeholder for voting component</Text>
                    </View>
                )
            case "game.round_over":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Placeholder for round over component</Text>
                    </View>
                )
        }
        return <Text className="text-white">{current}</Text>
    }

    return (
        <View className="bg-neutral-800 w-full h-full p-4">


            <Text className="text-3xl text-center text-white"> Round {round}</Text>
            <View>
                {renderStep()}
            </View>
            <View>
                <Text>Prompt:</Text>
                <Text> {prompt}</Text>
            </View>
            <View>
                <Text>Upload:</Text>
                <Button label='Upload' onPress={() => actor.send({ type: 'upload' })} />
            </View>


            {/* Simulation buttons */}
            <View className="h-16 overflow-scroll">
                <Button label='Simulate getting prompt' onPress={() => actor.send({ type: 'GET_PROMPT', prompt: "Test prompt" })} />

                <Button label='Simulate uploads done message' onPress={() => actor.send({ type: 'UPLOADS_DONE' })} />

                <Button label='Simulate votes done message' onPress={() => actor.send({ type: 'VOTES_DONE', votes: { Player_1: "Player_2" } })} />

                <Button label='Simulate next round' onPress={() => actor.send({ type: 'NEXT_ROUND' })} />
            </View>
        </View>
    )
}