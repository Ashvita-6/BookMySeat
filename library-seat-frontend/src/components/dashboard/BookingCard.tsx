'use client';

import { useState } from 'react';
import { Booking } from '@/types/booking';
import { CreateBreakData } from '@/types/break';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getSeatDisplayName, BOOKING_STATUS } from '../../utils/libraryStructure';

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: number) => void;
  onCreateBreak: (breakData: CreateBreakData) => void;
}

export default function BookingCard({ booking, onCancel, onCreateBreak }: BookingCardProps) {
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [isCreatingBreak, setIsCreatingBreak] = useState(false);

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      onCancel(booking.id);
    }
  };

  const handleCreateBreak = async () => {
    if (!breakStartTime || !breakEndTime) return;
    
    setIsCreatingBreak(true);
    try {
      await onCreateBreak({
        booking_id: booking.id,
        break_start_time: breakStartTime,
        break_end_time: breakEndTime,
        notes: breakNotes
      });
      setShowBreakForm(false);
      setBreakStartTime('');
      setBreakEndTime('');
      setBreakNotes('');
    } catch (error) {
      console.error('Failed to create break:', error);
    } finally {
      setIsCreatingBreak(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusInfo = () => {
    return BOOKING_STATUS[booking.status] || { 
      label: booking.status, 
      color: 'bg-gray-500', 
      description: '' 
    };
  };

  const statusInfo = getStatusInfo();
  
  // FIXED: Use the single object parameter version
  const seatDisplayName = getSeatDisplayName({
    building: booking.building,
    floor_hall: booking.floor_hall,
    section: booking.section,
    seat_number: booking.seat_number
  });

  const isActive = booking.status === 'active';
  const now = new Date();
  const endTime = new Date(booking.end_time);
  const isCurrentlyActive = isActive && endTime > now;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-semibold">{seatDisplayName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Start:</span>
            <span className="text-white">{formatDateTime(booking.start_time)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">End:</span>
            <span className="text-white">{formatDateTime(booking.end_time)}</span>
          </div>
        </div>

        {showBreakForm ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Break Start Time
              </label>
              <input
                type="datetime-local"
                value={breakStartTime}
                onChange={(e) => setBreakStartTime(e.target.value)}
                min={booking.start_time.slice(0, 16)}
                max={booking.end_time.slice(0, 16)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Break End Time
              </label>
              <input
                type="datetime-local"
                value={breakEndTime}
                onChange={(e) => setBreakEndTime(e.target.value)}
                min={breakStartTime || booking.start_time.slice(0, 16)}
                max={booking.end_time.slice(0, 16)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Notes (optional)
              </label>
              <textarea
                value={breakNotes}
                onChange={(e) => setBreakNotes(e.target.value)}
                placeholder="Add any notes for break takers..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBreakForm(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBreak}
                disabled={!breakStartTime || !breakEndTime || isCreatingBreak}
                loading={isCreatingBreak}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Create Break
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            {isCurrentlyActive && (
              <Button
                onClick={() => setShowBreakForm(true)}
                variant="outline"
                size="sm"
                className="flex-1 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
              >
                Create Break
              </Button>
            )}
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}