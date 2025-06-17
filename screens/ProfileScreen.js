import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
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
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Chưa cập nhật';
    }
  };

  const formatGender = (gender) => {
    if (!gender) return 'Chưa có thông tin';
    if (gender === '1' || gender.toLowerCase() === 'nam') return 'Nam';
    if (gender === '2' || gender.toLowerCase() === 'nữ') return 'Nữ';
    return gender;
  };

  // Tạm thời comment out avatar functionality để tránh lỗi
  /*
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
  };
  */

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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {/* Tạm thời hiển thị avatar đơn giản */}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          {/* Tạm thời comment out avatar functionality
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleAvatarPress}
            disabled={avatarLoading}
          >
            <Image 
              source={{ uri: profile.avatar || 'https://api.hast-app.online/ShareFiles/Avatars/default-avatar.png' }}
              style={styles.avatar}
            />
            {avatarLoading && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarOverlayText}>Thay đổi</Text>
            </View>
          </TouchableOpacity>
          */}
        </View>
        <Text style={styles.name}>{profile.full_name || 'Chưa cập nhật'}</Text>
        <Text style={styles.role}>{profile.role_name || 'Chưa xác định'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
            <Text style={styles.infoValue}>{profile.user_name || 'Chưa cập nhật'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{profile.email || 'Chưa cập nhật'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{profile.phone || 'Chưa cập nhật'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{formatGender(profile.gender)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>{formatDate(profile.dob)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>
              {profile.status || 'Chưa xác định'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('UpdateProfile', { profile })}
        >
          <Text style={styles.actionButtonText}>📝 Cập nhật thông tin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.actionButtonText}>🔒 Đổi mật khẩu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.actionButtonText, styles.backButtonText]}>← Quay lại</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, styles.actionButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, styles.actionButtonText]}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusActive: {
    color: '#4CAF50',
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
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
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6C757D',
  },
  backButtonText: {
    color: '#FFF',
  },
  logoutSection: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FFF',
  },
});

export default ProfileScreen; 