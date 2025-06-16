import ENV from './environment';

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  DEBUG: ENV.DEBUG,
  ENDPOINTS: {
    LOGIN: '/api/auth/sign-in',
    LOGIN_GOOGLE: '/api/auth/sign-in-google',
    LOGOUT: '/api/auth/sign-out',
    LOGOUT_ALL: '/api/auth/sign-out-all-application',
    RESET_PASSWORD: '/api/auth/reset-password',
    UPDATE_PASSWORD: '/api/auth/update-password'
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 