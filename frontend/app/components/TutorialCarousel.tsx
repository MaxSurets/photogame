
// Carousel component for React Native with auto-scrolling and pagination
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

const { width } = Dimensions.get('window');

const Carousel: React.FC<CarouselProps> = ({
  images,
  autoPlay = true,
  interval = 3000
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlay) {
      timer = setInterval(() => {
        if (activeIndex === images.length - 1) {
          scrollViewRef.current?.scrollTo({ x: 0, animated: true });
          setActiveIndex(0);
        } else {
          scrollViewRef.current?.scrollTo({
            x: width * (activeIndex + 1),
            animated: true,
          });
          setActiveIndex(activeIndex + 1);
        }
      }, interval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [activeIndex, autoPlay, images.length, interval]);

  // Handle manual scroll
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View className="w-80">
            <Text>{image}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: width * index,
                animated: true,
              });
              setActiveIndex(index);
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 200,
  },
  image: {
    width: width,
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
});

export default Carousel;