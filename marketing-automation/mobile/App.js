import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CampaignsScreen from './src/screens/CampaignsScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#2c3e50',
          borderTopColor: '#3498db',
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: '📊 Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{
          title: '📢 Campañas',
          tabBarLabel: 'Campañas',
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: '👥 Contactos',
          tabBarLabel: 'Contactos',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: '📈 Analytics',
          tabBarLabel: 'Analytics',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (token) => {
    await AsyncStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!token ? (
          <>
            <Stack.Screen
              name="Login"
              children={() => <LoginScreen onLogin={handleLogin} />}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              children={() => <RegisterScreen onRegister={handleLogin} />}
              options={{ title: 'Registro' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Dashboard"
            children={() => <DashboardTabs />}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
            listeners={({ navigation }) => ({
              beforeRemove: (e) => {
                if (e.data.action.type === 'GO_BACK') {
                  e.preventDefault();
                }
              },
            })}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
