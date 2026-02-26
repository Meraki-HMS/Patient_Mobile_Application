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
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const NurseDashboard = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'

  // Modal & Treatment States
  const [modalVisible, setModalVisible] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Tracking & Action States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const fetchPatients = async () => {
    try {
      const hospitalId = await AsyncStorage.getItem('hospitalId');
      const loggedInNurseId = await AsyncStorage.getItem('userId');

      const res = await axios.get(
        `${API_BASE_URL}/api/admissions/allAdmitted-patients`,
        { params: { hospitalId } },
      );

      if (res.data?.patients) {
        const patientsWithBeds = await Promise.all(
          res.data.patients.map(async item => {
            let bed = 'NA';
            let isAssignedToMe = false;

            try {
              const tp = await axios.get(
                `${API_BASE_URL}/treatment-plans/admission/${item._id}`,
              );

              const bedAssignment = tp.data?.data?.bed_assignment_id;

              if (bedAssignment) {
                bed = bedAssignment.bed_id || 'NA';
                const assignedNurseId =
                  bedAssignment.nurse_id?._id || bedAssignment.nurse_id;

                if (
                  assignedNurseId &&
                  loggedInNurseId &&
                  assignedNurseId.toString() === loggedInNurseId.toString()
                ) {
                  isAssignedToMe = true;
                }
              }
            } catch (err) {
              bed = 'NA';
            }

            return {
              id: item._id,
              admissionId: item._id,
              name: item.fullName || 'Unknown',
              dob: item.dob,
              gender: item.gender || 'NA',
              bedNumber: bed,
              wardType: item.wardType || 'NA',
              patientType: item.patientType || 'NA',
              admissionDateTime: item.admissionDateTime,
              address: item.currentAddress || '',
              isAssignedToMe: isAssignedToMe,
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
      setLoading(true);
      fetchPatients();
    }, []),
  );

  const openTreatmentModal = async patient => {
    try {
      setSelectedPatient(patient);
      setModalVisible(true);
      setModalLoading(true);
      setIsTodayCompleted(false);
      setCheckedItems({}); // Clear checkboxes initially

      const res = await axios.get(
        `${API_BASE_URL}/treatment-plans/admission/${patient.admissionId}`,
      );

      const plan = res.data?.data;
      setTreatmentPlan(plan || null);

      if (plan && plan.daily_status && plan.daily_status.length > 0) {
        // ✅ FAST TEST FIX: Grab the newest checklist from the array
        const latestStatus = plan.daily_status[plan.daily_status.length - 1];
        const isCompleted = latestStatus?.completed || false;

        setIsTodayCompleted(isCompleted);

        // Auto-check all the boxes if already completed
        if (isCompleted) {
          let autoChecked = {};
          if (plan.medicines) {
            plan.medicines.forEach((_, i) => (autoChecked[`med-${i}`] = true));
          }
          if (plan.meals) {
            plan.meals.forEach((_, i) => (autoChecked[`meal-${i}`] = true));
          }
          if (plan.procedures) {
            plan.procedures.forEach(
              (_, i) => (autoChecked[`proc-${i}`] = true),
            );
          }
          setCheckedItems(autoChecked);
        }
      }
    } catch (error) {
      console.log('Treatment fetch error:', error.message);
      setTreatmentPlan(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!treatmentPlan) return;

    try {
      setCompletingTask(true);
      const token = await AsyncStorage.getItem('staffToken');

      const res = await axios.patch(
        `${API_BASE_URL}/treatment-plans/${treatmentPlan._id}/complete-today`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setIsTodayCompleted(true);
        let autoChecked = {};
        if (treatmentPlan.medicines) {
          treatmentPlan.medicines.forEach(
            (_, i) => (autoChecked[`med-${i}`] = true),
          );
        }
        if (treatmentPlan.meals) {
          treatmentPlan.meals.forEach(
            (_, i) => (autoChecked[`meal-${i}`] = true),
          );
        }
        if (treatmentPlan.procedures) {
          treatmentPlan.procedures.forEach(
            (_, i) => (autoChecked[`proc-${i}`] = true),
          );
        }
        setCheckedItems(autoChecked);

        fetchPatients();

        Alert.alert('Success', "Today's treatment marked as completed! ✅");
      }
    } catch (error) {
      console.log(
        'Error marking completed:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not mark treatment as completed.',
      );
    } finally {
      setCompletingTask(false);
    }
  };

  const toggleCheck = key => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
            onPress={() => openTreatmentModal(item)}
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

  // ✅ NEW: Calculate if all items are checked
  let isAllChecked = false;
  if (treatmentPlan) {
    const totalMedicines = treatmentPlan.medicines?.length || 0;
    const totalMeals = treatmentPlan.meals?.length || 0;
    const totalProcedures = treatmentPlan.procedures?.length || 0;
    const totalItems = totalMedicines + totalMeals + totalProcedures;

    // Count how many checkedItems are 'true'
    const checkedCount = Object.values(checkedItems).filter(
      val => val === true,
    ).length;

    // If there are 0 items, or if the checked count matches the total count, it is fully checked
    isAllChecked = totalItems === 0 || checkedCount === totalItems;
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

                  {/* WARNING BANNER */}
                  {selectedPatient && !selectedPatient.isAssignedToMe && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        ⚠️ This patient is assigned to another nurse. Proceed
                        with caution.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.modalSection}>Doctor:</Text>
                  <Text>Dr. {treatmentPlan?.doctor_id?.name || 'N/A'}</Text>

                  <Text style={{ color: '#777', marginBottom: 8 }}>
                    {treatmentPlan?.doctor_id?.specialization || ''}
                  </Text>

                  <Text style={styles.modalSection}>Diagnosis:</Text>
                  <Text style={{ marginBottom: 10 }}>
                    {treatmentPlan.diagnosis}
                  </Text>

                  {/* MEDICINES */}
                  <Text style={styles.modalSection}>Medicines:</Text>
                  {treatmentPlan.medicines?.length ? (
                    treatmentPlan.medicines.map((med, i) => {
                      const key = `med-${i}`;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.checkboxRow}
                          onPress={() => toggleCheck(key)}
                          disabled={isTodayCompleted}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checkedItems[key] && styles.checkboxActive,
                            ]}
                          >
                            {checkedItems[key] && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontWeight: '600' }}>
                              {med.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>
                              Dosage: {med.dosage} | Freq: {med.frequency}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text>No medicines</Text>
                  )}

                  {/* MEALS */}
                  <Text style={styles.modalSection}>Meals:</Text>
                  {treatmentPlan.meals?.length ? (
                    treatmentPlan.meals.map((meal, i) => {
                      const key = `meal-${i}`;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.checkboxRow}
                          onPress={() => toggleCheck(key)}
                          disabled={isTodayCompleted}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checkedItems[key] && styles.checkboxActive,
                            ]}
                          >
                            {checkedItems[key] && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontWeight: '600' }}>
                              {meal.meal_time}
                            </Text>
                            {meal.items?.map((item, index) => (
                              <Text
                                key={index}
                                style={{ fontSize: 13, color: '#555' }}
                              >
                                - {item}
                              </Text>
                            ))}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text>No meal plan</Text>
                  )}

                  {/* PROCEDURES */}
                  <Text style={styles.modalSection}>Procedures:</Text>
                  {treatmentPlan.procedures?.length ? (
                    treatmentPlan.procedures.map((proc, i) => {
                      const key = `proc-${i}`;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.checkboxRow}
                          onPress={() => toggleCheck(key)}
                          disabled={isTodayCompleted}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checkedItems[key] && styles.checkboxActive,
                            ]}
                          >
                            {checkedItems[key] && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <Text style={{ fontWeight: '500' }}>
                            {proc.name || proc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text>No procedures</Text>
                  )}

                  <Text style={styles.modalSection}>Notes:</Text>
                  <Text style={{ fontStyle: 'italic', color: '#555' }}>
                    {treatmentPlan.notes}
                  </Text>
                </ScrollView>

                {/* STATUS BADGE OR COMPLETION BUTTON */}
                {isTodayCompleted ? (
                  <View style={styles.completedBadge}>
                    <Text
                      style={{
                        color: '#27AE60',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      ✅ Today's Treatment Completed
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    // ✅ NEW: Apply disabled styling if not all checked
                    style={[
                      styles.completeBtn,
                      (!isAllChecked || completingTask) && styles.disabledBtn,
                    ]}
                    onPress={handleMarkCompleted}
                    // ✅ NEW: Disable button if API is running OR if boxes aren't fully checked
                    disabled={!isAllChecked || completingTask}
                  >
                    {completingTask ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        {/* ✅ NEW: Change text dynamically to guide the nurse */}
                        {isAllChecked
                          ? 'Mark as Completed'
                          : 'Check all items first'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
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
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },

  searchInput: { fontSize: 15 },

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
    marginBottom: 6,
    fontWeight: '600',
  },

  completeBtn: {
    marginTop: 15,
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  // ✅ NEW: Style for when the button is disabled
  disabledBtn: {
    backgroundColor: '#A0A4A8', // A grey color so it looks unclickable
  },
  completedBadge: {
    marginTop: 15,
    backgroundColor: '#E8FDF3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  warningBox: {
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9F43',
  },
  warningText: {
    color: '#D37711',
    fontWeight: '600',
    fontSize: 13,
  },
  closeBtn: {
    marginTop: 10,
    backgroundColor: '#2D9CDB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  // STYLES FOR CHECKBOX UI
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#2D9CDB',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: '#2D9CDB',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
