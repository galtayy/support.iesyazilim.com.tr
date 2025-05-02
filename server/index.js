require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const { initFonts } = require('./utils/fontLoader');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const supportRoutes = require('./routes/support-tickets');
const categoryRoutes = require('./routes/categories');
const reportRoutes = require('./routes/reports');
const approvalRoutes = require('./routes/approval');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5051;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

// Serve PDF files
app.use('/pdfs', express.static(path.join(__dirname, process.env.PDF_PATH || 'pdfs')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tickets', supportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/settings', settingsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'IES Yazılım Destek Uygulaması API' });
});

// Database connection and server start
async function startServer() {
  try {
    // Initialize fonts
    try {
      await initFonts();
      console.log('Fonts initialized successfully.');
    } catch (err) {
      console.warn('Font initialization failed, using system fonts:', err.message);
    }

    // Test DB connection only (no sync)
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Migrations should be applied separately via CLI
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Sequelize sync is disabled. Run migrations via: npx sequelize-cli db:migrate');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      if (process.env.NODE_ENV === 'production') {
        console.log('Production: https://api.support.iesyazilim.com.tr');
      }
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
