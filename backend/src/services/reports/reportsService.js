const pool = require('../../config/db');

// ─── DASHBOARD STATS ──────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [members, sessions, bookings, attendance, plans] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role='member'`),
      pool.query(`SELECT COUNT(*) FROM sessions WHERE session_date >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM bookings WHERE status='booked'`),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status='present') as present,
          COUNT(*) FILTER (WHERE status='absent')  as absent,
          COUNT(*) FILTER (WHERE status='unmarked') as unmarked,
          COUNT(*) as total
        FROM attendance`),
      pool.query(`SELECT COUNT(*) FROM memberships WHERE status='active'`)
    ]);

    const att = attendance.rows[0];
    const attendanceRate = att.total > 0
      ? Math.round((att.present / att.total) * 100)
      : 0;

    res.json({
      stats: {
        total_members:      parseInt(members.rows[0].count),
        upcoming_sessions:  parseInt(sessions.rows[0].count),
        total_bookings:     parseInt(bookings.rows[0].count),
        active_memberships: parseInt(plans.rows[0].count),
        attendance_rate:    attendanceRate,
        attendance_detail: {
          present:  parseInt(att.present),
          absent:   parseInt(att.absent),
          unmarked: parseInt(att.unmarked)
        }
      }
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── ATTENDANCE REPORT ────────────────────────────────────
const getAttendanceReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.name as session_name,
              s.session_date, s.start_time, s.room,
              u.name as trainer_name,
              COUNT(a.id) as total_booked,
              COUNT(a.id) FILTER (WHERE a.status='present') as present,
              COUNT(a.id) FILTER (WHERE a.status='absent')  as absent,
              COUNT(a.id) FILTER (WHERE a.status='unmarked') as unmarked,
              s.capacity,
              s.booked_count,
              ROUND(
                COUNT(a.id) FILTER (WHERE a.status='present')::decimal
                / NULLIF(s.booked_count,0) * 100
              ) as attendance_rate
       FROM sessions s
       JOIN users u ON s.trainer_id = u.id
       LEFT JOIN attendance a ON a.session_id = s.id
       GROUP BY s.id, u.name
       ORDER BY s.session_date DESC`
    );
    res.json({ report: result.rows });
  } catch (err) {
    console.error('getAttendanceReport error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── MEMBERSHIP REPORT ────────────────────────────────────
const getMembershipReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.name as plan_name, p.price, p.duration,
              COUNT(m.id) FILTER (WHERE m.status='active')  as active_count,
              COUNT(m.id) FILTER (WHERE m.status='expired') as expired_count,
              COUNT(m.id) as total_count
       FROM plans p
       LEFT JOIN memberships m ON m.plan_id = p.id
       GROUP BY p.id
       ORDER BY active_count DESC`
    );
    res.json({ report: result.rows });
  } catch (err) {
    console.error('getMembershipReport error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getDashboard,
  getAttendanceReport,
  getMembershipReport
};