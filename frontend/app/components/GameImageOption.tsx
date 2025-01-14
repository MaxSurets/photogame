import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import StyledModal from "./StyledModal";
import Button from "./Button";

import { actor } from '@/services/apiclient';

export default function GameImageOption({ roomNumber, roundNumber, playerId }) {

    const [showModal, setShowModal] = useState(false);

    const vote = () => {
        console.log("Voted")
        actor.send({ type: 'VOTE', vote: playerId })
        setShowModal(false)
    }

    const image = (<Image
        source={{ uri: `https://game-photo-bucket.s3.us-east-2.amazonaws.com/${roomNumber}/${roundNumber}/${playerId}.jpg` }}
        resizeMode="contain"
        className="h-full"
    />)

    console.log("image", image)
    if (image.ref === null) {
        return null
    }
    return (
        <>
            <StyledModal show={showModal}>
                <View className="bg-neutral-900 rounded-xl h-full w-full">
                    <TouchableOpacity
                        onPress={() => setShowModal(false)}
                        className="w-full h-5/6">
                        {image}
                    </TouchableOpacity>
                    <Button
                        label="Vote"
                        onPress={() => vote()}
                        className=""
                    />
                </View>
            </StyledModal>

            <TouchableOpacity onPress={() => setShowModal(true)}>
                <View className="bg-neutral-950 rounded-xl h-64 w-48">
                    {image}
                </View>
            </TouchableOpacity>
        </>
    )
}