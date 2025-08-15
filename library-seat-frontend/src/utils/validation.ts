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

// library-seat-frontend/src/utils/validation.ts
// Updated validation functions with better time handling

export const validateBookingTime = (
  startTime: Date,
  endTime: Date
): { isValid: boolean; error?: string } => {
  const now = new Date();
  const maxBookingHours = 4;
  const minBookingMinutes = 30;

  // Check if times are valid dates
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Check if start time is in the future (with 5-minute buffer for processing time)
  const bufferTime = new Date(now.getTime() + 5 * 60 * 1000);
  if (startTime <= bufferTime) {
    return {
      isValid: false,
      error: 'Start time must be at least 5 minutes in the future',
    };
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    return { isValid: false, error: 'End time must be after start time' };
  }

  // Check booking duration
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationMinutes = durationMs / (1000 * 60);

  if (durationHours > maxBookingHours) {
    return {
      isValid: false,
      error: `Maximum booking duration is ${maxBookingHours} hours`,
    };
  }

  if (durationMinutes < minBookingMinutes) {
    return {
      isValid: false,
      error: `Minimum booking duration is ${minBookingMinutes} minutes`,
    };
  }

  // Check if booking is within library hours (8 AM - 10 PM)
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  if (startHour < 8 || startHour >= 22) {
    return {
      isValid: false,
      error: 'Bookings must start between 8:00 AM and 10:00 PM',
    };
  }

  if (endHour > 22 || (endHour === 22 && endMinute > 0)) {
    return {
      isValid: false,
      error: 'Bookings must end by 10:00 PM',
    };
  }

  return { isValid: true };
};

// Helper function to get current time rounded to next 15-minute interval
export const getNextQuarterHour = (): Date => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  if (roundedMinutes >= 60) {
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
  } else {
    now.setMinutes(roundedMinutes, 0, 0);
  }

  return now;
};

// Helper function to format date for datetime-local input
export const formatForDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to get minimum datetime for input (current time + buffer)
export const getMinDateTime = (): string => {
  const now = new Date();
  const minTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  return formatForDateTimeLocal(minTime);
};
