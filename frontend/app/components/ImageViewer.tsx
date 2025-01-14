import { Image, type ImageSource } from "expo-image";

type Props = {
  selectedImage?: string;
};

export default function ImageViewer({ selectedImage }: Props) {
  const imageSource = { uri: selectedImage };

  return <Image source={imageSource} className="rounded-xl w-[320px] h-[440px] md:w-[480px] lg:h-[660px]" />;
}

