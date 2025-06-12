// GaraadApp/utils/validators.ts
export const isValidEmail = (email: string): boolean => {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Example: Password must be at least 8 characters
  return password.length >= 8;
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
}

export const isValidAge = (age: string): boolean => {
  if (!isNotEmpty(age)) return false;
  const numAge = parseInt(age, 10);
  return !isNaN(numAge) && numAge > 0 && numAge < 150;
}