// library-seat-frontend/src/app/breaks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BreakCard from '../../components/breaks/BreakCard';
import { Break, BreakFilters } from '../../types/break';
import { breakService } from '../../services/breaks';
import { BUILDING_OPTIONS, getFloorHallOptions, SEAT_TYPES } from '../../utils/libraryStructure';

export default function BreaksPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BreakFilters>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadAvailableBreaks();
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAvailableBreaks();
    }
  }, [filters, isAuthenticated]);

  const loadAvailableBreaks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const availableBreaks = await breakService.getAvailableBreaks(filters);
      setBreaks(availableBreaks);
    } catch (err: any) {
      setError(err.message || 'Failed to load breaks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookBreak = async (breakId: number) => {
    try {
      await breakService.bookBreak(breakId);
      // Reload breaks to reflect changes
      await loadAvailableBreaks();
    } catch (err: any) {
      setError(err.message || 'Failed to book break');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Available Breaks</h1>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Building</label>
                <select
                  value={filters.building || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    building: e.target.value as 'main' | 'reading' | undefined,
                    floor_hall: undefined // Reset floor when building changes
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Buildings</option>
                  {BUILDING_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Floor/Hall</label>
                <select
                  value={filters.floor_hall || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    floor_hall: e.target.value || undefined 
                  }))}
                  disabled={!filters.building}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">All Floors/Halls</option>
                  {filters.building && getFloorHallOptions(filters.building).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Seat Type</label>
                <select
                  value={filters.seat_type || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    seat_type: e.target.value || undefined 
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Seat Types</option>
                  {Object.entries(SEAT_TYPES).map(([key, seatType]) => (
                    <option key={key} value={key}>
                      {seatType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Min Duration</label>
                <select
                  value={filters.min_duration || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    min_duration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Duration</option>
                  <option value="30">30+ minutes</option>
                  <option value="60">1+ hours</option>
                  <option value="120">2+ hours</option>
                  <option value="180">3+ hours</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={() => setFilters({})}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-6">
            <p className="text-red-300 p-4">{error}</p>
          </Card>
        )}

        {/* Breaks Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading available breaks..." />
          </div>
        ) : breaks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No Available Breaks</h3>
            <p className="text-gray-400 mb-4">
              There are no breaks available matching your filters at the moment.
            </p>
            <p className="text-gray-500 text-sm">
              Check back later or adjust your filters to see more options.
            </p>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {breaks.length} Available Break{breaks.length !== 1 ? 's' : ''}
              </h2>
              <Button
                onClick={loadAvailableBreaks}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Refresh
              </Button>
            </div>

            {/* FIXED: Use correct prop name onBook instead of onBookBreak */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breaks.map((breakItem: Break) => (
                <BreakCard
                  key={breakItem.id}
                  break={breakItem}
                  onBook={handleBookBreak}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}