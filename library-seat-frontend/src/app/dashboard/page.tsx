// library-seat-frontend/src/app/dashboard/page.tsx
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
import { Seat } from '../../types/seat';
import { Booking } from '../../types/booking';
import { CreateBreakData } from '../../types/break';
import { breakService } from '../../services/breaks';
import { 
  BUILDING_OPTIONS, 
  getFloorHallOptions, 
  SEAT_TYPES,
  LIBRARY_STRUCTURE 
} from '../../utils/libraryStructure';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<'main' | 'reading'>('main');
  const [selectedFloorHall, setSelectedFloorHall] = useState<string>('ground_floor');
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

  // Reset floor/hall when building changes
  useEffect(() => {
    const floorHallOptions = getFloorHallOptions(selectedBuilding);
    if (floorHallOptions.length > 0) {
      setSelectedFloorHall(floorHallOptions[0].value);
    }
  }, [selectedBuilding]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [seatsResponse, bookingsResponse] = await Promise.all([
        api.seats.getAll(),
        api.bookings.getMyBookings()
      ]);
      
      setSeats(seatsResponse.seats);
      
      // Filter active bookings
      const activeBookings = bookingsResponse.bookings.filter((booking: Booking) => 
        booking.status === 'active'
      );
      setMyBookings(activeBookings);
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
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleCreateBreak = async (breakData: CreateBreakData) => {
    try {
      await breakService.createBreak(breakData);
      // Optionally reload data to reflect changes
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create break');
    }
  };

  // Filter seats based on selected building and floor/hall
  const filteredSeats = seats.filter(seat => {
    if (seat.building !== selectedBuilding) return false;
    if (seat.floor_hall !== selectedFloorHall) return false;
    if (selectedSeatType !== 'all' && seat.seat_type !== selectedSeatType) return false;
    return true;
  });

  // Get available seat types for the selected location
  const getAvailableSeatTypes = () => {
    if (selectedBuilding === 'main') {
      const structure = LIBRARY_STRUCTURE.main[selectedFloorHall as keyof typeof LIBRARY_STRUCTURE.main];
      if (!structure) return ['all'];
      
      const availableTypes = new Set<string>(['all']);
      Object.values(structure.sections).forEach(section => {
        availableTypes.add(section.type);
      });
      
      return Array.from(availableTypes);
    } else {
      const structure = LIBRARY_STRUCTURE.reading[selectedFloorHall as keyof typeof LIBRARY_STRUCTURE.reading];
      if (!structure) return ['all'];
      
      const availableTypes = new Set<string>(['all']);
      Object.values(structure.sections).forEach(section => {
        availableTypes.add(section.type);
      });
      
      return Array.from(availableTypes);
    }
  };

  const seatTypeOptions = getAvailableSeatTypes().map(type => ({
    value: type,
    label: type === 'all' ? 'All Types' : SEAT_TYPES[type as keyof typeof SEAT_TYPES]?.label || type
  }));

  const floorHallOptions = getFloorHallOptions(selectedBuilding);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Dashboard - Welcome back, {user?.name}!
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/breaks')}
              className="bg-green-600 hover:bg-green-700"
            >
              Available Breaks
            </Button>
            <Button
              onClick={() => router.push('/my-breaks')}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-900"
            >
              My Breaks
            </Button>
            {user?.role === 'admin' && (
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-6">
            <p className="text-red-300">{error}</p>
            <Button
              onClick={() => setError('')}
              className="mt-2 bg-red-700 hover:bg-red-600 text-sm"
            >
              Dismiss
            </Button>
          </Card>
        )}

        {/* My Active Bookings */}
        {myBookings.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">My Active Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onCreateBreak={handleCreateBreak}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Break Information Section */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Break System</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/breaks')}
                className="bg-green-600 hover:bg-green-700 text-sm"
              >
                Browse Breaks
              </Button>
              <Button
                onClick={() => router.push('/my-breaks')}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900 text-sm"
              >
                Manage My Breaks
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">🎯 Create a Break</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Going on a break? Let others use your seat</li>
                <li>• Duration: 30 minutes to 5 hours</li>
                <li>• Must be during your active booking</li>
                <li>• Add notes for break takers</li>
              </ul>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">📍 Take a Break</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Find available breaks from other users</li>
                <li>• Filter by location and duration</li>
                <li>• No WiFi confirmation needed</li>
                <li>• Instant booking activation</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Location and Seat Type Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Book a Seat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Building
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value as 'main' | 'reading')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BUILDING_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Floor/Hall
              </label>
              <select
                value={selectedFloorHall}
                onChange={(e) => setSelectedFloorHall(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {floorHallOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Seat Type
              </label>
              <select
                value={selectedSeatType}
                onChange={(e) => setSelectedSeatType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {seatTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seat Grid */}
          <SeatGrid
            seats={filteredSeats}
            onBookSeat={handleBookSeat}
            selectedBuilding={selectedBuilding}
            selectedFloorHall={selectedFloorHall}
          />
        </Card>
      </div>
    </div>
  );
}