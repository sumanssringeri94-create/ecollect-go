const express = require('express');
const router = express.Router();
const { getCenters, getCentersByCity } = require('../controllers/centerController');

// GET /api/centers
router.get('/', getCentersByCity);

module.exports = router;
