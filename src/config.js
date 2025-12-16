const dotenv = require('dotenv');

dotenv.config();

const config = {
  clientId: process.env.SPOTIFY_CLIENT_ID || null,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || null,
  tokenUrl: process.env.SPOTIFY_TOKEN_URL || 'https://accounts.spotify.com/api/token'
};

function validate() {
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment');
  }
}

module.exports = Object.assign({}, config, { validate });
