const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const allowRoles = require('../../middleware/role');
const schedulingService = require('./schedulingService');

// GET all sessions (all roles)
router.get('/', verifyToken, schedulingService.getAllSessions);

// GET single session
router.get('/:id', verifyToken, schedulingService.getSessionById);

// GET sessions by trainer (trainer sees own sessions)
router.get('/trainer/my', verifyToken, allowRoles('trainer'), schedulingService.getMysessions);

// POST create session (admin or trainer)
router.post('/', verifyToken, allowRoles('admin', 'trainer'), schedulingService.createSession);

// PUT update session (admin or trainer who owns it)
router.put('/:id', verifyToken, allowRoles('admin', 'trainer'), schedulingService.updateSession);

// DELETE session (admin only)
router.delete('/:id', verifyToken, allowRoles('admin'), schedulingService.deleteSession);

module.exports = router;