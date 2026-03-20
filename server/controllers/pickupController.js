const Pickup = require('../models/Pickup');
const WasteItem = require('../models/WasteItem');
const User = require('../models/User');

// @desc    Schedule a pickup
// @route   POST /api/pickups
// @access  Private
const schedulePickup = async (req, res, next) => {
  try {
    const { address, city, pincode, scheduledDate, timeSlot, itemIds, notes } = req.body;

    if (!address || !city || !scheduledDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Address, city, date, and time slot are required.',
      });
    }

    // Validate date is in the future
    const date = new Date(scheduledDate);
    if (date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future.',
      });
    }

    const pickup = await Pickup.create({
      user: req.user._id,
      items: itemIds || [],
      address: address.trim(),
      city: city.trim(),
      pincode: pincode || '',
      scheduledDate: date,
      timeSlot,
      notes: notes || '',
    });

    // Update waste items status
    if (itemIds && itemIds.length > 0) {
      await WasteItem.updateMany(
        { _id: { $in: itemIds }, user: req.user._id },
        { status: 'pickup_requested', pickup: pickup._id }
      );
    }

    const populated = await Pickup.findById(pickup._id)
      .populate('items', 'itemName category quantity')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully!',
      pickup: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's pickups
// @route   GET /api/pickups/my
// @access  Private
const getMyPickups = async (req, res, next) => {
  try {
    const pickups = await Pickup.find({ user: req.user._id })
      .populate('items', 'itemName category quantity pointsEarned')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: pickups.length, pickups });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pickup
// @route   DELETE /api/pickups/:id
// @access  Private
const cancelPickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    if (pickup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['completed', 'rejected'].includes(pickup.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed or rejected pickup.' });
    }

    await pickup.deleteOne();

    // Reset item status
    if (pickup.items.length > 0) {
      await WasteItem.updateMany(
        { _id: { $in: pickup.items } },
        { status: 'logged', pickup: null }
      );
    }

    res.status(200).json({ success: true, message: 'Pickup cancelled.' });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN ───────────────────────────────────

// @desc    Get all pickups (admin)
// @route   GET /api/pickups/admin/all
// @access  Admin
const getAllPickups = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const pickups = await Pickup.find(filter)
      .populate('user', 'name email city phone')
      .populate('items', 'itemName category quantity')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: pickups.length, pickups });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a pickup (admin)
// @route   PUT /api/pickups/admin/:id/approve
// @access  Admin
const approvePickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('items');
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    pickup.status = 'approved';
    pickup.adminNote = req.body.adminNote || 'Approved';
    await pickup.save();

    res.status(200).json({ success: true, message: 'Pickup approved.', pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a pickup (admin)
// @route   PUT /api/pickups/admin/:id/reject
// @access  Admin
const rejectPickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    pickup.status = 'rejected';
    pickup.adminNote = req.body.adminNote || 'Rejected by admin';
    await pickup.save();

    // Reset items
    if (pickup.items.length > 0) {
      await WasteItem.updateMany(
        { _id: { $in: pickup.items } },
        { status: 'logged', pickup: null }
      );
    }

    res.status(200).json({ success: true, message: 'Pickup rejected.', pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark pickup as completed (admin)
// @route   PUT /api/pickups/admin/:id/complete
// @access  Admin
const completePickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('items');
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    pickup.status = 'completed';
    pickup.completedAt = new Date();

    // Calculate total points from items
    let totalPoints = 0;
    if (pickup.items && pickup.items.length > 0) {
      for (const item of pickup.items) {
        totalPoints += item.pointsEarned || 0;
        await WasteItem.findByIdAndUpdate(item._id, { status: 'recycled' });
      }
    }

    pickup.pointsAwarded = totalPoints;
    await pickup.save();

    // Award bonus points to user for completed pickup
    const user = await User.findById(pickup.user);
    if (user) {
      user.points += 50; // bonus for pickup completion
      user.updateLevel();
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Pickup marked as completed.', pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide analytics (admin)
// @route   GET /api/pickups/admin/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers   = await User.countDocuments({ role: 'user' });
    const totalItems   = await WasteItem.countDocuments();
    const totalPickups = await Pickup.countDocuments();
    const pendingPickups   = await Pickup.countDocuments({ status: 'pending' });
    const completedPickups = await Pickup.countDocuments({ status: 'completed' });

    const pointsData = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$points' }, totalCO2: { $sum: '$co2Saved' } } },
    ]);

    const categoryBreakdown = await WasteItem.aggregate([
      { $group: { _id: '$category', count: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalItems,
        totalPickups,
        pendingPickups,
        completedPickups,
        totalPointsAwarded: pointsData[0]?.totalPoints || 0,
        totalCO2Saved: Math.round((pointsData[0]?.totalCO2 || 0) * 10) / 10,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  schedulePickup,
  getMyPickups,
  cancelPickup,
  getAllPickups,
  approvePickup,
  rejectPickup,
  completePickup,
  getAnalytics,
};
