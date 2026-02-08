import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
// Dynamic import or relative import
import worker from '../Cloudflare_Workers/worker.mjs';

// Mock global fetch for handleSecureData
const originalFetch = global.fetch;

before(() => {
    global.fetch = async (url, options) => {
        if (url.toString().includes('api.github.com/user')) {
            const auth = options.headers['Authorization'];
            if (auth === 'token valid_token') {
                return new Response(JSON.stringify({ login: 'testuser' }), { status: 200 });
            }
            return new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 });
        }
        return new Response('Not Found', { status: 404 });
    };
});

after(() => {
    global.fetch = originalFetch;
});

describe('CORS Policy Implementation', () => {
    const env = {};
    const ctx = {
        waitUntil: () => {},
        passThroughOnException: () => {}
    };

    it('should allow whitelisted origin https://willbracken.com', async () => {
        const req = new Request('https://api.example.com/', {
            method: 'GET',
            headers: { 'Origin': 'https://willbracken.com' }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://willbracken.com');
        assert.strictEqual(res.headers.get('Vary'), 'Origin');
    });

    it('should allow whitelisted origin https://brackenw3.github.io', async () => {
        const req = new Request('https://api.example.com/', {
            method: 'GET',
            headers: { 'Origin': 'https://brackenw3.github.io' }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://brackenw3.github.io');
    });

    it('should allow localhost', async () => {
        const req = new Request('https://api.example.com/', {
            method: 'GET',
            headers: { 'Origin': 'http://localhost:3000' }
        });
        const res = await worker.fetch(req, env, ctx);
        // My implementation returns origin if allowed
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000');
    });

    it('should block unknown origin', async () => {
        const req = new Request('https://api.example.com/', {
            method: 'GET',
            headers: { 'Origin': 'https://evil.com' }
        });
        const res = await worker.fetch(req, env, ctx);
        // My implementation returns "null" for blocked
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'null');
    });

    it('should handle OPTIONS request correctly for allowed origin', async () => {
         const req = new Request('https://api.example.com/', {
            method: 'OPTIONS',
            headers: { 'Origin': 'https://willbracken.com' }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://willbracken.com');
        assert.strictEqual(res.headers.get('Access-Control-Allow-Methods'), 'GET, POST, OPTIONS');
    });

    it('should handle OPTIONS request correctly for blocked origin', async () => {
         const req = new Request('https://api.example.com/', {
            method: 'OPTIONS',
            headers: { 'Origin': 'https://evil.com' }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'null');
    });

    it('should include CORS headers even on 401 Unauthorized', async () => {
        const req = new Request('https://api.example.com/api/secure-data', {
            method: 'GET',
            headers: {
                'Origin': 'https://willbracken.com',
                // No Authorization header -> 401
            }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://willbracken.com');
    });

    it('should include CORS headers on successful authorized request', async () => {
        const req = new Request('https://api.example.com/api/secure-data', {
            method: 'GET',
            headers: {
                'Origin': 'https://willbracken.com',
                'Authorization': 'Bearer valid_token'
            }
        });
        const res = await worker.fetch(req, env, ctx);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://willbracken.com');
        const data = await res.json();
        assert.strictEqual(data.user, 'testuser');
    });
});
