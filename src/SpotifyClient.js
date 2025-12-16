const qs = require('querystring');

class SpotifyClient {
  constructor(options = {}) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.tokenUrl = options.tokenUrl || 'https://accounts.spotify.com/api/token';
    this.httpClient = options.httpClient || null;
    if (!this.httpClient) {
      try {
        this.httpClient = require('axios');
      } catch (e) {
        throw new Error('No http client provided and axios not available');
      }
    }

    this._token = null; // { value, expiresAt }
  }

  async getAccessToken() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('clientId and clientSecret must be provided to SpotifyClient');
    }

    if (this._token && this._token.expiresAt && Date.now() < this._token.expiresAt) {
      return this._token.value;
    }

    return this._requestToken();
  }

  async _requestToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`
    };

    const body = qs.stringify({ grant_type: 'client_credentials' });

    const res = await this.httpClient.post(this.tokenUrl, body, { headers });
    if (!res || !res.data) throw new Error('Invalid response from token endpoint');

    const token = res.data.access_token;
    const expiresIn = res.data.expires_in ? Number(res.data.expires_in) : 3600;
    const bufferMs = 5000; // 5 seconds safety
    const expiresAt = Date.now() + expiresIn * 1000 - bufferMs;

    this._token = { value: token, expiresAt };
    return token;
  }

  async search(query, type = 'track', options = {}) {
    const token = await this.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const params = Object.assign({ q: query, type }, options.params || {});
    const res = await this.httpClient.get('https://api.spotify.com/v1/search', { headers, params });
    return res.data;
  }

  async getTrack(id) {
    const token = await this.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const res = await this.httpClient.get(`https://api.spotify.com/v1/tracks/${id}`, { headers });
    return res.data;
  }
}

module.exports = SpotifyClient;
