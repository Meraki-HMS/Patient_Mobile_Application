import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Card from '../../components/Card';
import { COLORS } from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecentMeetingsScreen() {
  const navigation = useNavigation();
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (userData && token) {
          const user = JSON.parse(userData);

          const res = await axios.get(
            `${API_BASE_URL}/api/patient-appointments/patient/${user.id}/past`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.data && res.data.appointments) {
            setRecentMeetings(res.data.appointments);
          }
        }
      } catch (err) {
        console.log('Error loading meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const renderMeeting = ({ item }) => (
    <Card style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{item.doctorName}</Text>
      <Text style={styles.meta}>Date: {item.date}</Text>
      <Text style={styles.meta}>Time: {item.time}</Text>
      <Text style={styles.meta}>
        Session: {item.sessionType ? item.sessionType : 'N/A'}
      </Text>
      <Text style={styles.meta}>
        Appointment Type: {item.appointmentType ? item.appointmentType : 'N/A'}
      </Text>

      {/* ✅ View Details Button styled same as "Recent" tab (blue text, transparent bg) */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() =>
          navigation.navigate('RecordDetails', {
            appointmentId: item.appointmentId,
          })
        }
      >
        <Text style={styles.linkButtonText}>View Details</Text>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>Recent Appointments</Text>
        {recentMeetings.length > 0 ? (
          <FlatList
            data={recentMeetings}
            keyExtractor={item =>
              item.appointmentId?.toString() || Math.random().toString()
            }
            renderItem={renderMeeting}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={{ color: COLORS.subtext, marginTop: 20 }}>
            No recent appointments
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.text,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: COLORS.text,
  },
  meta: { color: COLORS.subtext, marginTop: 2 },

  // 🔹 New styling for blue link-style button
  linkButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 12,
  },
  linkButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
