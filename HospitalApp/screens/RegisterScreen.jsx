'use client';
import { phoneClient, emailClient } from '../utils/AxiosClient';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // 📧 Email OTP states
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [isEmailOtpVerified, setIsEmailOtpVerified] = useState(false);

  // 📅 DOB Calendar modal state
  const [showCalendar, setShowCalendar] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{3,}$/.test(form.name.trim())) {
      newErrors.name =
        'Name must be at least 3 letters (only alphabets allowed)';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        form.email.trim(),
      )
    ) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (form.password.trim() !== form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.dob.trim()) {
      newErrors.dob = 'Date of Birth is required';
    }

    if (!form.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📱 PHONE OTP
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(form.phone)) {
      alert('Enter a valid 10-digit phone number first');
      return;
    }

    try {
      await phoneClient.post('/api/auth/send-otp', { mobile: form.phone });
      alert('OTP sent to your mobile number');
      setShowOtpInput(true);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await phoneClient.post('/api/auth/verify-otp', {
        mobile: form.phone,
        otp,
      });

      if (res.data.success) {
        setIsOtpVerified(true);
        alert('Phone OTP verified successfully!');
      } else {
        alert('Invalid Phone OTP');
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || 'OTP verification failed');
    }
  };

  // 📧 EMAIL OTP
  const handleSendEmailOtp = async () => {
    if (!form.email.trim()) {
      alert('Enter a valid email first');
      return;
    }
    try {
      await emailClient.post('/auth/register', {
        email: form.email,
        name: form.name,
        password: form.password,
      });
      alert('OTP sent to your email');
      setShowEmailOtpInput(true);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to send Email OTP');
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      const res = await emailClient.post('/auth/verify-email', {
        email: form.email,
        code: emailOtp,
      });

      if (res.data.success) {
        setIsEmailOtpVerified(true);
        alert('Email verified successfully!');
      } else {
        alert('Invalid Email OTP');
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || 'Email OTP verification failed');
    }
  };

  // REGISTER
  const handleRegister = async () => {
    if (!validate()) return;
    if (!isOtpVerified) {
      alert('Please verify your mobile number first');
      return;
    }
    if (!isEmailOtpVerified) {
      alert('Please verify your email first');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.phone.trim(),
      password: form.password.trim(),
      dob: form.dob.trim(),
      gender: form.gender.trim(),
      address: form.address.trim(),
    };

    try {
      const res = await phoneClient.post('/patients/register', payload);
      alert(res.data.message || 'Registration done successfully!');
      if (res.data?.patient?._id) {
        await AsyncStorage.setItem('patientId', res.data.patient._id);
      }
      navigation.replace('Login');

      // Reset
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dob: '',
        gender: '',
        address: '',
      });
      setOtp('');
      setEmailOtp('');
      setShowOtpInput(false);
      setShowEmailOtpInput(false);
      setIsOtpVerified(false);
      setIsEmailOtpVerified(false);
      Keyboard.dismiss();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Patient Register</Text>

      {/* NAME */}
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#000"
        style={[styles.input, errors.name ? { borderColor: 'red' } : null]}
        value={form.name}
        onChangeText={v => handleChange('name', v)}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#000"
        style={[styles.input, errors.email ? { borderColor: 'red' } : null]}
        value={form.email}
        onChangeText={v => handleChange('email', v)}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {!isEmailOtpVerified && (
        <TouchableOpacity style={styles.otpButton} onPress={handleSendEmailOtp}>
          <Text style={styles.otpButtonText}>Send Email OTP</Text>
        </TouchableOpacity>
      )}

      {showEmailOtpInput && !isEmailOtpVerified && (
        <View>
          <TextInput
            placeholder="Enter Email OTP"
            placeholderTextColor="#000"
            style={styles.input}
            value={emailOtp}
            onChangeText={setEmailOtp}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            style={styles.otpButton}
            onPress={handleVerifyEmailOtp}
          >
            <Text style={styles.otpButtonText}>Verify Email OTP</Text>
          </TouchableOpacity>
        </View>
      )}
      {isEmailOtpVerified && (
        <View style={styles.verifiedBox}>
          <Text style={styles.verifiedText}>Email Verified Successfully!</Text>
        </View>
      )}

      {/* PHONE */}
      <TextInput
        placeholder="Phone"
        placeholderTextColor="#000"
        style={[styles.input, errors.phone ? { borderColor: 'red' } : null]}
        value={form.phone}
        onChangeText={v => handleChange('phone', v)}
        keyboardType="numeric"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      {!isOtpVerified && (
        <TouchableOpacity style={styles.otpButton} onPress={handleSendOtp}>
          <Text style={styles.otpButtonText}>Send Phone OTP</Text>
        </TouchableOpacity>
      )}

      {showOtpInput && !isOtpVerified && (
        <View>
          <TextInput
            placeholder="Enter Phone OTP"
            placeholderTextColor="#000"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity style={styles.otpButton} onPress={handleVerifyOtp}>
            <Text style={styles.otpButtonText}>Verify Phone OTP</Text>
          </TouchableOpacity>
        </View>
      )}
      {isOtpVerified && (
        <View style={styles.verifiedBox}>
          <Text style={styles.verifiedText}>
            Phone OTP Verified Successfully!
          </Text>
        </View>
      )}

      {/* DOB (Calendar Picker) */}
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={{ color: form.dob ? '#000' : '#777' }}>
          {form.dob || 'Select Date of Birth'}
        </Text>
      </TouchableOpacity>
      {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

      <Modal visible={showCalendar} animationType="slide">
        <View style={{ flex: 1 }}>
          <Calendar
            maxDate={new Date().toISOString().split('T')[0]} // ⛔ block future dates
            onDayPress={day => {
              handleChange('dob', day.dateString);
              setShowCalendar(false);
            }}
          />
          <TouchableOpacity
            style={styles.otpButton}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.otpButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* GENDER (Picker) */}
      <View
        style={[
          styles.input,
          { padding: 0, overflow: 'hidden' },
          errors.gender ? { borderColor: 'red' } : null,
        ]}
      >
        <Picker
          selectedValue={form.gender}
          onValueChange={v => handleChange('gender', v)}
        >
          <Picker.Item label="Select Gender" value="" color="#2f2c2cff" />
          <Picker.Item label="Male" value="Male" color="#2f2c2cff" />
          <Picker.Item label="Female" value="Female" color="#2f2c2cff" />
          <Picker.Item
            label="Prefer not to say"
            value="Prefer not to say"
            color="#2f2c2cff"
          />
        </Picker>
      </View>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

      {/* ADDRESS */}
      <TextInput
        placeholder="Address"
        placeholderTextColor="#000"
        style={[styles.input, errors.address ? { borderColor: 'red' } : null]}
        value={form.address}
        onChangeText={v => handleChange('address', v)}
      />
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      {/* PASSWORD */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#000"
        style={[styles.input, errors.password ? { borderColor: 'red' } : null]}
        value={form.password}
        onChangeText={v => handleChange('password', v)}
        secureTextEntry
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#000"
        style={[
          styles.input,
          errors.confirmPassword ? { borderColor: 'red' } : null,
        ]}
        value={form.confirmPassword}
        onChangeText={v => handleChange('confirmPassword', v)}
        secureTextEntry
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      )}

      {/* REGISTER BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9ff', flexGrow: 1 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    color: '#000',
  },
  errorText: { color: 'red', marginBottom: 8, fontSize: 13 },
  otpButton: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  otpButtonText: { color: '#fff', fontWeight: '600' },
  button: {
    backgroundColor: '#4B00F5',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  bottomText: { marginTop: 20, textAlign: 'center', color: '#444' },
  link: { color: '#4B00F5', fontWeight: '600' },
  verifiedBox: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#d1ffd6',
    borderRadius: 6,
  },
  verifiedText: { color: 'green', fontWeight: '600' },
});

export default RegisterScreen;
