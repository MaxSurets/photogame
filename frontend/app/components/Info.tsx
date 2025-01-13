import { View, Text } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import React from "react";

import TutorialModal from "@/components/TutorialModal";

export default function Info() {
    return (
        <View className="flex-row justify-end">
            {/* <View className="w-full">
            </View> */}
            <View className="">
                <Feather name="info" size={24} color="white" onPress={() => console.log("wah")} />
            </View>
        </View>
    );
}