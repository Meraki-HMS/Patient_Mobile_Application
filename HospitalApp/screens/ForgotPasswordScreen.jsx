'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
const ForgotPasswordScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = enter mobile, 2 = enter otp + new password
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!mobile.trim()) {
      alert('Enter your registered mobile number');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        mobile,
      });
      alert('OTP sent to your mobile');
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      alert('Enter OTP and new password');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/patients/reset-password`, {
        mobile,
        otp,
        newPassword,
      });
      alert('Password reset successful!');
      navigation.replace('Login');
    } catch (err) {
      alert(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 && (
        <>
          <TextInput
            placeholder="Enter Mobile Number"
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
            color="#000"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={sendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="Enter OTP"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            placeholderTextColor="#666"
            color="#000"
          />
          <TextInput
            placeholder="Enter New Password"
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#666"
            color="#000"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={resetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 24,
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
});

export default ForgotPasswordScreen;
