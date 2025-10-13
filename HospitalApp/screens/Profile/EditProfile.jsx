import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function EditProfile({ navigation }) {
  const [user, setUser] = useState(null);

  // --- Personal Fields ---
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('');

  // --- Medical Fields ---
  const [allergies, setAllergies] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [pastMeds, setPastMeds] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [injuries, setInjuries] = useState('');
  const [surgeries, setSurgeries] = useState('');

  // --- Lifestyle Fields ---
  const [smoking, setSmoking] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [foodPref, setFoodPref] = useState('');
  const [occupation, setOccupation] = useState('');

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('personal');

  // --- Load user data from AsyncStorage ---
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setDob(parsed.dob || '');
        setGender(parsed.gender || '');
        setContact(parsed.contact || parsed.mobile || '');
        setAddress(parsed.address || '');
        setMaritalStatus(parsed.marital_status || '');
        setBloodGroup(parsed.blood_group || '');
        setHeight(parsed.height ? String(parsed.height) : '');
        setWeight(parsed.weight ? String(parsed.weight) : '');
        setAvatar(parsed.profileImage || '');

        // Load medical fields
        setAllergies(
          Array.isArray(parsed.allergies)
            ? parsed.allergies.join(', ')
            : parsed.allergies || '',
        );
        setCurrentMeds(
          Array.isArray(parsed.current_medications)
            ? parsed.current_medications.join(', ')
            : parsed.current_medications || '',
        );
        setPastMeds(
          Array.isArray(parsed.past_medications)
            ? parsed.past_medications.join(', ')
            : parsed.past_medications || '',
        );
        setChronicDiseases(
          Array.isArray(parsed.chronic_diseases)
            ? parsed.chronic_diseases.join(', ')
            : parsed.chronic_diseases || '',
        );
        setInjuries(
          Array.isArray(parsed.injuries)
            ? parsed.injuries.join(', ')
            : parsed.injuries || '',
        );
        setSurgeries(
          Array.isArray(parsed.surgeries)
            ? parsed.surgeries.join(', ')
            : parsed.surgeries || '',
        );

        // Load lifestyle fields
        setSmoking(parsed.smoking_habits || '');
        setAlcohol(parsed.alcohol_consumption || '');
        setActivityLevel(parsed.activity_level || '');
        setFoodPref(parsed.food_preference || '');
        setOccupation(parsed.occupation || '');
      }
    };
    fetchUser();
  }, []);

  // --- Upload image to server ---
  const uploadProfileImageToServer = async uri => {
    try {
      const token = await AsyncStorage.getItem('token');
      const patient_id = user?.id || user?._id;

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
      formData.append('patient_id', patient_id);

      const res = await fetch(
        `${API_BASE_URL}/patients/profile/upload-profile/${patient_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok && data.profile_url) {
        setAvatar(data.profile_url);
        await AsyncStorage.setItem('user', JSON.stringify(data.patient));
      } else {
        console.log('Upload failed:', data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // --- Image Picker ---
  const handleImagePicker = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const result = await launchCamera({
            mediaType: 'photo',
            cameraType: 'front',
            quality: 0.7,
          });

          if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            await uploadProfileImageToServer(uri);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
          });

          if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            await uploadProfileImageToServer(uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // --- Save Profile ---
  const handleSave = async () => {
    try {
      const patient_id = user?.id || user?._id;
      if (!patient_id) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const token = await AsyncStorage.getItem('token');

      const payload = {
        dob,
        gender,
        contact,
        address,
        marital_status: maritalStatus,
        blood_group: bloodGroup,
        height,
        weight,
        profileImage: avatar,

        // Medical

        allergies: allergies
          ? allergies.split(',').map(item => item.trim())
          : [],
        current_medications: currentMeds
          ? currentMeds.split(',').map(item => item.trim())
          : [],
        past_medications: pastMeds
          ? pastMeds.split(',').map(item => item.trim())
          : [],
        chronic_diseases: chronicDiseases
          ? chronicDiseases.split(',').map(item => item.trim())
          : [],
        injuries: injuries ? injuries.split(',').map(item => item.trim()) : [],
        surgeries: surgeries
          ? surgeries.split(',').map(item => item.trim())
          : [],

        // Lifestyle
        smoking_habits: smoking,
        alcohol_consumption: alcohol,
        activity_level: activityLevel,
        food_preferences: foodPref,
        occupation,
      };

      const response = await fetch(
        `${API_BASE_URL}/patients/profile/${patient_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok && data.updatedProfile) {
        await AsyncStorage.setItem('user', JSON.stringify(data.updatedProfile));
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleCancel = () => setShowDiscardModal(true);

  const getInitials = (name = '') => {
    const words = name.trim().split(' ');
    if (words.length === 0) return '';
    if (words.length === 1) return words[0][0]?.toUpperCase() || '';
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const renderAvatar = () => {
    if (avatar) {
      return (
        <TouchableOpacity onPress={handleImagePicker}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={handleImagePicker}
        style={styles.initialsCircle}
      >
        <Text style={styles.initialsText}>{getInitials(user?.name)}</Text>
      </TouchableOpacity>
    );
  };

  const renderPersonalTab = () => (
    <>
      <View style={styles.avatarBox}>
        {renderAvatar()}
        <TouchableOpacity
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const patient_id = user?.id || user?._id;

              const res = await fetch(
                `${API_BASE_URL}/patients/profile/delete-profile/${patient_id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const data = await res.json();

              if (res.ok) {
                setAvatar('');
                await AsyncStorage.setItem(
                  'user',
                  JSON.stringify(data.patient),
                );
                Alert.alert('Success', 'Profile photo deleted successfully');
              } else {
                Alert.alert(
                  'Error',
                  data.message || 'Failed to delete profile photo',
                );
              }
            } catch (error) {
              console.error('Delete photo error:', error);
              Alert.alert(
                'Error',
                'Something went wrong while deleting the photo',
              );
            }
          }}
        >
          <Text style={styles.deletePhoto}>Delete photo</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        placeholder="Full Name"
        value={user?.name || ''}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (DD/MM/YYYY)"
        value={dob}
        onChangeText={setDob}
        placeholderTextColor="#666"
      />

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={gender}
          onValueChange={setGender}
          style={{ color: gender ? '#000' : '#999' }}
        >
          <Picker.Item label="Select Gender" value="" color="#999" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={maritalStatus}
          onValueChange={setMaritalStatus}
          style={{ color: maritalStatus ? '#000' : '#999' }}
        >
          <Picker.Item label="Select Marital Status" value="" color="#999" />
          <Picker.Item label="Single" value="Single" />
          <Picker.Item label="Married" value="Married" />
          <Picker.Item label="Divorced" value="Divorced" />
          <Picker.Item label="Widowed" value="Widowed" />
        </Picker>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={bloodGroup}
          onValueChange={setBloodGroup}
          style={{ color: bloodGroup ? '#000' : '#999' }}
        >
          <Picker.Item label="Select Blood Group" value="" color="#999" />
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
            <Picker.Item key={b} label={b} value={b} />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Height (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        placeholderTextColor="#666"
      />
    </>
  );

  const renderMedicalTab = () => (
    <View>
      <Text style={styles.sectionTitle}>Medical Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Allergies"
        value={allergies}
        onChangeText={setAllergies}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Current Medications"
        value={currentMeds}
        onChangeText={setCurrentMeds}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Past Medications"
        value={pastMeds}
        onChangeText={setPastMeds}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Chronic Diseases"
        value={chronicDiseases}
        onChangeText={setChronicDiseases}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Injuries"
        value={injuries}
        onChangeText={setInjuries}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Surgeries"
        value={surgeries}
        onChangeText={setSurgeries}
        placeholderTextColor="#666"
      />
    </View>
  );

  const renderLifestyleTab = () => (
    <View>
      <Text style={styles.sectionTitle}>Lifestyle Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Smoking Habits"
        value={smoking}
        onChangeText={setSmoking}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Alcohol Consumption"
        value={alcohol}
        onChangeText={setAlcohol}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Activity Level"
        value={activityLevel}
        onChangeText={setActivityLevel}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Food Preferences"
        value={foodPref}
        onChangeText={setFoodPref}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Occupation"
        value={occupation}
        onChangeText={setOccupation}
        placeholderTextColor="#666"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['personal', 'medical', 'lifestyle'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {selectedTab === 'personal' && renderPersonalTab()}
        {selectedTab === 'medical' && renderMedicalTab()}
        {selectedTab === 'lifestyle' && renderLifestyleTab()}
      </ScrollView>

      {/* Discard Modal */}
      {/* Discard Modal */}
      <Modal visible={showDiscardModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Discard changes?</Text>
            <Text style={styles.modalSubtitle}>
              Unsaved changes will be lost.
            </Text>

            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => {
                setShowDiscardModal(false);
                navigation.goBack(); // go back to previous screen
              }}
            >
              <Text style={styles.discardText}>Yes, discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepBtn}
              onPress={() => setShowDiscardModal(false)}
            >
              <Text style={styles.keepText}>No, keep</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F6FB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, color: 'gray' },
  saveText: { fontSize: 16, color: '#00796B', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#D9EFF4',
    paddingVertical: 8,
  },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTabButton: { backgroundColor: '#00796B' },
  tabText: { color: '#00796B', fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: '700' },
  form: { padding: 16 },
  avatarBox: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  initialsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  initialsText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  deletePhoto: { color: 'red', fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00796B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
  discardBtn: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  discardText: { color: '#fff', fontWeight: '600' },
  keepBtn: {
    borderWidth: 1,
    borderColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  keepText: { color: '#00796B', fontWeight: '600' },
});
