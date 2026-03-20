const express = require('express');
const router = express.Router();
const {
  schedulePickup,
  getMyPickups,
  cancelPickup,
  getAllPickups,
  approvePickup,
  rejectPickup,
  completePickup,
  getAnalytics,
} = require('../controllers/pickupController');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/pickups
router.post('/', protect, schedulePickup);

// GET  /api/pickups/my
router.get('/my', protect, getMyPickups);

// DELETE /api/pickups/:id
router.delete('/:id', protect, cancelPickup);

// Admin
router.get('/admin/all',          protect, adminOnly, getAllPickups);
router.get('/admin/analytics',    protect, adminOnly, getAnalytics);
router.put('/admin/:id/approve',  protect, adminOnly, approvePickup);
router.put('/admin/:id/reject',   protect, adminOnly, rejectPickup);
router.put('/admin/:id/complete', protect, adminOnly, completePickup);

module.exports = router;
