const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const allowRoles = require('../../middleware/role');
const membershipService = require('./membershipService');

// ── PLANS (Admin only) ────────────────────────────────────

// GET all plans
router.get('/plans', verifyToken, membershipService.getAllPlans);

// GET single plan
router.get('/plans/:id', verifyToken, membershipService.getPlanById);

// POST create plan (admin only)
router.post('/plans', verifyToken, allowRoles('admin'), membershipService.createPlan);

// PUT update plan (admin only)
router.put('/plans/:id', verifyToken, allowRoles('admin'), membershipService.updatePlan);

// DELETE / toggle plan (admin only)
router.patch('/plans/:id/toggle', verifyToken, allowRoles('admin'), membershipService.togglePlan);

// ── MEMBER MEMBERSHIPS ────────────────────────────────────

// GET my membership (member)
router.get('/my', verifyToken, allowRoles('member'), membershipService.getMyMembership);

// GET membership by user id (admin)
router.get('/user/:userId', verifyToken, allowRoles('admin'), membershipService.getMembershipByUser);

// POST assign membership to member (admin)
router.post('/assign', verifyToken, allowRoles('admin'), membershipService.assignMembership);

// GET all memberships (admin)
router.get('/', verifyToken, allowRoles('admin'), membershipService.getAllMemberships);

module.exports = router;