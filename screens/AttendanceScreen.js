import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';

const AttendanceScreen = ({ navigation }) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scheduleId, setScheduleId] = useState('');
  const [fileAlias, setFileAlias] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const result = await authService.getMyAttendance();
      
      if (result.success) {
        setAttendanceList(result.data || []);
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tải danh sách điểm danh');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải danh sách điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const takeAttendancePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập camera để điểm danh');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setShowAddModal(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chụp ảnh');
    }
  };

  const submitAttendance = async () => {
    if (!selectedImageUri) {
      Alert.alert('Lỗi', 'Vui lòng chụp ảnh trước');
      return;
    }

    if (!scheduleId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Schedule ID');
      return;
    }

    try {
      setUploadingAttendance(true);
      const result = await authService.addAttendance(
        selectedImageUri,
        scheduleId.trim(),
        fileAlias.trim() || null
      );
      
      if (result.success) {
        Alert.alert('Thành công', result.message || 'Điểm danh thành công');
        setShowAddModal(false);
        setScheduleId('');
        setFileAlias('');
        setSelectedImageUri(null);
        await fetchAttendance();
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể điểm danh');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi điểm danh');
    } finally {
      setUploadingAttendance(false);
    }
  };

  const removeAttendance = async (attendanceId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa điểm danh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await authService.removeAttendance(attendanceId);
              
              if (result.success) {
                Alert.alert('Thành công', result.message || 'Xóa điểm danh thành công');
                await fetchAttendance();
              } else {
                Alert.alert('Lỗi', result.error || 'Không thể xóa điểm danh');
              }
            } catch (error) {
              console.error('Error removing attendance:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa điểm danh');
            }
          }
        }
      ]
    );
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.attendanceInfo}>
        <Text style={styles.attendanceTitle}>
          {item.file_alias || `Điểm danh ${item.id}`}
        </Text>
        <Text style={styles.attendanceDetail}>
          Schedule ID: {item.schedule_id}
        </Text>
        <Text style={styles.attendanceDetail}>
          Ngày: {new Date(item.created_date).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.attendanceDetail}>
          Giờ: {new Date(item.created_date).toLocaleTimeString('vi-VN')}
        </Text>
      </View>
      
      {item.file_path && (
        <Image 
          source={{ uri: item.file_path }}
          style={styles.attendanceImage}
        />
      )}
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeAttendance(item.id)}
      >
        <Text style={styles.removeButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải danh sách điểm danh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Điểm danh</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={takeAttendancePhoto}
        >
          <Text style={styles.addButtonText}>📷 Điểm danh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={attendanceList}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có điểm danh nào</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={takeAttendancePhoto}
            >
              <Text style={styles.emptyButtonText}>Điểm danh ngay</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={attendanceList.length === 0 ? styles.emptyList : null}
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông tin điểm danh</Text>
            
            {selectedImageUri && (
              <Image 
                source={{ uri: selectedImageUri }}
                style={styles.previewImage}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Schedule ID (bắt buộc)"
              value={scheduleId}
              onChangeText={setScheduleId}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Tên file (tùy chọn)"
              value={fileAlias}
              onChangeText={setFileAlias}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setScheduleId('');
                  setFileAlias('');
                  setSelectedImageUri(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitAttendance}
                disabled={uploadingAttendance}
              >
                {uploadingAttendance ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Điểm danh</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceItem: {
    backgroundColor: '#FFF',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  attendanceDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  attendanceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6C757D',
    margin: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AttendanceScreen; 