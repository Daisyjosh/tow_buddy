const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { toggleOnline, getProfile, updateProfile } = require('../controllers/riderController');

router.get('/profile', protect, authorize('rider'), getProfile);
router.put('/profile', protect, authorize('rider'), updateProfile);
router.patch('/toggle-online', protect, authorize('rider'), toggleOnline);

module.exports = router;
