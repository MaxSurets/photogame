import { View, Platform, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { type ImageSource } from "expo-image";
import { captureRef } from "react-native-view-shot";
import domtoimage from "dom-to-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from '@expo/vector-icons/Feather';

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import IconButton from "@/components/IconButton";
import CircleButton from "@/components/CircleButton";
import EmojiPicker from "@/components/EmojiPicker";
import EmojiList from "@/components/EmojiList";
import EmojiSticker from "@/components/EmojiSticker";
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient';
import React from "react";

export default function Index() {
    const [selectedImage, setSelectedImage] = useState<string | undefined>(
        undefined
    );
    const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [pickedEmoji, setPickedEmoji] = useState<ImageSource | undefined>(
        undefined
    );
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [uploading, setUploading] = useState(false)
    const [status, requestPermission] = MediaLibrary.usePermissions();
    const imageRef = useRef<View>(null);



    const uploadUrl = useSelector(actor, (state) => state.context.uploadUrl)

    if (status === null) {
        requestPermission();
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setShowAppOptions(true);
        } else {
            alert("You did not select any image.");
        }
    };

    const saveDimensions = event => {
        let { width, height } = event.nativeEvent.layout
        setDimensions({ width, height })
    }

    const onReset = () => {
        setShowAppOptions(false);
    };

    const onAddSticker = () => {
        setIsModalVisible(true);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const handleImageUpload = async () => {
        let imageToUpload;
        setUploading(true)
        try {
            if (Platform.OS !== "web") {
                imageToUpload = await captureRef(imageRef, {
                    height: dimensions.height,
                    width: dimensions.width,
                    quality: 1,
                });

            } else {
                imageToUpload = await domtoimage.toJpeg(imageRef.current, {
                    height: dimensions.height,
                    width: dimensions.width,
                    quality: 0.95,
                });
            }
        } catch (e) {
            console.error("Failed to get image", e);
        }

        if (!imageToUpload || !uploadUrl) {
            console.error("Image or upload URL not available");
            setUploading(false)
            alert("Failed to upload photo");
            return;
        }
        try {
            if (imageToUpload) {
                const response = await fetch(imageToUpload);
                const fileData = await response.blob();
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': imageToUpload.type || 'image/jpeg',
                    },
                    body: fileData,
                });
                if (uploadResponse.ok) {
                    console.log("Photo uploaded successfully");
                } else {
                    console.error("Failed to upload photo", uploadResponse.status, uploadResponse.statusText);
                }
            } else {
                console.error("Image URI is missing");
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
        }

        setUploading(false)
    };

    const onSaveImageAsync = async () => {
        if (Platform.OS !== "web") {
            try {
                const localUri = await captureRef(imageRef, {
                    height: 440,
                    quality: 1,
                });

                await MediaLibrary.saveToLibraryAsync(localUri);
                if (localUri) {
                    alert("Saved!");
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                const dataUrl = await domtoimage.toJpeg(imageRef.current, {
                    quality: 0.95,
                });

                let link = document.createElement("a");
                link.download = "sticker-smash.jpeg";
                link.href = dataUrl;
                link.click();
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <GestureHandlerRootView className="flex-1 items-center">
            <View className="flex-1">
                <View ref={imageRef} collapsable={false} className="rounded-xl w-[320px] h-[440px] md:w-[480px] lg:h-[660px]" onLayout={saveDimensions}>
                    {uploading && <ActivityIndicator
                        className="absolute top-1/2 left-1/2 z-10"
                        size="large"
                        color="#fff"
                    />}
                    {selectedImage && <ImageViewer
                        selectedImage={selectedImage}
                    />}
                    {pickedEmoji && (
                        <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
                    )}
                </View>
            </View>
            {showAppOptions ? (
                <View className="absolute bottom-[16px]">
                    <View className="align-center flex-row">
                        <IconButton
                            icon={<MaterialIcons name="refresh" size={24} color="white" />}
                            label="Reset"
                            onPress={onReset}
                        />
                        <CircleButton onPress={onAddSticker} />
                        <IconButton
                            icon={<Feather name="upload" size={24} color="white" />}
                            label="Upload"
                            onPress={async () => {
                                console.log("Uploading photo to", uploadUrl)
                                await handleImageUpload()
                                actor.send({ type: 'UPLOAD' })
                            }}
                        />
                    </View>
                </View>
            ) : (
                <View className="flex-1/3 items-center">
                    <Button
                        size="md"
                        label="Choose a photo"
                        onPress={pickImageAsync}
                    />
                </View>
            )}
            <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
            </EmojiPicker>

        </GestureHandlerRootView>
    );
}
