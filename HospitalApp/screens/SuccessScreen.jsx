'use client';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SuccessScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>🎉 You Registered Successfully!</Text>
      <Text style={styles.subText}>Redirecting to login...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  message: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B00F5',
    marginBottom: 10,
  },
  subText: { fontSize: 16, color: '#555' },
});

export default SuccessScreen;
