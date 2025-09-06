const express = require('express');
const { success, error } = require('../helpers/response');
const { saveData, checkUserExists, updateAndGetUserDay, sendWhatsAppMessage, checkAndUpdateReward } = require('../helpers/storage');

const router = express.Router();


router.get('/', (req, res) => {
  success(res, 'ok');
});


// Check if user exists by phone number
router.post('/check-user', async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const exists = await checkUserExists(number);
    if (exists) {
      return res.status(200).end(); // User exists
    } else {
      return res.status(404).end(); // User doesn't exist
    }
  } catch (err) {
    console.error('Error checking user:', err);
    res.status(500).end(); // Internal server error
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


// Check and send day number to user
router.post('/check-and-send-day', async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Update user's day number in the sheet and get the latest day
    const user = await updateAndGetUserDay(number);
    const latestDay = user.days[user.days.length - 1]; // Get the most recent day
    
    // Send WhatsApp message with the latest day
    await sendWhatsAppMessage(number, latestDay);
    
    // Return user data with the latest day
    res.json({
      success: true,
      data: {
        name: user.name,
        number: user.number,
        day: parseInt(latestDay),
        prizeEligible: user.prizeEligible
      }
    });
  } catch (err) {
    console.error('Error in check-and-send-day:', err);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check answer and update rewards
router.post('/check-answer', async (req, res) => {
  try {
    const { number, day, answer } = req.body;
    
    // Validate input
    if (!number || !day || !answer) {
      return error(res, 'Number, day, and answer are required', 400);
    }
    
    if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
      return error(res, 'Answer must be A, B, C, or D', 400);
    }
    
    // Check if day is valid (1-7)
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 7) {
      return error(res, 'Day must be a number between 1 and 7', 400);
    }
    
    // Process the answer and update rewards
    const result = await checkAndUpdateReward(number, dayNum, answer.toUpperCase());
    
    // Send success response
    success(res, 'Answer processed successfully', {
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      day: result.day,
      reward: result.reward,
      allRewards: result.allRewards
    });
    
  } catch (err) {
    console.error('Error checking answer:', err);
    error(res, err.message || 'Failed to process answer', 500);
  }
});

module.exports = router;
