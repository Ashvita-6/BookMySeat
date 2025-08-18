// library-seat-frontend/src/components/dashboard/SeatGrid.tsx
'use client';

import { useState,useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Seat } from '../../types/seat';
import { getSeatDisplayName } from '../../utils/libraryStructure';

interface SeatGridProps {
  seats: Seat[];
  onBookSeat: (seatId: number, startTime: string, endTime: string) => Promise<void>;
  selectedBuilding: 'main' | 'reading';
  selectedFloorHall: string;
}

interface BookingModalProps {
  seat: Seat;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => Promise<void>;
}

function BookingModal({ seat, isOpen, onClose, onConfirm }: BookingModalProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Convert datetime-local values to ISO string format
      const startISO = new Date(startTime).toISOString();
      const endISO = new Date(endTime).toISOString();
      
      await onConfirm(startISO, endISO);
      setStartTime('');
      setEndTime('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book seat');
    } finally {
      setIsLoading(false);
    }
  };

  // Set default times (current time and 2 hours later)
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Initialize with default values when modal opens
  useEffect(() => {
    if (isOpen && !startTime && !endTime) {
      setStartTime(formatDateTimeLocal(defaultStart));
      setEndTime(formatDateTimeLocal(defaultEnd));
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Book Seat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-white font-medium">{getSeatDisplayName(seat)}</p>
          <p className="text-gray-300 text-sm">
            {seat.seat_type} • Section {seat.section}
          </p>
          {seat.has_power && (
            <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
              Power Outlet
            </span>
          )}
          {seat.has_monitor && (
            <span className="inline-block mt-1 ml-1 px-2 py-1 bg-purple-600 text-white text-xs rounded">
              Monitor
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={formatDateTimeLocal(now)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={startTime || formatDateTimeLocal(now)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Booking...' : 'Book Seat'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function SeatGrid({ seats, onBookSeat, selectedBuilding, selectedFloorHall }: SeatGridProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available') {
      setSelectedSeat(seat);
      setShowBookingModal(true);
    }
  };

  const handleBookSeat = async (startTime: string, endTime: string) => {
    if (selectedSeat) {
      await onBookSeat(selectedSeat.id, startTime, endTime);
    }
  };

  const getSeatStatusColor = (seat: Seat) => {
    switch (seat.status) {
      case 'available':
        return 'bg-green-600 hover:bg-green-700 border-green-500';
      case 'occupied':
        return 'bg-red-600 border-red-500 cursor-not-allowed';
      default:
        return 'bg-gray-600 border-gray-500 cursor-not-allowed';
    }
  };

  const getSeatTypeIcon = (seatType: string) => {
    switch (seatType) {
      case 'individual':
        return '👤';
      case 'group':
        return '👥';
      case 'computer':
        return '💻';
      default:
        return '💺';
    }
  };

  // Group seats by section for better organization
  const seatsBySection = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = [];
    }
    acc[seat.section].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort seats within each section by seat number
  Object.keys(seatsBySection).forEach(section => {
    seatsBySection[section].sort((a, b) => {
      const aNum = parseInt(a.seat_number);
      const bNum = parseInt(b.seat_number);
      return aNum - bNum;
    });
  });

  const availableSeats = seats.filter(seat => seat.status === 'available').length;
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;

  if (seats.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-center py-8">
        <p className="text-gray-400">No seats found for the selected location.</p>
        <p className="text-gray-500 text-sm mt-2">Try selecting a different building or floor.</p>
      </Card>
    );
  }

  return (
    <>
      {/* Seat Statistics */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{seats.length}</p>
          <p className="text-gray-300 text-sm">Total Seats</p>
        </div>
        <div className="bg-green-900 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{availableSeats}</p>
          <p className="text-green-300 text-sm">Available</p>
        </div>
        <div className="bg-red-900 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{occupiedSeats}</p>
          <p className="text-red-300 text-sm">Occupied</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded border"></div>
          <span className="text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded border"></div>
          <span className="text-gray-300">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">👤 Individual</span>
          <span className="text-gray-300">👥 Group</span>
          <span className="text-gray-300">💻 Computer</span>
        </div>
      </div>

      {/* Seats by Section */}
      <div className="space-y-6">
        {Object.entries(seatsBySection).map(([section, sectionSeats]) => (
          <div key={section}>
            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
              Section {section}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {sectionSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status !== 'available'}
                  className={`relative p-3 rounded-lg border-2 transition-colors ${getSeatStatusColor(seat)}`}
                  title={`${getSeatDisplayName(seat)} - ${seat.status === 'available' ? 'Click to book' : 'Occupied'}`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">
                      {getSeatTypeIcon(seat.seat_type)}
                    </div>
                    <div className="text-white font-medium text-sm">
                      {seat.seat_number}
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                      {seat.has_power && (
                        <span className="text-xs" title="Power Available">⚡</span>
                      )}
                      {seat.has_monitor && (
                        <span className="text-xs" title="Monitor Available">🖥️</span>
                      )}
                    </div>
                    {seat.status === 'occupied' && seat.occupied_until && (
                      <div className="text-xs text-red-200 mt-1">
                        Until {new Date(seat.occupied_until).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedSeat && (
        <BookingModal
          seat={selectedSeat}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSeat(null);
          }}
          onConfirm={handleBookSeat}
        />
      )}
    </>
  );
}