import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AttendanceConfirmation from './AttendanceConfirmation';
import useLocationTracker from '../hooks/useLocationTracker';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Break modal states
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [selectedBookingForBreak, setSelectedBookingForBreak] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');

  // Track location automatically
  useLocationTracker(60000);

  useEffect(() => {
    fetchBookings();
    
    // Auto-refresh bookings every 30 seconds to check for expirations
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBookings(response.data.bookings);
    } catch (err) {
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      alert('Error cancelling booking');
    }
  };

  const handleAttendanceConfirmed = (updatedBooking) => {
    setBookings(bookings.map(b => 
      b._id === updatedBooking._id ? updatedBooking : b
    ));
    setSelectedBooking(null);
  };

  const openBreakModal = (booking) => {
    setSelectedBookingForBreak(booking);
    setBreakStartTime('');
    setBreakEndTime('');
    setError('');
    setShowBreakModal(true);
  };

  const handleStartBreak = async () => {
    if (!breakStartTime || !breakEndTime) {
      setError('Please select break start and end times');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bookings/start-break/${selectedBookingForBreak._id}`,
        {
          breakStartTime,
          breakEndTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Break started successfully!');
      setShowBreakModal(false);
      setSelectedBookingForBreak(null);
      setBreakStartTime('');
      setBreakEndTime('');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Error starting break');
    }
  };

  const handleEndBreak = async (bookingId) => {
    if (!window.confirm('Are you sure you want to end your break?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bookings/end-break/${bookingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Break ended successfully!');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error ending break');
    }
  };

  const getStatusBadge = (booking) => {
    if (booking.status === 'cancelled') {
      return <span style={styles.badgeCancelled}>Cancelled</span>;
    }
    if (booking.status === 'completed') {
      return <span style={styles.badgeCompleted}>Completed</span>;
    }
    if (booking.status === 'on-break') {
      return <span style={styles.badgeOnBreak}>On Break</span>;
    }
    if (booking.attendanceConfirmed) {
      return <span style={styles.badgeConfirmed}>Confirmed</span>;
    }
    return <span style={styles.badgePending}>Pending Attendance</span>;
  };

  const needsAttendance = (booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed' || booking.attendanceConfirmed) {
      return false;
    }

    const now = new Date();
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const deadlineTime = new Date(bookingDate.getTime() + 20 * 60 * 1000);
    
    return now >= bookingDate && now <= deadlineTime;
  };

  const isBookingActive = (booking) => {
    // Active means: not cancelled, not completed, and either confirmed or on break
    return booking.status !== 'cancelled' && 
           booking.status !== 'completed' &&
           (booking.status === 'confirmed' || booking.status === 'on-break' || booking.attendanceConfirmed);
  };

  // FIXED: New function to determine if booking can be cancelled
  // Allows cancellation of ANY booking that's not already cancelled or completed
  const canCancelBooking = (booking) => {
    return booking.status !== 'cancelled' && booking.status !== 'completed';
  };

  const canTakeBreak = (booking) => {
    return booking.status === 'confirmed' && booking.attendanceConfirmed;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.status === 'pending' && !booking.attendanceConfirmed;
    if (filter === 'confirmed') return booking.attendanceConfirmed || booking.status === 'confirmed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    if (filter === 'completed') return booking.status === 'completed';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading your bookings...</div>;
  }

  if (selectedBooking) {
    return (
      <div>
        <button 
          onClick={() => setSelectedBooking(null)}
          style={styles.backButton}
        >
          ← Back to Bookings
        </button>
        <AttendanceConfirmation 
          booking={selectedBooking}
          onAttendanceConfirmed={handleAttendanceConfirmed}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Bookings</h2>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {})
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterButton,
            ...(filter === 'pending' ? styles.filterButtonActive : {})
          }}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'confirmed' ? styles.filterButtonActive : {})
          }}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'completed' ? styles.filterButtonActive : {})
          }}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          style={{
            ...styles.filterButton,
            ...(filter === 'cancelled' ? styles.filterButtonActive : {})
          }}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div style={styles.noBookings}>
          <p>No bookings found</p>
        </div>
      ) : (
        <div style={styles.bookingsList}>
          {filteredBookings.map((booking) => (
            <div key={booking._id} style={styles.bookingCard}>
              <div style={styles.bookingHeader}>
                <div style={styles.seatInfo}>
                  <h3 style={styles.seatNumber}>Seat {booking.seat?.seatNumber}</h3>
                  <p style={styles.floor}>
                    Floor {booking.seat?.floor} - {booking.seat?.section} Section
                  </p>
                </div>
                {getStatusBadge(booking)}
              </div>

              <div style={styles.bookingDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Date:</span>
                  <span style={styles.detailValue}>{formatDate(booking.date)}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Time:</span>
                  <span style={styles.detailValue}>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Status:</span>
                  <span style={styles.detailValue}>
                    {booking.status === 'on-break' ?
                     'On Break' :
                     booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Current Break Display */}
              {booking.status === 'on-break' && booking.currentBreak && (
                <div style={styles.currentBreakBox}>
                  <div style={styles.breakIcon}>🟡</div>
                  <div>
                    <p style={styles.breakTitle}>Currently On Break</p>
                    <p style={styles.breakTime}>
                      {booking.currentBreak.startTime} - {booking.currentBreak.endTime}
                    </p>
                    <p style={styles.breakNote}>
                      Break will auto-end after {booking.currentBreak.endTime}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Status Info */}
              {booking.status === 'completed' && (
                <div style={styles.completedBox}>
                  <p style={styles.completedText}>
                    ✓ This booking has been completed
                  </p>
                </div>
              )}

              {/* Break History */}
              {booking.breaks && booking.breaks.length > 0 && (
                <div style={styles.breakHistoryBox}>
                  <p style={styles.breakHistoryTitle}>Break History:</p>
                  {booking.breaks.map((brk, index) => (
                    <p key={index} style={styles.breakHistoryItem}>
                      Break {index + 1}: {brk.startTime} - {brk.endTime}
                    </p>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.bookingActions}>
                {needsAttendance(booking) && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    style={styles.attendButton}
                  >
                    Confirm Attendance
                  </button>
                )}

                {canTakeBreak(booking) && (
                  <button
                    onClick={() => openBreakModal(booking)}
                    style={styles.breakButton}
                  >
                    Take Break
                  </button>
                )}

                {booking.status === 'on-break' && (
                  <button
                    onClick={() => handleEndBreak(booking._id)}
                    style={styles.endBreakButton}
                  >
                    End Break
                  </button>
                )}

                {/* FIXED: Use canCancelBooking instead of isBookingActive */}
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    style={styles.cancelButton}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Break Modal */}
      {showBreakModal && selectedBookingForBreak && (
        <div style={styles.modalOverlay} onClick={() => setShowBreakModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Take a Break</h3>
            
            <div style={styles.breakInfoBox}>
              <p style={styles.breakInfoTitle}>Break Guidelines:</p>
              <ul style={styles.breakInfoList}>
                <li>Minimum break duration: 20 minutes</li>
                <li>Break must be within your booking time</li>
                <li>Your seat will be marked as "On Break" (Yellow)</li>
                <li>Break will automatically end at the specified time</li>
                <li>You can manually end your break anytime before it expires</li>
              </ul>
            </div>

            <div style={styles.bookingSummary}>
              <p><strong>Seat:</strong> {selectedBookingForBreak.seat?.seatNumber}</p>
              <p><strong>Booking Time:</strong> {selectedBookingForBreak.startTime} - {selectedBookingForBreak.endTime}</p>
            </div>

            {selectedBookingForBreak.breaks && selectedBookingForBreak.breaks.length > 0 && (
              <div style={styles.existingBreaksBox}>
                <p style={styles.existingBreaksTitle}>Previous Breaks:</p>
                {selectedBookingForBreak.breaks.map((brk, index) => (
                  <p key={index} style={styles.existingBreakItem}>
                    Break {index + 1}: {brk.startTime} - {brk.endTime}
                  </p>
                ))}
              </div>
            )}

            <div style={styles.breakTimeInputs}>
              <div style={styles.timeInputGroup}>
                <label style={styles.timeLabel}>Break Start Time:</label>
                <input
                  type="time"
                  value={breakStartTime}
                  onChange={(e) => setBreakStartTime(e.target.value)}
                  style={styles.timeInput}
                />
              </div>
              <div style={styles.timeInputGroup}>
                <label style={styles.timeLabel}>Break End Time:</label>
                <input
                  type="time"
                  value={breakEndTime}
                  onChange={(e) => setBreakEndTime(e.target.value)}
                  style={styles.timeInput}
                />
              </div>
            </div>

            {error && <div style={styles.modalError}>{error}</div>}

            <div style={styles.modalActions}>
              <button onClick={handleStartBreak} style={styles.modalConfirmButton}>
                Start Break
              </button>
              <button onClick={() => setShowBreakModal(false)} style={styles.modalCancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    fontSize: '28px',
    color: '#333',
    margin: 0
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.3s'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fcc'
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  noBookings: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    color: '#666'
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  bookingCard: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  seatInfo: {
    flex: 1
  },
  seatNumber: {
    fontSize: '20px',
    color: '#333',
    margin: '0 0 5px 0',
    fontWeight: '700'
  },
  floor: {
    color: '#666',
    margin: 0,
    fontSize: '14px'
  },
  badgePending: {
    padding: '6px 12px',
    backgroundColor: '#FFC107',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  badgeConfirmed: {
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  badgeOnBreak: {
    padding: '6px 12px',
    backgroundColor: '#FF9800',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  badgeCancelled: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  badgeCompleted: {
    padding: '6px 12px',
    backgroundColor: '#2196F3',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  bookingDetails: {
    marginBottom: '15px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  detailLabel: {
    color: '#666',
    fontWeight: '600'
  },
  detailValue: {
    color: '#333',
    fontWeight: '600'
  },
  currentBreakBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fff8e1',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #ffd54f'
  },
  breakIcon: {
    fontSize: '24px'
  },
  breakTitle: {
    fontWeight: '600',
    color: '#f57c00',
    margin: '0 0 4px 0',
    fontSize: '14px'
  },
  breakTime: {
    color: '#666',
    margin: '0 0 4px 0',
    fontSize: '13px'
  },
  breakNote: {
    color: '#888',
    margin: 0,
    fontSize: '12px',
    fontStyle: 'italic'
  },
  completedBox: {
    backgroundColor: '#e8f5e9',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #a5d6a7'
  },
  completedText: {
    color: '#2e7d32',
    margin: 0,
    fontSize: '14px',
    fontWeight: '600'
  },
  breakHistoryBox: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  breakHistoryTitle: {
    fontWeight: '600',
    color: '#666',
    margin: '0 0 8px 0',
    fontSize: '13px'
  },
  breakHistoryItem: {
    color: '#888',
    margin: '4px 0',
    fontSize: '12px'
  },
  bookingActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  attendButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.3s',
    minWidth: '150px'
  },
  breakButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.3s',
    minWidth: '150px'
  },
  endBreakButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.3s',
    minWidth: '150px'
  },
  cancelButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.3s',
    minWidth: '150px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
    marginTop: 0
  },
  breakInfoBox: {
    backgroundColor: '#f0f7ff',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #d0e7ff'
  },
  breakInfoTitle: {
    fontWeight: '600',
    color: '#1976d2',
    margin: '0 0 10px 0',
    fontSize: '14px'
  },
  breakInfoList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.8'
  },
  bookingSummary: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  existingBreaksBox: {
    backgroundColor: '#fff8e1',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ffd54f'
  },
  existingBreaksTitle: {
    fontWeight: '600',
    color: '#f57c00',
    margin: '0 0 10px 0',
    fontSize: '14px'
  },
  existingBreakItem: {
    color: '#666',
    margin: '5px 0',
    fontSize: '13px'
  },
  breakTimeInputs: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  },
  timeInputGroup: {
    flex: 1
  },
  timeLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  timeInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  modalError: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid #fcc'
  },
  modalActions: {
    display: 'flex',
    gap: '10px'
  },
  modalConfirmButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.3s'
  },
  modalCancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.3s'
  }
};

export default MyBookings;