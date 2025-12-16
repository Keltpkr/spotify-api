const SpotifyClient = require('../src/SpotifyClient');

describe('SpotifyClient token cache and API methods', () => {
  test('caches token and reuses before expiry', async () => {
    const postMock = jest.fn().mockResolvedValue({ data: { access_token: 'token1', expires_in: 3600 } });
    const fakeHttp = { post: postMock, get: jest.fn() };

    const client = new SpotifyClient({
      clientId: 'id',
      clientSecret: 'secret',
      httpClient: fakeHttp
    });

    const t1 = await client.getAccessToken();
    const t2 = await client.getAccessToken();
    expect(t1).toBe('token1');
    expect(t2).toBe('token1');
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  test('search calls Spotify search endpoint with bearer token', async () => {
    const postMock = jest.fn().mockResolvedValue({ data: { access_token: 'tokenX', expires_in: 3600 } });
    const getMock = jest.fn().mockResolvedValue({ data: { tracks: { items: [] } } });
    const fakeHttp = { post: postMock, get: getMock };

    const client = new SpotifyClient({ clientId: 'id', clientSecret: 'secret', httpClient: fakeHttp });

    const res = await client.search('beatles', 'artist');
    expect(getMock).toHaveBeenCalledWith('https://api.spotify.com/v1/search', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer tokenX' }),
      params: expect.objectContaining({ q: 'beatles', type: 'artist' })
    }));
    expect(res).toHaveProperty('tracks');
  });

  test('getTrack calls tracks endpoint', async () => {
    const postMock = jest.fn().mockResolvedValue({ data: { access_token: 'tokenY', expires_in: 3600 } });
    const getMock = jest.fn().mockResolvedValue({ data: { id: '123', name: 'Song' } });
    const fakeHttp = { post: postMock, get: getMock };
    const client = new SpotifyClient({ clientId: 'id', clientSecret: 'secret', httpClient: fakeHttp });

    const track = await client.getTrack('123');
    expect(getMock).toHaveBeenCalledWith('https://api.spotify.com/v1/tracks/123', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer tokenY' })
    }));
    expect(track).toHaveProperty('id', '123');
  });
});
