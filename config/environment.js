import Constants from 'expo-constants';

// Environment configuration
const ENV = {
  development: {
    API_BASE_URL: 'https://api.hast-app.online',
    DEBUG: true,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.hast-app.online',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://api.hast-app.online',
    DEBUG: false,
  },
};

// Get current environment
function getEnvVars(env = Constants.manifest?.releaseChannel) {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.development;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'production') {
    return ENV.production;
  } else {
    return ENV.development;
  }
}

export default getEnvVars(); 