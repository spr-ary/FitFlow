const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const allowRoles = require('../../middleware/role');
const reportsService = require('./reportsService');

// GET dashboard stats (admin only)
router.get('/dashboard', verifyToken, allowRoles('admin'), reportsService.getDashboard);

// GET class attendance report (admin)
router.get('/attendance', verifyToken, allowRoles('admin'), reportsService.getAttendanceReport);

// GET membership report (admin)
router.get('/memberships', verifyToken, allowRoles('admin'), reportsService.getMembershipReport);

module.exports = router;