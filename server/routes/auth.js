const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    await register(req, res);
  } catch (error) {
    console.error("REGISTER ROUTE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    console.error("LOGIN ROUTE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;