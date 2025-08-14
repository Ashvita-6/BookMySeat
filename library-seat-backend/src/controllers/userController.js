const User = require('../models/User');
const Booking = require('../models/Booking');

const getAllUsers = async (req, res) => {
  try {
    const { role, limit = 20, offset = 0 } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      student_id: user.student_id,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        student_id: user.student_id,
        role: user.role,
        updated_at: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has active bookings
    const activeBookings = await Booking.find({
      user_id: id,
      status: 'active',
      end_time: { $gt: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete user with active bookings' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser };