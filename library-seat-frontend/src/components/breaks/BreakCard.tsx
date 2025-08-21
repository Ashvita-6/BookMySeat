'use client';

import { useState } from 'react';
import { Break } from '@/types/break';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  getSeatDisplayName, 
  getLocationDisplayName, 
  formatDuration, 
  formatTimeRemaining,
  SEAT_TYPES 
} from '../../utils/libraryStructure';

interface BreakCardProps {
  break: Break;
  onBook?: (breakId: number) => void;
  onCancel?: (breakId: number) => void;
  showActions?: boolean;
  isMyBreak?: boolean;
  currentUserId?: number;
}

export default function BreakCard({ 
  break: breakItem, 
  onBook, 
  onCancel, 
  showActions = true,
  isMyBreak = false,
  currentUserId
}: BreakCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBook = async () => {
    if (!onBook || isLoading) return;
    
    setIsLoading(true);
    try {
      await onBook(breakItem.id);
    } catch (error) {
      console.error('Failed to book break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel || isLoading) return;
    
    setIsLoading(true);
    try {
      await onCancel(breakItem.id);
    } catch (error) {
      console.error('Failed to cancel break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (breakItem.status) {
      case 'active':
        return 'bg-green-500';
      case 'taken':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (breakItem.status) {
      case 'active':
        return 'Available';
      case 'taken':
        return 'Taken';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatBreakTime = () => {
    const start = new Date(breakItem.break_start_time);
    const end = new Date(breakItem.break_end_time);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    
    const today = new Date();
    const isToday = start.toDateString() === today.toDateString();
    
    if (isToday) {
      return `${formatTime(start)} - ${formatTime(end)}`;
    } else {
      return `${start.toLocaleDateString()} ${formatTime(start)} - ${formatTime(end)}`;
    }
  };

  const calculateDuration = () => {
    const start = new Date(breakItem.break_start_time);
    const end = new Date(breakItem.break_end_time);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    return formatDuration(minutes);
  };

  const getTimeRemaining = () => {
    if (breakItem.status !== 'active') return null;
    return formatTimeRemaining(breakItem.break_end_time);
  };

  // FIXED: Use the single object parameter version
  const seatDisplayName = getSeatDisplayName({
    building: breakItem.building,
    floor_hall: breakItem.floor_hall,
    section: breakItem.section,
    seat_number: breakItem.seat_number
  });

  const locationDisplayName = getLocationDisplayName(
    breakItem.building,
    breakItem.floor_hall
  );

  const seatTypeInfo = SEAT_TYPES[breakItem.seat_type];
  const timeRemaining = getTimeRemaining();
  const isExpired = breakItem.status === 'expired' || timeRemaining === 'Expired';
  const isTaken = breakItem.status === 'taken';
  const isAvailable = breakItem.status === 'active' && !isExpired && !isTaken;
  const actualIsMyBreak = isMyBreak || breakItem.user_id === currentUserId;

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <div className="p-4">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor()}`}></span>
            <span className="text-white font-medium text-sm">
              {getStatusLabel()}
            </span>
            {timeRemaining && timeRemaining !== 'Expired' && (
              <span className="text-gray-400 text-sm">
                • {timeRemaining} left
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg">{seatTypeInfo?.icon}</span>
            <span className="text-gray-400 text-sm">{seatTypeInfo?.label}</span>
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-3">
          <h3 className="text-white font-semibold">
            {seatDisplayName}
          </h3>
          <p className="text-gray-400 text-sm">
            {locationDisplayName}
          </p>
        </div>

        {/* Time Info */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Time:</span>
            <span className="text-white text-sm">{formatBreakTime()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Duration:</span>
            <span className="text-white text-sm">{calculateDuration()}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Created by:</span>
            <span className="text-white text-sm">
              {breakItem.user_name}
              {breakItem.user_student_id && ` (${breakItem.user_student_id})`}
            </span>
          </div>
          
          {isTaken && breakItem.taken_by && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-300 text-sm">Taken by:</span>
              <span className="text-blue-400 text-sm">
                {breakItem.taken_by.name}
                {breakItem.taken_by.student_id && ` (${breakItem.taken_by.student_id})`}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {breakItem.notes && (
          <div className="mb-3">
            <p className="text-gray-300 text-sm">
              <span className="font-medium">Notes:</span> {breakItem.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {actualIsMyBreak ? (
              <Button
                onClick={handleCancel}
                disabled={isLoading || breakItem.status !== 'active'}
                variant="outline"
                size="sm"
                className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Break'}
              </Button>
            ) : (
              <>
                {isAvailable && (
                  <Button
                    onClick={handleBook}
                    disabled={isLoading}
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Booking...' : 'Book This Break'}
                  </Button>
                )}
                
                {isTaken && (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-400 cursor-not-allowed"
                  >
                    Already Taken
                  </Button>
                )}
                
                {isExpired && (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-400 cursor-not-allowed"
                  >
                    Expired
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Break Booking Info */}
        {breakItem.break_booking && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              Original booking: {new Date(breakItem.original_booking_start || '').toLocaleString()} - 
              {new Date(breakItem.original_booking_end || '').toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

