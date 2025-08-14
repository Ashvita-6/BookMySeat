import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

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
}

interface SeatGridProps {
  seats: Seat[];
  onBookSeat: (seatId: number, startTime: string, endTime: string) => Promise<void>;
  userBookings: Booking[];
}

export default function SeatGrid({ seats, onBookSeat, userBookings }: SeatGridProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-600 hover:bg-blue-700';
      case 'group': return 'bg-green-600 hover:bg-green-700';
      case 'quiet': return 'bg-purple-600 hover:bg-purple-700';
      case 'computer': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getSeatTypeIcon = (type: string, hasMonitor: boolean) => {
    if (type === 'computer' || hasMonitor) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type === 'group') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    if (type === 'quiet') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    setSelectedSeat(seat);
    setShowBookingModal(true);
    
    // Set default times (current time to 2 hours later)
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    setStartTime(now.toISOString().slice(0, 16));
    setEndTime(later.toISOString().slice(0, 16));
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !startTime || !endTime) return;
    
    setIsBooking(true);
    try {
      await onBookSeat(selectedSeat.id, startTime, endTime);
      setShowBookingModal(false);
      setSelectedSeat(null);
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsBooking(false);
    }
  };

  const isUserBooking = (seatId: number) => {
    return userBookings.some(booking => booking.seat_id === seatId);
  };

  // Group seats by section
  const seatsBySection = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = [];
    }
    acc[seat.section].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(seatsBySection).map(([section, sectionSeats]) => (
          <div key={section}>
            <h3 className="text-lg font-medium text-white mb-3">Section {section}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sectionSeats
                .sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
                .map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'occupied'}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      ${seat.status === 'available' 
                        ? `${getSeatTypeColor(seat.seat_type)} border-transparent text-white` 
                        : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                      }
                      ${isUserBooking(seat.id) ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {getSeatTypeIcon(seat.seat_type, seat.has_monitor)}
                    </div>
                    <div className="text-xs font-medium">{seat.seat_number}</div>
                    
                    {/* Power indicator */}
                    {seat.has_power && (
                      <div className="absolute top-1 right-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* User booking indicator */}
                    {isUserBooking(seat.id) && (
                      <div className="absolute top-1 left-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      </div>
                    )}
                    
                    {/* Occupied indicator */}
                    {seat.status === 'occupied' && (
                      <div className="absolute inset-0 bg-red-900/50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-300">Individual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-300">Group Study</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <span className="text-gray-300">Quiet Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
            <span className="text-gray-300">Computer</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-300">Has Power</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-300">Your Booking</span>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        title="Book Seat"
      >
        {selectedSeat && (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">
                Seat {selectedSeat.section}{selectedSeat.seat_number}
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Type: {selectedSeat.seat_type}</p>
                <p>Floor: {selectedSeat.floor}</p>
                {selectedSeat.has_power && <p>✓ Power outlet available</p>}
                {selectedSeat.has_monitor && <p>✓ Monitor available</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleBookSeat}
                loading={isBooking}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Book Seat
              </Button>
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}