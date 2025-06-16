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
            // Successful login - look for token in various possible locations
            const token = responseData.token || 
                         responseData.access_token || 
                         responseData.data?.token || 
                         responseData.data?.access_token ||
                         responseData.data_set?.token;
            
            if (token) {
              await SecureStore.setItemAsync('authToken', token);
              // Store user info if available
              const userInfo = responseData.user || 
                              responseData.data || 
                              responseData.data_set ||
                              { username: username };
              await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
            } else {
              // Success but no token - might be a different auth flow
              console.warn('Login successful but no token found in response');
              await SecureStore.setItemAsync('userInfo', JSON.stringify({ username: username }));
            }
            
            return {
              success: true,
              data: responseData,
              message: responseData.description || 'Đăng nhập thành công',
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
}

export default new AuthService(); 