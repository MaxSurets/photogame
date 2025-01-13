import { View, Modal } from "react-native";

export default function StyledModal({ show, children }) {

    return (
        <Modal animationType="fade" transparent={true} visible={show}>
            <View className="w-full h-full bg-black bg-opacity-50">
                <View className="flex-col justify-between items-center bg-stone-900 p-4 sm:p-16 w-7/8 md:w-2/3 md:h-1/2 rounded-lg m-auto outline outline-1 outline-offset-2 outline-stone-700">
                    {children}
                </View>
            </View>
        </Modal>
    )
}


