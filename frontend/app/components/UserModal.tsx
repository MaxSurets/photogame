import { View, TextInput, Text } from "react-native";
import React, { useState } from "react";
import { actor } from '@/services/apiclient'
import { useSelector } from '@xstate/react';
import Button from "@/components/Button";
import StyledModal from "@/components/StyledModal";

export default function UserModal() {

    const current = useSelector(actor, (snapshot) => snapshot.value)

    const [name, setName] = useState<string>("");

    return (
        <StyledModal
            show={current === 'creating_room' || current === 'joining_room'}>
            <View className="flex-col justify-between items-center bg-stone-900 p-4 sm:p-16 w-7/8 md:w-2/3 md:h-1/2 max-h-96 max-w-80 rounded-lg m-auto outline outline-1 outline-offset-2 outline-stone-700">
                <Text className="color-neutral-400 p-2">Enter your name:</Text>
                <TextInput
                    className="input w-60"
                    onChangeText={setName}
                    value={name}
                    placeholder="ex: jiwonie11"
                />
                <Button
                    label="Next"
                    size="md"
                    onPress={() => actor.send({ type: 'NEXT', username: name })}
                // TODO: Disable when username invalid
                />
                <Button
                    label="Cancel"
                    size="md"
                    onPress={() => actor.send({ type: 'BACK' })}
                />
            </View>
        </StyledModal>
    )
}