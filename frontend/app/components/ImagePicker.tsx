import React from 'react';
import { View, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Button from '@/components/Button';

export default function ImagePickerComponent({ onImageSelected }) {
    const pickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
            });

            if (result.didCancel) {
                Alert.alert('Cancelled', 'Photo selection was cancelled.');
            } else if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                onImageSelected(file);
            } else {
                Alert.alert('Error', 'No photo selected.');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'An error occurred while picking the image.');
        }
    };

    return (
        <View>
            <Button
                label="Select Image"
                onPress={pickImage}
                size="md"
            />
        </View>
    );
}
