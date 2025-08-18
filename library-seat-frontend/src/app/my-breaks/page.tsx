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

  const loadMyBreaks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const myBreaks = await breakService.getMyBreaks(activeTab);
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

  // Filter breaks based on active tab
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
          <div>
            <h1 className="text-2xl font-bold text-white">My Breaks</h1>
            <p className="text-gray-400">Manage your created breaks and view breaks you've taken</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Tabs */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Breaks ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'created'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              My Created Breaks ({createdCount})
            </button>
            <button
              onClick={() => setActiveTab('taken')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'taken'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Breaks I've Taken ({takenCount})
            </button>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-6">
            <p className="text-red-300">{error}</p>
          </Card>
        )}

        {/* Breaks Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading breaks..." />
          </div>
        ) : filteredBreaks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'all' && 'No Breaks Found'}
              {activeTab === 'created' && 'No Created Breaks'}
              {activeTab === 'taken' && 'No Taken Breaks'}
            </h3>
            <p className="text-gray-400 mb-4">
              {activeTab === 'all' && "You haven't created or taken any breaks yet."}
              {activeTab === 'created' && "You haven't created any breaks yet. Create a break from your active bookings."}
              {activeTab === 'taken' && "You haven't taken any breaks yet. Check available breaks to find opportunities."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
              {activeTab !== 'created' && (
                <Button
                  onClick={() => router.push('/breaks')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Browse Available Breaks
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {filteredBreaks.length} Break{filteredBreaks.length !== 1 ? 's' : ''}
              </h2>
              <Button
                onClick={loadMyBreaks}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBreaks.map((breakItem) => (
                <BreakCard
                  key={breakItem.id}
                  break={breakItem}
                  onCancelBreak={handleCancelBreak}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </>
        )}

        {/* Info Section */}
        <Card className="bg-gray-800 border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-white mb-3">About Breaks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">Creating Breaks</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Create breaks from your active bookings</li>
                <li>• Duration: 30 minutes to 5 hours</li>
                <li>• Must be within your booking period</li>
                <li>• Add optional notes for break takers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Taking Breaks</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Book available breaks from other users</li>
                <li>• No WiFi confirmation required</li>
                <li>• Automatically starts when booked</li>
                <li>• Cannot book your own breaks</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}