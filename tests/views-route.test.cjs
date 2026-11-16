const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function loadRoute(views) {
  const filename = path.join(__dirname, '../src/app/api/views/[...slug]/route.ts');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, Response,
    console: { error() {} },
    require: (name) => name === '~/server/db' ? { db: { views } } : require(name),
  }, { filename });
  return exports;
}

const request = new Request('https://example.com/api/views/en/fafo-learning');

test('reads and increments the same nested article key without losing simultaneous views', async () => {
  const counts = new Map([['en/fafo-learning', 7], ['en/another-post', 3]]);
  const route = loadRoute({
    async findUnique({ where }) {
      return counts.has(where.slug) ? { count: counts.get(where.slug) } : null;
    },
    async upsert({ where, create, update }) {
      assert.equal(update.count.increment, 1);
      counts.set(where.slug, counts.has(where.slug)
        ? counts.get(where.slug) + update.count.increment : create.count);
    },
  });
  const context = { params: { slug: ['en', 'fafo-learning'] } };
  await Promise.all(Array.from({ length: 20 }, () => route.POST(request, context)));
  const response = await route.GET(request, context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { views: { slug: 'en/fafo-learning', count: 27 } });
  assert.equal(counts.get('en/another-post'), 3);
  assert.equal(route.dynamic, 'force-dynamic');
});

test('supports single-segment keys and returns zero for a new article', async () => {
  const route = loadRoute({ async findUnique() { return null; } });
  const response = await route.GET(request, { params: { slug: ['new-post'] } });
  assert.deepEqual(await response.json(), { views: { slug: 'new-post', count: 0 } });
});

test('returns errors rather than a false successful zero when the database fails', async () => {
  const fail = async () => { throw Error('Database unavailable'); };
  const route = loadRoute({ findUnique: fail, upsert: fail });
  const context = { params: { slug: ['en', 'fafo-learning'] } };
  assert.equal((await route.GET(request, context)).status, 500);
  assert.equal((await route.POST(request, context)).status, 500);
});

test('rejects missing slug segments before querying the database', async () => {
  const route = loadRoute({});
  assert.equal((await route.GET(request, { params: { slug: [] } })).status, 400);
});
