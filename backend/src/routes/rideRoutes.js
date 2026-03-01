const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRide,
  getPendingRides,
  acceptRide,
  markArrived,
  verifyOtp,
  completeRide,
  cancelRide,
  getRideById,
  getMyRides,
  getRiderActiveRide,
  estimateFare,
} = require('../controllers/rideController');

router.post('/estimate', protect, estimateFare);
router.post('/', protect, authorize('customer'), createRide);
router.get('/my', protect, authorize('customer'), getMyRides);
router.get('/pending', protect, authorize('rider'), getPendingRides);
router.get('/active', protect, authorize('rider'), getRiderActiveRide);
router.get('/:rideId', protect, getRideById);
router.patch('/:rideId/accept', protect, authorize('rider'), acceptRide);
router.patch('/:rideId/arrived', protect, authorize('rider'), markArrived);
router.patch('/:rideId/verify-otp', protect, authorize('rider'), verifyOtp);
router.patch('/:rideId/complete', protect, authorize('rider'), completeRide);
router.patch('/:rideId/cancel', protect, cancelRide);

module.exports = router;
