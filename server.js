const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const apiRoutes = require('./routes/api');
const logger = require('./middleware/logger');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(morgan('dev'));  // request logger
app.use(logger);         // custom middleware

// Routes
app.use('/api', apiRoutes);

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${config.PORT}`);
});
