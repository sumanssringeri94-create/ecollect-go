const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getLeaderboard,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// GET  /api/users/profile
router.get('/profile', protect, getProfile);

// PUT  /api/users/profile
router.put('/profile', protect, updateProfile);

// GET  /api/users/leaderboard
router.get('/leaderboard', protect, getLeaderboard);

// Admin routes
// GET  /api/users/admin/all
router.get('/admin/all', protect, adminOnly, getAllUsers);

// PUT  /api/users/admin/:id/toggle
router.put('/admin/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
