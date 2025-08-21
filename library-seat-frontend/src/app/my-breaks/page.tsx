// library-seat-frontend/src/app/my-breaks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BreakCard from '../../components/breaks/BreakCard';
import { Break } from '../../types/break';
import { breakService } from '../../services/breaks';

export default function MyBreaksPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'taken'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadMyBreaks();
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyBreaks();
    }
  }, [activeTab, isAuthenticated]);

  // FIXED: Remove parameter from getMyBreaks call
  const loadMyBreaks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const myBreaks = await breakService.getMyBreaks(); // No parameter
      setBreaks(myBreaks);
    } catch (err: any) {
      setError(err.message || 'Failed to load breaks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBreak = async (breakId: number) => {
    try {
      await breakService.cancelBreak(breakId);
      // Reload breaks to reflect changes
      await loadMyBreaks();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel break');
    }
  };

  // FIXED: Use the correct method names that exist in breakService
  const getFilteredBreaks = () => {
    switch (activeTab) {
      case 'created':
        return breakService.getMyCreatedBreaks(breaks);
      case 'taken':
        return breakService.getMyTakenBreaks(breaks);
      default:
        return breaks;
    }
  };

  const filteredBreaks = getFilteredBreaks();

  // Get counts for tabs
  const createdCount = breakService.getMyCreatedBreaks(breaks).length;
  const takenCount = breakService.getMyTakenBreaks(breaks).length;
  const totalCount = breaks.length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading size="lg" text="Loading your breaks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Breaks</h1>
          <Button
            onClick={loadMyBreaks}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'created'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Created ({createdCount})
            </button>
            <button
              onClick={() => setActiveTab('taken')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'taken'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Taken ({takenCount})
            </button>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-6">
            <p className="text-red-300 p-4">{error}</p>
          </Card>
        )}

        {/* Breaks Grid */}
        {filteredBreaks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No Breaks Found</h3>
            <p className="text-gray-400 mb-4">
              {activeTab === 'all' && "You haven't created or taken any breaks yet."}
              {activeTab === 'created' && "You haven't created any breaks yet."}
              {activeTab === 'taken' && "You haven't taken any breaks yet."}
            </p>
            <p className="text-gray-500 text-sm">
              Create a break from your active bookings to get started.
            </p>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {filteredBreaks.length} Break{filteredBreaks.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {/* FIXED: Use correct prop name onCancel instead of onCancelBreak */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBreaks.map((breakItem: Break) => (
                <BreakCard
                  key={breakItem.id}
                  break={breakItem}
                  onCancel={handleCancelBreak}
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