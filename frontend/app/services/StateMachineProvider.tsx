import { createActorContext } from "@xstate/react";
import { createActor } from "xstate";
import stateMachine from "./apiclient";
import { useNavigation } from "@react-navigation/native";

export const actor = createActor(stateMachine)