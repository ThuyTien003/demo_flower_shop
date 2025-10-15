// Validate email format
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Validate phone number (Vietnamese format: 0912345678 or +84912345678)
export const isValidPhone = (phone) => {
  const re = /^(0|\+84)[0-9]{9,10}$/;
  return re.test(String(phone).replace(/\s/g, ''));
};

// Validate password strength - Returns { isValid, message }
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  if (password.length > 100) {
    return { isValid: false, message: 'Mật khẩu quá dài' };
  }
  return { isValid: true, message: '' };
};

// Sanitize input string - Remove dangerous characters
export const sanitizeInput = (str) => {
  if (!str) return '';
  return String(str).trim().replace(/[<>]/g, '');
};
