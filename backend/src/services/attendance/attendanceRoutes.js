const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const allowRoles = require('../../middleware/role');
const attendanceService = require('./attendanceService');

// GET attendance for a session (trainer + admin)
router.get('/session/:sessionId', verifyToken, allowRoles('admin', 'trainer'), attendanceService.getSessionAttendance);

// GET my attendance history (member)
router.get('/my', verifyToken, allowRoles('member'), attendanceService.getMyAttendance);

// PATCH mark single attendance (trainer)
router.patch('/:id', verifyToken, allowRoles('trainer', 'admin'), attendanceService.markAttendance);

// POST bulk mark attendance (trainer marks whole class at once)
router.post('/bulk', verifyToken, allowRoles('trainer', 'admin'), attendanceService.bulkMarkAttendance);

module.exports = router;