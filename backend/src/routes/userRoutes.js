const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const allowRoles = require('../middleware/role');

// ─── GET ALL USERS (admin) ────────────────────────────────
router.get('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── GET ALL MEMBERS ONLY (admin) ────────────────────────
router.get('/members', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at,
              m.status as membership_status, p.name as plan_name,
              m.end_date
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
         AND m.status = 'active'
       LEFT JOIN plans p ON m.plan_id = p.id
       WHERE u.role = 'member'
       ORDER BY u.created_at DESC`
    );
    res.json({ members: result.rows });
  } catch (err) {
    console.error('getMembers error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── GET ALL TRAINERS ONLY (admin) ───────────────────────
router.get('/trainers', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at,
              COUNT(s.id) as total_sessions
       FROM users u
       LEFT JOIN sessions s ON u.id = s.trainer_id
       WHERE u.role = 'trainer'
       GROUP BY u.id
       ORDER BY u.name ASC`
    );
    res.json({ trainers: result.rows });
  } catch (err) {
    console.error('getTrainers error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── GET SINGLE USER (admin) ─────────────────────────────
router.get('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('getUser error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── CREATE USER (admin adds member or trainer) ───────────
router.post('/', verifyToken, allowRoles('admin'), async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required.' });
  }
  if (!['member', 'trainer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hashedPassword, role, phone || null]
    );

    res.status(201).json({
      message: 'User created successfully.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── UPDATE USER (admin) ──────────────────────────────────
router.put('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  const { name, email, phone, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name=$1, email=$2, phone=$3, role=$4, updated_at=NOW()
       WHERE id=$5
       RETURNING id, name, email, role, phone`,
      [name, email, phone, role, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User updated.', user: result.rows[0] });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── DELETE USER (admin) ──────────────────────────────────
router.delete('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING id, name',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: `User ${result.rows[0].name} deleted.` });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── UPDATE OWN PROFILE (any role) ───────────────────────
router.put('/profile/me', verifyToken, async (req, res) => {
  const { name, phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name=$1, phone=$2, updated_at=NOW()
       WHERE id=$3
       RETURNING id, name, email, role, phone`,
      [name, phone, req.user.id]
    );
    res.json({ message: 'Profile updated.', user: result.rows[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;