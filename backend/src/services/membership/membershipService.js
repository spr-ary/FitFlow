const pool = require('../../config/db');

// ─── GET ALL PLANS ────────────────────────────────────────
const getAllPlans = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plans ORDER BY price ASC'
    );
    res.json({ plans: result.rows });
  } catch (err) {
    console.error('getAllPlans error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET PLAN BY ID ───────────────────────────────────────
const getPlanById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plans WHERE id = $1', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ plan: result.rows[0] });
  } catch (err) {
    console.error('getPlanById error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── CREATE PLAN ──────────────────────────────────────────
const createPlan = async (req, res) => {
  const { name, duration, price, description } = req.body;

  if (!name || !duration || !price) {
    return res.status(400).json({ message: 'Name, duration and price are required.' });
  }
  if (!['monthly', 'yearly'].includes(duration)) {
    return res.status(400).json({ message: 'Duration must be monthly or yearly.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO plans (name, duration, price, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, duration, price, description || null]
    );
    res.status(201).json({ message: 'Plan created.', plan: result.rows[0] });
  } catch (err) {
    console.error('createPlan error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE PLAN ──────────────────────────────────────────
const updatePlan = async (req, res) => {
  const { name, duration, price, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE plans
       SET name=$1, duration=$2, price=$3, description=$4
       WHERE id=$5
       RETURNING *`,
      [name, duration, price, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ message: 'Plan updated.', plan: result.rows[0] });
  } catch (err) {
    console.error('updatePlan error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── TOGGLE PLAN ACTIVE/INACTIVE ─────────────────────────
const togglePlan = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE plans
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    const plan = result.rows[0];
    res.json({
      message: `Plan is now ${plan.is_active ? 'active' : 'inactive'}.`,
      plan
    });
  } catch (err) {
    console.error('togglePlan error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MY MEMBERSHIP (member) ───────────────────────────
const getMyMembership = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.name as plan_name, p.duration, p.price
       FROM memberships m
       JOIN plans p ON m.plan_id = p.id
       WHERE m.user_id = $1
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No membership found.' });
    }

    // Auto update status if expired
    const membership = result.rows[0];
    if (new Date(membership.end_date) < new Date()) {
      await pool.query(
        'UPDATE memberships SET status=$1 WHERE id=$2',
        ['expired', membership.id]
      );
      membership.status = 'expired';
    }

    res.json({ membership });
  } catch (err) {
    console.error('getMyMembership error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MEMBERSHIP BY USER ID (admin) ───────────────────
const getMembershipByUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.name as plan_name, p.duration, p.price,
              u.name as member_name, u.email
       FROM memberships m
       JOIN plans p ON m.plan_id = p.id
       JOIN users u ON m.user_id = u.id
       WHERE m.user_id = $1
       ORDER BY m.created_at DESC`,
      [req.params.userId]
    );
    res.json({ memberships: result.rows });
  } catch (err) {
    console.error('getMembershipByUser error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── ASSIGN MEMBERSHIP (admin) ───────────────────────────
const assignMembership = async (req, res) => {
  const { user_id, plan_id, start_date } = req.body;

  if (!user_id || !plan_id) {
    return res.status(400).json({ message: 'user_id and plan_id are required.' });
  }

  try {
    // Check user exists and is a member
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1', [user_id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (userCheck.rows[0].role !== 'member') {
      return res.status(400).json({ message: 'User is not a member.' });
    }

    // Get plan to calculate end date
    const planCheck = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND is_active = TRUE', [plan_id]
    );
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found or inactive.' });
    }

    const plan = planCheck.rows[0];
    const start = start_date ? new Date(start_date) : new Date();
    const end = new Date(start);

    if (plan.duration === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    // Cancel any existing active membership
    await pool.query(
      `UPDATE memberships SET status='cancelled'
       WHERE user_id=$1 AND status='active'`,
      [user_id]
    );

    // Create new membership
    const result = await pool.query(
      `INSERT INTO memberships (user_id, plan_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [user_id, plan_id, start, end]
    );

    res.status(201).json({
      message: 'Membership assigned successfully.',
      membership: result.rows[0]
    });
  } catch (err) {
    console.error('assignMembership error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ALL MEMBERSHIPS (admin) ─────────────────────────
const getAllMemberships = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.name as plan_name, p.price,
              u.name as member_name, u.email
       FROM memberships m
       JOIN plans p ON m.plan_id = p.id
       JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`
    );
    res.json({ memberships: result.rows });
  } catch (err) {
    console.error('getAllMemberships error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  togglePlan,
  getMyMembership,
  getMembershipByUser,
  assignMembership,
  getAllMemberships
};