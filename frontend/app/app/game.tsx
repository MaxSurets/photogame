import { View, ScrollView, Text } from "react-native";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient';
import Button from "@/components/Button";
import React from "react";
import GameProgressBar from "@/components/GameProgressBar";
import { renderSnapshotValue } from "@/services/utils"
import GameImageUpload from "@/components/GameImageUpload";
import GameImageOption from "@/components/GameImageOption";
import Leaderboard from "@/components/Leaderboard";


export default function Game() {

    const prompt = useSelector(actor, (state) => state.context.prompt)
    // const round = useSelector(actor, (state) => state.context.round)
    const round = useSelector(actor, (state) => state.context.round)
    const players = useSelector(actor, (state) => state.context.players)
    const roomNumber = useSelector(actor, (state) => state.context.roomNumber)
    const scores = useSelector(actor, (state) => state.context.scores)
    const current = renderSnapshotValue(useSelector(actor, (snapshot) => snapshot.value))


    const renderImages = () => {
        return players.map((player, i) => {
            return (
                <GameImageOption
                    playerId={player.id}
                    roomNumber={roomNumber}
                    roundNumber={round}
                    key={i}
                />
            )
        })
    }

    const getWinner = () => {
        const filtered_scores = Object.values(scores).filter(score => !Number.isNaN(score))
        const max = Math.max(...filtered_scores)
        console.log(max)
        const winners = Object.keys(scores).filter(key => scores[key] === max)
        console.log(winners)
        return (
            <View>
                <Text className="text-center text-3xl font-medium">{`Congrats to our winner${winners.length > 1 ? "s" : ""}!`}</Text>
                {winners.map((winner, i) => <Text key={i} className="text-6xl text-center font-extrabold">{winner}</Text>)}
            </View>
        )
    }

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
                    <View className="flex-col items-center justify-center h-4/5 space-y-16">
                        <Text className="text-white text-2xl">Waiting for other users</Text>
                        <View className='bouncing-dots' />
                    </View>
                )
            case "game.waiting_for_votes":
                return (
                    <View className="h-full items-center justify-center p-6">
                        <ScrollView className="h-5/6 space-y-10">
                            {renderImages()}
                        </ScrollView>

                        <Button
                            size="lg"
                            label='Skip vote'
                            onPress={() => actor.send({ type: 'VOTE', vote: null })}
                        />
                    </View>
                )
            case "game.voting":
                return (
                    <View className="items-center justify-center h-4/5 space-y-10">
                        <Text className="text-white text-2xl">Waiting for other users</Text>
                        <View className='bouncing-dots' />
                    </View>
                )
            case "game.round_over":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white text-3xl font-light">Round over</Text>
                        <Leaderboard />
                    </View>
                )
            case "game.game_over":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white text-3xl font-light">Game over</Text>
                        <Text className="text-white">{getWinner()}</Text>
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