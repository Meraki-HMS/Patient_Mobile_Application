import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@env';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../utils/colors.js';
import LabIcon from '../../Icons/LabIcon';
import PrescriptionIcon from '../../Icons/PrescriptionIcon';
import MedicalHistoryIcon from '../../Icons/MedicalHistoryIcon.jsx';

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [savedAppointments, setSavedAppointments] = useState([]);
  const [userHospital, setUserHospital] = useState('');
  const [medicalHistoryCount, setMedicalHistoryCount] = useState(0); // ✅ dynamic count

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const hospitalData = await AsyncStorage.getItem('hospital');
        const selectedHospitalId = await AsyncStorage.getItem(
          'selectedHospitalId',
        ); // ✅ fetch selected hospital ID
        const token = await AsyncStorage.getItem('token');
        const patientId = await AsyncStorage.getItem('patientId');

        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || 'User');

          const imageUrl =
            user.profileImage || user.profile_url || user.image || '';
          if (imageUrl) setUserImage(imageUrl);

          // ✅ Fetch Appointments filtered by selected hospital
          if (token && (user.id || user._id)) {
            const pid = user.id || user._id;
            const res = await axios.get(
              `${API_BASE_URL}/api/patient-appointments/patient/${pid}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            console.log('selectedHospitalId:', selectedHospitalId);
            console.log(
              'appointments sample:',
              res.data.appointments?.slice(0, 2),
            );
            if (res.data && res.data.appointments) {
              let activeAppointments = res.data.appointments.filter(
                a => String(a.status).toLowerCase() !== 'cancelled',
              );

              if (selectedHospitalId) {
                activeAppointments = activeAppointments.filter(a => {
                  const appHospitalId =
                    a.hospitalId ||
                    a.hospital_id ||
                    a.hospital?.hospital_id ||
                    a.hospital?._id ||
                    a.hospital?._id?.toString();

                  return String(appHospitalId) === String(selectedHospitalId);
                });
              }

              setSavedAppointments(activeAppointments);
            }
          }
        }

        if (hospitalData) setUserHospital(hospitalData);

        // ✅ Fetch medical history count dynamically
        if (patientId && token) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/patient-uploads/${patientId}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (res.data && res.data.uploads) {
              setMedicalHistoryCount(res.data.uploads.length);
            } else {
              setMedicalHistoryCount(0);
            }
          } catch (err) {
            console.log('Error fetching medical history:', err);
            setMedicalHistoryCount(0);
          }
        }
      } catch (err) {
        console.log('Error loading user:', err);
      }
    };

    loadUser();
    const unsubscribe = navigation.addListener('focus', loadUser);
    return unsubscribe;
  }, [navigation]);

  const healthRecords = [
    { id: 1, title: 'Lab Result', count: 10, color: '#FF6B6B' },
    { id: 2, title: 'Prescriptions', count: 5, color: '#1DD1A1' },
    {
      id: 3,
      title: 'Medical History',
      count: medicalHistoryCount,
      color: '#54A0FF',
    }, // ✅ dynamic count here
  ];

  const medications = [
    { id: 1, name: 'Loratadin 5mg', dosage: '0-1-1', left: '3 Days left' },
    { id: 2, name: 'Brocopan 50mg', dosage: '1-0-0', left: '2 Days left' },
    { id: 3, name: 'Loratadin 5mg', dosage: '0-1-0', left: '5 Days left' },
    { id: 4, name: 'Mytiacin 5mg', dosage: '0-0-1', left: '8 Days left' },
  ];

  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

  const upcomingAppointments = savedAppointments.filter(a => {
    if (a.date > todayDate) return true;
    if (a.date === todayDate) {
      const slotStart = a.time.split(' - ')[0];
      return slotStart >= currentTime;
    }
    return false;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.userName}>Hello {userName}</Text>
          <Text style={styles.location}>{userHospital}</Text>
        </View>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
        >
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {userName
                ? userName
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Health Records */}
      {/* Health Records */}
      <Text style={styles.sectionTitle}>Health Records</Text>
      <View style={styles.healthRow}>
        {healthRecords.map(h => (
          <TouchableOpacity
            key={h.id}
            style={styles.healthCard}
            onPress={() => {
              if (h.title === 'Medical History') {
                navigation.navigate('Records'); // ✅ go to MedicalHistoryScreen
              } else if (h.title === 'Prescriptions') {
                navigation.navigate('Prescriptions'); // optional future route
              } else if (h.title === 'Lab Result') {
                navigation.navigate('UploadRecords'); // optional future route
              }
            }}
          >
            {h.title === 'Lab Result' ? (
              <LabIcon focused={true} size={40} />
            ) : h.title === 'Prescriptions' ? (
              <PrescriptionIcon focused={true} size={40} />
            ) : h.title === 'Medical History' ? (
              <MedicalHistoryIcon focused={true} size={40} />
            ) : (
              <View style={[styles.iconCircle, { backgroundColor: h.color }]} />
            )}
            <Text style={styles.healthText}>{h.title}</Text>
            <Text style={styles.healthCount}>{h.count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.rowHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AllAppointments')}
          >
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { marginLeft: 10 }]}
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'Appointments',
                params: { screen: 'Schedule', params: { openForm: true } },
              })
            }
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.th}>Doctor</Text>
          <Text style={styles.th}>Date</Text>
          <Text style={styles.th}>Time</Text>
          <Text style={styles.th}>Type</Text>
        </View>

        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map(a => (
            <View key={a.appointmentId} style={styles.tr}>
              <Text style={styles.td}>{a.doctorName}</Text>
              <Text style={styles.td}>{a.date}</Text>
              <Text style={styles.td}>{a.time}</Text>
              <Text style={styles.td}>{a.sessionType}</Text>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            No upcoming appointments
          </Text>
        )}
      </View>

      {/* Medications */}
      <View style={styles.rowHeader}>
        <Text style={styles.sectionTitle}>Medications</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.th}>Medication Name</Text>
          <Text style={styles.th}>Dosage</Text>
          <Text style={styles.th}>Days Left</Text>
        </View>
        {[
          {
            id: 1,
            name: 'Loratadin 5mg',
            dosage: '0-1-1',
            left: '3 Days left',
          },
          {
            id: 2,
            name: 'Brocopan 50mg',
            dosage: '1-0-0',
            left: '2 Days left',
          },
          {
            id: 3,
            name: 'Loratadin 5mg',
            dosage: '0-1-0',
            left: '5 Days left',
          },
          { id: 4, name: 'Mytiacin 5mg', dosage: '0-0-1', left: '8 Days left' },
        ].map(m => (
          <View key={m.id} style={styles.tr}>
            <Text style={styles.td}>{m.name}</Text>
            <Text style={styles.td}>{m.dosage}</Text>
            <Text style={styles.td}>{m.left}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#E6F7FF' },
  scrollContent: { padding: 16, paddingBottom: 80, flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: { fontSize: 18, fontWeight: '700', color: '#000' },
  location: { color: '#666' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D9CDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
  },
  iconCircle: { width: 30, height: 30, borderRadius: 15, marginBottom: 6 },
  healthText: { fontSize: 12, color: '#666' },
  healthCount: { fontSize: 16, fontWeight: '700', color: '#000' },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  addBtn: {
    backgroundColor: '#2D9CDB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  viewAll: { color: '#2D9CDB', fontWeight: '600' },
  table: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  th: { flex: 1, fontWeight: '700', fontSize: 12, color: '#000' },
  td: { flex: 1, fontSize: 12, color: '#333' },
  appointmentRow: {
    backgroundColor: '#F9FBFD',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#2D9CDB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  doctorName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },

  sessionTypeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
  },

  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateText: {
    fontSize: 12,
    color: '#333',
  },

  timeText: {
    fontSize: 12,
    color: '#333',
  },
});
