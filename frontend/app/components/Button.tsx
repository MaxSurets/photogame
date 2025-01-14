import { StyleSheet, View, Pressable, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type Props = {
  disabled?: boolean;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: any;
  onPress?: () => void;
};

export default function Button({ label, onPress, size, className, icon, disabled=false }: Props) {

  let width = "w-full";

  if (size === "sm") {
    width = "w-28";
  } else if (size === "md") {
    width = "w-60";
  } else if (size === "lg") {
    width = "w-80";
  }

  return (
    <View
      className="m-3"
    >
      <Pressable
        className={`${width} button ${className} flex-row space-x-3 justify-baseline`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text
          className="text-white text-lg">
          {label}
        </Text>
        {icon}
      </Pressable>
    </View>
  );
}
