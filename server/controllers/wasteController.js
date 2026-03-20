const WasteItem = require('../models/WasteItem');
const User = require('../models/User');

// @desc    Add a new waste item
// @route   POST /api/waste
// @access  Private
const addWasteItem = async (req, res, next) => {
  try {
    const { category, itemName, brand, condition, quantity, description } = req.body;

    if (!category || !itemName) {
      return res.status(400).json({
        success: false,
        message: 'Category and item name are required.',
      });
    }

    // Calculate points and CO2 based on category
    const meta = WasteItem.getCategoryMeta(category);
    const totalPoints = meta.points * (quantity || 1);
    const totalCO2 = meta.co2 * (quantity || 1);

    const item = await WasteItem.create({
      user: req.user._id,
      category,
      itemName: itemName.trim(),
      brand: brand || '',
      condition: condition || 'Unknown',
      quantity: quantity || 1,
      description: description || '',
      pointsEarned: totalPoints,
      co2Saved: totalCO2,
    });

    // Update user points and stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        points: totalPoints,
        totalItemsRecycled: quantity || 1,
        co2Saved: totalCO2,
      },
    });

    // Update user level
    const user = await User.findById(req.user._id);
    user.updateLevel();
    await user.save();

    const populatedItem = await WasteItem.findById(item._id);
    res.status(201).json({
      success: true,
      message: `Item added! You earned ${totalPoints} points.`,
      item: populatedItem,
      pointsEarned: totalPoints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's waste items
// @route   GET /api/waste/my
// @access  Private
const getMyWasteItems = async (req, res, next) => {
  try {
    const items = await WasteItem.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all waste categories with meta info
// @route   GET /api/waste/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'Laptop/PC',         name: 'Laptop / PC',       icon: '💻', points: 150, co2: 1.2, hazardous: false },
      { id: 'Mobile Phone',      name: 'Mobile Phone',      icon: '📱', points: 80,  co2: 0.7, hazardous: false },
      { id: 'Tablet',            name: 'Tablet',            icon: '📟', points: 100, co2: 0.9, hazardous: false },
      { id: 'TV/Monitor',        name: 'TV / Monitor',      icon: '📺', points: 200, co2: 3.0, hazardous: false },
      { id: 'Battery',           name: 'Battery',           icon: '🔋', points: 30,  co2: 0.3, hazardous: true  },
      { id: 'Charger/Cable',     name: 'Charger / Cable',   icon: '🔌', points: 20,  co2: 0.1, hazardous: false },
      { id: 'Printer',           name: 'Printer',           icon: '🖨️', points: 120, co2: 1.0, hazardous: false },
      { id: 'Refrigerator',      name: 'Refrigerator',      icon: '❄️', points: 300, co2: 5.0, hazardous: true  },
      { id: 'Washing Machine',   name: 'Washing Machine',   icon: '🫧', points: 250, co2: 4.0, hazardous: false },
      { id: 'Other Electronics', name: 'Other Electronics', icon: '🔧', points: 50,  co2: 0.5, hazardous: false },
    ];

    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a waste item
// @route   DELETE /api/waste/:id
// @access  Private
const deleteWasteItem = async (req, res, next) => {
  try {
    const item = await WasteItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all waste items (admin)
// @route   GET /api/waste/admin/all
// @access  Admin
const getAllWasteItems = async (req, res, next) => {
  try {
    const items = await WasteItem.find()
      .populate('user', 'name email city')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

module.exports = { addWasteItem, getMyWasteItems, getCategories, deleteWasteItem, getAllWasteItems };
