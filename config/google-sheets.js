// Replace these values with your Google Sheets configuration
module.exports = {
  // The ID of your Google Sheet (found in the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit)
  SPREADSHEET_ID: '1MqzU8yjwedlkOaidnpGkl0gDrbRUA-GfgJk1nUBdRh8',
  
  // The name of the sheet/tab where you want to store the data
  SHEET_NAME: 'Data',
  
  // Google API credentials (you'll need to create a service account)
  // Go to: https://console.cloud.google.com/
  // Create a new project > Enable Google Sheets API > Create credentials > Service account
  // Download the JSON key file and copy its contents here
  credentials: {
    "type": "service_account",
    "project_id": "second-brain-462019",
    "private_key_id": "ab0f94aeab6de21fd9bcdf93971a68f93f8084c2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNANTt5asLrPjg\nZP4APIctuLYAgE8LNXcjuLv/R5trPq0EcVJXyFy6mA8bHEJU76P8GV9eFTmUy1S0\nZpGWhfiB1BXFJxd08hpr27AeGcZpitkGuBPvv1q38Avh+L+lg3COzEucpHczMhX9\nig6uZbaP7t35MtrbvdZEV27y7+sh4LsXLTa80heacwcYqfOzgXiXp4HKaiMr7Mbb\nIZWJpgrGy0WvCvTz801SLhq3ulHreQfRuu9N2vw2uybfTWGf7DicBuxjwAm4v3dt\nn3VX7jCZmQWhQU3f7+sCp/8PPnfxymHmMZqrc+/l9HngnztYkLgawKemgaVZ5GsG\nUVc+wwHLAgMBAAECggEAAytcR82z36OnHf7l7VkCNqPZ1wMySduZzZFQlXzGm3Ru\nWAfRiFiHqJUrPp42VSlOP5Bq9j5MmplNUBrKsHoPVrSbzSIhvlajB02l0jB4j7Xl\nkL7eploT5TxrM3QOenPPZfC5DUZWSaZI2KUZSsv/38QAoqQhUcNwKZlgPSo33vre\ne2aZSFZ1fERSs8awD9jJVihzavqLfqiopHQes63cVTbhRe5KHfDk+gEfJogTcim1\nbpU1rtYoQocq8Owlk1so071i/y+DHYTnpLpOZj6Urb1pb5uTP9MzFhlh+W4aPGI9\n84nxOtj7RLxvnjin7a4bPbAk2NjLueaBRUQhattSSQKBgQDyenZpdgQq5SVxumj/\n8zupzDfZoT1KBjH31YX/FtWfD1eqk5oLP3fjffpHXw+6Dyx0QompKUu+8ihmCyPy\nZ8A/IJfwSe/Ugtj04EGa9QXp051YklceqRHNqg/Hl4FCXiX/sheY0nfKbAW3PhAA\nBKt32BUZ7WTX2ijWTZNLTssPbQKBgQDYb2MoWBczk3s+S1oPUNVyS2B4qH/vK6zP\nPwWqoegTLDvv2ZtSTVb/Z2ZfP87xPhtX2Bbxedp7UOzqN0okMq4do2gR4nirulEh\n2UwzehPVZK9vGQ7vtVMeoILr2W736SJMLyeuzSmtEVNL/zegYzFV6Ig0jIjj9M2f\nf2gJB0C7FwKBgGxlJGQWttw6HZgOnfu1Tzmjql/mfZCG3nWNBV64ZXy6jhUZ8KYQ\nlFalLWoUa+JgAB5k1EdDx7GvbTHYzxQBH2bY+jMXyle0uqoVSh6sZB1YVSGQIdP5\n/pRy7qTp7IWvssrwYS4XACgETDXTT7HCZKipdx1lC0yXIORUP4FN0uatAoGADskF\nMBNcemR/zdCd9V/jROyLSZLRMoh8RKgcffyTewPRkGAAMU4hPE9W+fjE7Uv92DFl\n19coKrZriNCAGxrvNA0epeIftjODKVnLz9RuGGzJY0CF+bAcXoI+j1gKMZtWgXfT\nMSjIyQ7e7tkfdrBwBVteOqDDFTd6+INemwdIz78CgYEAsuyp4KtVbUFP7h7rgAY6\nCYEXlQTTH19scVyNDhesQVQQJAAoaKA0lpYK2AQ2RjLRhWHGPTPnC4VxWgldu83E\nSzsK7M5WfETWHSZQ7Yz5I4H0n6FduY2dMJhH/DlXpTG4f35ZA55KqpaA1UTMsB1g\ndTFZoU/UUzbzHXb+5taIyCw=\n-----END PRIVATE KEY-----\n",
    "client_email": "imagine@second-brain-462019.iam.gserviceaccount.com",
    "client_id": "112140926277465888055",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/imagine%40second-brain-462019.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"}
};
