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
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const result = await authService.getProfile();
      if (result.success) {
        setProfile(result.data);
      } else {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('ProfileScreen mounted, fetching profile...');
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
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
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender) => {
    if (!gender) return 'Chưa có thông tin';
    if (gender === '1' || gender.toLowerCase() === 'nam') return 'Nam';
    if (gender === '2' || gender.toLowerCase() === 'nữ') return 'Nữ';
    return gender;
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để thay đổi avatar');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập camera để chụp ảnh');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
    }
  };

  const updateAvatar = async (imageUri) => {
    setAvatarLoading(true);
    try {
      const result = await authService.updateAvatar(imageUri);
      if (result.success) {
        Alert.alert('Thành công', result.message);
        // Refresh profile to get new avatar
        await fetchProfile();
      } else {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const removeAvatar = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa avatar?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setAvatarLoading(true);
            try {
              const result = await authService.removeAvatar();
              if (result.success) {
                Alert.alert('Thành công', result.message);
                await fetchProfile();
              } else {
                Alert.alert('Lỗi', result.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa avatar');
            } finally {
              setAvatarLoading(false);
            }
          },
        },
      ]
    );
  };

  const showAvatarOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chụp ảnh', 'Chọn từ thư viện', 'Xóa avatar'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              takePhoto();
              break;
            case 2:
              pickImage();
              break;
            case 3:
              removeAvatar();
              break;
          }
        }
      );
    } else {
      Alert.alert(
        'Chọn avatar',
        'Bạn muốn làm gì?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Chụp ảnh', onPress: takePhoto },
          { text: 'Chọn từ thư viện', onPress: pickImage },
          { text: 'Xóa avatar', style: 'destructive', onPress: removeAvatar },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
        <Text style={styles.title}>Thông tin cá nhân</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={showAvatarOptions}
          disabled={avatarLoading}
        >
          {avatarLoading ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <Image
              source={{
                uri: profile?.avatar || 'https://api.hast-app.online/ShareFiles/Avatars/default-avatar.png'
              }}
              style={styles.avatar}
            />
          )}
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>Thay đổi</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Nhấn để thay đổi avatar</Text>
      </View>

      <View style={styles.profileCard}>
        <ProfileField
          label="Tên đăng nhập"
          value={profile?.user_name || profile?.username || 'Chưa có thông tin'}
        />
        <ProfileField
          label="Họ và tên"
          value={profile?.full_name || profile?.fullName || 'Chưa có thông tin'}
        />
        <ProfileField
          label="Email"
          value={profile?.email || 'Chưa có thông tin'}
        />
        <ProfileField
          label="Số điện thoại"
          value={profile?.phone || 'Chưa có thông tin'}
        />
        <ProfileField
          label="Giới tính"
          value={formatGender(profile?.gender)}
        />
        <ProfileField
          label="Ngày sinh"
          value={formatDate(profile?.dob || profile?.date_of_birth)}
        />
        <ProfileField
          label="Vai trò"
          value={profile?.role_name || profile?.role || 'Chưa có thông tin'}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to UpdateProfile with profile:', profile);
            navigation.navigate('UpdateProfile', { profile });
          }}
        >
          <Text style={styles.buttonText}>Cập nhật thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Navigating to ChangePassword');
            navigation.navigate('ChangePassword');
          }}
        >
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, styles.logoutButtonText]}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ProfileField = ({ label, value }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarOverlayText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  avatarHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
  },
});

export default ProfileScreen; 