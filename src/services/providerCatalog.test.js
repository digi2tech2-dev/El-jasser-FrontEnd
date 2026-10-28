import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchProviderCatalog } from './providerCatalog.js';

test('loads every advertised page, including products beyond 2000', async () => {
  const calls = [];
  const products = await fetchProviderCatalog(async (page) => {
    calls.push(page);
    return {
      items: Array.from({ length: 500 }, (_, index) => ({ _id: String((page - 1) * 500 + index) })),
      pagination: { pages: 5, total: 2500, limit: 500 },
    };
  });
  assert.deepEqual(calls, [1, 2, 3, 4, 5]);
  assert.equal(products.length, 2500);
  assert.equal(products[2499]._id, '2499');
});

test('reports incomplete pagination instead of silently returning a partial catalog', async () => {
  await assert.rejects(fetchProviderCatalog(async () => ({
    items: [{ id: 'same' }], pagination: { pages: 3 },
  })), /Incomplete provider catalog/);
});

test('propagates a later page failure', async () => {
  await assert.rejects(fetchProviderCatalog(async (page) => {
    if (page === 2) throw new Error('network failure');
    return { items: [{ id: '1' }], pagination: { total: 2, limit: 1 } };
  }), /network failure/);
});
