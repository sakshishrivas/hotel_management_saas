import request from 'supertest';

import { createApp } from '../../src/app';

describe('Health endpoint', () => {
  it('returns a healthy response', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
  });
});
