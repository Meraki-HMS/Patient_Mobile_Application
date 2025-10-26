import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function AllAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (userData && token) {
          const user = JSON.parse(userData);
          const res = await axios.get(
            `${API_BASE_URL}/api/patient-appointments/patient/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (res.data && res.data.appointments) {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);

            const selectedHospitalId = await AsyncStorage.getItem(
              'selectedHospitalId',
            );
            console.log('selectedHospitalId:', selectedHospitalId);
            console.log(
              'appointments sample:',
              res.data.appointments?.slice(0, 2),
            );

            let filteredAppointments = res.data.appointments;

            // ✅ Filter by hospital ID first
            if (selectedHospitalId) {
              filteredAppointments = filteredAppointments.filter(a => {
                const appHospitalId =
                  a.hospitalId ||
                  a.hospital_id ||
                  a.hospital?.hospital_id ||
                  a.hospital?._id ||
                  a.hospital?._id?.toString();

                return String(appHospitalId) === String(selectedHospitalId);
              });
            }

            // ✅ Then filter by upcoming/cancelled logic
            filteredAppointments = filteredAppointments
              .filter(a => {
                if (a.status === 'cancelled' && a.date >= currentDate)
                  return true;

                if (a.status !== 'cancelled') {
                  if (a.date > currentDate) return true;
                  if (a.date === currentDate) {
                    const [startTime] = a.time.split(' - ');
                    return startTime >= currentTime;
                  }
                }
                return false;
              })
              .sort((a, b) => {
                const [ay, am, ad] = a.date.split('-');
                const [by, bm, bd] = b.date.split('-');
                return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
              });

            console.log(
              'filteredAppointments count:',
              filteredAppointments.length,
            );
            setAppointments(filteredAppointments);
          }
        }
      } catch (err) {
        console.log('Error fetching all appointments:', err);
      }
    };

    loadAppointments();
  }, []);

  const handleCancel = appointmentId => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.put(
                `${API_BASE_URL}/api/patient-appointments/${appointmentId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
              );

              setAppointments(prev =>
                prev.map(a =>
                  a.appointmentId === appointmentId
                    ? { ...a, status: 'cancelled' }
                    : a,
                ),
              );

              Alert.alert('Success', 'Appointment cancelled');
            } catch (err) {
              console.log(err);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ],
    );
  };

  const handleReschedule = appointment => {
    if (appointment.status === 'cancelled') return;

    setSelectedAppointment(appointment);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setModalVisible(true);

    // Fetch slots for same date
    fetchAvailableSlots(appointment.date);
  };

  const fetchAvailableSlots = async date => {
    if (!selectedAppointment) return;
    try {
      setLoadingSlots(true);
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(
        `${API_BASE_URL}/api/patient-appointments/available-slots`,
        {
          params: { doctorId: selectedAppointment.doctorId, date },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      let slots = res.data.slots || [];

      // filter for today
      if (date === todayDate) {
        slots = slots.filter(slot => slot.start >= currentTime);
      }

      // remove duplicates by start+end
      const uniqueSlots = Array.from(
        new Map(slots.map(s => [`${s.start}-${s.end}`, s])).values(),
      );

      setAvailableSlots(uniqueSlots);
    } catch (err) {
      console.error('Error fetching slots:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to fetch available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !selectedSlot) {
      return Alert.alert('Error', 'Please select a new time slot');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formattedDate = `${newDate.getFullYear()}-${String(
        newDate.getMonth() + 1,
      ).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

      const payload = {
        newSlotStart: selectedSlot.start,
        newSlotDuration: 30, // or your default slot size
      };

      await axios.put(
        `${API_BASE_URL}/api/patient-appointments/${selectedAppointment.appointmentId}/reschedule`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === selectedAppointment.appointmentId
            ? { ...a, time: `${selectedSlot.start} - ${selectedSlot.end}` }
            : a,
        ),
      );

      setModalVisible(false);
      Alert.alert('Success', 'Appointment rescheduled');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to reschedule appointment');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Upcoming Appointments</Text>

        {appointments.length === 0 ? (
          <Text style={styles.noAppointments}>No upcoming appointments</Text>
        ) : (
          appointments.map(a => (
            <View key={a.appointmentId} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.doctorName}>{a.doctorName}</Text>
                <Text style={styles.sessionType}>{a.sessionType}</Text>
                {a.status && (
                  <Text
                    style={[
                      styles.status,
                      a.status === 'cancelled' && styles.cancelledStatus,
                    ]}
                  >
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </Text>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{a.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>{a.time}</Text>
                </View>
              </View>

              {a.status?.trim().toLowerCase() !== 'cancelled' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.rescheduleBtn]}
                    onPress={() => handleReschedule(a)}
                  >
                    <Text style={styles.btnText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn]}
                    onPress={() => handleCancel(a.appointmentId)}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>

              <Text style={styles.sub}>Available Slots</Text>
              {loadingSlots ? (
                <ActivityIndicator size="large" color="#2D9CDB" />
              ) : (
                <View style={styles.slotContainer}>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => {
                      const label = `${slot.start} - ${slot.end}`;
                      return (
                        <TouchableOpacity
                          key={`${label}-${index}`}
                          style={[
                            styles.slotBtn,
                            selectedSlot?.start === slot.start &&
                              styles.slotActive,
                          ]}
                          onPress={() => setSelectedSlot(slot)}
                        >
                          <Text
                            style={
                              selectedSlot?.start === slot.start
                                ? styles.slotActiveText
                                : styles.slotText
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

              <View style={styles.modalActions}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button title="Save" onPress={confirmReschedule} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#E6F7FF' },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#000' },
  noAppointments: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#333' },
  sessionType: { fontSize: 14, fontWeight: '500', color: '#2D9CDB' },
  status: { fontSize: 12, fontWeight: '600', color: '#333', marginLeft: 8 },
  cancelledStatus: { color: '#FF6B6B' },
  cardBody: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: '600', color: '#555', width: 50 },
  value: { color: '#333' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  rescheduleBtn: { backgroundColor: '#2D9CDB', marginRight: 8 },
  cancelBtn: { backgroundColor: '#FF6B6B' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  footer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  backBtn: {
    paddingVertical: 10,
    backgroundColor: '#2D9CDB',
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sub: { fontSize: 15, fontWeight: '600', marginVertical: 10, color: '#333' },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  slotBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 4,
  },
  slotActive: { backgroundColor: '#2D9CDB', borderColor: '#2D9CDB' },
  slotText: { color: '#333', fontSize: 13 },
  slotActiveText: { color: '#fff', fontSize: 13 },
});
