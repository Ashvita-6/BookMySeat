// library-seat-frontend/src/services/breaks.ts
import { api } from './api';
import { Break, CreateBreakData, BreakFilters } from '@/types/break';

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
      return response.breaks || [];
    } catch (error) {
      throw error;
    }
  }

  // FIXED: Remove parameter, getMyBreaks doesn't take any arguments
  async getMyBreaks(): Promise<Break[]> {
    try {
      const response = await api.breaks.getMyBreaks(); 
      return response.breaks || [];
    } catch (error) {
      throw error;
    }
  }

  async bookBreak(breakId: number): Promise<Break> {
    try {
      const response = await api.breaks.book(breakId);
      return response.break;
    } catch (error) {
      throw error;
    }
  }

  async cancelBreak(breakId: number): Promise<Break> {
    try {
      const response = await api.breaks.cancel(breakId);
      return response.break;
    } catch (error) {
      throw error;
    }
  }

  // FIXED: Add the missing filter methods that were being called
  getMyCreatedBreaks(breaks: Break[]): Break[] {
    return breaks.filter(breakItem => breakItem.is_my_break === true);
  }

  getMyTakenBreaks(breaks: Break[]): Break[] {
    return breaks.filter(breakItem => 
      breakItem.taken_by && breakItem.is_my_break === false
    );
  }

  // Utility methods for break management
  getActiveBreaks(breaks: Break[]): Break[] {
    const now = new Date();
    return breaks.filter(breakItem => 
      breakItem.status === 'active' && new Date(breakItem.break_end_time) > now
    );
  }

  getUpcomingBreaks(breaks: Break[]): Break[] {
    const now = new Date();
    return breaks.filter(breakItem => 
      breakItem.status === 'active' && new Date(breakItem.break_start_time) > now
    );
  }

  getCurrentBreaks(breaks: Break[]): Break[] {
    const now = new Date();
    return breaks.filter(breakItem => 
      breakItem.status === 'active' && 
      new Date(breakItem.break_start_time) <= now && 
      new Date(breakItem.break_end_time) > now
    );
  }

  calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // duration in minutes
  }

  calculateTimeRemaining(endTime: string): number {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    return diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0; // remaining minutes
  }

  isBreakAvailable(breakItem: Break): boolean {
    const now = new Date();
    return (
      breakItem.status === 'active' &&
      new Date(breakItem.break_start_time) <= now &&
      new Date(breakItem.break_end_time) > now &&
      !breakItem.taken_by
    );
  }

  formatBreakTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    
    if (startDate === endDate) {
      return `${startDate} ${formatTime(start)} - ${formatTime(end)}`;
    } else {
      return `${startDate} ${formatTime(start)} - ${endDate} ${formatTime(end)}`;
    }
  }
}

export const breakService = new BreakService();