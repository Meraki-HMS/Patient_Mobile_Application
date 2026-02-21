import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const NurseDashboard = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: State for Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'

  const [modalVisible, setModalVisible] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const hospitalId = await AsyncStorage.getItem('hospitalId');

      const res = await axios.get(
        `${API_BASE_URL}/api/admissions/allAdmitted-patients`,
        { params: { hospitalId } },
      );

      if (res.data?.patients) {
        const patientsWithBeds = await Promise.all(
          res.data.patients.map(async (item, index) => {
            let bed = 'NA';

            try {
              const tp = await axios.get(
                `${API_BASE_URL}/treatment-plans/admission/${item._id}`,
              );

              bed = tp.data?.data?.bed_assignment_id?.bed_id || 'NA';
            } catch (err) {
              bed = 'NA';
            }

            return {
              id: item._id,
              admissionId: item._id,
              name: item.fullName || 'Unknown',
              dob: item.dob,
              gender: item.gender || 'NA',
              bedNumber: bed, // ✅ from treatment plan
              wardType: item.wardType || 'NA',
              patientType: item.patientType || 'NA',
              admissionDateTime: item.admissionDateTime,
              address: item.currentAddress || '',
              // Static mock for assigned patient (makes first 2 assigned for UI testing)
              isAssignedToMe: index === 0 || index === 1,
            };
          }),
        );

        setPatients(patientsWithBeds);
      }
    } catch (error) {
      console.log('Error fetching admitted patients:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, []),
  );

  const openTreatmentModal = async admissionId => {
    try {
      setModalVisible(true);
      setModalLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/treatment-plans/admission/${admissionId}`,
      );

      setTreatmentPlan(res.data?.data || null);
    } catch (error) {
      console.log('Treatment fetch error:', error.message);
      setTreatmentPlan(null);
    } finally {
      setModalLoading(false);
    }
  };

  // UPDATED: Filter by search text AND the active tab
  const filteredPatients = patients.filter(p => {
    const matchesSearch = `${p.name} ${p.bedNumber}`
      .toLowerCase()
      .includes(search.toLowerCase());
    if (activeTab === 'mine') {
      return p.isAssignedToMe && matchesSearch;
    }
    return matchesSearch;
  });

  const renderPatientCard = ({ item }) => {
    const admissionDate = item.admissionDateTime
      ? new Date(item.admissionDateTime).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        })
      : 'NA';

    const admissionTime = item.admissionDateTime
      ? new Date(item.admissionDateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'NA';

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{admissionDate.split(' ')[0]}</Text>
            <Text style={styles.dateMonth}>{admissionDate.split(' ')[1]}</Text>
            <View style={styles.timeTag}>
              <Text style={styles.timeText}>{admissionTime}</Text>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.patientName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>

              <View style={styles.bedBadge}>
                <Text style={styles.bedText}>{item.bedNumber}</Text>
              </View>
            </View>

            <Text style={styles.demographics}>
              DOB: {item.dob ? new Date(item.dob).toLocaleDateString() : 'NA'}
            </Text>

            <Text style={styles.demographics}>Gender: {item.gender}</Text>

            <Text style={styles.demographics}>Ward: {item.wardType}</Text>

            <Text style={styles.demographics}>Type: {item.patientType}</Text>

            <Text style={styles.address} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.statusRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openTreatmentModal(item.admissionId)}
          >
            <Text style={styles.actionBtnText}>View Details</Text>
          </TouchableOpacity>

          <Text style={styles.statusBadge}>Admitted</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#2D9CDB"
          style={{ marginTop: 40 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F7FF" />
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerCard}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>

              <Text style={styles.hospitalName}>Apollo Hospital</Text>
              <Text style={styles.subText}>Nurse Dashboard</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('NurseProfile')}
            >
              <Image
                source={{
                  uri: 'https://i.pravatar.cc/150?img=47',
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search patient, bed ID..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A0A4A8"
            style={styles.searchInput}
          />
        </View>

        {/* NEW: Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              All Patients
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'mine' && styles.activeTab]}
            onPress={() => setActiveTab('mine')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'mine' && styles.activeTabText,
              ]}
            >
              My Patients
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPatients}
          keyExtractor={item => item.id}
          renderItem={renderPatientCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{ textAlign: 'center', marginTop: 20, color: '#8CA2B5' }}
            >
              No patients found.
            </Text>
          }
        />
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalLoading ? (
              <ActivityIndicator size="large" color="#2D9CDB" />
            ) : treatmentPlan ? (
              <>
                <ScrollView>
                  <Text style={styles.modalTitle}>Treatment Plan</Text>

                  {/* ✅ Doctor Details */}
                  <Text style={styles.modalSection}>Doctor:</Text>
                  <Text>Dr. {treatmentPlan?.doctor_id?.name || 'N/A'}</Text>

                  <Text style={{ color: '#777', marginBottom: 8 }}>
                    {treatmentPlan?.doctor_id?.specialization || ''}
                  </Text>

                  {/* Diagnosis */}
                  <Text style={styles.modalSection}>Diagnosis:</Text>
                  <Text>{treatmentPlan.diagnosis}</Text>

                  {/* Medicines */}
                  <Text style={styles.modalSection}>Medicines:</Text>
                  {treatmentPlan.medicines?.length ? (
                    treatmentPlan.medicines.map((med, i) => (
                      <View key={i} style={{ marginBottom: 6 }}>
                        <Text>• {med.name}</Text>
                        <Text style={{ marginLeft: 10 }}>
                          Dosage: {med.dosage}
                        </Text>
                        <Text style={{ marginLeft: 10 }}>
                          Frequency: {med.frequency}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text>No medicines</Text>
                  )}

                  {/* Meals */}
                  <Text style={styles.modalSection}>Meals:</Text>
                  {treatmentPlan.meals?.length ? (
                    treatmentPlan.meals.map((meal, i) => (
                      <View key={i} style={{ marginBottom: 8 }}>
                        <Text style={{ fontWeight: '600' }}>
                          • {meal.meal_time}
                        </Text>

                        {meal.items?.map((item, index) => (
                          <Text key={index} style={{ marginLeft: 10 }}>
                            - {item}
                          </Text>
                        ))}

                        {meal.instructions && (
                          <Text
                            style={{
                              marginLeft: 10,
                              fontStyle: 'italic',
                            }}
                          >
                            Instructions: {meal.instructions}
                          </Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text>No meal plan</Text>
                  )}

                  {/* Procedures */}
                  <Text style={styles.modalSection}>Procedures:</Text>
                  {treatmentPlan.procedures?.length ? (
                    treatmentPlan.procedures.map((proc, i) => (
                      <Text key={i}>• {proc.name || proc}</Text>
                    ))
                  ) : (
                    <Text>No procedures</Text>
                  )}

                  <Text style={styles.modalSection}>Notes:</Text>
                  <Text>{treatmentPlan.notes}</Text>
                </ScrollView>

                {/* Static Mark as Completed Button */}
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => console.log('Mark as completed clicked')}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Mark as Completed
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>No Active Treatment Plan</Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NurseDashboard;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F7FF' },
  container: { flex: 1, backgroundColor: '#E6F7FF' },

  headerWrapper: { padding: 20 },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, color: '#607D8B' },
  hospitalName: { fontSize: 24, fontWeight: '800' },
  subText: { fontSize: 13, color: '#2D9CDB' },
  avatar: { width: 50, height: 50, borderRadius: 18 },

  searchBox: {
    marginHorizontal: 20,
    marginBottom: 10, // Adjusted margin to fit tabs nicely
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },

  searchInput: { fontSize: 15 },

  // NEW: Styles for the Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    color: '#777',
    fontWeight: '600',
  },
  activeTab: {
    backgroundColor: '#2D9CDB',
  },
  activeTabText: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    elevation: 4,
  },

  dateBox: {
    width: 65,
    backgroundColor: '#F0F7FF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },

  dateText: { fontSize: 18, fontWeight: '800' },
  dateMonth: { fontSize: 12, color: '#2D9CDB' },

  timeTag: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  timeText: { fontSize: 10 },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingRight: 8,
  },

  patientName: { fontSize: 17, fontWeight: '700' },

  bedBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  bedText: { fontSize: 11, color: '#FF9F43', fontWeight: 'bold' },

  demographics: { fontSize: 13, marginTop: 4 },

  address: { fontSize: 12, marginTop: 6 },

  separator: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 12,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionBtnText: { color: '#8CA2B5' },

  statusBadge: {
    backgroundColor: '#E8FDF3',
    color: '#2ECC71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  modalSection: {
    marginTop: 10,
    fontWeight: '600',
  },

  completeBtn: {
    marginTop: 15,
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: '#2D9CDB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
