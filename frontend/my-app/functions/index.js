const functions = require('firebase-functions');

// Function to serve environment variables
exports.getEnvVariables = functions.https.onRequest((request, response) => {
  response.json({
    geminiApiKey: functions.config().gemini.api_key,
  });
});
