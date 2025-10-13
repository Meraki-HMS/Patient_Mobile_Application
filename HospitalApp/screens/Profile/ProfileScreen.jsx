import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MedicalIcon from '../../Icons/MedicalIcon';
import EmergencyContactIcon from '../../Icons/EmergencyContactIcon';
import InsuranceIcon from '../../Icons/InsuranceIcon';
import NotificationIcon from '../../Icons/NotificationIcon';
import PaymentIcon from '../../Icons/PaymentIcon';
import EmailIcon from '../../Icons/EmailIcon';

// 🔹 Helper to get initials
const getInitials = name => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  // 🔹 Load user from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.log('Error fetching user:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchUser);
    fetchUser();

    return unsubscribe;
  }, [navigation]);

  // 🔹 MenuItem component
  const MenuItem = ({ title, screen, Icon }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={styles.menuLeft}>
        {Icon && <Icon size={22} color="#00796B" />}
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  // 🔹 Determine profile image to show
  const profilePic =
    user?.profileImage || user?.profile_url || user?.avatar || null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* User Info */}
      <TouchableOpacity
        style={styles.userBox}
        onPress={() => navigation.navigate('EditProfile')}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>
              {getInitials(user?.name || 'Guest User')}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userAge}>
            {user?.age ? `${user.age} y.o.` : ''}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <MenuItem
        title="Assigned Doctors"
        screen="AssignedDoctors"
        Icon={MedicalIcon}
      />
      <MenuItem
        title="Emergency Contact"
        screen="EmergencyContact"
        Icon={EmergencyContactIcon}
      />
      <MenuItem
        title="Insurance Information"
        screen="InsuranceInformation"
        Icon={InsuranceIcon}
      />
      <MenuItem
        title="Notification Settings"
        screen="NotificationSettings"
        Icon={NotificationIcon}
      />
      <MenuItem
        title="Payment Settings"
        screen="PaymentSettings"
        Icon={PaymentIcon}
      />
      <MenuItem title="Change Email" screen="ChangeEmail" Icon={EmailIcon} />

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        }}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F6FB', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  // User Box
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
  },

  // Avatar and Initials Circle
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  initialsCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00796B', // teal color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: { fontSize: 20, color: '#fff', fontWeight: '700' },

  userName: { fontSize: 18, fontWeight: '600' },
  userAge: { fontSize: 14, color: '#555' },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 12,
  },
  menuText: { fontSize: 16 },
  arrow: { fontSize: 20, color: '#888' },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Logout
  logoutBtn: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, color: 'red', fontWeight: '600' },
});
