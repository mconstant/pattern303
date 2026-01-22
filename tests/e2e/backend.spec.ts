import { test, expect } from '@playwright/test';

// These tests require the backend verification service to be running
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

test.describe('Backend Verification Service', () => {
  test('should respond to health check', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('collection');
    expect(data).toHaveProperty('authority');
  });

  test('should reject requests without mintAddress', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/verify-pattern`, {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('mintAddress');
  });

  test('should reject invalid mintAddress', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/verify-pattern`, {
      data: {
        mintAddress: 'invalid-address'
      }
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should enforce rate limiting', async ({ request }) => {
    const requests = [];
    
    // Make 12 requests rapidly
    for (let i = 0; i < 12; i++) {
      requests.push(
        request.post(`${BACKEND_URL}/verify-pattern`, {
          data: {
            mintAddress: `test-${i}`
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    // At least one should be rate limited (429)
    const rateLimitedCount = statusCodes.filter(code => code === 429).length;
    expect(rateLimitedCount).toBeGreaterThan(0);
  });

  test('should have CORS headers', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': 'https://p303.xyz'
      }
    });
    
    const headers = response.headers();
    expect(headers).toHaveProperty('access-control-allow-origin');
  });

  test('should respond within reasonable time', async ({ request }) => {
    const startTime = Date.now();
    await request.get(`${BACKEND_URL}/health`);
    const duration = Date.now() - startTime;
    
    // Health check should respond in under 200ms
    expect(duration).toBeLessThan(200);
  });
});
