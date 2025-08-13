import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@/utils/constants';
import { authService } from './auth';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): void {
    if (this.socket?.connected) return;

    const token = authService.getToken();
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Seat-related socket methods
  joinSeat(seatId: number): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.JOIN_SEAT, seatId);
    }
  }

  leaveSeat(seatId: number): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_SEAT, seatId);
    }
  }

  getSeatStatus(seatId: number): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.GET_SEAT_STATUS, seatId);
    }
  }

  // Event listeners
  onSeatBooked(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.SEAT_BOOKED, callback);
    }
  }

  onSeatFreed(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.SEAT_FREED, callback);
    }
  }

  onSeatUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.SEAT_UPDATE, callback);
    }
  }

  onSeatListUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.SEAT_LIST_UPDATE, callback);
    }
  }

  onSeatStatus(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.SEAT_STATUS, callback);
    }
  }

  onBookingUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.BOOKING_UPDATE, callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.ERROR, callback);
    }
  }

  // Remove event listeners
  offSeatBooked(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.SEAT_BOOKED, callback);
    }
  }

  offSeatFreed(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.SEAT_FREED, callback);
    }
  }

  offSeatUpdate(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.SEAT_UPDATE, callback);
    }
  }

  offSeatListUpdate(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.SEAT_LIST_UPDATE, callback);
    }
  }

  offSeatStatus(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.SEAT_STATUS, callback);
    }
  }

  offBookingUpdate(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.BOOKING_UPDATE, callback);
    }
  }

  offError(callback?: (error: any) => void): void {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.ERROR, callback);
    }
  }

  get connected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }
}

export const socketService = new SocketService();