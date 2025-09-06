const { google } = require('googleapis');
const axios = require('axios');
const sheets = google.sheets('v4');
const config = require('../config/google-sheets');

// Create a new JWT client using the service account credentials
const auth = new google.auth.GoogleAuth({
  credentials: config.credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Sends WhatsApp message via AiSensy API
 * @param {string} to - Phone number with country code
 * @param {number} day - Day number to include in the message
 */
async function sendWhatsAppMessage(to, day) {
  try {
    const response = await axios.post(
      'https://apis.aisensy.com/project-apis/v1/project/68778bfb52435a133a4b3039/messages',
      {
        to,
        type: 'template',
        template: {
          language: { policy: 'deterministic', code: 'en' },
          name: 'marketing_english_06_09_2025_3182111',
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: `${day}` },
                { type: 'text', text: `${day}` }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-AiSensy-Project-API-Pwd': '56e47afac4e7fcbcf0806'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Saves data to Google Sheets
 * @param {Object} data - The data to save
 * @param {string} data.name - The name to save
 * @param {string} data.number - The number to save
 * @returns {Promise<Object>} - The response from Google Sheets API
 */
async function saveToGoogleSheets({ name, number }) {
  try {
    const authClient = await auth.getClient();
    const timestamp = new Date().toISOString();
    
    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, number, timestamp]],
      },
    });
    
    console.log(' Data saved to Google Sheets:', { name, number, timestamp });
    return response.data;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error;
  }
}

/**
 * Triggers an external API with the provided data
 * @param {Object} data - The data to send to the external API
 * @param {string} data.name - The name
 * @param {string} data.number - The number
 */
async function triggerExternalApi({ name, number }) {
  try {
    const apiUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTY1MDYzNDA0M2M1MjZkNTUzMjUxMzci_pc';
    
    const response = await axios.post(apiUrl, {
      name,
      number,
      timestamp: new Date().toISOString()
    });
    
    console.log(' External API triggered successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(' Error triggering external API:', error.message);
    // Don't throw the error to prevent blocking the main flow
    // You might want to implement retry logic here
    return { success: false, error: error.message };
  }
}

/**
 * Saves data to both memory and Google Sheets, then triggers external API
 * @param {Object} data - The data to save
 * @param {string} data.name - The name to save
 * @param {string} data.number - The number to save
 */
async function saveData({ name, number }) {
  try {
    console.log(` Saving data: Name=${name}, Number=${number}`);
    
    // Save to Google Sheets
    await saveToGoogleSheets({ name, number });
    
    // Trigger external API in the background (don't await to keep response fast)
    triggerExternalApi({ name, number })
      .catch(err => console.error('Background API call failed:', err));
    
    return { success: true };
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
}

/**
 * Checks if a user with the given phone number exists in the Google Sheet
 * @param {string} phoneNumber - The phone number to check
 * @returns {Promise<boolean>} - True if user exists, false otherwise
 */
async function checkUserExists(phoneNumber) {
  try {
    const authClient = await auth.getClient();
    
    // Get all values from the sheet
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    
    // Skip header row if it exists
    const startRow = rows.length > 0 && rows[0].some(cell => 
      cell.toString().toLowerCase().includes('number')
    ) ? 1 : 0;
    
    // Check if any row has a matching phone number (case-insensitive)
    return rows.slice(startRow).some(row => 
      row.length > 1 && row[1].toString().trim() === phoneNumber.toString().trim()
    );
  } catch (error) {
    console.error('Error checking user in Google Sheets:', error);
    throw error;
  }
}

/**
 * Gets and updates user's day number in Google Sheets
 * @param {string} phoneNumber - The user's phone number
 * @returns {Promise<{name: string, number: string, day: number}>} User data with updated day
 */
async function updateAndGetUserDay(phoneNumber) {
  try {
    const authClient = await auth.getClient();
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!A:F`, // A: Name, B: Number, C: Start Date, D: Day, E: Rewards, F: Grand Prize
    });

    const rows = response.data.values || [];
    const startRow = rows.length > 0 && rows[0].some(cell => 
      cell.toString().toLowerCase().includes('number')
    ) ? 1 : 0;

    const userRowIndex = rows.findIndex((row, index) =>
      index >= startRow &&
      row.length > 1 &&
      row[1].toString().trim() === phoneNumber.toString().trim()
    );

    if (userRowIndex === -1) throw new Error('User not found');

    const userRow = rows[userRowIndex];
    const dayColumn = 3; // column D (0-based index 3)
    const prizeColumn = 5; // column F (0-based index 5)

    // Get existing days as array of numbers
    let existingDays = [];
    if (userRow[dayColumn] && userRow[dayColumn].trim() !== '') {
      existingDays = userRow[dayColumn]
        .split(',')
        .map(d => parseInt(d.trim()))
        .filter(d => !isNaN(d));
    }
    
    console.log('Existing days:', existingDays);
    
    // Find the next day (max + 1, or 1 if no days exist)
    const nextDay = existingDays.length > 0 ? Math.max(...existingDays) + 1 : 1;
    console.log('Next day to add:', nextDay);
    
    // Add the new day if it's not already there
    if (!existingDays.includes(nextDay)) {
      existingDays.push(nextDay);
      // Sort the days to keep them in order
      existingDays.sort((a, b) => a - b);
      console.log('Updated days:', existingDays);
    }

    // Update days string back into sheet (convert numbers to strings)
    const daysString = existingDays.join(', ');
    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!D${userRowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[daysString]] }
    });

    // Check if user has played all 7 days
    let prizeEligible = false;
    if ([1,2,3,4,5,6,7].every(d => existingDays.includes(d))) {
      prizeEligible = true;

      // Update prize column F (Grand Prize Eligible)
      await sheets.spreadsheets.values.update({
        auth: authClient,
        spreadsheetId: config.SPREADSHEET_ID,
        range: `${config.SHEET_NAME}!F${userRowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [["Yes"]] }
      });
    }

    return {
      name: userRow[0],
      number: userRow[1],
      day: nextDay,  // Return the newly added day
      days: existingDays,  // Return all days for reference
      prizeEligible
    };

  } catch (error) {
    console.error('Error updating user day:', error);
    throw error;
  }
}

/**
 * Checks if the answer is correct and updates the rewards
 * @param {string} phoneNumber - User's phone number
 * @param {number} day - Day number (1-7)
 * @param {string} answer - User's answer (A, B, C, or D)
 * @returns {Promise<Object>} Result of the operation
 */
async function checkAndUpdateReward(phoneNumber, day, answer) {
  try {
    const authClient = await auth.getClient();
    
    // 1. Get the correct answer from Answer tab
    const answerResponse = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: 'Answer!A:B', // Column A: Day, Column B: Correct Answer
    });
    
    // Find the correct answer for the day
    const answerRows = answerResponse.data.values || [];
    const answerRow = answerRows.find(row => parseInt(row[0]) === day);
    
    if (!answerRow || !answerRow[1]) {
      throw new Error('Invalid day or answer not found');
    }
    
    const correctAnswer = answerRow[1].trim().toUpperCase();
    const isCorrect = answer.toUpperCase() === correctAnswer;
    
    // 2. Update the Rewards column in Data tab
    const dataResponse = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!A:F`,
    });
    
    const rows = dataResponse.data.values || [];
    const userRowIndex = rows.findIndex((row, index) =>
      index >= 0 &&
      row.length > 1 &&
      row[1].toString().trim() === phoneNumber.toString().trim()
    );
    
    if (userRowIndex === -1) {
      throw new Error('User not found');
    }
    
    const rewardsColumn = 4; // Column E (0-based index 4)
    const existingRewards = rows[userRowIndex][rewardsColumn] || '';
    const newReward = `${day}${isCorrect ? 'W' : 'L'}`;
    const updatedRewards = existingRewards 
      ? `${existingRewards}, ${newReward}`
      : newReward;
    
    // Update the sheet
    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!E${userRowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[updatedRewards]] }
    });
    
    return {
      isCorrect,
      correctAnswer,
      day,
      reward: newReward,
      allRewards: updatedRewards
    };
    
  } catch (error) {
    console.error('Error in checkAndUpdateReward:', error);
    throw error;
  }
}

module.exports = { 
  saveData, 
  saveToGoogleSheets, 
  triggerExternalApi,
  checkUserExists,
  updateAndGetUserDay,
  checkAndUpdateReward,
  sendWhatsAppMessage
};