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
      {/* Header */}
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
        {/* Card Container */}
        <View style={styles.card}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Doctor</Text>
            <Text style={styles.tableValue}>
              {record.doctor_id?.name} ({record.doctor_id?.specialization})
            </Text>
          </View>

          <View style={styles.tableRowAlt}>
            <Text style={styles.tableLabel}>Patient</Text>
            <Text style={styles.tableValue}>{record.patient_id?.name}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Symptoms</Text>
            <Text style={styles.tableValue}>{record.symptoms || 'N/A'}</Text>
          </View>

          <View style={styles.tableRowAlt}>
            <Text style={styles.tableLabel}>Diagnosis</Text>
            <Text style={styles.tableValue}>{record.diagnosis || 'N/A'}</Text>
          </View>

          {/* Prescription */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Prescription</Text>
            <View style={{ flex: 1 }}>
              {Array.isArray(record.prescription) &&
              record.prescription.length > 0 ? (
                record.prescription.map((med, index) => (
                  <View key={index} style={styles.prescriptionItem}>
                    <Text style={styles.tableValue}>• {med.medicine_name}</Text>
                    <Text style={styles.tableSubValue}>
                      Dosage: {med.dosage}, {med.frequency}, {med.duration}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.tableValue}>
                  {typeof record.prescription === 'string'
                    ? record.prescription
                    : 'N/A'}
                </Text>
              )}
            </View>
          </View>

          {/* Tests */}
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableLabel}>Recommended Tests</Text>
            <View style={{ flex: 1 }}>
              {Array.isArray(record.recommended_tests) &&
              record.recommended_tests.length > 0 ? (
                record.recommended_tests.map((test, index) => (
                  <Text key={index} style={styles.tableValue}>
                    • {test}
                  </Text>
                ))
              ) : (
                <Text style={styles.tableValue}>
                  {typeof record.recommended_tests === 'string'
                    ? record.recommended_tests
                    : 'N/A'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Doctor Notes</Text>
            <Text style={styles.tableValue}>{record.notes || 'N/A'}</Text>
          </View>
        </View>

        {/* Close Button */}
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backIcon: { marginRight: 8, padding: 4 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  tableRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fb',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  tableLabel: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
    color: COLORS.text,
  },
  tableValue: {
    flex: 2,
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: 'right',
  },
  tableSubValue: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },

  prescriptionItem: { marginBottom: 6 },

  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
