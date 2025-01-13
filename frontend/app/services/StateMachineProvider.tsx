import { createActorContext } from "@xstate/react";
import { createActor } from "xstate";
import createUserMachine from "./apiclient";
import { useNavigation } from "@react-navigation/native";

export var StateMachineContext = createActorContext(createUserMachine(null));
export var actor:any = null

export const StateMachineMachineProvider = ({ children }) => {
    const navigation = useNavigation();
    const userMachine = createUserMachine(navigation)
    actor = createActor(userMachine);
    StateMachineContext = createActorContext(createUserMachine(navigation));

    actor.start()

    return (
        <StateMachineContext.Provider value={actor}>
            {children}
        </StateMachineContext.Provider>
    );
};