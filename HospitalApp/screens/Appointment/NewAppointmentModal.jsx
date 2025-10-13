import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../utils/colors';
import CustomButton from '../../components/CustomButton';

import AddAppointmentIcon from '../../Icons/AddAppointment';
import UserIcon from '../../Icons/UserIcon';
import DateIcon from '../../Icons/DateIcon';
import HospitalIcon from '../../Icons/HospitalIcon';
import MeetingIcon from '../../Icons/MeetingIcon';
import MedicalIcon from '../../Icons/MedicalIcon';
import ComplaintIcon from '../../Icons/ComplaintIcon';
import StethoscopeIcon from '../../Icons/StethoscopeIcon';
import CalendarCheckIcon from '../../Icons/CalendarCheckIcon';
import SessionIcon from '../../Icons/SessionIcon';

export default function NewAppointmentModal({ route, navigation }) {
  const { date } = route.params || {};

  const [patient, setPatient] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [time, setTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [complaint, setComplaint] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [departmentDropdownVisible, setDepartmentDropdownVisible] =
    useState(false);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [sessionDropdownVisible, setSessionDropdownVisible] = useState(false);
  const [appointmentTypeDropdownVisible, setAppointmentTypeDropdownVisible] =
    useState(false);

  const sessionOptions = ['Consultation', 'Follow-up', 'Therapy', 'Check-up'];
  const appointmentTypeOptions = ['Manual', 'Virtual'];

  /** --- Load patient & hospital --- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        const storedHospitalId = await AsyncStorage.getItem(
          'selectedHospitalId',
        );

        if (userData) {
          const user = JSON.parse(userData);
          setPatient(user);
        }

        if (!storedHospitalId)
          return Alert.alert('Error', 'No hospital selected');
        setHospitalId(storedHospitalId);

        const resHospital = await axios.get(
          `${API_BASE_URL}/hospital/${storedHospitalId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setHospitalName(resHospital.data.name);

        setLoadingDepartments(true);
        const resDept = await axios.get(
          `${API_BASE_URL}/api/patient-appointments/departments/${storedHospitalId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setDepartmentList(resDept.data.departments || []);
      } catch (err) {
        console.error('Error loading data:', err.response?.data || err.message);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadData();
  }, []);

  /** --- Fetch doctors when department selected --- */
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedDepartment) return setDoctorList([]);
      try {
        setLoadingDoctors(true);
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `${API_BASE_URL}/api/patient-appointments/doctors`,
          {
            params: { hospitalId, department: selectedDepartment },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDoctorList(res.data.doctors || []);
      } catch (err) {
        console.error(
          'Error fetching doctors:',
          err.response?.data || err.message,
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [selectedDepartment]);

  /** --- Fetch available slots when doctor selected --- */
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor) return setAvailableSlots([]);
      try {
        setLoadingSlots(true);
        const token = await AsyncStorage.getItem('token');
        const doctor = doctorList.find(d => d.name === selectedDoctor);
        if (!doctor) return;

        const res = await axios.get(
          `${API_BASE_URL}/api/patient-appointments/available-slots`,
          {
            params: { doctorId: doctor._id, date },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const slots = (res.data.slots || [])
          .map(s => ({ start: s.start, end: s.end }))
          .filter(s => {
            if (date === todayStr) {
              const slotTime = new Date(`${date}T${s.start}`);
              return slotTime > now;
            }
            return true;
          });

        const uniqueSlots = slots.filter(
          (s, index, self) =>
            index ===
            self.findIndex(t => t.start === s.start && t.end === s.end),
        );

        setAvailableSlots(uniqueSlots);
      } catch (err) {
        console.error(
          'Error fetching slots:',
          err.response?.data || err.message,
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor]);

  /** --- Book appointment with conflict check --- */
  const saveAppointment = async () => {
    if (
      !selectedDoctor ||
      !selectedDepartment ||
      !time ||
      !sessionType ||
      !appointmentType
    )
      return;

    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const doctor = doctorList.find(d => d.name === selectedDoctor);
      if (!doctor) return;

      const [slotStart, slotEnd] = time.split(' - ');

      const payload = {
        hospitalId,
        doctorId: doctor._id,
        patientId: patient?.id,
        patientName: patient?.name,
        date,
        slotStart,
        slotEnd,
        sessionType: sessionType.toLowerCase(),
        appointmentType: appointmentType.toLowerCase(), // ✅ added
        reason: complaint,
      };

      await axios.post(
        `${API_BASE_URL}/api/patient-appointments/book`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ Save locally only if booking successful
      const newAppointment = {
        id: Date.now().toString(),
        doctor: doctor.name,
        date,
        time,
        type: sessionType,
        appointmentType,
        patientId: patient?.id,
      };

      const existing =
        JSON.parse(await AsyncStorage.getItem('appointments')) || [];
      await AsyncStorage.setItem(
        'appointments',
        JSON.stringify([...existing, newAppointment]),
      );

      Alert.alert('Success', 'Appointment booked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert('Conflict', 'This slot is already booked.');
      } else {
        console.error(err.response?.data || err.message);
        Alert.alert(
          'Error',
          err.response?.data?.message || 'Failed to book appointment',
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.titleWrapper}>
            <AddAppointmentIcon size={32} color={COLORS.primary} />
            <Text style={styles.title}>New Appointment</Text>
          </View>

          {/* Patient Name */}
          <View style={styles.inputWrapper}>
            <UserIcon size={20} color={COLORS.subtext} />
            <TextInput
              value={patient?.name || 'Unknown Patient'}
              style={styles.input}
              editable={false}
            />
          </View>

          {/* Date */}
          <View style={styles.inputWrapper}>
            <DateIcon size={20} color={COLORS.subtext} />
            <TextInput value={date} style={styles.input} editable={false} />
          </View>

          {/* Hospital Name */}
          <View style={styles.inputWrapper}>
            <HospitalIcon size={20} color={COLORS.subtext} />
            <Text style={[styles.input, { color: COLORS.text }]}>
              {hospitalName}
            </Text>
          </View>

          {/* Department */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setDepartmentDropdownVisible(true)}
          >
            <MedicalIcon size={20} color={COLORS.subtext} />
            <Text
              style={[
                styles.input,
                { color: selectedDepartment ? COLORS.text : '#999' },
              ]}
            >
              {selectedDepartment || 'Select Department'}
            </Text>
          </TouchableOpacity>

          {/* Department Dropdown */}
          <Modal
            visible={departmentDropdownVisible}
            transparent
            animationType="fade"
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setDepartmentDropdownVisible(false)}
            >
              <View style={styles.modalContent}>
                {loadingDepartments ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                  <FlatList
                    data={departmentList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          setSelectedDepartment(item);
                          setSelectedDoctor('');
                          setDepartmentDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Doctor */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setDoctorModalVisible(true)}
            disabled={!selectedDepartment}
          >
            <StethoscopeIcon size={20} color={COLORS.subtext} />
            <Text
              style={[
                styles.input,
                { color: selectedDoctor ? COLORS.text : '#999' },
              ]}
            >
              {selectedDoctor || 'Select Doctor'}
            </Text>
          </TouchableOpacity>

          {/* Doctor Modal */}
          <Modal visible={doctorModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                {/* 🔍 Search Bar */}
                <TextInput
                  placeholder="Search doctor..."
                  placeholderTextColor="#999"
                  style={styles.searchInput}
                  value={doctorSearch}
                  onChangeText={setDoctorSearch}
                />

                {loadingDoctors ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                  <FlatList
                    data={doctorList.filter(item =>
                      item.name
                        .toLowerCase()
                        .includes(doctorSearch.toLowerCase()),
                    )}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          setSelectedDoctor(item.name);
                          setDoctorModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text
                        style={{
                          textAlign: 'center',
                          padding: 20,
                          color: '#999',
                        }}
                      >
                        No doctors found
                      </Text>
                    }
                  />
                )}
                <CustomButton
                  title="Close"
                  type="secondary"
                  onPress={() => setDoctorModalVisible(false)}
                />
              </KeyboardAvoidingView>
            </View>
          </Modal>

          {/* Session Type */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setSessionDropdownVisible(true)}
          >
            <SessionIcon size={20} color={COLORS.subtext} />
            <Text
              style={[
                styles.input,
                { color: sessionType ? COLORS.text : '#999' },
              ]}
            >
              {sessionType || 'Select session type'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={sessionDropdownVisible}
            transparent
            animationType="fade"
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setSessionDropdownVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={sessionOptions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        setSessionType(item);
                        setSessionDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Appointment Type */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setAppointmentTypeDropdownVisible(true)}
          >
            <CalendarCheckIcon size={20} color={COLORS.subtext} />
            <Text
              style={[
                styles.input,
                { color: appointmentType ? COLORS.text : '#999' },
              ]}
            >
              {appointmentType || 'Select appointment type'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={appointmentTypeDropdownVisible}
            transparent
            animationType="fade"
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setAppointmentTypeDropdownVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={appointmentTypeOptions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        setAppointmentType(item);
                        setAppointmentTypeDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Available Slots */}
          {selectedDoctor && (
            <>
              <Text style={styles.sub}>Available Time Slots</Text>
              {loadingSlots ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <View style={styles.timeRow}>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => {
                      const label = `${slot.start} - ${slot.end}`;
                      return (
                        <TouchableOpacity
                          key={`${label}-${index}`}
                          style={[
                            styles.timeBtn,
                            time === label && styles.timeActive,
                          ]}
                          onPress={() => setTime(label)}
                        >
                          <Text
                            style={
                              time === label
                                ? styles.timeActiveText
                                : styles.timeText
                            }
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#999' }}>
                      No available slots
                    </Text>
                  )}
                </View>
              )}
            </>
          )}

          {/* Complaint */}
          <View style={styles.inputWrapperMulti}>
            <ComplaintIcon size={20} color={COLORS.subtext} />
            <TextInput
              placeholder="Enter presenting complaint"
              placeholderTextColor={COLORS.subtext}
              style={[styles.input, styles.multi]}
              value={complaint}
              onChangeText={setComplaint}
              multiline
            />
          </View>

          {/* Buttons */}
          <CustomButton
            title="Book Appointment"
            onPress={saveAppointment}
            disabled={
              !selectedDepartment ||
              !selectedDoctor ||
              !time ||
              !sessionType ||
              !appointmentType
            }
          />
          <CustomButton
            title="Cancel"
            type="secondary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.bg },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 50,
  },
  inputWrapperMulti: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  multi: { minHeight: 80, textAlignVertical: 'top' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    maxHeight: '60%',
  },
  option: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  optionText: { fontSize: 16, color: COLORS.text },
  sub: {
    fontSize: 15,
    fontWeight: '600',
    marginVertical: 10,
    color: COLORS.text,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    margin: 4,
  },
  timeActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { color: COLORS.text, fontSize: 13 },
  timeActiveText: { color: '#fff', fontSize: 13 },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: COLORS.text,
  },
});
