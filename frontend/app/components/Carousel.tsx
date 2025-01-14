import React, { useState, useRef } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useSelector } from '@xstate/react';
import { actor } from '@/services/apiclient';
import GameImageOption from "@/components/GameImageOption";


const windowWidth = Dimensions.get('window').width;
const imageGap = 10;

const ScrollingCarousel = () => {

    const round = useSelector(actor, (state) => state.context.round)
    const players = useSelector(actor, (state) => state.context.players)
    const roomNumber = useSelector(actor, (state) => state.context.roomNumber)
    const scores = useSelector(actor, (state) => state.context.scores)

    const carouselRef = useRef(null);
    const [centeredImageIndex, setCenteredImageIndex] = useState(0);

    const updateCenteredImageIndex = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.floor((contentOffsetX + (windowWidth / 2)) / (windowWidth + imageGap));
        setCenteredImageIndex(index);
    };

    const scrollToCenteredImage = (index) => {
        const xPosition = index * (windowWidth + imageGap) - (windowWidth / 2) + (windowWidth / 2);
        carouselRef.current.scrollTo({ x: xPosition, animated: true });
        setCenteredImageIndex(index);
    };

    return (
        <View style={{ position: 'relative' }}>
            <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                onScroll={updateCenteredImageIndex}
                scrollEventThrottle={16}
                contentContainerStyle={{

                    paddingHorizontal: imageGap / 2,
                    alignItems: 'center',
                }}
            >
                {players.map((player, index) => (
                    <View key={index} style={{ width: windowWidth, marginRight: index !== players.length - 1 ? imageGap : 0 }}>
                        <GameImageOption
                            playerId={player.id}
                            roomNumber={roomNumber}
                            roundNumber={round}
                        />
                    </View>
                ))}
            </ScrollView>
            <View style={styles.indicatorContainer}>
                {players.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            centeredImageIndex === index ? styles.indicatorActive : {},
                        ]}
                        onTouchEnd={() => scrollToCenteredImage(index)}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: windowWidth,
        height: 400,
        resizeMode: 'cover',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'gray',
        margin: 5,
    },
    indicatorActive: {
        backgroundColor: 'blue',
    },
});

export default ScrollingCarousel;