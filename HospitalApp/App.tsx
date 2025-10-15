import React from "react";
import {
  View,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
// Auth Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Home & Profile
import HomeScreen from "./screens/Home/HomeScreen";
import ProfileScreen from "./screens/Profile/ProfileScreen";
import NearbyHospitalsScreen from "./screens/Hospital/NearbyHospitalsScreen";

// Appointment Screens
import AppointmentsMainScreen from "./screens/Appointment/AppointmentMainScreen";
import RecentMeetingsScreen from "./screens/Appointment/RecentMeetingsScreen";
import ScheduleScreen from "./screens/Appointment/ScheduleScreen";
import NewAppointmentModal from "./screens/Appointment/NewAppointmentModal";
import AppointmentSuccess from "./screens/Appointment/AppointmentSuccess";
import AppointmentStatusScreen from "./screens/Appointment/AppointmentStatusScreen";
import BookAppointmentScreen from "./screens/Appointment/BookAppointmentScreen";

// Medical Screens
import MedicalHistoryScreen from "./screens/Medical/MedicalHistoryScreen";
import UploadRecordsScreen from "./screens/Medical/UploadRecordsScreen";

// Others
import PrescriptionsScreen from "./screens/Prescreption/PrescriptionsScreen";
import NotificationsScreen from "./screens/Notification/NotificationsScreen";
import DietPlanScreen from "./screens/Diet/DietPlanScreen";
import BillingScreen from "./screens/Billing/BillingScreen";
import FeedbackScreen from "./screens/Feedback/FeedbackScreen";

// Icons
import HomeIcon from "./Icons/HomeIcon";
import AppointmentIcon from "./Icons/AppointmentIcon";
import MedicalRecordsIcon from "./Icons/MedicalRecordsIcon";
import ProfileIcon from "./Icons/ProfileIcon";
import BillIcon from "./Icons/BillIcon";
import Svg, { Path } from "react-native-svg";
import AssignedDoctors from "./screens/Profile/AssignedDoctor";
import EmergencyContact from "./screens/Profile/EmergencyContact";
import NotificationSettings from "./screens/Profile/NotificationSettings";
import PaymentSettings from "./screens/Profile/PaymentSettings";
import ChangeEmail from "./screens/Profile/ChangeEmail";
import EditProfile from "./screens/Profile/EditProfile";
import AllAppointmentsScreen from "./screens/Appointment/AllAppointmentScreen";
import RecordDetailsScreen from "./screens/Appointment/RecordDetailsScreen";
import ReceiptDetailScreen from "./screens/Billing/ReceiptDetailScreen";
//ReceiptDetailScreen
// Bills Icon


// Navigation objects
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom floating middle button
function CustomTabBarButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={{
        top: -25,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#f2f6e3ff",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 3.5,
          elevation: 5,
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Records"
        component={MedicalHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <MedicalRecordsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsMainScreen}
        options={{
          tabBarIcon: () => <AppointmentIcon focused />,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <AppointmentIcon focused />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillingScreen}
        options={{
          tabBarIcon: ({ focused }) => <BillIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Main Tabs */}
        <Stack.Screen name="NearbyHospitals" component={NearbyHospitalsScreen} />
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Appointment Screens */}
        <Stack.Screen name="AppointmentsMain" component={AppointmentsMainScreen} />
        <Stack.Screen name="RecentMeetings" component={RecentMeetingsScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="NewAppointment" component={NewAppointmentModal} />
        <Stack.Screen name="AppointmentSuccess" component={AppointmentSuccess} />
        <Stack.Screen name="AppointmentStatus" component={AppointmentStatusScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
<Stack.Screen name="AllAppointments" component={AllAppointmentsScreen} />
<Stack.Screen
  name="RecordDetails"
  component={RecordDetailsScreen}
  options={{ title: 'Record Details' }}
/>
        {/* Other Screens */}
       

        <Stack.Screen name="UploadRecords" component={UploadRecordsScreen} />
        <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="DietPlan" component={DietPlanScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />

        <Stack.Screen name="AssignedDoctors" component={AssignedDoctors} />
<Stack.Screen name="EmergencyContact" component={EmergencyContact} />
{/* <Stack.Screen name="InsuranceInformation" component={InsuranceInformation} /> */}
<Stack.Screen name="NotificationSettings" component={NotificationSettings} />
<Stack.Screen name="PaymentSettings" component={PaymentSettings} />
<Stack.Screen name="ChangeEmail" component={ChangeEmail} />
<Stack.Screen name="EditProfile" component={EditProfile} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

