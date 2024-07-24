const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

exports.getEnvVariables = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.json({
      geminiApiKey: functions.config().gemini.api_key,
    });
  });
});
