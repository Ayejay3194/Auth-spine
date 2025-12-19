import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import BookingScreen from './screens/BookingScreen';
import ProfileScreen from './screens/ProfileScreen';
import PaymentScreen from './screens/PaymentScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import LoginScreen from './screens/LoginScreen';

// Store
import { useAuthStore } from './store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BookingStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="BookingList" component={BookingScreen} options={{ title: 'My Bookings' }} />
    <Stack.Screen name="BookingDetail" component={BookingScreen} options={{ title: 'Booking Details' }} />
  </Stack.Navigator>
);

const PaymentStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="PaymentList" component={PaymentScreen} options={{ title: 'Payments' }} />
    <Stack.Screen name="PaymentDetail" component={PaymentScreen} options={{ title: 'Payment Details' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileView" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="ProfileEdit" component={ProfileScreen} options={{ title: 'Edit Profile' }} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Bookings') {
          iconName = focused ? 'calendar-check' : 'calendar-outline';
        } else if (route.name === 'Payments') {
          iconName = focused ? 'credit-card' : 'credit-card-outline';
        } else if (route.name === 'Notifications') {
          iconName = focused ? 'bell' : 'bell-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'account' : 'account-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Bookings" component={BookingStack} />
    <Tab.Screen name="Payments" component={PaymentStack} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ animationEnabled: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
