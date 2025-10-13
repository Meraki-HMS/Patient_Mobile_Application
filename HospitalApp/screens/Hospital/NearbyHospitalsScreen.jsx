import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  View,
} from 'react-native';
import { API_BASE_URL } from '@env';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Card from '../../components/Card';
import Section from '../../components/Section';
import { COLORS } from '../../utils/colors';

export default function NearbyHospitalsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('Login');
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/hospital`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHospitals(res.data);

        const savedHospitalId = await AsyncStorage.getItem(
          'selectedHospitalId',
        );
        if (savedHospitalId) {
          setSelectedHospital(savedHospitalId);
        }
      } catch (err) {
        console.error(
          'Error fetching hospitals:',
          err.response?.data || err.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [navigation]);

  const handleHospitalChange = async hospitalId => {
    setSelectedHospital(hospitalId);
    if (hospitalId) {
      await AsyncStorage.setItem('selectedHospitalId', hospitalId);
    } else {
      await AsyncStorage.removeItem('selectedHospitalId');
    }
  };

  const openDoctorsModal = async hospitalId => {
    try {
      setLoadingDoctors(true);
      setModalVisible(true);

      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/doctors/hospital/${hospitalId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDoctors(res.data);
    } catch (err) {
      console.error(
        'Error fetching doctors:',
        err.response?.data || err.message,
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Filter hospitals based on search query
  const filteredHospitals = hospitals.filter(
    h =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      (h.specialties || '').toLowerCase().includes(query.toLowerCase()),
  );

  // ✅ Fix: match by hospital_id, not _id
  const selectedHospitalData = hospitals.find(
    h => h.hospital_id === selectedHospital,
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <TextInput
        placeholder="Search hospitals or symptoms"
        placeholderTextColor={COLORS.subtext}
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <>
          {filteredHospitals.length === 0 && query.length > 0 ? (
            <Text style={styles.noHospitalText}>No hospitals found</Text>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHospital}
                onValueChange={handleHospitalChange}
                dropdownIconColor="#000" // black arrow
                style={styles.picker}
              >
                <Picker.Item label="Select Hospital" value="" color="#fff" />
                {filteredHospitals.map(h => (
                  <Picker.Item
                    key={h._id}
                    label={h.name}
                    value={h.hospital_id} // ✅ store hospital_id
                    color="#fff" // 🔥 force black text
                  />
                ))}
              </Picker>
            </View>
          )}

          {selectedHospitalData && (
            <Section title="Hospital Details">
              <Card>
                <Text style={styles.title}>{selectedHospitalData.name}</Text>
                <Text style={styles.meta}>
                  📍 {selectedHospitalData.address}
                </Text>
                {selectedHospitalData.rating && (
                  <Text style={styles.meta}>
                    ⭐ {selectedHospitalData.rating} •{' '}
                    {selectedHospitalData.specialties || 'General'}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.viewDoctorsBtn}
                  // ✅ Fix: pass hospital_id to backend
                  onPress={() =>
                    openDoctorsModal(selectedHospitalData.hospital_id)
                  }
                >
                  <Text style={styles.viewDoctorsText}>View Doctors</Text>
                </TouchableOpacity>
              </Card>
            </Section>
          )}

          {/* Doctors Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Doctors</Text>

                {loadingDoctors ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : doctors.length === 0 ? (
                  <Text>No doctors found for this hospital</Text>
                ) : (
                  doctors.map(doc => (
                    <Card key={doc._id}>
                      <Text style={styles.title}>{doc.name}</Text>
                      <Text style={styles.meta}>
                        Specialization: {doc.specialization}
                      </Text>
                      <Text style={styles.meta}>Contact: {doc.contact}</Text>
                    </Card>
                  ))
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Buttons for navigation */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.homeBtn,
                !selectedHospital && { backgroundColor: COLORS.border },
              ]}
              onPress={() => navigation.replace('Main', { screen: 'Home' })}
              disabled={!selectedHospital}
            >
              <Text
                style={[
                  styles.buttonText,
                  !selectedHospital && { color: COLORS.subtext },
                ]}
              >
                Proceed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              style={styles.loginLinkContainer}
            >
              <Text style={styles.loginLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff', // white background for dropdown
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000', // black text for selected item
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
  },
  meta: { color: COLORS.subtext },
  viewDoctorsBtn: {
    marginTop: 10,
    backgroundColor: '#2196F3', // 🔹 Blue color for button
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewDoctorsText: { color: '#fff', fontWeight: '600' },

  noHospitalText: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: 16,
    marginVertical: 20,
  },

  // Buttons
  buttonContainer: {
    marginTop: 30,
  },
  homeBtn: {
    backgroundColor: '#2196F3', // 🔹 Blue button
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  loginLinkText: {
    color: '#2196F3', // 🔹 Blue text link
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.text,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#2196F3', // 🔹 Blue button
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '600' },
});
