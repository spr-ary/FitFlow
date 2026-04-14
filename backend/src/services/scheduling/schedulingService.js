const pool = require('../../config/db');

// ─── GET ALL SESSIONS ─────────────────────────────────────
const getAllSessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
              u.name as trainer_name,
              (s.capacity - s.booked_count) as slots_available
       FROM sessions s
       JOIN users u ON s.trainer_id = u.id
       ORDER BY s.session_date ASC, s.start_time ASC`
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('getAllSessions error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SESSION BY ID ────────────────────────────────────
const getSessionById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
              u.name as trainer_name,
              (s.capacity - s.booked_count) as slots_available
       FROM sessions s
       JOIN users u ON s.trainer_id = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.json({ session: result.rows[0] });
  } catch (err) {
    console.error('getSessionById error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MY SESSIONS (trainer) ────────────────────────────
const getMysessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
              (s.capacity - s.booked_count) as slots_available
       FROM sessions s
       WHERE s.trainer_id = $1
       ORDER BY s.session_date ASC, s.start_time ASC`,
      [req.user.id]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('getMySessions error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── CREATE SESSION ───────────────────────────────────────
const createSession = async (req, res) => {
  const {
    name, trainer_id, room, day_of_week,
    session_date, start_time, end_time, capacity
  } = req.body;

  if (!name || !session_date || !start_time || !end_time || !capacity) {
    return res.status(400).json({
      message: 'Name, session_date, start_time, end_time and capacity are required.'
    });
  }

  // Trainer can only create for themselves
  const assignedTrainer = req.user.role === 'trainer'
    ? req.user.id
    : (trainer_id || req.user.id);

  try {
    // Check trainer exists
    const trainerCheck = await pool.query(
      'SELECT id FROM users WHERE id=$1 AND role=$2',
      [assignedTrainer, 'trainer']
    );
    if (trainerCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }

    const result = await pool.query(
      `INSERT INTO sessions
         (name, trainer_id, room, day_of_week, session_date, start_time, end_time, capacity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [name, assignedTrainer, room, day_of_week, session_date, start_time, end_time, capacity]
    );
    res.status(201).json({ message: 'Session created.', session: result.rows[0] });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE SESSION ───────────────────────────────────────
const updateSession = async (req, res) => {
  const { name, room, day_of_week, session_date, start_time, end_time, capacity } = req.body;

  try {
    // Trainer can only update their own session
    const check = await pool.query(
      'SELECT * FROM sessions WHERE id=$1', [req.params.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    if (req.user.role === 'trainer' && check.rows[0].trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own sessions.' });
    }

    const result = await pool.query(
      `UPDATE sessions
       SET name=$1, room=$2, day_of_week=$3,
           session_date=$4, start_time=$5, end_time=$6, capacity=$7
       WHERE id=$8
       RETURNING *`,
      [name, room, day_of_week, session_date, start_time, end_time, capacity, req.params.id]
    );
    res.json({ message: 'Session updated.', session: result.rows[0] });
  } catch (err) {
    console.error('updateSession error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── DELETE SESSION ───────────────────────────────────────
const deleteSession = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM sessions WHERE id=$1 RETURNING id, name',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.json({ message: `Session "${result.rows[0].name}" deleted.` });
  } catch (err) {
    console.error('deleteSession error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  getMysessions,
  createSession,
  updateSession,
  deleteSession
};