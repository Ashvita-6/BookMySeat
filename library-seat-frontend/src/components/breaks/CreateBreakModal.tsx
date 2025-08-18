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

      if (duration > 300) {
        throw new Error('Break duration cannot exceed 5 hours');
      }

      await onCreateBreak({
        booking_id: booking.id,
        break_start_time: formData.break_start_time,
        break_end_time: formData.break_end_time,
        notes: formData.notes
      });

      // Reset form and close
      setFormData({ break_start_time: '', break_end_time: '', notes: '' });
      onClose();
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

  // Get min/max datetime values for inputs
  const now = new Date();
  const bookingStart = new Date(booking.start_time);
  const bookingEnd = new Date(booking.end_time);
  
  const minStartTime = new Date(Math.max(now.getTime(), bookingStart.getTime()));
  const maxEndTime = bookingEnd;

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create Break</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-white font-medium">
            {getSeatDisplayName(booking)}
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
              maxLength={200}
              rows={3}
              placeholder="Add any notes for people taking your break..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              {formData.notes.length}/200 characters
            </p>
          </div>

          <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg">
            <p className="font-medium mb-1">Break Rules:</p>
            <ul className="text-xs space-y-1">
              <li>• Minimum duration: 30 minutes</li>
              <li>• Maximum duration: 5 hours</li>
              <li>• Must be within your booking period</li>
              <li>• Cannot start in the past</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating...' : 'Create Break'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}