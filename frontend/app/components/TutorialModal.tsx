import { View, Text } from "react-native";
import Button from "@/components/Button";
import { actor } from '@/services/apiclient'
import { setFirstTimeVisit } from "@/services/storage";
import StyledModal from "./StyledModal";

export default function TutorialModal({ show }) {

    const closeModal = async () => {
        await setFirstTimeVisit();
        actor.send({ type: 'SKIP_TUTORIAL' })
    }

    return (
        <StyledModal show={show}>
            <View className="flex-col justify-between items-center bg-stone-900 p-4 sm:p-16 w-7/8 md:w-2/3 md:h-1/2 max-h-96 max-w-80 rounded-lg m-auto outline outline-1 outline-offset-2 outline-stone-700">
                <View className="mb-8">
                    <Text className="color-white text-center text-lg">Welcome!</Text>
                </View>
                <View>
                    <View className="">
                        <Text className="color-white text-base">To start a room as the host, press on [Create Room 🪄]</Text>
                    </View>
                    <View>
                        <Text className="color-white text-base">To join an existing room as a player, enter the room ID and click [Join Room 🚀]</Text>
                    </View>
                </View>
                <Button
                    label="Close"
                    onPress={closeModal}
                />
            </View>
        </StyledModal >

    )
}


