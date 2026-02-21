import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const TreatmentPlanScreen = () => {
  const [loading, setLoading] = useState(false);

  // ✅ STATIC DATA
  const [plans, setPlans] = useState([
    {
      _id: '1',
      diagnosis: 'Typhoid Fever',
      is_nurse_completed: false,
      patient_id: {
        name: 'John Doe',
        age: 30,
        gender: 'Male',
      },
      admission_id: {
        bedNumber: 'ICU-01',
      },
      doctor_id: {
        name: 'Dr. Sharma',
      },
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice Daily' },
        { name: 'Cefixime', dosage: '200mg', frequency: 'Once Daily' },
      ],
    },
    {
      _id: '2',
      diagnosis: 'Malaria',
      is_nurse_completed: true,
      patient_id: {
        name: 'Priya Singh',
        age: 25,
        gender: 'Female',
      },
      admission_id: {
        bedNumber: 'WARD-03',
      },
      doctor_id: {
        name: 'Dr. Mehta',
      },
      medicines: [
        { name: 'Chloroquine', dosage: '250mg', frequency: 'Once Daily' },
      ],
    },
  ]);

  // Only show plans that are completed by the nurse
  const filteredPlans = plans.filter(p => p.is_nurse_completed);

  const renderPlan = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{item.patient_id?.name}</Text>
          <Text style={styles.patientGender}>
            {item.patient_id?.age} Yrs • {item.patient_id?.gender}
          </Text>
        </View>

        <View style={styles.bedBadge}>
          <Text style={styles.bedLabel}>BED</Text>
          <Text style={styles.bedValue}>{item.admission_id?.bedNumber}</Text>
        </View>
      </View>

      <View style={styles.diagnosisBox}>
        <Text style={styles.label}>Diagnosis</Text>
        <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
      </View>

      <View style={styles.medSection}>
        <Text style={styles.sectionTitle}>Prescribed Medicines</Text>

        {item.medicines?.length > 0 ? (
          item.medicines.map((med, index) => (
            <View key={index} style={styles.medRow}>
              <View style={styles.bulletPoint} />
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage}</Text>
              </View>
              <View style={styles.freqBadge}>
                <Text style={styles.freqText}>{med.frequency}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noMedsText}>No medicines assigned.</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.doctorText}>{item.doctor_id?.name}</Text>

        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed ✔</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D9CDB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F7FF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Past Treatment Plans</Text>
        </View>

        <FlatList
          data={filteredPlans}
          keyExtractor={item => item._id}
          renderItem={renderPlan}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default TreatmentPlanScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F7FF' },
  container: { flex: 1, backgroundColor: '#E6F7FF' },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A2138',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
  },
  patientGender: {
    fontSize: 13,
    color: '#8CA2B5',
    marginTop: 2,
  },

  bedBadge: {
    backgroundColor: '#FFF4E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bedLabel: {
    fontSize: 10,
    color: '#FF9F43',
    fontWeight: '800',
  },
  bedValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  diagnosisBox: {
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: '#8CA2B5',
    fontWeight: '700',
  },
  diagnosisText: {
    fontSize: 14,
    fontWeight: '600',
  },

  medSection: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D9CDB',
    marginBottom: 10,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D9CDB',
    marginRight: 10,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
  },
  medDosage: {
    fontSize: 12,
    color: '#777',
  },
  freqBadge: {
    backgroundColor: '#E6F7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freqText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D9CDB',
  },
  noMedsText: {
    fontStyle: 'italic',
    color: '#999',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 12,
  },

  doctorText: {
    fontSize: 12,
    color: '#8CA2B5',
    marginBottom: 15,
    textAlign: 'center',
  },

  completedBadge: {
    backgroundColor: '#E8FDF3',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  completedText: {
    color: '#2ECC71',
    fontWeight: '700',
  },
});
