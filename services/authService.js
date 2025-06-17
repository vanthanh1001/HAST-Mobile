import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, getApiUrl } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Log request for debugging
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });

        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => {
        // Log response for debugging
        console.log('API Response:', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error) => {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          // Token expired or invalid, remove stored token
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userInfo');
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    try {
      console.log('Attempting login for user:', username);
      
      const response = await this.api.post(API_CONFIG.ENDPOINTS.LOGIN, {
        user_name: username,
        password: password,
      });

      console.log('Login response received:', response.data);

      // HAST API always returns 200, check response.data.success
      if (response.status === 200) {
        const responseData = response.data;
        
        // HAST API specific format
        if (responseData.hasOwnProperty('success')) {
          if (responseData.success === true) {
            // Check if user is teacher before allowing login
            const userInfo = responseData.user || 
                            responseData.data || 
                            responseData.data_set ||
                            { username: username };
            
            // Check is_teacher field or role_name contains "teacher"
            const isTeacher = userInfo.is_teacher === true || 
                             userInfo.is_teacher === 1 ||
                             (userInfo.role_name && userInfo.role_name.toLowerCase().includes('teacher')) ||
                             (userInfo.role_name && userInfo.role_name.toLowerCase().includes('giáo viên'));
            
            if (!isTeacher) {
              return {
                success: false,
                error: 'Chỉ giáo viên mới được phép đăng nhập ứng dụng mobile này.',
                statusCode: 403,
              };
            }
            
            // Successful login - look for token in various possible locations
            const token = responseData.token || 
                         responseData.access_token || 
                         responseData.data?.token || 
                         responseData.data?.access_token ||
                         responseData.data_set?.token;
            
            if (token) {
              await SecureStore.setItemAsync('authToken', token);
              // Store user info if available
              await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
            } else {
              // Success but no token - might be a different auth flow
              console.warn('Login successful but no token found in response');
              await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
            }
            
            return {
              success: true,
              data: responseData,
              message: responseData.description || 'Đăng nhập thành công',
              userInfo: userInfo,
            };
          } else {
            // Explicit failure from HAST API
            return {
              success: false,
              error: responseData.description || responseData.error || 'Đăng nhập thất bại',
              statusCode: responseData.status,
            };
          }
        }
        
        // Fallback: check for other success indicators if success field missing
        if (responseData.token || responseData.access_token || responseData.data?.token) {
          const token = responseData.token || responseData.access_token || responseData.data.token;
          await SecureStore.setItemAsync('authToken', token);
          await SecureStore.setItemAsync('userInfo', JSON.stringify(responseData.user || responseData.data || {}));
          
          return {
            success: true,
            data: responseData,
          };
        }
        
        // Check for error indicators in description or other fields
        if (responseData.description) {
          const desc = responseData.description.toLowerCase();
          if (desc.includes('thành công') || desc.includes('success')) {
            return {
              success: true,
              data: responseData,
              message: responseData.description,
            };
          } else {
            return {
              success: false,
              error: responseData.description,
            };
          }
        }

        // Default fallback for unclear responses
        console.warn('Unclear response format, full response:', responseData);
        return {
          success: false,
          error: `Response không rõ ràng. Data: ${JSON.stringify(responseData)}`,
          debugInfo: responseData,
        };
      }

      // Non-200 status codes (shouldn't happen with HAST API)
      return {
        success: false,
        error: response.data?.description || response.data?.message || `HTTP ${response.status}: ${response.statusText}`,
      };

    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        let errorMessage = `HTTP ${status}`;
        
        if (data?.description) {
          errorMessage = data.description;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (status === 401) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
        } else if (status === 403) {
          errorMessage = 'Tài khoản bị khóa hoặc không có quyền truy cập';
        } else if (status === 404) {
          errorMessage = 'API endpoint không tồn tại';
        } else if (status >= 500) {
          errorMessage = 'Lỗi server nội bộ';
        }
        
        return {
          success: false,
          error: errorMessage,
          statusCode: status,
          debugInfo: data,
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
          networkError: true,
        };
      } else {
        // Other error
        return {
          success: false,
          error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
          originalError: error.message,
        };
      }
    }
  }

  async logout() {
    try {
      await this.api.post(API_CONFIG.ENDPOINTS.LOGOUT);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
      return { success: true };
    }
  }

  async resetPassword(username) {
    try {
      console.log('🔄 Starting password reset for:', username);
      
      const response = await this.api.put(API_CONFIG.ENDPOINTS.RESET_PASSWORD, username, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📧 Reset password response:', {
        status: response.status,
        data: response.data
      });

      // Check HAST API success flag
      if (response.data && response.data.success === true) {
        return {
          success: true,
          message: response.data.description || 'Yêu cầu reset mật khẩu thành công',
          data: response.data
        };
      } else {
        // Handle HAST API error format
        const errorMessage = response.data?.description || 'Có lỗi xảy ra khi reset mật khẩu';
        console.log('❌ Reset password failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.log('❌ Reset password error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        const errorMessage = error.response.data?.description || 
                            error.response.data?.message || 
                            `Server error: ${error.response.status}`;
        return {
          success: false,
          error: errorMessage
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        };
      } else {
        return {
          success: false,
          error: error.message || 'Có lỗi không xác định xảy ra'
        };
      }
    }
  }

  async getStoredToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUserInfo() {
    try {
      const userInfo = await SecureStore.getItemAsync('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting stored user info:', error);
      return null;
    }
  }

  async isAuthenticated() {
    const token = await this.getStoredToken();
    return !!token;
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/time-slot`, {
        timeout: 5000,
      });
      
      // Check HAST API response format
      if (response.data?.success === true) {
        return { 
          success: true, 
          data: response.data,
          message: response.data.description || 'Kết nối thành công'
        };
      } else {
        return {
          success: false,
          error: response.data?.description || 'API trả về lỗi'
        };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Không thể kết nối đến server' 
      };
    }
  }

  async getProfile() {
    try {
      console.log('Getting user profile...');
      
      const response = await this.api.get('/api/user/profile');
      
      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.hasOwnProperty('success')) {
          if (responseData.success === true) {
            return {
              success: true,
              data: responseData.data || responseData.data_set,
              message: responseData.description || 'Lấy thông tin profile thành công',
            };
          } else {
            return {
              success: false,
              error: responseData.description || 'Không thể lấy thông tin profile',
            };
          }
        }
        
        // Fallback for different response format
        return {
          success: true,
          data: responseData,
        };
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
      
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến server',
          networkError: true,
        };
      } else {
        return {
          success: false,
          error: error.message,
        };
      }
    }
  }

  async updateProfile(profileData) {
    try {
      console.log('Updating user profile...', profileData);
      
      const response = await this.api.put('/api/user/update', profileData);
      
      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.hasOwnProperty('success')) {
          if (responseData.success === true) {
            // Update stored user info
            const currentUserInfo = await this.getStoredUserInfo();
            const updatedUserInfo = { ...currentUserInfo, ...profileData };
            await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUserInfo));
            
            return {
              success: true,
              data: responseData.data || responseData.data_set,
              message: responseData.description || 'Cập nhật thông tin thành công',
            };
          } else {
            return {
              success: false,
              error: responseData.description || 'Không thể cập nhật thông tin',
            };
          }
        }
        
        // Fallback for different response format
        return {
          success: true,
          data: responseData,
          message: 'Cập nhật thông tin thành công',
        };
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
      
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến server',
          networkError: true,
        };
      } else {
        return {
          success: false,
          error: error.message,
        };
      }
    }
  }

  async changePassword(oldPassword, newPassword, confirmNewPassword) {
    try {
      console.log('Changing password...');
      
      const response = await this.api.put('/api/auth/update-password', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      
      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.hasOwnProperty('success')) {
          if (responseData.success === true) {
            return {
              success: true,
              message: responseData.description || 'Đổi mật khẩu thành công',
            };
          } else {
            return {
              success: false,
              error: responseData.description || 'Không thể đổi mật khẩu',
            };
          }
        }
        
        // Fallback for different response format
        return {
          success: true,
          message: 'Đổi mật khẩu thành công',
        };
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
      
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến server',
          networkError: true,
        };
      } else {
        return {
          success: false,
          error: error.message,
        };
      }
    }
  }

  async updateAvatar(imageUri) {
    try {
      console.log('Updating avatar...', imageUri);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      const response = await this.api.put('/api/user/update-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.hasOwnProperty('success')) {
          if (responseData.success === true) {
            return {
              success: true,
              data: responseData.data || responseData.data_set,
              message: responseData.description || 'Cập nhật avatar thành công',
            };
          } else {
            return {
              success: false,
              error: responseData.description || 'Không thể cập nhật avatar',
            };
          }
        }
        
        // Fallback for different response format
        return {
          success: true,
          message: 'Cập nhật avatar thành công',
        };
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
      
    } catch (error) {
      console.error('Update avatar error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến server',
          networkError: true,
        };
      } else {
        return {
          success: false,
          error: error.message,
        };
      }
    }
  }

  async removeAvatar() {
    try {
      console.log('Removing avatar...');
      
      const response = await this.api.delete(API_CONFIG.ENDPOINTS.REMOVE_AVATAR);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            message: responseData.description || 'Xóa avatar thành công',
            data: responseData.data,
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể xóa avatar',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi xóa avatar',
      };

    } catch (error) {
      console.error('Remove avatar error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }

  // Attendance APIs
  async getMyAttendance() {
    try {
      console.log('Getting my attendance...');
      
      const response = await this.api.get('/api/attendance/my-attendance');

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            data: responseData.data || responseData.data_set || [],
            pagination: responseData.pagination,
            message: responseData.description || 'Lấy danh sách điểm danh thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể lấy danh sách điểm danh',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi lấy danh sách điểm danh',
      };

    } catch (error) {
      console.error('Get attendance error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }

  async addAttendance(imageUri, scheduleId, fileAlias = null) {
    try {
      console.log('Adding attendance...', { scheduleId, fileAlias });
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add image file
      const filename = `attendance_${Date.now()}.jpg`;
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      });

      // Build URL with query parameters
      let url = `/api/attendance/add?scheduleId=${scheduleId}`;
      if (fileAlias) {
        url += `&fileAlias=${encodeURIComponent(fileAlias)}`;
      }

      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.description || 'Điểm danh thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể điểm danh',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi điểm danh',
      };

    } catch (error) {
      console.error('Add attendance error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }

  async removeAttendance(attendanceId) {
    try {
      console.log('Removing attendance...', attendanceId);
      
      const response = await this.api.delete(`/api/attendance/remove/${attendanceId}`);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            message: responseData.description || 'Xóa điểm danh thành công',
            data: responseData.data,
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể xóa điểm danh',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi xóa điểm danh',
      };

    } catch (error) {
      console.error('Remove attendance error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }

  // Class APIs for teachers
  async getMyClasses() {
    try {
      console.log('Getting my classes...');
      
      const response = await this.api.get('/api/class?filter[teacher_user_name]=' + encodeURIComponent(await this.getStoredUserInfo()?.user_name || ''));

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            data: responseData.data || responseData.data_set || [],
            pagination: responseData.pagination,
            message: responseData.description || 'Lấy danh sách lớp thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể lấy danh sách lớp',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi lấy danh sách lớp',
      };

    } catch (error) {
      console.error('Get classes error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }

  async getClassSchedule(classCode) {
    try {
      console.log('Getting class schedule...', classCode);
      
      const response = await this.api.get(`/api/class/class-schedule-config/${classCode}`);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success === true) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.description || 'Lấy lịch học thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.description || 'Không thể lấy lịch học',
          };
        }
      }

      return {
        success: false,
        error: 'Lỗi không xác định khi lấy lịch học',
      };

    } catch (error) {
      console.error('Get class schedule error:', error);
      
      if (error.response) {
        const data = error.response.data;
        return {
          success: false,
          error: data?.description || data?.message || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Không thể kết nối đến server',
        networkError: true,
      };
    }
  }
}

export default new AuthService(); 