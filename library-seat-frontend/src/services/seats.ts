import { api } from './api';
import { Seat, SeatFilter } from '@/types/seat';

export class SeatService {
  async getAllSeats(filters?: SeatFilter): Promise<Seat[]> {
    try {
      const response = await api.seats.getAll(filters);
      return response.seats;
    } catch (error) {
      throw error;
    }
  }

  async getSeatById(id: number): Promise<Seat> {
    try {
      const response = await api.seats.getById(id);
      return response.seat;
    } catch (error) {
      throw error;
    }
  }

  async createSeat(seatData: Omit<Seat, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Seat> {
    try {
      const response = await api.seats.create(seatData);
      return response.seat;
    } catch (error) {
      throw error;
    }
  }

  async updateSeat(id: number, seatData: Partial<Seat>): Promise<Seat> {
    try {
      const response = await api.seats.update(id, seatData);
      return response.seat;
    } catch (error) {
      throw error;
    }
  }

  async deleteSeat(id: number): Promise<void> {
    try {
      await api.seats.delete(id);
    } catch (error) {
      throw error;
    }
  }

  filterSeats(seats: Seat[], filters: SeatFilter): Seat[] {
    return seats.filter(seat => {
      if (filters.floor !== undefined && seat.floor !== filters.floor) return false;
      if (filters.section && seat.section !== filters.section) return false;
      if (filters.seat_type && seat.seat_type !== filters.seat_type) return false;
      if (filters.has_power !== undefined && seat.has_power !== filters.has_power) return false;
      if (filters.has_monitor !== undefined && seat.has_monitor !== filters.has_monitor) return false;
      if (filters.status && seat.status !== filters.status) return false;
      return true;
    });
  }

  groupSeatsByFloorAndSection(seats: Seat[]): Record<string, Record<string, Seat[]>> {
    return seats.reduce((acc, seat) => {
      const floorKey = `Floor ${seat.floor}`;
      const sectionKey = `Section ${seat.section}`;
      
      if (!acc[floorKey]) acc[floorKey] = {};
      if (!acc[floorKey][sectionKey]) acc[floorKey][sectionKey] = [];
      
      acc[floorKey][sectionKey].push(seat);
      return acc;
    }, {} as Record<string, Record<string, Seat[]>>);
  }
}

export const seatService = new SeatService();