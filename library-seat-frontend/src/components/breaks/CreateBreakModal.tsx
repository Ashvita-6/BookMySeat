// library-seat-frontend/src/components/breaks/CreateBreakModal.tsx
'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Booking } from '../../types/booking';
import { CreateBreakData } from '../../types/break';
import { getSeatDisplayName } from '../../utils/libraryStructure';

interface CreateBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onCreateBreak: (breakData: CreateBreakData) => Promise<void>;
}

export default function CreateBreakModal({ 
  isOpen, 
  onClose, 
  booking, 
  onCreateBreak 
}: CreateBreakModalProps) {
  const [formData, setFormData] = useState({
    break_start_time: '',
    break_end_time: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate times
      const startTime = new Date(formData.break_start_time);
      const endTime = new Date(formData.break_end_time);
      const now = new Date();
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);

      // Validation checks
      if (startTime < now) {
        throw new Error('Break start time cannot be in the past');
      }

      if (endTime <= startTime) {
        throw new Error('Break end time must be after start time');
      }

      if (startTime < bookingStart || endTime > bookingEnd) {
        throw new Error('Break must be within your booking period');
      }

      const duration = (endTime.getTime() - startTime.getTime()) / (60 * 1000);
      if (duration < 30) {
        throw new Error('Break duration must be at least 30 minutes');
      }

      await onCreateBreak({
        booking_id: booking.id,
        break_start_time: formData.break_start_time,
        break_end_time: formData.break_end_time,
        notes: formData.notes
      });

      onClose();
      setFormData({ break_start_time: '', break_end_time: '', notes: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create break');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatDateTimeLocal = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  const minStartTime = new Date();
  const maxEndTime = new Date(booking.end_time);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create Break</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-white font-medium">
              {/* FIXED: Pass the correct object structure */}
              {getSeatDisplayName({
                building: booking.building,
                floor_hall: booking.floor_hall,
                section: booking.section,
                seat_number: booking.seat_number
              })}
            </p>
            <p className="text-gray-300 text-sm">
              Booking: {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Break Start Time
              </label>
              <input
                type="datetime-local"
                name="break_start_time"
                value={formData.break_start_time}
                onChange={handleChange}
                min={formatDateTimeLocal(minStartTime)}
                max={formatDateTimeLocal(maxEndTime)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Break End Time
              </label>
              <input
                type="datetime-local"
                name="break_end_time"
                value={formData.break_end_time}
                onChange={handleChange}
                min={formData.break_start_time || formatDateTimeLocal(minStartTime)}
                max={formatDateTimeLocal(maxEndTime)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about your break..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Creating...' : 'Create Break'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}