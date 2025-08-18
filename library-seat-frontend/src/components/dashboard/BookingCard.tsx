// library-seat-frontend/src/components/dashboard/BookingCard.tsx
'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import CreateBreakModal from '../breaks/CreateBreakModal';
import { Booking, BOOKING_STATUS } from '../../types/booking';
import { CreateBreakData } from '../../types/break';
import { getSeatDisplayName, getLocationDisplayName } from '../../utils/libraryStructure';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => Promise<void>;
  onCreateBreak?: (breakData: CreateBreakData) => Promise<void>;
}

export default function BookingCard({ booking, onCancel, onCreateBreak }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setIsLoading(true);
    try {
      await onCancel(booking.id);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBreak = async (breakData: CreateBreakData) => {
    if (!onCreateBreak) return;
    
    try {
      await onCreateBreak(breakData);
    } catch (error) {
      console.error('Failed to create break:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const status = BOOKING_STATUS[booking.status];
  const seatName = getSeatDisplayName(booking);
  const locationName = getLocationDisplayName(booking.building, booking.floor_hall);
  
  const now = new Date();
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  
  const isActive = booking.status === 'active';
  const isUpcoming = startTime > now;
  const isOngoing = startTime <= now && endTime > now;
  const canCancel = booking.status === 'active';
  const canCreateBreak = isActive && isOngoing && onCreateBreak;

  // Calculate time until booking starts/ends
  const getTimeInfo = () => {
    if (isUpcoming) {
      const timeUntilStart = Math.ceil((startTime.getTime() - now.getTime()) / (60 * 1000));
      return {
        label: 'Starts in',
        value: timeUntilStart < 60 ? `${timeUntilStart}m` : `${Math.ceil(timeUntilStart / 60)}h`,
        color: 'text-blue-400'
      };
    } else if (isOngoing) {
      const timeUntilEnd = Math.ceil((endTime.getTime() - now.getTime()) / (60 * 1000));
      return {
        label: 'Ends in',
        value: timeUntilEnd < 60 ? `${timeUntilEnd}m` : `${Math.ceil(timeUntilEnd / 60)}h`,
        color: 'text-green-400'
      };
    }
    return null;
  };

  const timeInfo = getTimeInfo();

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{seatName}</h3>
            <p className="text-gray-300 text-sm">{locationName}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} text-white`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time:</span>
            <span className="text-white">
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date:</span>
            <span className="text-white">
              {startTime.toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white">
              {Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000))} minutes
            </span>
          </div>

          {timeInfo && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{timeInfo.label}:</span>
              <span className={`font-medium ${timeInfo.color}`}>
                {timeInfo.value}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canCreateBreak && (
            <Button
              onClick={() => setShowBreakModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-2"
            >
              Create Break
            </Button>
          )}
          
          {canCancel && (
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-red-600 text-red-400 hover:bg-red-900 text-sm py-2"
            >
              {isLoading ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
        </div>

        {/* Break Creation Help Text */}
        {canCreateBreak && (
          <div className="mt-3 p-2 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-300 text-xs">
              💡 Going on a break? Let others use your seat temporarily!
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-400 text-xs">
            Booked {new Date(booking.created_at).toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Break Creation Modal */}
      {showBreakModal && (
        <CreateBreakModal
          isOpen={showBreakModal}
          onClose={() => setShowBreakModal(false)}
          booking={booking}
          onCreateBreak={handleCreateBreak}
        />
      )}
    </>
  );
}