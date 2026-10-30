const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, password, city, phone } = req.body;

    // ✅ Validate input
    if (!name || !email || !password || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and city.',
      });
    }

    // ✅ Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      city: city.trim(),
      phone: phone || '',
    });

    // ✅ Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
        points: user.points,
        level: user.level,
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // ✅ Find user (include password field which has select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
        points: user.points,
        level: user.level,
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("GETME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = { register, login, getMe };