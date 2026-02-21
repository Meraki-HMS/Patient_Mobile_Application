import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NurseProfileScreen = ({ navigation }) => {
  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const ProfileItem = ({ title, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.itemText}>{title}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
            style={styles.avatarSmall}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Anita Sharma</Text>
        <Text style={styles.role}>Staff Nurse • ICU Ward</Text>
      </View>

      {/* Nurse Options */}
      <View style={styles.list}>
        <ProfileItem
          title="My Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileItem title="Shift & Duty Status" onPress={() => {}} />
        <ProfileItem title="Assigned Ward" onPress={() => {}} />
        <ProfileItem title="Treatment History" onPress={() => {}} />
        <ProfileItem
          title="Notification Settings"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <ProfileItem
          title="Change Password"
          onPress={() => navigation.navigate('NurseForgotPassword')}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
  },

  scrollContent: {
    paddingBottom: 40, // ✅ ensures logout always visible
  },

  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  role: {
    marginTop: 6,
    color: '#666',
    fontSize: 14,
  },

  list: {
    marginHorizontal: 16,
    marginTop: 10,
  },

  item: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },

  itemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },

  arrow: {
    fontSize: 20,
    color: '#999',
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
  },

  logoutText: {
    color: '#E53935',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NurseProfileScreen;
