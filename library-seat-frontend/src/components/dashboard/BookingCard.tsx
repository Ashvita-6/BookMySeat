// library-seat-frontend/src/components/dashboard/BookingCard.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { Booking } from '../../types/booking';
import { 
  getSeatDisplayName, 
  BOOKING_STATUS, 
  getLocationDisplayName,
  SEAT_TYPES 
} from '../../utils/libraryStructure';

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
    return SEAT_TYPES[type as keyof typeof SEAT_TYPES]?.color || 'bg-gray-600';
  };

  const getStatusConfig = (status: string) => {
    return BOOKING_STATUS[status as keyof typeof BOOKING_STATUS] || {
      label: status,
      color: 'bg-gray-500',
      description: ''
    };
  };

  const getTimeRemaining = () => {
    const now = new Date();
    
    // Check confirmation deadline for pending bookings
    if (booking.status === 'pending' && booking.confirmation_deadline) {
      const deadline = new Date(booking.confirmation_deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      
      if (timeDiff <= 0) return 'Deadline passed';
      
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      return `${minutes}m ${seconds}s to connect WiFi`;
    }
    
    // Regular booking time remaining
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
    
    if (booking.status === 'pending' && booking.confirmation_deadline) {
      const deadline = new Date(booking.confirmation_deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      return timeDiff <= 5 * 60 * 1000; // 5 minutes
    }
    
    const endTime = new Date(booking.end_time);
    const diff = endTime.getTime() - now.getTime();
    return diff <= 30 * 60 * 1000; // 30 minutes
  };

  const canCancel = (): boolean => {
    return (['pending', 'confirmed', 'active'] as const).includes(booking.status as any);
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getSeatTypeColor(booking.seat_type)}`}></div>
          <div>
            <h4 className="font-medium text-white">
              {getSeatDisplayName(booking)}
            </h4>
            <p className="text-sm text-gray-400">
              {getLocationDisplayName(booking.building, booking.floor_hall)}
            </p>
          </div>
        </div>
        {canCancel() && (
          <Button
            onClick={handleCancel}
            loading={isCancelling}
            size="sm"
            variant="danger"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color} text-white`}>
          {statusConfig.label}
        </span>
        {statusConfig.description && (
          <p className="text-xs text-gray-400 mt-1">{statusConfig.description}</p>
        )}
      </div>

      {/* Booking Details */}
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
        
        {booking.confirmed_at && (
          <div className="flex justify-between">
            <span className="text-gray-400">Confirmed:</span>
            <span className="text-green-400">
              {format(new Date(booking.confirmed_at), 'MMM dd, HH:mm')}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={`font-medium ${isExpiring() ? 'text-orange-400' : 'text-green-400'}`}>
            {getTimeRemaining()}
          </span>
        </div>
      </div>

      {/* Warning Messages */}
      {booking.status === 'pending' && (
        <div className="mt-3 p-2 bg-yellow-900/50 border border-yellow-700 rounded text-yellow-300 text-xs">
          📶 Connect to library WiFi to confirm your booking
        </div>
      )}
      
      {isExpiring() && booking.status !== 'pending' && (
        <div className="mt-3 p-2 bg-orange-900/50 border border-orange-700 rounded text-orange-300 text-xs">
          ⚠️ Booking expires soon!
        </div>
      )}
      
      {booking.status === 'auto_cancelled' && (
        <div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-xs">
          ❌ Auto-cancelled: No WiFi confirmation within 15 minutes
        </div>
      )}
    </div>
  );
}