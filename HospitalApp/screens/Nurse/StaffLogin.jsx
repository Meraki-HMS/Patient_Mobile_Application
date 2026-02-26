'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const StaffLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  useEffect(() => {
    const loadHospitalId = async () => {
      const savedHospitalId = await AsyncStorage.getItem('hospitalId');
      if (savedHospitalId) setHospitalId(savedHospitalId);
    };
    loadHospitalId();
  }, []);

  const handleStaffLogin = async () => {
    if (!email || !password || !hospitalId) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/nurses/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          hospital_id: hospitalId,
        }),
      });

      const data = await response.json();

      // 🔍 Print the exact response to your terminal
      console.log('BACKEND RESPONSE:', data);

      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return;
      }

      await AsyncStorage.setItem('staffToken', data.token);
      await AsyncStorage.setItem('staffRole', 'nurse');
      await AsyncStorage.setItem('hospitalId', hospitalId);
      await AsyncStorage.setItem('staffEmail', email);

      // ✅ SAFETY CHECK: Only set the ID if it actually exists
      if (data.nurse && data.nurse._id) {
        await AsyncStorage.setItem('userId', String(data.nurse._id));
      } else {
        Alert.alert(
          'Error',
          "Server didn't send the Nurse ID. Check your backend console.",
        );
        return; // Stop here if we don't have the ID
      }

      // ✅ SUCCESS ALERT
      Alert.alert('Success', 'Login successful!');
      navigation.replace('NurseMain');
    } catch (error) {
      // 🐛 THIS SHOWS THE REAL ERROR
      console.error('ACTUAL CRASH ERROR:', error);
      Alert.alert('Error', String(error.message));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Login</Text>

      <TextInput
        placeholder="Hospital ID"
        placeholderTextColor="#666"
        style={styles.input}
        value={hospitalId}
        onChangeText={setHospitalId}
        autoCapitalize="characters"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleStaffLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('NurseForgotPassword')}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.bottomText}>Back to Patient Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9ff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#4B00F5',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotText: {
    textAlign: 'center',
    marginTop: 14,
    color: '#4B00F5',
    fontWeight: '500',
  },
  bottomText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4B00F5',
    fontWeight: '500',
  },
});

export default StaffLogin;
