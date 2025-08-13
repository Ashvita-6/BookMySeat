export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStudentId = (studentId: string): boolean => {
  // Assuming student ID format: 3 letters followed by 3 numbers (e.g., STU001)
  const studentIdRegex = /^[A-Z]{3}\d{3}$/;
  return studentIdRegex.test(studentId);
};

export const validateBookingTime = (startTime: Date, endTime: Date): { isValid: boolean; error?: string } => {
  const now = new Date();
  const maxBookingHours = 4;
  const hoursDifference = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  if (startTime <= now) {
    return { isValid: false, error: 'Start time must be in the future' };
  }
  
  if (endTime <= startTime) {
    return { isValid: false, error: 'End time must be after start time' };
  }
  
  if (hoursDifference > maxBookingHours) {
    return { isValid: false, error: `Booking duration cannot exceed ${maxBookingHours} hours` };
  }
  
  if (hoursDifference < 0.5) {
    return { isValid: false, error: 'Minimum booking duration is 30 minutes' };
  }
  
  return { isValid: true };
};
