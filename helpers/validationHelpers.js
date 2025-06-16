export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username) => {
  // Username should be at least 3 characters and only contain alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password) => {
  // Password should be at least 6 characters
  return password && password.length >= 6;
};

export const validateLoginInput = (input) => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, message: 'Vui lòng nhập tên đăng nhập hoặc email' };
  }

  const trimmedInput = input.trim();

  // Check if it's an email or username
  if (trimmedInput.includes('@')) {
    if (!validateEmail(trimmedInput)) {
      return { isValid: false, message: 'Email không hợp lệ' };
    }
  } else {
    if (!validateUsername(trimmedInput)) {
      return { isValid: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự và chỉ chứa chữ, số, dấu gạch dưới' };
    }
  }

  return { isValid: true, message: '' };
};

export const validatePasswordInput = (password) => {
  if (!password || password.trim().length === 0) {
    return { isValid: false, message: 'Vui lòng nhập mật khẩu' };
  }

  if (!validatePassword(password)) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }

  return { isValid: true, message: '' };
}; 