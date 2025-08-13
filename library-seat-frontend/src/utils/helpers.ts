import { format, parseISO, addHours, isAfter, isBefore } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPp');
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const isTimeSlotAvailable = (
  startTime: Date,
  endTime: Date,
  existingBookings: { start_time: string; end_time: string }[]
): boolean => {
  return !existingBookings.some(booking => {
    const bookingStart = parseISO(booking.start_time);
    const bookingEnd = parseISO(booking.end_time);
    
    return (
      (isAfter(startTime, bookingStart) && isBefore(startTime, bookingEnd)) ||
      (isAfter(endTime, bookingStart) && isBefore(endTime, bookingEnd)) ||
      (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd))
    );
  });
};

export const generateTimeSlots = (date: Date, duration: number = 2): Date[] => {
  const slots: Date[] = [];
  const startHour = 8; // Library opens at 8 AM
  const endHour = 22; // Library closes at 10 PM
  
  for (let hour = startHour; hour <= endHour - duration; hour++) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    slots.push(slotStart);
  }
  
  return slots;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getSeatDisplayName = (seat: { floor: number; section: string; seat_number: string }): string => {
  return `${seat.floor}${seat.section}-${seat.seat_number}`;
};
