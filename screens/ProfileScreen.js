import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen mounted, fetching profile...');
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const result = await authService.getProfile();
      
      if (result.success) {
        setProfile(result.data);
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tải thông tin profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Cập nhật ảnh đại diện',
      'Chọn nguồn ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chụp ảnh', onPress: takePhoto },
        { text: 'Chọn từ thư viện', onPress: pickImage },
        profile?.avatar && profile.avatar !== 'https://api.hast-app.online/ShareFiles/Avatars/default-avatar.png' 
          ? { text: 'Xóa ảnh', onPress: removeAvatar, style: 'destructive' }
          : null,
      ].filter(Boolean)
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập camera để chụp ảnh');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chụp ảnh');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh');
    }
  };

  const updateAvatar = async (imageUri) => {
    try {
      setAvatarLoading(true);
      const result = await authService.updateAvatar(imageUri);
      
      if (result.success) {
        Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
        await fetchProfile(); // Refresh profile data
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể cập nhật ảnh đại diện');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
    } finally {
      setAvatarLoading(false);
    }
  };

  const removeAvatar = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa ảnh đại diện?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setAvatarLoading(true);
              const result = await authService.removeAvatar();
              
              if (result.success) {
                Alert.alert('Thành công', 'Xóa ảnh đại diện thành công');
                await fetchProfile(); // Refresh profile data
              } else {
                Alert.alert('Lỗi', result.error || 'Không thể xóa ảnh đại diện');
              }
            } catch (error) {
              console.error('Error removing avatar:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa ảnh đại diện');
            } finally {
              setAvatarLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigate back to home or login
              navigation.navigate('home');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          disabled={avatarLoading}
        >
          {profile.avatar && profile.avatar !== 'https://api.hast-app.online/ShareFiles/Avatars/default-avatar.png' ? (
            <Image 
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          
          {avatarLoading && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          )}
          
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>Thay đổi</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{profile.full_name || 'Chưa cập nhật'}</Text>
        <Text style={styles.role}>{profile.role_name || 'Chưa xác định'}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Tên đăng nhập: {profile.user_name || 'Chưa cập nhật'}</Text>
          <Text style={styles.infoText}>Email: {profile.email || 'Chưa cập nhật'}</Text>
          <Text style={styles.infoText}>Số điện thoại: {profile.phone || 'Chưa cập nhật'}</Text>
          <Text style={styles.infoText}>Giới tính: {profile.gender || 'Chưa cập nhật'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('UpdateProfile', { profile })}
          >
            <Text style={styles.buttonText}>📝 Cập nhật thông tin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.buttonText}>🔒 Đổi mật khẩu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>← Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarOverlayText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  role: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6C757D',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
});

export default ProfileScreen; 