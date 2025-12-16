const SpotifyClient = require('../src/SpotifyClient');

describe('SpotifyClient', () => {
  test('getAccessToken posts correct request and returns token', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: { access_token: 'mock-token' } });
    const fakeHttp = { post: mockPost };

    const client = new SpotifyClient({
      clientId: 'id',
      clientSecret: 'secret',
      tokenUrl: 'https://example.com/token',
      httpClient: fakeHttp
    });

    const token = await client.getAccessToken();
    expect(token).toBe('mock-token');
    expect(mockPost).toHaveBeenCalledTimes(1);

    const [url, body, options] = mockPost.mock.calls[0];
    expect(url).toBe('https://example.com/token');
    expect(body).toContain('grant_type=client_credentials');
    expect(options.headers.Authorization).toMatch(/^Basic\s+/);
  });
});
