const config = require('./config');
const SpotifyClient = require('./SpotifyClient');
const axios = require('axios');

(async () => {
  try {
    config.validate();

    const client = new SpotifyClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tokenUrl: config.tokenUrl,
      httpClient: axios
    });

    const token = await client.getAccessToken();
    console.log('Access token obtained:', token);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
