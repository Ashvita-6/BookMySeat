// library-seat-frontend/src/components/breaks/BreakCard.tsx
'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Break, BREAK_STATUS } from '../../types/break';
import { getSeatDisplayName, getLocationDisplayName } from '../../utils/libraryStructure';
import { breakService } from '../../services/breaks';

interface BreakCardProps {
  break: Break;
  onBookBreak?: (breakId: number) => Promise<void>;
  onCancelBreak?: (breakId: number) => Promise<void>;
  showActions?: boolean;
  currentUserId?: number;
}

export default function BreakCard({ 
  break: breakItem, 
  onBookBreak, 
  onCancelBreak,
  showActions = true,
  currentUserId
}: BreakCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isMyBreak = breakItem.is_my_break || breakItem.user_id === currentUserId;
  const canBook = !isMyBreak && breakService.isBreakAvailable(breakItem) && onBookBreak;
  const canCancel = isMyBreak && breakService.canCancelBreak(breakItem) && onCancelBreak;

  const handleBookBreak = async () => {
    if (!onBookBreak) return;
    setIsLoading(true);
    try {
      await onBookBreak(breakItem.id);
    } catch (error) {
      console.error('Failed to book break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBreak = async () => {
    if (!onCancelBreak) return;
    if (!confirm('Are you sure you want to cancel this break?')) return;
    
    setIsLoading(true);
    try {
      await onCancelBreak(breakItem.id);
    } catch (error) {
      console.error('Failed to cancel break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const status = BREAK_STATUS[breakItem.status];
  const seatName = getSeatDisplayName(breakItem);
  const locationName = getLocationDisplayName(breakItem.building, breakItem.floor_hall);

  return (
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
          <span className="text-gray-400">Break Time:</span>
          <span className="text-white">
            {new Date(breakItem.break_start_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {new Date(breakItem.break_end_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Duration:</span>
          <span className="text-white">
            {breakService.formatDuration(breakItem.duration_minutes)}
          </span>
        </div>

        {breakItem.time_remaining_minutes !== undefined && breakItem.status === 'active' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time Left:</span>
            <span className="text-green-400 font-medium">
              {breakService.formatDuration(breakItem.time_remaining_minutes)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{isMyBreak ? 'Your Break' : 'By'}:</span>
          <span className="text-white">
            {isMyBreak ? 'You' : breakItem.user_name}
            {breakItem.user_student_id && (
              <span className="text-gray-400 ml-1">({breakItem.user_student_id})</span>
            )}
          </span>
        </div>

        {breakItem.taken_by && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Taken by:</span>
            <span className="text-blue-400">
              {breakItem.taken_by.name}
              <span className="text-gray-400 ml-1">({breakItem.taken_by.student_id})</span>
            </span>
          </div>
        )}

        {breakItem.notes && (
          <div className="mt-3 p-2 bg-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400 font-medium">Note: </span>
              {breakItem.notes}
            </p>
          </div>
        )}
      </div>

      {showActions && (canBook || canCancel) && (
        <div className="flex gap-2">
          {canBook && (
            <Button
              onClick={handleBookBreak}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
            >
              {isLoading ? 'Booking...' : 'Take Break'}
            </Button>
          )}
          
          {canCancel && (
            <Button
              onClick={handleCancelBreak}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-red-600 text-red-400 hover:bg-red-900 text-sm py-2"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Break'}
            </Button>
          )}
        </div>
      )}

      {breakItem.status === 'expired' && (
        <div className="mt-3 p-2 bg-yellow-900 border border-yellow-700 rounded-lg">
          <p className="text-yellow-300 text-xs">
            This break has expired and is no longer available.
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-gray-400 text-xs">
          Created {new Date(breakItem.created_at).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}