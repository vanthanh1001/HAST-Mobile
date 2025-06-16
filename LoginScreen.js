import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AuthService from './services/authService';
import DebugPanel from './components/DebugPanel';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onLoginSuccess, onForgotPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [lastApiResponse, setLastApiResponse] = useState(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    checkAuthStatus();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      if (isAuthenticated && onLoginSuccess) {
        onLoginSuccess();
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setIsLoading(true);

    // Add button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const result = await AuthService.login(username.trim(), password);
      
      // Save API response for debugging
      setLastApiResponse({
        timestamp: new Date().toISOString(),
        request: { username: username.trim(), password: '***' },
        response: result,
        success: result.success
      });

      if (result.success) {
        const message = result.warning 
          ? `Đăng nhập thành công!\n\n⚠️ Cảnh báo: ${result.warning}`
          : 'Đăng nhập thành công!';
          
        Alert.alert('🎉 Thành công', message, [
          {
            text: 'Debug',
            style: 'default',
            onPress: () => setShowDebugPanel(true),
          },
          {
            text: result.warning ? 'Tiếp tục (Cảnh báo)' : 'Tiếp tục',
            onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess();
              }
            },
          },
        ]);
      } else {
        Alert.alert('❌ Lỗi đăng nhập', result.error, [
          {
            text: 'Debug',
            style: 'default',
            onPress: () => setShowDebugPanel(true),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLastApiResponse({
        timestamp: new Date().toISOString(),
        request: { username: username.trim(), password: '***' },
        error: error.message,
        success: false
      });
      
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.', [
        {
          text: 'Debug',
          style: 'default',
          onPress: () => setShowDebugPanel(true),
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await AuthService.testConnection();
      if (result.success) {
        Alert.alert('🌐 Kết nối thành công', 'API server đang hoạt động bình thường');
      } else {
        Alert.alert('🔴 Lỗi kết nối', result.error);
      }
    } catch (error) {
      Alert.alert('🔴 Lỗi kết nối', 'Không thể kết nối đến server');
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Đang kiểm tra trạng thái đăng nhập...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>HAST</Text>
              <View style={styles.logoAccent} />
            </View>
            <Text style={styles.logoSubtext}>Thời Khóa Biểu Thông Minh</Text>
            
                         {/* Action Buttons */}
             <View style={styles.actionButtonsContainer}>
               <TouchableOpacity
                 style={styles.testConnectionButton}
                 onPress={handleTestConnection}
                 disabled={isTestingConnection}
               >
                 {isTestingConnection ? (
                   <ActivityIndicator size="small" color="#10B981" />
                 ) : (
                   <Text style={styles.testConnectionText}>🌐 Test Kết Nối</Text>
                 )}
               </TouchableOpacity>
               
               {lastApiResponse && (
                 <TouchableOpacity
                   style={styles.debugButton}
                   onPress={() => setShowDebugPanel(true)}
                 >
                   <Text style={styles.debugButtonText}>🐛 Debug</Text>
                 </TouchableOpacity>
               )}
             </View>
          </View>
        </Animated.View>

        {/* Animated Login Form */}
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.welcomeText}>Chào mừng trở lại! 👋</Text>
            <Text style={styles.subtitleText}>Đăng nhập để tiếp tục sử dụng ứng dụng</Text>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>👤 Tên đăng nhập / Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập tên đăng nhập hoặc email"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>🤔 Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <View style={styles.loginButtonContent}>
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loginButtonText}>Đang đăng nhập...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.loginButtonText}>🚀 Đăng nhập</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚠️ Lưu ý quan trọng</Text>
            <Text style={styles.infoText}>
              • Đăng nhập thất bại quá 5 lần sẽ bị khóa tài khoản
            </Text>
            <Text style={styles.infoText}>
              • Liên hệ quản trị viên để mở khóa tài khoản
            </Text>
            <Text style={styles.infoText}>
              • Sử dụng tài khoản được cấp bởi nhà trường
            </Text>
          </View>
                 </Animated.View>
       </ScrollView>
       
       {/* Debug Panel */}
       <DebugPanel
         visible={showDebugPanel}
         onClose={() => setShowDebugPanel(false)}
         debugData={lastApiResponse}
       />
     </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4F46E5',
    textShadowColor: 'rgba(79, 70, 229, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -8,
    width: 80,
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#E5E7EB',
    marginBottom: 20,
    fontWeight: '300',
    textAlign: 'center',
  },
     actionButtonsContainer: {
     flexDirection: 'row',
     gap: 12,
     marginTop: 20,
   },
   testConnectionButton: {
     backgroundColor: 'rgba(16, 185, 129, 0.2)',
     borderWidth: 1,
     borderColor: '#10B981',
     borderRadius: 12,
     paddingHorizontal: 16,
     paddingVertical: 8,
   },
   testConnectionText: {
     color: '#10B981',
     fontSize: 14,
     fontWeight: '600',
   },
   debugButton: {
     backgroundColor: 'rgba(239, 68, 68, 0.2)',
     borderWidth: 1,
     borderColor: '#EF4444',
     borderRadius: 12,
     paddingHorizontal: 16,
     paddingVertical: 8,
   },
   debugButtonText: {
     color: '#EF4444',
     fontSize: 14,
     fontWeight: '600',
   },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    minHeight: height * 0.65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  formHeader: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingRight: 55,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
}); 