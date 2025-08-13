import { api } from './api';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.auth.login(credentials);
      this.setToken(response.token);
      this.setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.auth.register(data);
      this.setToken(response.token);
      this.setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.auth.getProfile();
      this.setUser(response.user);
      return response.user;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();