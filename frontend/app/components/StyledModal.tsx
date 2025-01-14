import { View, Modal } from "react-native";

export default function StyledModal({ show, children }) {

    return (
        <Modal animationType="fade" transparent={true} visible={show}>
            <View className="w-full h-full bg-black bg-opacity-50">
                {children}
            </View>
        </Modal>
    )
}


