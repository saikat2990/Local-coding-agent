import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, TestApi } from './helpers';
import * as userRepository from '../src/repositories/user.repository';

let api: TestApi;
before(async () => { api = await startTestServer(); });
after(async () => { await api.close(); });
beforeEach(() => userRepository.clear());

test('creates and fetches a user', async () => {
  const created = await api.request('POST', '/api/users', { name: 'Ada', email: 'ADA@example.com' });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.email, 'ada@example.com');

  const fetched = await api.request('GET', `/api/users/${created.body.data.id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.data.name, 'Ada');
});

test('rejects invalid user payload', async () => {
  const res = await api.request('POST', '/api/users', { name: '' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details.length, 2);
});

test('rejects duplicate email', async () => {
  await api.request('POST', '/api/users', { name: 'Ada', email: 'ada@example.com' });
  const res = await api.request('POST', '/api/users', { name: 'Other', email: 'ada@example.com' });
  assert.equal(res.status, 409);
});

test('updates a user', async () => {
  const created = await api.request('POST', '/api/users', { name: 'Ada', email: 'ada@example.com' });
  const res = await api.request('PATCH', `/api/users/${created.body.data.id}`, { name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.name, 'Ada L.');
});

test('deletes a user', async () => {
  const created = await api.request('POST', '/api/users', { name: 'Ada', email: 'ada@example.com' });
  const id = created.body.data.id;
  assert.equal((await api.request('DELETE', `/api/users/${id}`)).status, 204);
  assert.equal((await api.request('GET', `/api/users/${id}`)).status, 404);
});

test('lists users', async () => {
  await api.request('POST', '/api/users', { name: 'A', email: 'a@example.com' });
  await api.request('POST', '/api/users', { name: 'B', email: 'b@example.com' });
  const res = await api.request('GET', '/api/users');
  assert.equal(res.body.data.length, 2);
});

test('malformed JSON returns 400', async () => {
  const res = await api.request('POST', '/api/users', '{"name":');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.message, 'Invalid JSON body');
});
