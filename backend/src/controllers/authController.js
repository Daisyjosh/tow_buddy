const User = require('../models/User');
const RiderProfile = require('../models/RiderProfile');
const { generateToken } = require('../utils/jwtUtils');

const register = async (req, res, next) => {
  try {
    const { email, password, role, name, phone, vehicleType } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    }

    if (!['customer', 'rider'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be customer or rider' });
    }

    if (role === 'rider' && (!name || !phone || !vehicleType)) {
      return res.status(400).json({ success: false, message: 'Riders must provide name, phone, and vehicleType' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ email, password, role });

    if (role === 'rider') {
      await RiderProfile.create({ user: user._id, name, phone, vehicleType });
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();

    let profile = null;
    if (user.role === 'rider') {
      profile = await RiderProfile.findOne({ user: user._id });
    }

    res.json({ success: true, token, user: userObj, profile });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'rider') {
      profile = await RiderProfile.findOne({ user: user._id });
    }
    res.json({ success: true, user, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
