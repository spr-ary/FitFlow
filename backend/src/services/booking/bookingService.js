const pool = require('../../config/db');

// ─── GET MY BOOKINGS (member) ─────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
              s.name as session_name,
              s.session_date, s.start_time, s.end_time,
              s.room, u.name as trainer_name
       FROM bookings b
       JOIN sessions s ON b.session_id = s.id
       JOIN users u ON s.trainer_id = u.id
       WHERE b.user_id = $1
       ORDER BY s.session_date ASC, s.start_time ASC`,
      [req.user.id]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('getMyBookings error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SESSION BOOKINGS (trainer/admin) ─────────────────
const getSessionBookings = async (req, res) => {
  try {
    // Trainer can only see their own session bookings
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
      `SELECT b.*, u.name as member_name, u.email,
              a.status as attendance_status
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN attendance a ON a.booking_id = b.id
       WHERE b.session_id = $1 AND b.status = 'booked'
       ORDER BY u.name ASC`,
      [req.params.sessionId]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('getSessionBookings error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ALL BOOKINGS (admin) ─────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
              u.name as member_name, u.email,
              s.name as session_name, s.session_date,
              s.start_time, s.room
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN sessions s ON b.session_id = s.id
       ORDER BY b.booked_at DESC`
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('getAllBookings error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── BOOK A SESSION (member) ──────────────────────────────
const bookSession = async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ message: 'session_id is required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check session exists
    const sessionCheck = await client.query(
      'SELECT * FROM sessions WHERE id=$1 FOR UPDATE',
      [session_id]
    );
    if (sessionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionCheck.rows[0];

    // 2. Check capacity — PREVENT OVERBOOKING
    if (session.booked_count >= session.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Class is full. No available slots.',
        capacity: session.capacity,
        booked: session.booked_count
      });
    }

    // 3. Check member has active membership
    const membershipCheck = await client.query(
      `SELECT id FROM memberships
       WHERE user_id=$1 AND status='active' AND end_date >= CURRENT_DATE`,
      [req.user.id]
    );
    if (membershipCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        message: 'Active membership required to book a class.'
      });
    }

    // 4. Check not already booked
    const duplicateCheck = await client.query(
      `SELECT id FROM bookings
       WHERE user_id=$1 AND session_id=$2 AND status='booked'`,
      [req.user.id, session_id]
    );
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'You already booked this class.' });
    }

    // 5. Create booking
    const booking = await client.query(
      `INSERT INTO bookings (user_id, session_id, status)
       VALUES ($1, $2, 'booked')
       RETURNING *`,
      [req.user.id, session_id]
    );

    // 6. Increment booked_count on session
    await client.query(
      'UPDATE sessions SET booked_count = booked_count + 1 WHERE id=$1',
      [session_id]
    );

    // 7. Create attendance record (unmarked by default)
    await client.query(
      `INSERT INTO attendance (booking_id, user_id, session_id, status)
       VALUES ($1, $2, $3, 'unmarked')`,
      [booking.rows[0].id, req.user.id, session_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Class booked successfully!',
      booking: booking.rows[0],
      slots_remaining: session.capacity - session.booked_count - 1
    });

  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'You already booked this class.' });
    }
    console.error('bookSession error:', err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

// ─── CANCEL BOOKING ───────────────────────────────────────
const cancelBooking = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get booking
    const bookingCheck = await client.query(
      'SELECT * FROM bookings WHERE id=$1', [req.params.id]
    );
    if (bookingCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const booking = bookingCheck.rows[0];

    // Member can only cancel own bookings
    if (req.user.role === 'member' && booking.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You can only cancel your own bookings.' });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // Cancel the booking
    await client.query(
      'UPDATE bookings SET status=$1 WHERE id=$2',
      ['cancelled', req.params.id]
    );

    // Decrement booked_count
    await client.query(
      'UPDATE sessions SET booked_count = booked_count - 1 WHERE id=$1',
      [booking.session_id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Booking cancelled successfully.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('cancelBooking error:', err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getMyBookings,
  getSessionBookings,
  getAllBookings,
  bookSession,
  cancelBooking
};