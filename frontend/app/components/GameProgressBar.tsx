import { View, Text } from "react-native";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient'
import { renderSnapshotValue } from "@/services/utils"
import Button from "@/components/Button";
import React from "react";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function GameProgressBar({ }) {
    const current = renderSnapshotValue(useSelector(actor, (snapshot) => snapshot.value))
    const round = useSelector(actor, (state) => state.context.round)

    const progress = () => {
        switch (current) {
            case "game.waiting_for_uploads":
                return "20%"
            case "game.uploading":
                return "40%"
            case "game.waiting_for_votes":
                return "50%"
            case "game.voting":
                return "60%"
            case "game.round_over":
                return "85%"
            case "game.game_over":
                return "100%"
            default:
                return "0%"
        }
    }


    return (
        <View className="flex-0">

            <Text className="text-3xl text-center text-white mb-4"> Round {round}</Text>
            <Text className="sr-only">Steps</Text>

            <View>
                <View className="overflow-hidden rounded-full bg-neutral-800">
                    <View
                        className={`h-3 w-${progress()} rounded-full bg-blue-400`}
                        style={{width: progress()}}
                    />
                </View>

                <View className="mt-4 grid grid-cols-3 text-sm font-medium text-gray-500">
                    <View className="flex items-center justify-start text-blue-400 sm:gap-1.5">
                        <View className="hidden sm:inline">
                            <Text className="text-neutral-300">Upload</Text>
                        </View>
                        <Feather name="upload" size={24} color="white" />
                    </View>

                    <View className="flex items-center justify-center text-blue-400 sm:gap-1.5">
                        <View className="hidden sm:inline">
                            <Text className="text-neutral-300">Vote</Text>
                        </View>
                        <MaterialIcons name="how-to-vote" size={24} color="white" />
                    </View>

                    <View className="flex items-center justify-end sm:gap-1.5">
                        <View className="hidden sm:inline">
                            <Text className="text-neutral-300">Leaderboard</Text>
                        </View>
                        <MaterialIcons name="leaderboard" size={24} color="white" />
                    </View>
                </View>
            </View>
        </View>
    )
}
