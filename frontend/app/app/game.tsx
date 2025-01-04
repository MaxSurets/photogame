import { View, StyleSheet, Platform, TextInput, Text, Modal } from "react-native";
import { useState } from "react";
import * as Clipboard from 'expo-clipboard';
import { StateMachineContext } from '../services/StateMachineProvider'
import Button from "@/components/Button";
import React from "react";


export default function Game() {

    const actor = StateMachineContext.useActorRef();

    const prompt = StateMachineContext.useSelector((state) => state.context.prompt)
    const round = StateMachineContext.useSelector((state) => state.context.round)
    const current = JSON.stringify(StateMachineContext.useSelector((snapshot) => snapshot.value))
    console.log("Current", current)
    return (
        <>
            <View>
                <Text>This screen is shown during the game</Text>
                <Text> Step: {current}</Text>
                <Text> Round: {round}</Text>
            </View>
            <View>
                <Text>Prompt:</Text>
                <Text> {prompt}</Text>
            </View>
            <View>
                <Text>Upload:</Text>
                <Button label='Upload' onPress={() => actor.send({type: 'upload'})}/>
            </View>
            <View>
                <Button label='Simulate getting prompt' onPress={() => actor.send({type: 'GET_PROMPT', prompt: "Test prompt"})}/>
            </View>
            <View>
                <Button label='Simulate uploads done message' onPress={() => actor.send({type: 'UPLOADS_DONE'})}/>
            </View>
            <View>
                <Button label='Simulate votes done message' onPress={() => actor.send({type: 'VOTES_DONE', votes: {Player_1: "Player_2"}})}/>
            </View>
            <View>
                <Button label='Simulate next round' onPress={() => actor.send({type: 'NEXT_ROUND'})}/>
            </View>
        </>
    )
}