const Center = require('../models/Center');

// @desc    Get all active centers
// @route   GET /api/centers
// @access  Public
const getCenters = async (req, res, next) => {
  try {
    const centers = await Center.find({ isActive: true }).sort({ rating: -1 });
    res.status(200).json({ success: true, count: centers.length, centers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get centers by city
// @route   GET /api/centers?city=Bengaluru
// @access  Public
const getCentersByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const centers = await Center.find(filter).sort({ rating: -1 });
    res.status(200).json({ success: true, count: centers.length, centers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCenters, getCentersByCity };
