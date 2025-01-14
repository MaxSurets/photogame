import { View, Text } from "react-native";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient'
import Button from "@/components/Button";
import React from "react";
import ImagePickerComponent from "@/components/ImagePicker";


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

    const prompt = useSelector(actor, (state) => state.context.prompt)
    const round = useSelector(actor, (state) => state.context.round)
    const uploadUrl = useSelector(actor, (state) => state.context.uploadUrl)
    const current = renderSnapshotValue(useSelector(actor, (snapshot) => snapshot.value))
    const [imageToUpload, setImageToUpload] = React.useState<File | null>(null);

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
                        <Text className="text-white">Prompt: {prompt}</Text>
                        <Text className="text-white">Upload URL: {uploadUrl}</Text>
                        <ImagePickerComponent 
                            onImageSelected={(image) => setImageToUpload(image)} 
                        />
                    </View>
                )
            case "game.waiting_for_votes":
                return (
                    <View className="items-center justify-center p-6 space-y-10">
                        <Text className="text-white">Prompt: {prompt}</Text>
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
                <Button
                    label="Upload"
                    onPress={async () => {
                        if (!imageToUpload || !uploadUrl) {
                            console.error("Image or upload URL not available");
                            return;
                        }

                        try {
                            console.log("Uploading photo to", uploadUrl);

                            const response = await fetch(uploadUrl, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': imageToUpload.type
                                },
                                body: imageToUpload, 
                            });

                            if (response.ok) {
                                console.log("Photo uploaded successfully");
                                actor.send({ type: 'UPLOAD_SUCCESS' });
                            } else {
                                console.error("Failed to upload photo", response.statusText);
                                actor.send({ type: 'UPLOAD_FAILURE' });
                            }
                        } catch (error) {
                            console.error("Error uploading photo:", error);
                            actor.send({ type: 'UPLOAD_FAILURE' });
                        }
                    }}
                />
            </View>


            {/* Simulation buttons */}
            <View className="h-32 overflow-scroll">
                {/* <Button label='Simulate getting prompt' onPress={() => actor.send({ type: 'GET_PROMPT', prompt: "Test prompt" })} />
                <Button label='Simulate uploads done message' onPress={() => actor.send({ type: 'UPLOADS_DONE' })} /> */}


                <Button label='Vote for p2' onPress={() => actor.send({ type: 'VOTE', vote: "p2" })} />
                <Button label='Simulate votes done message' onPress={() => actor.send({ type: 'VOTES_DONE', votes: { p1: "p2" } })} />

                <Button label='Simulate next round' onPress={() => actor.send({ type: 'NEXT_ROUND' })} />
            </View>
        </View>
    )
}