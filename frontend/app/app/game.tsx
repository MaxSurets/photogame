import { View, Text } from "react-native";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient'
import Button from "@/components/Button";
import React from "react";
import GameProgressBar from "@/components/GameProgressBar";
import { renderSnapshotValue } from "@/services/utils"
import GameImageUpload from "@/components/GameImageUpload";


export default function Game() {

    const prompt = useSelector(actor, (state) => state.context.prompt)
    // const round = useSelector(actor, (state) => state.context.round)
    const uploadUrl = useSelector(actor, (state) => state.context.uploadUrl)
    let current = renderSnapshotValue(useSelector(actor, (snapshot) => snapshot.value))

    console.log("Current", current)


    current = "game.waiting_for_uploads"

    const renderStep = () => {
        switch (current) {
            case "game.waiting_for_prompt":
                return (
                    <View className="flex-col items-center justify-center p-6 space-y-10">
                        <Text className="text-white text-2xl">Waiting for a prompt</Text>
                        <View className='bouncing-dots' />
                    </View>
                )
            case "game.waiting_for_uploads":
                return (
                    <View className="items-center justify-between space-y-4 h-full">
                        <Text className="text-white text-2xl">Prompt: {prompt}</Text>
                        {/* <Text className="text-white">Placeholder for image picker component</Text> */}
                        <GameImageUpload />

                    </View>
                )
            case "game.uploading":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Prompt: {prompt}</Text>
                        <Text className="text-white">Upload URL: {uploadUrl}</Text>
                        <Text className="text-white">Waiting for uploads</Text>
                    </View>
                )
            case "game.waiting_for_votes":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Prompt: {prompt}</Text>
                        <Text className="text-white">Vote here</Text>
                        <Button label='Vote for p2' onPress={() => actor.send({ type: 'VOTE', vote: "p2" })} />
                    </View>
                )
            case "game.voting":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Prompt: {prompt}</Text>
                        <Text className="text-white">Waiting for votes</Text>
                    </View>
                )
            case "game.round_over":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Round over</Text>
                    </View>
                )
            case "game.game_over":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Game over</Text>
                        <Text className="text-white">Winner: (put winner here)</Text>
                    </View>
                )
            default:
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Unknown state: {current}</Text>
                    </View>
                )
        }
    }

    return (
        <View className="flex-1 bg-neutral-900 w-full h-full p-4">

            {/* Header */}
            <GameProgressBar />

            <View className="h-4/5">
                {renderStep()}

            </View>


            {/* Simulation buttons */}
            {/* <View className="h-32 overflow-scroll">
                <Button label='Simulate getting prompt' onPress={() => actor.send({ type: 'GET_PROMPT', prompt: "Test prompt" })} />
                <Button label='Simulate uploads done message' onPress={() => actor.send({ type: 'UPLOADS_DONE' })} />

                <Button label='Simulate votes done message' onPress={() => actor.send({ type: 'VOTES_DONE', votes: { p1: "p2" } })} />

                <Button label='Simulate next round' onPress={() => actor.send({ type: 'NEXT_ROUND' })} />
            </View> */}
        </View>
    )
}