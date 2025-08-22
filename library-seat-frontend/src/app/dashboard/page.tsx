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
  const [selectedBuilding, setSelectedBuilding] = useState<'reading'>('reading'); // FIXED: Only reading
  const [selectedFloorHall, setSelectedFloorHall] = useState<string>('hall_1'); // FIXED: Default to hall_1
  const [selectedSeatType, setSelectedSeatType] = useState<string>('all');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fix hydration error - only render after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, router]);

  // Load data when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadSeats();
    }
  }, [selectedBuilding, selectedFloorHall, selectedSeatType, isAuthenticated]);

  const loadData = async () => {
    await Promise.all([loadSeats(), loadMyBookings()]);
  };

  const loadSeats = async () => {
    try {
      setIsLoading(true);
      const params: any = { 
        is_active: true,
        building: selectedBuilding, // Always 'reading'
        floor_hall: selectedFloorHall
      };
      
      if (selectedSeatType !== 'all') {
        params.seat_type = selectedSeatType;
      }

      const response = await api.seats.getAll(params);
      setSeats(response.seats || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load seats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const response = await api.bookings.getMyBookings();
      setMyBookings(response.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    }
  };

  const handleBookSeat = async (seatId: number, startTime: string, endTime: string) => {
    try {
      setError('');
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
      setError('');
      await api.bookings.cancel(bookingId);
      // Reload data to reflect changes
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleCreateBreak = async (breakData: CreateBreakData) => {
    try {
      setError('');
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
    const structure = LIBRARY_STRUCTURE.reading[selectedFloorHall as keyof typeof LIBRARY_STRUCTURE.reading];
    if (!structure) return ['all'];
    
    const availableTypes = new Set<string>(['all']);
    Object.values(structure.sections).forEach(section => {
      availableTypes.add(section.type);
    });
    
    return Array.from(availableTypes);
  };

  const seatTypeOptions = getAvailableSeatTypes().map(type => ({
    value: type,
    label: type === 'all' ? 'All Types' : SEAT_TYPES[type as keyof typeof SEAT_TYPES]?.label || type
  }));

  const floorHallOptions = getFloorHallOptions(selectedBuilding);

  // Prevent hydration error by not rendering until mounted
  if (!mounted) {
    return null;
  }

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
          <Button
            onClick={loadData}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-6">
            <p className="text-red-300 p-4">{error}</p>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Find Seats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Building Selection - Hidden since only reading rooms */}
              <input type="hidden" value={selectedBuilding} />
              
              {/* Floor/Hall Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Hall</label>
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

              {/* Seat Type */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Seat Type</label>
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

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  onClick={loadSeats}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Search Seats
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seats Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Available Seats ({filteredSeats.length})
                </h3>
                <SeatGrid
                  seats={filteredSeats}
                  onBookSeat={handleBookSeat}
                  selectedBuilding={selectedBuilding}
                  selectedFloorHall={selectedFloorHall}
                />
              </div>
            </Card>
          </div>

          {/* My Bookings */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  My Bookings ({myBookings.length})
                </h3>
                <div className="space-y-4">
                  {myBookings.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No active bookings
                    </p>
                  ) : (
                    myBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        onCreateBreak={handleCreateBreak}
                      />
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}