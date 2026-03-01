const RiderProfile = require('../models/RiderProfile');

// Toggle online status
const toggleOnline = async (req, res, next) => {
  try {
    const profile = await RiderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    profile.isOnline = !profile.isOnline;
    // When going offline, mark unavailable too
    if (!profile.isOnline) {
      profile.isAvailable = true;
    }
    await profile.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('rider_status_change', { riderId: req.user._id, isOnline: profile.isOnline });
    }

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Get rider profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await RiderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Update rider profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, vehicleType } = req.body;
    const profile = await RiderProfile.findOneAndUpdate(
      { user: req.user._id },
      { name, phone, vehicleType },
      { new: true, runValidators: true }
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Reset today's earnings (cron-like endpoint)
const resetDailyEarnings = async (req, res, next) => {
  try {
    await RiderProfile.updateMany({}, { 'earnings.today': 0 });
    res.json({ success: true, message: "Today's earnings reset" });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleOnline, getProfile, updateProfile, resetDailyEarnings };
