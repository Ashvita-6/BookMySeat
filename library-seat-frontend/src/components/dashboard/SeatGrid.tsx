// library-seat-frontend/src/components/dashboard/SeatGrid.tsx
'use client';

import { useState } from 'react';
import { Seat  } from '../../types/seat';
import { Booking } from '../../types/booking';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { 
  getSeatDisplayName, 
  SEAT_TYPES, 
  BOOKING_STATUS,
  getLocationDisplayName 
} from '../../utils/libraryStructure';
import { 
  formatForDateTimeLocal, 
  getNextQuarterHour, 
  getMinDateTime,
  validateBookingTime 
} from '../../utils/validation';

interface SeatGridProps {
  seats: Seat[];
  onBookSeat: (seatId: number, startTime: string, endTime: string) => Promise<void>;
  userBookings: Booking[];
  selectedLocation: {
    building: string;
    floor_hall: string;
  };
}

export default function SeatGrid({ seats, onBookSeat, userBookings, selectedLocation }: SeatGridProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [validationError, setValidationError] = useState('');

  const getSeatTypeColor = (type: string) => {
    return SEAT_TYPES[type as keyof typeof SEAT_TYPES]?.color || 'bg-gray-600';
  };

  const getSeatTypeIcon = (type: string) => {
    return SEAT_TYPES[type as keyof typeof SEAT_TYPES]?.icon || '💺';
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    setSelectedSeat(seat);
    setShowBookingModal(true);
    setValidationError('');
    
    // Set default times with proper current time handling
    const now = getNextQuarterHour();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    setStartTime(formatForDateTimeLocal(now));
    setEndTime(formatForDateTimeLocal(later));
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !startTime || !endTime) return;
    
    // Validate booking times
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const validation = validateBookingTime(startDate, endDate);
    
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid booking time');
      return;
    }
    
    setIsBooking(true);
    setValidationError('');
    
    try {
      await onBookSeat(selectedSeat.id, startTime, endTime);
      setShowBookingModal(false);
      setSelectedSeat(null);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to book seat');
    } finally {
      setIsBooking(false);
    }
  };

  const isUserBooking = (seatId: number) => {
    return userBookings.some(booking => 
      booking.seat_id === seatId && 
      (['pending', 'confirmed', 'active'] as const).includes(booking.status as any)
    );
  };

  const getUserBookingStatus = (seatId: number): string | undefined => {
    const booking = userBookings.find(b => 
      b.seat_id === seatId && 
      (['pending', 'confirmed', 'active'] as const).includes(b.status as any)
    );
    return booking?.status;
  };

  // Group seats by section
  const seatsBySection = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = [];
    }
    acc[seat.section].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const locationDisplayName = getLocationDisplayName(selectedLocation.building, selectedLocation.floor_hall);

  return (
    <>
      <div className="space-y-6">
        {/* Location Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-white">{locationDisplayName}</h3>
          <p className="text-sm text-gray-400">
            {seats.length} seats • {seats.filter(s => s.status === 'available').length} available
          </p>
        </div>

        {Object.entries(seatsBySection).map(([section, sectionSeats]) => (
          <div key={section}>
            <h4 className="text-md font-medium text-white mb-3">Section {section}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {sectionSeats
                .sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
                .map((seat) => {
                  const isOccupied = seat.status === 'occupied';
                  const isUserSeat = isUserBooking(seat.id);
                  const userBookingStatus = getUserBookingStatus(seat.id);
                  
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isOccupied && !isUserSeat}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center
                        ${isOccupied && !isUserSeat
                          ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' 
                          : isUserSeat
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                          : `${getSeatTypeColor(seat.seat_type)} border-transparent text-white hover:scale-105 hover:shadow-lg cursor-pointer`
                        }
                      `}
                      title={`${getSeatDisplayName(seat)} - ${SEAT_TYPES[seat.seat_type as keyof typeof SEAT_TYPES]?.label}`}
                    >
                      {/* Seat Icon */}
                      <div className="text-lg mb-1">
                        {getSeatTypeIcon(seat.seat_type)}
                      </div>
                      
                      {/* Seat Number */}
                      <span className="text-sm font-medium">
                        {seat.seat_number}
                      </span>
                      
                      {/* Features */}
                      <div className="flex gap-1 mt-1">
                        {seat.has_power && (
                          <span className="text-xs" title="Power outlet">⚡</span>
                        )}
                        {seat.has_monitor && (
                          <span className="text-xs" title="Monitor">🖥️</span>
                        )}
                      </div>

                      {/* User booking status indicator */}
                      {isUserSeat && userBookingStatus && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            {userBookingStatus === 'pending' ? '⏳' : 
                             userBookingStatus === 'confirmed' ? '✅' : '🔵'}
                          </span>
                        </div>
                      )}

                      {/* Occupied indicator */}
                      {isOccupied && !isUserSeat && (
                        <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-300">Occupied</span>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

        {seats.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🪑</div>
            <h3 className="text-lg font-medium text-white mb-2">No seats found</h3>
            <p className="text-gray-400">Try selecting a different location or seat type</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setValidationError('');
        }}
        title={selectedSeat ? `Book ${getSeatDisplayName(selectedSeat)}` : 'Book Seat'}
      >
        {selectedSeat && (
          <div className="space-y-4">
            {/* Seat Info */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">
                {getSeatDisplayName(selectedSeat)}
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                {getLocationDisplayName(selectedSeat.building, selectedSeat.floor_hall)} • Section {selectedSeat.section}
              </p>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${getSeatTypeColor(selectedSeat.seat_type)}`}></span>
                <span className="text-sm text-gray-300">
                  {SEAT_TYPES[selectedSeat.seat_type as keyof typeof SEAT_TYPES]?.label}
                </span>
                {selectedSeat.has_power && <span className="text-sm">⚡</span>}
                {selectedSeat.has_monitor && <span className="text-sm">🖥️</span>}
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div>
                  <h5 className="text-yellow-300 font-medium">WiFi Confirmation Required</h5>
                  <p className="text-yellow-200 text-sm">
                    You must connect to the library WiFi within 15 minutes to confirm your booking, 
                    or it will be automatically cancelled.
                  </p>
                </div>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
                {validationError}
              </div>
            )}

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={getMinDateTime()}
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
                  min={startTime}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleBookSeat}
                loading={isBooking}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!startTime || !endTime}
              >
                Book Seat
              </Button>
              <Button
                onClick={() => {
                  setShowBookingModal(false);
                  setValidationError('');
                }}
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