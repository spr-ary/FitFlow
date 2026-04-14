const pool = require('../../config/db');

// ─── GET SESSION ATTENDANCE ───────────────────────────────
const getSessionAttendance = async (req, res) => {
  try {
    // Trainer can only see their own sessions
    if (req.user.role === 'trainer') {
      const check = await pool.query(
        'SELECT trainer_id FROM sessions WHERE id=$1',
        [req.params.sessionId]
      );
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Session not found.' });
      }
      if (check.rows[0].trainer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    const result = await pool.query(
      `SELECT a.*, u.name as member_name, u.email,
              s.name as session_name, s.session_date, s.start_time
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       JOIN sessions s ON a.session_id = s.id
       WHERE a.session_id = $1
       ORDER BY u.name ASC`,
      [req.params.sessionId]
    );
    res.json({ attendance: result.rows });
  } catch (err) {
    console.error('getSessionAttendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MY ATTENDANCE (member) ───────────────────────────
const getMyAttendance = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as session_name,
              s.session_date, s.start_time, s.room,
              u.name as trainer_name
       FROM attendance a
       JOIN sessions s ON a.session_id = s.id
       JOIN users u ON s.trainer_id = u.id
       WHERE a.user_id = $1
       ORDER BY s.session_date DESC`,
      [req.user.id]
    );
    res.json({ attendance: result.rows });
  } catch (err) {
    console.error('getMyAttendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── MARK SINGLE ATTENDANCE ───────────────────────────────
const markAttendance = async (req, res) => {
  const { status } = req.body;

  if (!['present', 'absent', 'unmarked'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be present, absent, or unmarked.'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE attendance
       SET status=$1, marked_at=NOW()
       WHERE id=$2
       RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }
    res.json({ message: 'Attendance marked.', attendance: result.rows[0] });
  } catch (err) {
    console.error('markAttendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── BULK MARK ATTENDANCE ─────────────────────────────────
// Body: { session_id, records: [{ attendance_id, status }] }
const bulkMarkAttendance = async (req, res) => {
  const { session_id, records } = req.body;

  if (!session_id || !records || !Array.isArray(records)) {
    return res.status(400).json({
      message: 'session_id and records array are required.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify trainer owns this session
    if (req.user.role === 'trainer') {
      const check = await client.query(
        'SELECT trainer_id FROM sessions WHERE id=$1', [session_id]
      );
      if (check.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Session not found.' });
      }
      if (check.rows[0].trainer_id !== req.user.id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    // Update each record
    for (const record of records) {
      if (!['present', 'absent', 'unmarked'].includes(record.status)) continue;
      await client.query(
        `UPDATE attendance
         SET status=$1, marked_at=NOW()
         WHERE id=$2 AND session_id=$3`,
        [record.status, record.attendance_id, session_id]
      );
    }

    await client.query('COMMIT');

    // Return updated attendance
    const result = await pool.query(
      `SELECT a.*, u.name as member_name
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.session_id=$1
       ORDER BY u.name ASC`,
      [session_id]
    );

    res.json({
      message: `Attendance saved for ${records.length} members.`,
      attendance: result.rows
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('bulkMarkAttendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getSessionAttendance,
  getMyAttendance,
  markAttendance,
  bulkMarkAttendance
};