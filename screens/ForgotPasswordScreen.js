import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    startAnimations();
    
    // Cleanup animation on unmount
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  const startAnimations = () => {
    // Basic entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Simple pulse animation for icon (more controlled)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    }, 1000); // Delay pulse start
  };

  const validateInput = () => {
    if (!username.trim()) {
      Alert.alert('❌ Lỗi', 'Vui lòng nhập tên đăng nhập hoặc email');
      return false;
    }

    // Basic email validation if contains @
    if (username.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username.trim())) {
        Alert.alert('❌ Lỗi', 'Email không hợp lệ');
        return false;
      }
    } else {
      // Username validation
      if (username.trim().length < 3) {
        Alert.alert('❌ Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        return false;
      }
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.resetPassword(username.trim());

      if (result.success) {
        Alert.alert(
          '✅ Thành công', 
          result.message + '\n\n📧 Vui lòng kiểm tra email để nhận mật khẩu mới.', 
          [
            {
              text: 'Về đăng nhập',
              onPress: () => {
                if (onBackToLogin) {
                  onBackToLogin();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('❌ Lỗi', result.error);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra khi reset mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Floating Particles Background */}
          <View style={styles.particlesContainer}>
            {[...Array(3)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, index * 15 - 30],
                        })
                      },
                      { 
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, Math.sin(index) * 20],
                        })
                      }
                    ],
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.6],
                    }),
                  }
                ]}
              />
            ))}
          </View>

          {/* Animated Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backButtonText}>← Quay lại</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Animated.View 
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                  style={styles.iconGradient}
                >
                  <Text style={styles.iconText}>🔐</Text>
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.titleText}>Quên Mật Khẩu</Text>
              <Text style={styles.subtitleText}>
                Nhập thông tin tài khoản để nhận mật khẩu mới qua email
              </Text>
            </View>
          </Animated.View>

          {/* Animated Form */}
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
            <Text style={styles.welcomeText}>Reset Mật Khẩu 🔄</Text>
            <Text style={styles.descriptionText}>
              Mật khẩu mới sẽ được gửi đến email của bạn sau khi xác thực thành công
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>👤 Tên đăng nhập hoặc Email</Text>
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
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#059669', '#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resetButtonGradient}
            >
              <View style={styles.resetButtonContent}>
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.resetButtonText, {marginLeft: 10}]}>Đang gửi yêu cầu...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.resetButtonText}>📧 Gửi yêu cầu reset</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Lưu ý quan trọng</Text>
            <Text style={styles.infoText}>
              • Mật khẩu mới sẽ được gửi qua email đã đăng ký
            </Text>
            <Text style={styles.infoText}>
              • Vui lòng đăng nhập lại sau khi nhận được email
            </Text>
            <Text style={styles.infoText}>
              • Nếu không đăng nhập trong thời hạn, tài khoản sẽ bị khóa
            </Text>
            <Text style={styles.infoText}>
              • Liên hệ quản trị viên nếu không nhận được email
            </Text>
          </View>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleBackToLogin}
            disabled={isLoading}
          >
            <Text style={styles.backToLoginText}>
              🔙 Về trang đăng nhập
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: Math.random() * height,
    left: Math.random() * width,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconText: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 60,
    minHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  formHeader: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontSize: 17,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    color: '#1F2937',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 25,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 32,
    overflow: 'hidden',
  },
  resetButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 25,
  },
  resetButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoCard: {
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#3B82F6',
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 22,
    marginBottom: 6,
    fontWeight: '500',
  },
  backToLoginButton: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  backToLoginText: {
    color: '#6B7280',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});