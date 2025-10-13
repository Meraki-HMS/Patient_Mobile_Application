import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function EmergencyContact({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate inputs
  const validateFields = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !relationship ||
      !phone.trim() ||
      !email.trim() ||
      !city ||
      !address.trim()
    ) {
      Alert.alert('Missing Fields', 'All fields are required.');
      return false;
    }

    // Validate phone (only digits, exactly 10)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Phone number must be exactly 10 digits.',
      );
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleCancel = () => {
    setShowDiscardModal(true);
  };

  // ✅ Integrated save function
  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      const patient_id = await AsyncStorage.getItem('patientId');

      if (!token || !patient_id) {
        Alert.alert('Session expired', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const payload = {
        emergency_contact: {
          first_name: firstName,
          last_name: lastName,
          relationship,
          phone,
          email,
          city,
          address,
        },
      };

      const response = await axios.put(
        `${API_BASE_URL}/patients/profile/${patient_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        Alert.alert('Success', 'Emergency contact saved successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert(
        'Server Error',
        error.response?.data?.message || 'Failed to update emergency contact.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contact</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveText, loading && { opacity: 0.5 }]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Relationship Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={relationship}
            onValueChange={itemValue => setRelationship(itemValue)}
            style={{ color: relationship ? '#000' : '#999' }}
          >
            <Picker.Item label="Select Relationship" value="" color="#999" />
            <Picker.Item label="Parent" value="Parent" color="#000" />
            <Picker.Item label="Sibling" value="Sibling" color="#000" />
            <Picker.Item label="Friend" value="Friend" color="#000" />
            <Picker.Item label="Other" value="Other" color="#000" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#666"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* City Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={city}
            onValueChange={val => setCity(val)}
            style={{ color: city ? '#000' : '#999' }}
          >
            <Picker.Item label="Select City" value="" color="#999" />
            <Picker.Item label="Boston" value="Boston" color="#000" />
            <Picker.Item label="New York" value="New York" color="#000" />
            <Picker.Item label="Chicago" value="Chicago" color="#000" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#666"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </ScrollView>

      {/* Discard Modal */}
      <Modal visible={showDiscardModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Discard changes?</Text>
            <Text style={styles.modalSubtitle}>
              Unsaved changes will be lost.
            </Text>

            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => {
                setShowDiscardModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.discardText}>Yes, discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepBtn}
              onPress={() => setShowDiscardModal(false)}
            >
              <Text style={styles.keepText}>No, keep editing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F6FB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#E6F6FB',
  },
  cancelText: { fontSize: 16, color: 'gray' },
  saveText: { fontSize: 16, color: '#00796B', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  form: { padding: 16 },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
  discardBtn: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  discardText: { color: '#fff', fontWeight: '600' },
  keepBtn: {
    borderWidth: 1,
    borderColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  keepText: { color: '#00796B', fontWeight: '600' },
});
