const express = require('express');
const router = express.Router();
const {
  addWasteItem,
  getMyWasteItems,
  getCategories,
  deleteWasteItem,
  getAllWasteItems,
} = require('../controllers/wasteController');
const { protect, adminOnly } = require('../middleware/auth');

// GET  /api/waste/categories  (public)
router.get('/categories', getCategories);

// POST /api/waste
router.post('/', protect, addWasteItem);

// GET  /api/waste/my
router.get('/my', protect, getMyWasteItems);

// DELETE /api/waste/:id
router.delete('/:id', protect, deleteWasteItem);

// Admin
// GET  /api/waste/admin/all
router.get('/admin/all', protect, adminOnly, getAllWasteItems);

module.exports = router;
