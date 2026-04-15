-- =============================================
-- FITFLOW SEED DATA
-- =============================================

-- Password for all demo users = "password"
-- (bcrypt hash generated separately, for now plain for seeding)

-- Admin
INSERT INTO users (name, email, password, role) VALUES
('Alex Admin',  'admin@fitflow.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Sara Kim',    'sara@fitflow.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer'),
('Marco Lopez', 'marco@fitflow.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer'),
('Jamie Lee',   'jamie@email.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Ryan Koh',    'ryan@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member');

-- Plans
INSERT INTO plans (name, duration, price, description) VALUES
('Basic',        'monthly', 890.00,  'Access to all standard classes'),
('Premium',      'monthly', 1590.00, 'Unlimited classes + priority booking'),
('Annual Basic', 'yearly',  8500.00, 'Full year access, best value');

-- Memberships (jamie = premium active, ryan = basic active)
INSERT INTO memberships (user_id, plan_id, start_date, end_date, status) VALUES
(4, 2, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active'),
(5, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active');

-- Sessions
INSERT INTO sessions (name, trainer_id, room, day_of_week, session_date, start_time, end_time, capacity) VALUES
('Morning Yoga',    2, 'Studio A',   'monday',    CURRENT_DATE,     '07:00', '08:00', 20),
('HIIT Blast',      3, 'Main Hall',  'monday',    CURRENT_DATE,     '09:00', '09:45', 20),
('Pilates Core',    2, 'Studio B',   'monday',    CURRENT_DATE,     '11:00', '12:00', 15),
('Spin Cycle',      3, 'Cycle Room', 'tuesday',   CURRENT_DATE + 1, '17:00', '17:45', 20),
('Evening Stretch', 2, 'Studio A',   'tuesday',   CURRENT_DATE + 1, '19:00', '19:45', 15);