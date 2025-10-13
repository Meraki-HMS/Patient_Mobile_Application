import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RecordDetailsScreen({ route }) {
  const { appointmentId } = route.params;
  const navigation = useNavigation();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `${API_BASE_URL}/patient-records/appointment/${appointmentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setRecord(res.data);
      } catch (err) {
        console.log('Error loading record:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [appointmentId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.subtext }}>
          No record found for this appointment.
        </Text>
        <TouchableOpacity
          style={[styles.closeButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Close Icon in Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        >
          <Icon name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Record</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Doctor:</Text>
        <Text style={styles.value}>
          {record.doctor_id?.name} ({record.doctor_id?.specialization})
        </Text>

        <Text style={styles.label}>Patient:</Text>
        <Text style={styles.value}>{record.patient_id?.name}</Text>

        <Text style={styles.label}>Symptoms:</Text>
        <Text style={styles.value}>{record.symptoms || 'N/A'}</Text>

        <Text style={styles.label}>Diagnosis:</Text>
        <Text style={styles.value}>{record.diagnosis || 'N/A'}</Text>

        {/* ✅ Prescription Section */}
        <Text style={styles.label}>Prescription:</Text>
        {Array.isArray(record.prescription) &&
        record.prescription.length > 0 ? (
          record.prescription.map((med, index) => (
            <View key={index} style={styles.prescriptionItem}>
              <Text style={styles.value}>• {med.medicine_name}</Text>
              <Text style={styles.value}>
                Dosage: {med.dosage}, Frequency: {med.frequency}, Duration:{' '}
                {med.duration}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>
            {typeof record.prescription === 'string'
              ? record.prescription
              : 'N/A'}
          </Text>
        )}

        {/* ✅ Recommended Tests Section */}
        <Text style={styles.label}>Recommended Tests:</Text>
        {Array.isArray(record.recommended_tests) &&
        record.recommended_tests.length > 0 ? (
          record.recommended_tests.map((test, index) => (
            <Text key={index} style={styles.value}>
              • {test}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>
            {typeof record.recommended_tests === 'string'
              ? record.recommended_tests
              : 'N/A'}
          </Text>
        )}

        <Text style={styles.label}>Doctor Notes:</Text>
        <Text style={styles.value}>{record.notes || 'N/A'}</Text>

        {/* ✅ Blue Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  value: { fontSize: 15, color: COLORS.subtext, marginTop: 4 },
  prescriptionItem: { marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ✅ Blue button (matches “View Details” style)
  closeButton: {
    backgroundColor: COLORS.primary, // same blue
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
