import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkFirstTimeVisit = async (): Promise<boolean> => {
    const visited = await AsyncStorage.getItem('visited');
    console.log("Visited", visited, Boolean(visited));
    return !Boolean(visited);
}

export const setFirstTimeVisit = async () => {
    await AsyncStorage.setItem('visited', 'false');
    console.log("Set first time visit to false")
}