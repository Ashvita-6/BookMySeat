import { api } from './api';
import { Booking, CreateBookingData } from '@/types/booking';

export class BookingService {
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    try {
      const response = await api.bookings.create(bookingData);
      return response.booking;
    } catch (error) {
      throw error;
    }
  }

  async getMyBookings(status?: string, limit?: number, offset?: number): Promise<Booking[]> {
    try {
      const response = await api.bookings.getMyBookings(status, limit, offset);
      return response.bookings;
    } catch (error) {
      throw error;
    }
  }

  async getAllBookings(status?: string, seatId?: number, limit?: number, offset?: number): Promise<Booking[]> {
    try {
      const response = await api.bookings.getAll(status, seatId, limit, offset);
      return response.bookings;
    } catch (error) {
      throw error;
    }
  }

  async cancelBooking(id: number): Promise<Booking> {
    try {
      const response = await api.bookings.cancel(id);
      return response.booking;
    } catch (error) {
      throw error;
    }
  }

  getActiveBookings(bookings: Booking[]): Booking[] {
    const now = new Date();
    return bookings.filter(booking => 
      booking.status === 'active' && new Date(booking.end_time) > now
    );
  }

  getUpcomingBookings(bookings: Booking[]): Booking[] {
    const now = new Date();
    return bookings.filter(booking => 
      booking.status === 'active' && new Date(booking.start_time) > now
    );
  }

  getCurrentBookings(bookings: Booking[]): Booking[] {
    const now = new Date();
    return bookings.filter(booking => 
      booking.status === 'active' && 
      new Date(booking.start_time) <= now && 
      new Date(booking.end_time) > now
    );
  }
}

export const bookingService = new BookingService();