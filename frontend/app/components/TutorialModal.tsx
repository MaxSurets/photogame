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
        </StyledModal>

    )
}


