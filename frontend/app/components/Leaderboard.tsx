import { View, ScrollView, Text } from "react-native";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient';
import Button from "@/components/Button";
import React from "react";
import GameProgressBar from "@/components/GameProgressBar";
import { renderSnapshotValue } from "@/services/utils"


export default function Leaderboard() {

    const prompt = useSelector(actor, (state) => state.context.prompt)
    const round = useSelector(actor, (state) => state.context.round)
    const scores = useSelector(actor, (state) => state.context.scores)

    const sortedScoresList = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, value }));

    return (
        <ScrollView  className="w-3/4 md:w-1/2">
            <View className="divide-y divide-neutral-700 bg-neutral-950 p-4 space-y-4 rounded-2xl">
                <Text className="text-white text-3xl">Leaderboard</Text>
                {sortedScoresList.map((score, i) => {
                    return (
                        <View key={i} className="flex-row items-center justify-between w-full">
                            <Text className="text-white text-2xl">{score.key}</Text>
                            <Text className="text-white text-2xl">{score.value}</Text>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    )
}