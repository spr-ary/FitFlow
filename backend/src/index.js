const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'FitFlow API running', time: new Date() });
});

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/membership', require('./services/membership/membershipRoutes'));
app.use('/api/scheduling', require('./services/scheduling/schedulingRoutes'));
app.use('/api/booking',    require('./services/booking/bookingRoutes'));
app.use('/api/attendance', require('./services/attendance/attendanceRoutes'));
app.use('/api/reports',    require('./services/reports/reportsRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FitFlow API running on http://localhost:${PORT}`);
});