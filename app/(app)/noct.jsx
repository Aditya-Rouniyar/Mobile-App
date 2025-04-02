import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import { MotiView } from 'moti';
import { useAuth } from "../../context/authContext";
import theme from '../../constants/theme';
import MoonletModal from '../../components/MoonletModal';
import { hp } from '../../helpers/common';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COUNT = 5;
const DURATION = 4000;
const STAR_COUNT = 30;
const HOLD_DURATION = 3000;
const { width, height } = Dimensions.get('window');

const starColors = ['#FFFFFF', '#FFD700', '#FFEC8B', '#FFFACD', '#EEE8AA'];

const BackgroundStars = React.memo(() => (
  <>
    {[...Array(STAR_COUNT).keys()].map((index) => {
      const randomX = Math.random() * width;
      const randomY = Math.random() * height;
      const randomDelay = Math.random() * 3000;
      const randomColor = starColors[Math.floor(Math.random() * starColors.length)];

      return (
        <MotiView
          key={`star-${index}`}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 2000,
            loop: true,
            delay: randomDelay,
            repeatReverse: true,
          }}
          style={[styles.star, { left: randomX, top: randomY, backgroundColor: randomColor }]}
        />
      );
    })}
  </>
));

const PulsingCircles = ({ onLongPress }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pressTimer = useRef(null);

  const handlePressIn = () => {
    setIsAnimating(true);
    pressTimer.current = setTimeout(() => {
      onLongPress();
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    setIsAnimating(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <Pressable
      style={styles.centeredContainer}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isAnimating &&
        [...Array(COUNT).keys()].map((index) => (
          <MotiView
            key={index}
            from={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{
              type: 'timing',
              duration: DURATION,
              loop: true,
              delay: index * (DURATION / COUNT),
              repeatReverse: false,
            }}
            style={styles.circle}
          />
        ))}
    </Pressable>
  );
};

const App = () => {
  const { getMoonlet, user } = useAuth();
  const [moonlet, setMoonlet] = useState(null);

  const onLongPress = async () => {
    let result = await getMoonlet();
    setMoonlet(result);
  };

  return (
    <View style={styles.container}>
      <View className='flex-row px-6 mt-20'>
        <LinearGradient style={{ paddingHorizontal: 6, flexDirection: 'row' }}
          colors={['#6A1B9A', '#9C27B0', '#bf118b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text className='font-bold' style={{ color: 'black', fontSize: hp(6) }}>
            Staryn
          </Text>
          <Ionicons name='planet' color='black' size={18}></Ionicons>
        </LinearGradient>
      </View>


      <BackgroundStars />
      <PulsingCircles onLongPress={onLongPress} />
      {moonlet && (
        <MoonletModal
          visible={true}
          item={moonlet}
          postUser={moonlet.user}
          currentUser={user}
          onClose={() => setMoonlet(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.dark.colors.primary,
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
});

export default App;
