const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'FitFlow API running' });
});

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/membership', require('./services/membership/membershipRoutes'));
app.use('/api/scheduling', require('./services/scheduling/schedulingRoutes'));
app.use('/api/booking',    require('./services/booking/bookingRoutes'));
app.use('/api/attendance', require('./services/attendance/attendanceRoutes'));
app.use('/api/reports',    require('./services/reports/reportsRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FitFlow API running on http://localhost:${PORT}`);
});