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
import { Seat  } from '../../types/seat';
import { Booking } from '../../types/booking';
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
      
      // Filter active bookings (including pending ones)
      const activeBookings = bookingsResponse.bookings.filter((booking: Booking) => 
        ['pending', 'confirmed', 'active'].includes(booking.status)
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

              {/* Location Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Building
                  </label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value as 'main' | 'reading')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BUILDING_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {selectedBuilding === 'main' ? 'Floor' : 'Hall'}
                  </label>
                  <select
                    value={selectedFloorHall}
                    onChange={(e) => setSelectedFloorHall(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {floorHallOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {seatTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seat Legend */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Legend</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(SEAT_TYPES).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${config.color}`}></div>
                      <span className="text-sm text-gray-300">
                        {config.icon} {config.label}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-600"></div>
                    <span className="text-sm text-gray-300">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-600"></div>
                    <span className="text-sm text-gray-300">Your Booking</span>
                  </div>
                </div>
              </div>

              <SeatGrid 
                seats={filteredSeats} 
                onBookSeat={handleBookSeat}
                userBookings={myBookings}
                selectedLocation={{
                  building: selectedBuilding,
                  floor_hall: selectedFloorHall
                }}
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
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No active bookings</h3>
                  <p className="text-gray-400">Book a seat to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
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
                  <span className="text-white font-medium">290</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Available Now</span>
                  <span className="text-green-400 font-medium">
                    {seats.filter(s => s.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Bookings</span>
                  <span className="text-blue-400 font-medium">{myBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Confirmation</span>
                  <span className="text-yellow-400 font-medium">
                    {myBookings.filter(b => b.status === 'pending').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}