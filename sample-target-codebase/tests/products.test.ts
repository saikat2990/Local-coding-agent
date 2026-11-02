import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, TestApi } from './helpers';
import * as productRepository from '../src/repositories/product.repository';

let api: TestApi;
before(async () => { api = await startTestServer(); });
after(async () => { await api.close(); });
beforeEach(() => productRepository.clear());

test('creates a product with default stock 0 and fetches it', async () => {
  const created = await api.request('POST', '/api/products', { name: ' Keyboard ', price: 49.99 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.name, 'Keyboard');
  assert.equal(created.body.data.stock, 0);

  const fetched = await api.request('GET', `/api/products/${created.body.data.id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.data.price, 49.99);
});

test('rejects invalid product payload', async () => {
  const res = await api.request('POST', '/api/products', { name: '', price: -1, stock: 1.5 });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details.length, 3);
});

test('rejects duplicate product name (case-insensitive)', async () => {
  await api.request('POST', '/api/products', { name: 'Mouse', price: 10 });
  const res = await api.request('POST', '/api/products', { name: 'mouse', price: 12 });
  assert.equal(res.status, 409);
});

test('updates a product', async () => {
  const created = await api.request('POST', '/api/products', { name: 'Mouse', price: 10 });
  const res = await api.request('PATCH', `/api/products/${created.body.data.id}`, { price: 8, stock: 5 });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.price, 8);
  assert.equal(res.body.data.stock, 5);
});

test('rejects empty update', async () => {
  const created = await api.request('POST', '/api/products', { name: 'Mouse', price: 10 });
  const res = await api.request('PATCH', `/api/products/${created.body.data.id}`, {});
  assert.equal(res.status, 400);
});

test('lists products and filters by inStock', async () => {
  await api.request('POST', '/api/products', { name: 'A', price: 1, stock: 3 });
  await api.request('POST', '/api/products', { name: 'B', price: 2 });

  const all = await api.request('GET', '/api/products');
  assert.equal(all.body.data.length, 2);

  const inStock = await api.request('GET', '/api/products?inStock=true');
  assert.equal(inStock.body.data.length, 1);
  assert.equal(inStock.body.data[0].name, 'A');
});

test('deletes a product', async () => {
  const created = await api.request('POST', '/api/products', { name: 'Mouse', price: 10 });
  const id = created.body.data.id;
  assert.equal((await api.request('DELETE', `/api/products/${id}`)).status, 204);
  assert.equal((await api.request('GET', `/api/products/${id}`)).status, 404);
});

test('missing product returns 404', async () => {
  const res = await api.request('GET', '/api/products/nope');
  assert.equal(res.status, 404);
});
