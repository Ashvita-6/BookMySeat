import { useState } from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';

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

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: number) => Promise<void>;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(booking.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-600';
      case 'group': return 'bg-green-600';
      case 'quiet': return 'bg-purple-600';
      case 'computer': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(booking.end_time);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const isExpiring = () => {
    const now = new Date();
    const endTime = new Date(booking.end_time);
    const diff = endTime.getTime() - now.getTime();
    return diff <= 30 * 60 * 1000; // 30 minutes
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getSeatTypeColor(booking.seat_type)}`}></div>
          <div>
            <h4 className="font-medium text-white">
              Seat {booking.section}{booking.seat_number}
            </h4>
            <p className="text-sm text-gray-400">
              Floor {booking.floor} • {booking.seat_type}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCancel}
          loading={isCancelling}
          size="sm"
          variant="danger"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Start:</span>
          <span className="text-white">
            {format(new Date(booking.start_time), 'MMM dd, HH:mm')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">End:</span>
          <span className="text-white">
            {format(new Date(booking.end_time), 'MMM dd, HH:mm')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={`font-medium ${isExpiring() ? 'text-orange-400' : 'text-green-400'}`}>
            {getTimeRemaining()}
          </span>
        </div>
      </div>

      {isExpiring() && (
        <div className="mt-3 p-2 bg-orange-900/50 border border-orange-700 rounded text-orange-300 text-xs">
          ⚠️ Booking expires soon!
        </div>
      )}
    </div>
  );
}