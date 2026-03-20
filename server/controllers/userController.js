const User = require('../models/User');
const WasteItem = require('../models/WasteItem');
const Pickup = require('../models/Pickup');

// @desc    Get user profile + stats
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const itemCount = await WasteItem.countDocuments({ user: req.user._id });
    const pickupCount = await Pickup.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      user,
      stats: {
        itemCount,
        pickupCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, city, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name: name.trim() }),
        ...(city && { city: city.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true, role: 'user' })
      .select('name city points level totalItemsRecycled')
      .sort({ points: -1 })
      .limit(10);

    res.status(200).json({ success: true, leaderboard: users });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN ───────────────────────────────────

// @desc    Get all users (admin)
// @route   GET /api/users/admin/all
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (admin)
// @route   PUT /api/users/admin/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getLeaderboard, getAllUsers, toggleUserStatus };
