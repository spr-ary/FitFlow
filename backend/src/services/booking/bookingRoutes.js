const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const allowRoles = require('../../middleware/role');
const bookingService = require('./bookingService');

// GET my bookings (member)
router.get('/my', verifyToken, allowRoles('member'), bookingService.getMyBookings);

// GET all bookings for a session (trainer + admin)
router.get('/session/:sessionId', verifyToken, allowRoles('admin', 'trainer'), bookingService.getSessionBookings);

// GET all bookings (admin)
router.get('/', verifyToken, allowRoles('admin'), bookingService.getAllBookings);

// POST book a class (member only)
router.post('/', verifyToken, allowRoles('member'), bookingService.bookSession);

// PATCH cancel booking (member cancels own, admin cancels any)
router.patch('/:id/cancel', verifyToken, bookingService.cancelBooking);

module.exports = router;