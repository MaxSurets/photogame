import { createActor } from "xstate";
import stateMachine from "./apiclient";

export const actor = createActor(stateMachine)
