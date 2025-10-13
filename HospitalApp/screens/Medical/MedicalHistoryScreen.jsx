// src/screens/Medical/MedicalHistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Calendar } from 'react-native-calendars';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import Section from '../../components/Section';
import { COLORS } from '../../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import DeleteIcon from '../../Icons/DeleteIcon';

export default function MedicalHistoryScreen({ navigation }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [history, setHistory] = useState([]);
  const [showImagePickerOptions, setShowImagePickerOptions] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [hospitalId, setHospitalId] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const getIdsAndToken = async () => {
      try {
        const pid = await AsyncStorage.getItem('patientId');
        const hid = await AsyncStorage.getItem('selectedHospitalId');
        const tkn = await AsyncStorage.getItem('token');

        if (pid) setPatientId(pid);
        if (hid) setHospitalId(hid);
        if (tkn) setToken(tkn);

        if (pid && tkn) fetchHistory(pid, tkn);
      } catch (error) {
        console.log('Error fetching IDs or token:', error);
      }
    };
    getIdsAndToken();
  }, []);

  const fetchHistory = async (pid, tkn) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-uploads/${pid}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      const data = await response.json();
      if (response.ok) setHistory(data.uploads || []);
      else setHistory([]);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const addItem = async () => {
    if (!diagnosis || (!prescription && !prescriptionImage) || !date) {
      Alert.alert('Please fill all required fields');
      return;
    }

    try {
      if (!patientId || !hospitalId || !token) {
        Alert.alert('Missing IDs or token, please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('patient_id', patientId);
      formData.append('hospital_id', hospitalId);
      formData.append('diagnosis', diagnosis);
      formData.append('doctor_name', doctor);

      if (prescriptionImage) {
        const uriParts = prescriptionImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('file', {
          uri: prescriptionImage,
          name: `prescription_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/patient-uploads/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Medical record uploaded successfully.');
        fetchHistory(patientId, token);
      } else {
        console.error('Upload failed:', data);
        Alert.alert('Error', data.message || 'Failed to upload record.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Something went wrong while uploading.');
    }

    setDiagnosis('');
    setPrescription('');
    setPrescriptionImage(null);
    setDate('');
    setDoctor('');
  };

  const handleDelete = async recordId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/patient-uploads/${recordId}`,
                {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const data = await response.json();
              if (response.ok) {
                Alert.alert('Deleted', 'Record deleted successfully.');
                setHistory(prev => prev.filter(item => item._id !== recordId));
              } else {
                Alert.alert(
                  'Error',
                  data.message || 'Failed to delete record.',
                );
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Something went wrong while deleting.');
            }
          },
        },
      ],
    );
  };

  const handleTakePhoto = async () => {
    setShowImagePickerOptions(false);
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.assets?.[0]?.uri) setPrescriptionImage(result.assets[0].uri);
  };

  const handleSelectFromGallery = async () => {
    setShowImagePickerOptions(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets?.[0]?.uri) setPrescriptionImage(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Medical History</Text>

          <Card>
            <TextInput
              placeholder="Diagnosis (e.g. Flu, Asthma Review)"
              placeholderTextColor="#777"
              style={styles.input}
              value={diagnosis}
              onChangeText={setDiagnosis}
            />

            <TouchableOpacity onPress={() => setShowImagePickerOptions(true)}>
              <View pointerEvents="none">
                <TextInput
                  placeholder="Prescription / Medication (Tap to upload image)"
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={prescription}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {prescriptionImage && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: prescriptionImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  onPress={() => setShowImagePickerOptions(true)}
                >
                  <Text style={styles.reuploadText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => setShowCalendar(true)}>
              <View pointerEvents="none">
                <TextInput
                  placeholder="Select Date"
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={date}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            <TextInput
              placeholder="Doctor's Name (e.g. Dr. John Doe)"
              placeholderTextColor="#777"
              style={styles.input}
              value={doctor}
              onChangeText={setDoctor}
            />

            <CustomButton title="Add Record" onPress={addItem} />
          </Card>

          <Section title="Previous Records" />
          {history.length === 0 ? (
            <Text style={{ color: COLORS.subtext, marginTop: 8 }}>
              No records added yet.
            </Text>
          ) : (
            history.map(h => (
              <Card key={h._id}>
                <View style={styles.recordHeader}>
                  <Text style={styles.itemTitle}>{h.diagnosis}</Text>
                  <TouchableOpacity onPress={() => handleDelete(h._id)}>
                    <DeleteIcon size={22} color="#E53935" />
                  </TouchableOpacity>
                </View>
                {h.doctor_name && (
                  <Text style={styles.meta}>👨‍⚕️ {h.doctor_name}</Text>
                )}
                {h.files &&
                  h.files.map((f, idx) =>
                    f.file_type === 'image' ? (
                      <Image
                        key={idx}
                        source={{ uri: f.file_url }}
                        style={styles.historyImage}
                      />
                    ) : (
                      <Text
                        key={idx}
                        style={{ color: COLORS.primary, marginTop: 6 }}
                      >
                        📄 PDF File
                      </Text>
                    ),
                  )}
              </Card>
            ))
          )}

          <View style={styles.bottomSpacer}>
            <CustomButton
              title="Upload Lab Records"
              onPress={() => navigation.navigate('UploadRecords')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={day => {
                setDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [date]: { selected: true, selectedColor: COLORS.primary },
              }}
            />
            <CustomButton
              title="Close"
              style={{ marginTop: 12 }}
              onPress={() => setShowCalendar(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal visible={showImagePickerOptions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Upload Prescription</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.optionText}>📸 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectFromGallery}
            >
              <Text style={styles.optionText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: '#eee' }]}
              onPress={() => setShowImagePickerOptions(false)}
            >
              <Text style={[styles.optionText, { color: '#555' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20, paddingBottom: 120 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.text,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  imagePreviewContainer: { alignItems: 'center', marginBottom: 12 },
  imagePreview: { width: 120, height: 120, borderRadius: 10, marginTop: 4 },
  reuploadText: { color: COLORS.primary, marginTop: 8, fontSize: 14 },
  historyImage: { width: '100%', height: 180, borderRadius: 10, marginTop: 6 },
  itemTitle: { fontWeight: '800', color: COLORS.text, fontSize: 16 },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meta: { color: COLORS.subtext, marginBottom: 4 },
  bottomSpacer: { marginTop: 16, marginBottom: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  optionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS.text,
  },
  optionButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: { color: '#fff', fontSize: 16 },
});
