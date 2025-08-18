// library-seat-frontend/src/services/breaks.ts
import { api } from './api';
import { Break, CreateBreakData, BreakFilters, BreakBooking } from '@/types/break';

export class BreakService {
  async createBreak(breakData: CreateBreakData): Promise<Break> {
    try {
      const response = await api.breaks.create(breakData);
      return response.break;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableBreaks(filters?: BreakFilters): Promise<Break[]> {
    try {
      const response = await api.breaks.getAvailable(filters);
      return response.breaks;
    } catch (error) {
      throw error;
    }
  }

  async getMyBreaks(type?: 'created' | 'taken' | 'all'): Promise<Break[]> {
    try {
      const response = await api.breaks.getMyBreaks(type);
      return response.breaks;
    } catch (error) {
      throw error;
    }
  }

  async bookBreak(id: number): Promise<BreakBooking> {
    try {
      const response = await api.breaks.book(id);
      return response.booking;
    } catch (error) {
      throw error;
    }
  }

  async cancelBreak(id: number): Promise<Break> {
    try {
      const response = await api.breaks.cancel(id);
      return response.break;
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  getActiveBreaks(breaks: Break[]): Break[] {
    const now = new Date();
    return breaks.filter(breakItem => 
      breakItem.status === 'active' && 
      new Date(breakItem.break_end_time) > now
    );
  }

  getMyCreatedBreaks(breaks: Break[]): Break[] {
    return breaks.filter(breakItem => breakItem.is_my_break === true);
  }

  getMyTakenBreaks(breaks: Break[]): Break[] {
    return breaks.filter(breakItem => breakItem.is_my_break === false && breakItem.taken_by);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  formatTimeRemaining(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const minutes = Math.ceil(diffMs / (60 * 1000));
    return this.formatDuration(minutes);
  }

  isBreakAvailable(breakItem: Break): boolean {
    const now = new Date();
    return breakItem.status === 'active' && 
           new Date(breakItem.break_start_time) <= now && 
           new Date(breakItem.break_end_time) > now;
  }

  canCancelBreak(breakItem: Break): boolean {
    return breakItem.status === 'active' && 
           new Date(breakItem.break_start_time) > new Date();
  }
}

export const breakService = new BreakService();