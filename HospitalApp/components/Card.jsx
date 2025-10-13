// src/components/Card.js
import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { COLORS } from '../utils/colors';

export default function Card({ children, style, onPress, onLongPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{
        color: COLORS.ripple || 'rgba(0,0,0,0.1)',
        borderless: false,
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.card, style, { transform: [{ scale: scaleAnim }] }]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card || '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,

    // Shadow for Android
    elevation: 6,

    // Optional border
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
