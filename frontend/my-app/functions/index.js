const functions = require('firebase-functions');

exports.getEnvVariables = functions.https.onRequest((request, response) => {
  response.json({
    geminiApiKey: functions.config().gemini.api_key,
  });
});
