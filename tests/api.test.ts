import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CompressionMethod, createApi, MimeType } from '../src/index.ts';

const originalFetch = globalThis.fetch;

// Bun's fetch type includes `preconnect`; cast once here so tests stay clean.
function setFetch(
	impl: (input?: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): void {
	globalThis.fetch = mock(impl) as unknown as typeof fetch;
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

const api = createApi();

describe('api.head', () => {
	it('returns ok with null data on 200', async () => {
		// Arrange
		setFetch(async () => new Response(null, { status: 200 }));

		// Act
		const result = await api.head('/ping');

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBeNull();
		expect(result.status).toBe(200);
	});
});

describe('204 No Content', () => {
	it('returns ok with null data regardless of method', async () => {
		// Arrange
		setFetch(async () => new Response(null, { status: 204 }));

		// Act
		const result = await api.post('/items', { name: 'test' });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBeNull();
		expect(result.status).toBe(204);
	});
});

describe('api.get', () => {
	it('returns parsed JSON data on success', async () => {
		// Arrange
		setFetch(
			async () =>
				new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
		);

		// Act
		const result = await api.get<{ id: number; name: string }>('/users/1');

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ id: 1, name: 'Alice' });
		expect(result.status).toBe(200);
	});

	it('returns ok: false with null data on error status', async () => {
		// Arrange
		setFetch(async () => new Response(null, { status: 404 }));

		// Act
		const result = await api.get('/missing');

		// Assert
		expect(result.ok).toBe(false);
		expect(result.data).toBeNull();
		expect(result.status).toBe(404);
	});

	it('returns ok: false with status 0 on network failure', async () => {
		// Arrange
		setFetch(() => Promise.reject(new TypeError('Failed to fetch')));

		// Act
		const result = await api.get('/unreachable');

		// Assert
		expect(result.ok).toBe(false);
		expect(result.data).toBeNull();
		expect(result.status).toBe(0);
	});

	it('returns ok: false with status 0 on abort', async () => {
		// Arrange
		setFetch(() => Promise.reject(new DOMException('The operation was aborted.', 'AbortError')));

		// Act
		const result = await api.get('/slow', { signal: new AbortController().signal });

		// Assert
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
	});

	it('returns text when accept is MimeType.PLAIN', async () => {
		// Arrange
		setFetch(async () => new Response('hello world', { status: 200 }));

		// Act
		const result = await api.get<string>('/readme', { accept: MimeType.PLAIN });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBe('hello world');
	});

	it('returns a Blob for binary accept types', async () => {
		// Arrange
		const bytes = new Uint8Array([1, 2, 3]);
		setFetch(async () => new Response(bytes, { status: 200 }));

		// Act
		const result = await api.get<Blob>('/file.bin', { accept: MimeType.OCTET_STREAM });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBeInstanceOf(Blob);
	});

	it('accepts a URL instance as the url argument', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

		// Act & Assert
		const result = await api.get(new URL('https://example.com/api'));
		expect(result.ok).toBe(true);
	});
});

describe('api.post', () => {
	it('sends a plain object body and returns parsed JSON', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ id: 42 }), { status: 201 }));

		// Act
		const result = await api.post<{ id: number }>('/items', { name: 'widget' });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ id: 42 });
		expect(result.status).toBe(201);
	});

	it('accepts a pre-serialized string body', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }));

		// Act
		const result = await api.post('/items', JSON.stringify({ name: 'widget' }));

		// Assert
		expect(result.ok).toBe(true);
	});

	it('accepts a FormData body without error', async () => {
		// Arrange
		const form = new FormData();
		form.append('name', 'widget');
		setFetch(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }));

		// Act
		const result = await api.post('/upload', form);

		// Assert
		expect(result.ok).toBe(true);
	});

	it('sends Uint8Array bodies as-is, not JSON-stringified', async () => {
		// Arrange
		let captured: BodyInit | null | undefined;
		setFetch(async (_, init) => {
			captured = init?.body;
			return new Response(null, { status: 204 });
		});
		const bytes = new Uint8Array([72, 105]);

		// Act
		await api.post('/bin', bytes);

		// Assert
		expect(captured).toBe(bytes);
	});

	it('sends DataView bodies as-is, not JSON-stringified', async () => {
		// Arrange
		let captured: BodyInit | null | undefined;
		setFetch(async (_, init) => {
			captured = init?.body;
			return new Response(null, { status: 204 });
		});
		const view = new DataView(new ArrayBuffer(8));

		// Act
		await api.post('/bin', view);

		// Assert
		expect(captured).toBe(view);
	});
});

describe('api.put', () => {
	it('returns parsed JSON on success', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ id: 1, name: 'updated' }), { status: 200 }));

		// Act
		const result = await api.put<{ id: number; name: string }>('/items/1', { name: 'updated' });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ id: 1, name: 'updated' });
	});
});

describe('api.patch', () => {
	it('returns parsed JSON on success', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ id: 1, name: 'patched' }), { status: 200 }));

		// Act
		const result = await api.patch<{ id: number; name: string }>('/items/1', { name: 'patched' });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ id: 1, name: 'patched' });
	});
});

describe('api.delete', () => {
	it('returns ok with null data on 204', async () => {
		// Arrange
		setFetch(async () => new Response(null, { status: 204 }));

		// Act
		const result = await api.delete('/items/1');

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBeNull();
		expect(result.status).toBe(204);
	});
});

describe('api.options', () => {
	it('returns parsed JSON on 200', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ allow: 'GET, POST' }), { status: 200 }));

		// Act
		const result = await api.options<{ allow: string }>('/items');

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ allow: 'GET, POST' });
	});
});

describe('compression', () => {
	let capturedInit: RequestInit | undefined;

	it('passes FormData through unchanged when compressed', async () => {
		// Arrange
		const form = new FormData();
		form.append('name', 'widget');
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/upload', form, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(form);
	});

	it('passes URLSearchParams through unchanged when compressed', async () => {
		// Arrange
		const params = new URLSearchParams({ q: 'test' });
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/search', params, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(params);
	});

	it('pipes a ReadableStream through CompressionStream', async () => {
		// Arrange
		const stream = new ReadableStream();
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/upload', stream, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBeInstanceOf(ReadableStream);
		expect(capturedInit?.body).not.toBe(stream);
	});

	it('passes a small string through unchanged (below compression threshold)', async () => {
		// Arrange
		const small = 'x'.repeat(512);
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/data', small, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(small);
	});

	it('compresses a large string into a ReadableStream and sets Content-Encoding header', async () => {
		// Arrange
		const large = 'x'.repeat(2000);
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/data', large, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBeInstanceOf(ReadableStream);
		const headers = capturedInit?.headers as Headers;
		expect(headers.get('Content-Encoding')).toBe('gzip');
	});

	it('passes a small Blob through unchanged (below compression threshold)', async () => {
		// Arrange
		const blob = new Blob(['hello']);
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/upload', blob, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(blob);
	});

	it('passes a small ArrayBuffer through unchanged (below compression threshold)', async () => {
		// Arrange
		const buffer = new ArrayBuffer(16);
		setFetch(async (_, init) => {
			capturedInit = init as RequestInit;
			return new Response(null, { status: 204 });
		});

		// Act
		await api.post('/upload', buffer, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(buffer);
	});
});

describe('timeout', () => {
	it('returns ok: false with status 0 when request exceeds timeout', async () => {
		// Arrange — fetch never resolves; AbortSignal.timeout fires
		setFetch(
			() =>
				new Promise<Response>((_, reject) => {
					// simulate a signal abort via the timeout mechanism
					setTimeout(() => reject(new DOMException('Timeout', 'TimeoutError')), 50);
				})
		);

		// Act
		const result = await createApi().get('/slow', { timeout: 1 });

		// Assert
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
	});

	it('does not interfere with fast responses when timeout is generous', async () => {
		// Arrange
		setFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

		// Act
		const result = await createApi().get('/fast', { timeout: 10_000 });

		// Assert
		expect(result.ok).toBe(true);
	});

	it('applies config-level timeout to all requests', async () => {
		// Arrange
		const timedApi = createApi({ timeout: 1 });
		setFetch(
			() =>
				new Promise<Response>((_, reject) => {
					setTimeout(() => reject(new DOMException('Timeout', 'TimeoutError')), 50);
				})
		);

		// Act
		const result = await timedApi.get('/slow');

		// Assert
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
	});

	it('per-request timeout overrides config timeout', async () => {
		// Arrange — config has short timeout, per-request overrides with generous value
		const timedApi = createApi({ timeout: 1 });
		setFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

		// Act
		const result = await timedApi.get('/fast', { timeout: 10_000 });

		// Assert
		expect(result.ok).toBe(true);
	});
});

describe('retry', () => {
	it('retries on network error up to retry count and returns ok: false', async () => {
		// Arrange
		let callCount = 0;
		setFetch(() => {
			callCount++;
			return Promise.reject(new TypeError('Failed to fetch'));
		});

		// Act
		const result = await createApi().get('/unreachable', { retry: 2 });

		// Assert — 1 initial + 2 retries = 3 total
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
		expect(callCount).toBe(3);
	});

	it('does not retry on server errors (4xx/5xx)', async () => {
		// Arrange
		let callCount = 0;
		setFetch(() => {
			callCount++;
			return Promise.resolve(new Response(null, { status: 500 }));
		});

		// Act
		const result = await createApi().get('/server-error', { retry: 2 });

		// Assert — server responded; no retry
		expect(result.ok).toBe(false);
		expect(result.status).toBe(500);
		expect(callCount).toBe(1);
	});

	it('returns success immediately when an attempt succeeds before exhausting retries', async () => {
		// Arrange — fail once then succeed
		let callCount = 0;
		setFetch(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.reject(new TypeError('Failed to fetch'));
			}
			return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		});

		// Act
		const result = await createApi().get('/flaky', { retry: 2 });

		// Assert
		expect(result.ok).toBe(true);
		expect(callCount).toBe(2);
	});

	it('uses exponential backoff between retry attempts', async () => {
		// Arrange
		const spy = spyOn(globalThis, 'setTimeout');
		setFetch(() => Promise.reject(new TypeError('Failed to fetch')));

		// Act
		await createApi().get('/slow', { retry: 2, retryDelay: 100 });

		// Assert — extract delays >= 100ms (ignoring internal timeouts) in call order
		const delays = spy.mock.calls
			.map(([, ms]) => ms)
			.filter((ms): ms is number => typeof ms === 'number' && ms >= 100);

		expect(delays[0]).toBe(100); // attempt 1: base
		expect(delays[1]).toBe(200); // attempt 2: base * 2
		spy.mockRestore();
	});

	it('does not retry by default (retry: 0)', async () => {
		// Arrange
		let callCount = 0;
		setFetch(() => {
			callCount++;
			return Promise.reject(new TypeError('Failed to fetch'));
		});

		// Act
		await createApi().get('/error');

		// Assert
		expect(callCount).toBe(1);
	});

	it('short-circuits when the caller signal is already aborted', async () => {
		// Arrange
		let callCount = 0;
		setFetch(async (_, init) => {
			callCount++;
			if (init?.signal?.aborted) {
				throw new DOMException('Aborted', 'AbortError');
			}
			return new Response(null, { status: 200 });
		});
		const controller = new AbortController();
		controller.abort();

		// Act
		const result = await createApi().get('/x', {
			signal: controller.signal,
			retry: 3,
			retryDelay: 0,
		});

		// Assert — caller said stop, stop immediately
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
		expect(callCount).toBeLessThanOrEqual(1);
	});

	it('retries timeouts with a fresh per-attempt signal', async () => {
		// Arrange
		let callCount = 0;
		let sawAbortedOnEntry = false;
		setFetch(async (_, init) => {
			callCount++;
			if (init?.signal?.aborted === true) {
				sawAbortedOnEntry = true;
			}
			return new Promise<Response>((_, reject) => {
				init?.signal?.addEventListener('abort', () => {
					reject(new DOMException('Timeout', 'AbortError'));
				});
			});
		});

		// Act
		await createApi().get('/slow', { timeout: 10, retry: 2, retryDelay: 0 });

		// Assert — each attempt gets a fresh signal, so none arrive pre-aborted
		expect(callCount).toBe(3);
		expect(sawAbortedOnEntry).toBe(false);
	});
});

describe('parse errors', () => {
	it('reports the server status when a 2xx body cannot be parsed', async () => {
		// Arrange — server returns HTML but the client asked for JSON
		setFetch(
			async () =>
				new Response('<html>not json</html>', {
					status: 200,
					headers: { 'Content-Type': 'text/html' },
				})
		);

		// Act
		const result = await createApi().get('/x');

		// Assert — status 0 would mean "no response"; the server did respond
		expect(result.ok).toBe(false);
		expect(result.status).toBe(200);
	});

	it('does not retry on a parse failure', async () => {
		// Arrange
		let callCount = 0;
		setFetch(async () => {
			callCount++;
			return new Response('<html>bad</html>', {
				status: 200,
				headers: { 'Content-Type': 'text/html' },
			});
		});

		// Act — server gave a deterministic response; retry would be pointless
		await createApi().get('/x', { retry: 3 });

		// Assert
		expect(callCount).toBe(1);
	});
});

describe('createApi', () => {
	it('prepends baseUrl to relative paths', async () => {
		// Arrange
		let capturedUrl: string | URL | undefined;
		setFetch(async (input) => {
			capturedUrl = input as URL;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ baseUrl: 'https://api.example.com' });

		// Act
		await client.get('/users');

		// Assert
		expect(capturedUrl?.toString()).toBe('https://api.example.com/users');
	});

	it('does not alter an absolute URL string even when baseUrl is set', async () => {
		// Arrange
		let capturedUrl: string | URL | undefined;
		setFetch(async (input) => {
			capturedUrl = input as URL;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ baseUrl: 'https://api.example.com' });

		// Act
		await client.get('https://other.example.com/data');

		// Assert
		expect(capturedUrl?.toString()).toBe('https://other.example.com/data');
	});

	it('accepts a URL instance as url argument when baseUrl is set', async () => {
		// Arrange
		let capturedUrl: string | URL | undefined;
		setFetch(async (input) => {
			capturedUrl = input as URL;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ baseUrl: 'https://api.example.com' });

		// Act
		await client.get(new URL('https://other.example.com/data'));

		// Assert
		expect(capturedUrl?.toString()).toBe('https://other.example.com/data');
	});

	it('includes config headers in every request', async () => {
		// Arrange
		let capturedHeaders: Headers | undefined;
		setFetch(async (_, init) => {
			capturedHeaders = init?.headers as Headers;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ headers: { 'X-Api-Key': 'secret' } });

		// Act
		await client.get('https://example.com/data');

		// Assert
		expect(capturedHeaders?.get('X-Api-Key')).toBe('secret');
	});

	it('per-request headers override config headers', async () => {
		// Arrange
		let capturedHeaders: Headers | undefined;
		setFetch(async (_, init) => {
			capturedHeaders = init?.headers as Headers;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ headers: { 'X-Api-Key': 'config-key' } });

		// Act
		await client.get('https://example.com/data', { headers: { 'X-Api-Key': 'request-key' } });

		// Assert
		expect(capturedHeaders?.get('X-Api-Key')).toBe('request-key');
	});

	it('applies config accept to all requests', async () => {
		// Arrange
		let capturedHeaders: Headers | undefined;
		setFetch(async (_, init) => {
			capturedHeaders = init?.headers as Headers;
			return new Response('hello', { status: 200 });
		});
		const client = createApi({ accept: MimeType.PLAIN });

		// Act
		await client.get('https://example.com/text');

		// Assert
		expect(capturedHeaders?.get('Accept')).toBe(MimeType.PLAIN);
	});

	it('per-request accept overrides config accept', async () => {
		// Arrange
		let capturedHeaders: Headers | undefined;
		setFetch(async (_, init) => {
			capturedHeaders = init?.headers as Headers;
			return new Response(JSON.stringify({}), { status: 200 });
		});
		const client = createApi({ accept: MimeType.PLAIN });

		// Act
		await client.get('https://example.com/json', { accept: MimeType.JSON });

		// Assert
		expect(capturedHeaders?.get('Accept')).toBe(MimeType.JSON);
	});
});
