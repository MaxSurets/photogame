
import { View, Text, Modal } from "react-native";
import React, { useState, useEffect } from "react";

import { checkFirstTimeVisit, setFirstTimeVisit } from "@/services/storage";
import Button from "../components/Button";

export default function Tutorial() {

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function checkUserVisits() {
            const isFirstVisit = await checkFirstTimeVisit();
            console.log("Is first visit", isFirstVisit);
            if (isFirstVisit) {
                setShowModal(true);
            }
        }
        checkUserVisits();
    }, []);

    const handleCloseModal = async () => {
        await setFirstTimeVisit();
        setShowModal(false);
    };




    return (
        <>
            {showModal &&
                <Modal>
                    <View>
                        <Text>Welcome to the game!</Text>
                    </View>
                    <Button
                        theme="primary"
                        label="Close"
                        onPress={handleCloseModal}
                    />
                </Modal>
            }
        </>
    )
}