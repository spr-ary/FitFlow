-- =============================================
-- FITFLOW DATABASE SCHEMA
-- =============================================

-- Clean up if re-running
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- USERS TABLE (members, trainers, admins)
-- =============================================
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('member', 'trainer', 'admin')),
  phone       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PLANS TABLE (membership plans)
-- =============================================
CREATE TABLE plans (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  duration    VARCHAR(20) NOT NULL CHECK (duration IN ('monthly', 'yearly')),
  price       DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- MEMBERSHIPS TABLE (which user has which plan)
-- =============================================
CREATE TABLE memberships (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id     INT NOT NULL REFERENCES plans(id),
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date    DATE NOT NULL,
  status      VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- SESSIONS TABLE (gym classes)
-- =============================================
CREATE TABLE sessions (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  trainer_id   INT NOT NULL REFERENCES users(id),
  room         VARCHAR(50),
  day_of_week  VARCHAR(10) CHECK (day_of_week IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  session_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  capacity     INT NOT NULL DEFAULT 20,
  booked_count INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- BOOKINGS TABLE (member books a session)
-- =============================================
CREATE TABLE bookings (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id  INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status      VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
  booked_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- =============================================
-- ATTENDANCE TABLE (trainer marks attendance)
-- =============================================
CREATE TABLE attendance (
  id          SERIAL PRIMARY KEY,
  booking_id  INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id),
  session_id  INT NOT NULL REFERENCES sessions(id),
  status      VARCHAR(20) DEFAULT 'unmarked' CHECK (status IN ('present', 'absent', 'unmarked')),
  marked_at   TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_memberships_user  ON memberships(user_id);
CREATE INDEX idx_sessions_trainer  ON sessions(trainer_id);
CREATE INDEX idx_sessions_date     ON sessions(session_date);
CREATE INDEX idx_bookings_user     ON bookings(user_id);
CREATE INDEX idx_bookings_session  ON bookings(session_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);