import { User } from './auth';

export interface UserProfile extends User {
  total_bookings?: number;
  active_bookings?: number;
  last_login?: string;
}

export interface UpdateUserRole {
  role: 'student' | 'admin';
}