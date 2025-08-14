'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { api } from '../../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  student_id: string;
  role: 'student' | 'admin';
  created_at: string;
}

interface Booking {
  id: number;
  user_id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  floor: number;
  section: string;
  seat_number: string;
  seat_type: string;
  user_name?: string;
}

interface Seat {
  id: number;
  floor: number;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'quiet' | 'computer';
  has_power: boolean;
  has_monitor: boolean;
  is_active: boolean;
  status: 'available' | 'occupied';
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  // Modal states
  const [showAddSeatModal, setShowAddSeatModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newSeat, setNewSeat] = useState({
    floor: 1,
    section: 'A',
    seat_number: '',
    seat_type: 'individual' as const,
    has_power: true,
    has_monitor: false,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, bookingsResponse, seatsResponse] = await Promise.all([
        api.users.getAll(),
        api.bookings.getAll(),
        api.seats.getAll()
      ]);
      
      setUsers(usersResponse.users);
      setBookings(bookingsResponse.bookings);
      setSeats(seatsResponse.seats);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSeat = async () => {
    try {
      await api.seats.create(newSeat);
      setShowAddSeatModal(false);
      setNewSeat({
        floor: 1,
        section: 'A',
        seat_number: '',
        seat_type: 'individual',
        has_power: true,
        has_monitor: false,
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add seat');
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: 'student' | 'admin') => {
    try {
      await api.users.updateRole(userId, { role: newRole });
      await loadData();
      setShowEditUserModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteSeat = async (seatId: number) => {
    if (!confirm('Are you sure you want to delete this seat?')) return;
    
    try {
      await api.seats.delete(seatId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete seat');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading size="lg" text="Loading admin panel..." />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const stats = {
    totalUsers: users.length,
    totalSeats: seats.length,
    activeBookings: bookings.filter(b => b.status === 'active').length,
    occupiedSeats: seats.filter(s => s.status === 'occupied').length,
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'seats', label: 'Seats' },
    { id: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400">Manage users, seats, and bookings</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Seats</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSeats}</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m10-18v18M7 9h10m-10 4h10" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats.activeBookings}</p>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSeats > 0 ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Users Management</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300">Student ID</th>
                    <th className="text-left py-3 px-4 text-gray-300">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-white">{user.name}</td>
                      <td className="py-3 px-4 text-gray-300">{user.email}</td>
                      <td className="py-3 px-4 text-gray-300">{user.student_id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                            : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUserModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Seats Tab */}
        {activeTab === 'seats' && (
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Seats Management</h2>
              <Button
                onClick={() => setShowAddSeatModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Seat
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">Seat</th>
                    <th className="text-left py-3 px-4 text-gray-300">Floor</th>
                    <th className="text-left py-3 px-4 text-gray-300">Section</th>
                    <th className="text-left py-3 px-4 text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-gray-300">Features</th>
                    <th className="text-left py-3 px-4 text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seats.map((seat) => (
                    <tr key={seat.id} className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-white">
                        {seat.section}{seat.seat_number}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{seat.floor}</td>
                      <td className="py-3 px-4 text-gray-300">{seat.section}</td>
                      <td className="py-3 px-4 text-gray-300">{seat.seat_type}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {seat.has_power && '⚡'} {seat.has_monitor && '🖥️'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          seat.status === 'available' 
                            ? 'bg-green-900/50 text-green-300 border border-green-700' 
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {seat.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDeleteSeat(seat.id)}
                          size="sm"
                          variant="danger"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Bookings Management</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">User</th>
                    <th className="text-left py-3 px-4 text-gray-300">Seat</th>
                    <th className="text-left py-3 px-4 text-gray-300">Start Time</th>
                    <th className="text-left py-3 px-4 text-gray-300">End Time</th>
                    <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-white">{booking.user_name}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {booking.section}{booking.seat_number} (Floor {booking.floor})
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(booking.start_time).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(booking.end_time).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'active' 
                            ? 'bg-green-900/50 text-green-300 border border-green-700' 
                            : booking.status === 'completed'
                            ? 'bg-gray-900/50 text-gray-300 border border-gray-700'
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add Seat Modal */}
      <Modal 
        isOpen={showAddSeatModal} 
        onClose={() => setShowAddSeatModal(false)}
        title="Add New Seat"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Floor
              </label>
              <input
                type="number"
                value={newSeat.floor}
                onChange={(e) => setNewSeat({...newSeat, floor: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section
              </label>
              <input
                type="text"
                value={newSeat.section}
                onChange={(e) => setNewSeat({...newSeat, section: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seat Number
              </label>
              <input
                type="text"
                value={newSeat.seat_number}
                onChange={(e) => setNewSeat({...newSeat, seat_number: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seat Type
              </label>
              <select
                value={newSeat.seat_type}
                onChange={(e) => setNewSeat({...newSeat, seat_type: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="individual">Individual</option>
                <option value="group">Group Study</option>
                <option value="quiet">Quiet Zone</option>
                <option value="computer">Computer Station</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSeat.has_power}
                onChange={(e) => setNewSeat({...newSeat, has_power: e.target.checked})}
                className="mr-2"
              />
              <span className="text-gray-300">Has Power</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSeat.has_monitor}
                onChange={(e) => setNewSeat({...newSeat, has_monitor: e.target.checked})}
                className="mr-2"
              />
              <span className="text-gray-300">Has Monitor</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddSeat}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add Seat
            </Button>
            <Button
              onClick={() => setShowAddSeatModal(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        isOpen={showEditUserModal} 
        onClose={() => setShowEditUserModal(false)}
        title="Edit User Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">{selectedUser.name}</h3>
              <p className="text-sm text-gray-300">{selectedUser.email}</p>
              <p className="text-sm text-gray-300">Student ID: {selectedUser.student_id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    defaultChecked={selectedUser.role === 'student'}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    defaultChecked={selectedUser.role === 'admin'}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Admin</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  const formData = new FormData(document.querySelector('form') as HTMLFormElement);
                  const newRole = formData.get('role') as 'student' | 'admin';
                  handleUpdateUserRole(selectedUser.id, newRole);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Update Role
              </Button>
              <Button
                onClick={() => setShowEditUserModal(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}