import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, TestApi } from './helpers';

let api: TestApi;
before(async () => { api = await startTestServer(); });
after(async () => { await api.close(); });

test('GET /api/health returns ok', async () => {
  const res = await api.request('GET', '/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('unknown route returns 404', async () => {
  const res = await api.request('GET', '/api/does-not-exist');
  assert.equal(res.status, 404);
});
