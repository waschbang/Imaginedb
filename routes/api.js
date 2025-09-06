const express = require('express');
const { success, error } = require('../helpers/response');
const { saveData, checkUserExists } = require('../helpers/storage');

const router = express.Router();


router.get('/', (req, res) => {
  success(res, 'ok');
});


// Check if user exists by phone number
router.post('/check-user', async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return error(res, 'Phone number is required in the request body', 400);
    }
    
    const exists = await checkUserExists(number);
    success(res, 'User check completed', { exists: exists ? 'Y' : 'N' });
  } catch (err) {
    console.error('Error checking user:', err);
    error(res, 'Internal server error', 500);
  }
});

// Webhook endpoint for saving user data
router.post('/webhook', async (req, res) => {
  try {
    const { name, number } = req.body;
    if (!name || !number) {
      return error(res, 'Name and number are required', 400);
    }
    console.log('Received webhook data:', { name, number, timestamp: new Date().toISOString() });
    await saveData({ name, number });
    const newEntry = { id: Date.now(), name, number, createdAt: new Date().toISOString() };
    success(res, 'Data received and stored successfully', { id: newEntry.id });
  } catch (err) {
    console.error('Error processing webhook:', err);
    error(res, 'Internal server error: ' + (err.message || 'Unknown error'), 500);
  }
});


module.exports = router;
