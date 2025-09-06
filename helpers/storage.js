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

module.exports = { 
  saveData, 
  saveToGoogleSheets, 
  triggerExternalApi,
  checkUserExists
};