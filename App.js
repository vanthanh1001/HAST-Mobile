import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import UpdateProfileScreen from './screens/UpdateProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AuthService from './services/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'forgotPassword', 'home', 'profile', 'updateProfile', 'changePassword', 'attendance'
  const [screenData, setScreenData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const showForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const showLogin = () => {
    setCurrentScreen('login');
  };

  // Navigation methods
  const navigate = (screenName, params = null) => {
    setCurrentScreen(screenName);
    setScreenData(params);
  };

  const goBack = () => {
    // Simple back navigation logic
    console.log('Going back from:', currentScreen); // Debug log
    switch (currentScreen) {
      case 'UpdateProfile':
      case 'ChangePassword':
        setCurrentScreen('profile');
        break;
      case 'profile':
      case 'attendance':
        setCurrentScreen('home');
        break;
      default:
        setCurrentScreen('home');
        break;
    }
    setScreenData(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated) {
    // Handle authenticated screens
    console.log('Current screen:', currentScreen); // Debug log
    switch (currentScreen) {
      case 'profile':
        return <ProfileScreen navigation={{ navigate, goBack, replace: navigate }} />;
      case 'UpdateProfile':
        return (
          <UpdateProfileScreen 
            navigation={{ navigate, goBack, replace: navigate }} 
            route={{ params: screenData }}
          />
        );
      case 'ChangePassword':
        return <ChangePasswordScreen navigation={{ navigate, goBack, replace: navigate }} />;
      case 'attendance':
        return <AttendanceScreen navigation={{ navigate, goBack, replace: navigate }} />;
      case 'home':
      default:
        return <HomeScreen onLogout={handleLogout} navigation={{ navigate, goBack, replace: navigate }} />;
    }
  }

  // Handle auth screens navigation
  if (currentScreen === 'forgotPassword') {
    return <ForgotPasswordScreen onBackToLogin={showLogin} />;
  }

  return (
    <LoginScreen 
      onLoginSuccess={handleLoginSuccess} 
      onForgotPassword={showForgotPassword}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});