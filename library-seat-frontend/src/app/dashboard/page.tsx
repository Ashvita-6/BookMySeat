'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SeatGrid from '../../components/dashboard/SeatGrid';
import BookingCard from '../../components/dashboard/BookingCard';
import { api } from '../../services/api';

interface Seat {
  id: number;
  floor: number;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'quiet' | 'computer';
  has_power: boolean;
  has_monitor: boolean;
  status: 'available' | 'occupied';
  occupied_by?: number;
  occupied_until?: string;
  occupied_by_name?: string;
}

interface Booking {
  id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  floor: number;
  section: string;
  seat_number: string;
  seat_type: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSeatType, setSelectedSeatType] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [seatsResponse, bookingsResponse] = await Promise.all([
        api.seats.getAll(),
        api.bookings.getMyBookings('active')
      ]);
      
      setSeats(seatsResponse.seats);
      setMyBookings(bookingsResponse.bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSeat = async (seatId: number, startTime: string, endTime: string) => {
    try {
      await api.bookings.create({
        seat_id: seatId,
        start_time: startTime,
        end_time: endTime
      });
      
      // Reload data to reflect changes
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to book seat');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await api.bookings.cancel(bookingId);
      // Reload data to reflect changes
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredSeats = seats.filter(seat => {
    const floorMatch = seat.floor === selectedFloor;
    const typeMatch = selectedSeatType === 'all' || seat.seat_type === selectedSeatType;
    return floorMatch && typeMatch;
  });

  const floors = [...new Set(seats.map(seat => seat.floor))].sort((a, b) => a - b);
  const seatTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'group', label: 'Group Study' },
    { value: 'quiet', label: 'Quiet Zone' },
    { value: 'computer', label: 'Computer Station' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4">
            {user?.role === 'admin' && (
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Admin Panel
              </Button>
            )}
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Available Seats</h2>
                <Button
                  onClick={loadData}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Refresh
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Floor
                  </label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {floors.map(floor => (
                      <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seat Type
                  </label>
                  <select
                    value={selectedSeatType}
                    onChange={(e) => setSelectedSeatType(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {seatTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <SeatGrid 
                seats={filteredSeats} 
                onBookSeat={handleBookSeat}
                userBookings={myBookings}
              />
            </Card>
          </div>

          {/* My Bookings */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">My Active Bookings</h2>
              
              {myBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">No active bookings</p>
                  <p className="text-sm text-gray-500">Book a seat to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Seats</span>
                  <span className="text-white">{seats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Available</span>
                  <span className="text-green-400">
                    {seats.filter(s => s.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Occupied</span>
                  <span className="text-red-400">
                    {seats.filter(s => s.status === 'occupied').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">My Bookings</span>
                  <span className="text-blue-400">{myBookings.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}