import { afterEach, describe, expect, it, mock } from 'bun:test';
import { api, CompressionMethod, MimeType } from '../src/index.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('api.head', () => {
	it('returns ok with null data on 200', async () => {
		// Arrange
		globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 200 })));

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
		globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 204 })));

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
		globalThis.fetch = mock(() =>
			Promise.resolve(
				new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			)
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
		globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 404 })));

		// Act
		const result = await api.get('/missing');

		// Assert
		expect(result.ok).toBe(false);
		expect(result.data).toBeNull();
		expect(result.status).toBe(404);
	});

	it('returns ok: false with status 0 on network failure', async () => {
		// Arrange
		globalThis.fetch = mock(() => Promise.reject(new TypeError('Failed to fetch')));

		// Act
		const result = await api.get('/unreachable');

		// Assert
		expect(result.ok).toBe(false);
		expect(result.data).toBeNull();
		expect(result.status).toBe(0);
	});

	it('returns ok: false with status 0 on abort', async () => {
		// Arrange
		const controller = new AbortController();
		globalThis.fetch = mock(() =>
			Promise.reject(new DOMException('The operation was aborted.', 'AbortError'))
		);

		// Act
		const result = await api.get('/slow', { signal: controller.signal });

		// Assert
		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
	});

	it('returns text when accept is MimeType.PLAIN', async () => {
		// Arrange
		globalThis.fetch = mock(() => Promise.resolve(new Response('hello world', { status: 200 })));

		// Act
		const result = await api.get<string>('/readme', { accept: MimeType.PLAIN });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBe('hello world');
	});

	it('returns a Blob for binary accept types', async () => {
		// Arrange
		const bytes = new Uint8Array([1, 2, 3]);
		globalThis.fetch = mock(() => Promise.resolve(new Response(bytes, { status: 200 })));

		// Act
		const result = await api.get<Blob>('/file.bin', { accept: MimeType.OCTET_STREAM });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toBeInstanceOf(Blob);
	});

	it('accepts a URL instance as the url argument', async () => {
		// Arrange
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
		);

		// Act & Assert
		const result = await api.get(new URL('https://example.com/api'));
		expect(result.ok).toBe(true);
	});
});

describe('api.post', () => {
	it('sends a plain object body and returns parsed JSON', async () => {
		// Arrange
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ id: 42 }), { status: 201 }))
		);

		// Act
		const result = await api.post<{ id: number }>('/items', { name: 'widget' });

		// Assert
		expect(result.ok).toBe(true);
		expect(result.data).toEqual({ id: 42 });
		expect(result.status).toBe(201);
	});

	it('accepts a pre-serialized string body', async () => {
		// Arrange
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ id: 1 }), { status: 200 }))
		);

		// Act
		const result = await api.post('/items', JSON.stringify({ name: 'widget' }));

		// Assert
		expect(result.ok).toBe(true);
	});

	it('accepts a FormData body without error', async () => {
		// Arrange
		const form = new FormData();
		form.append('name', 'widget');
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ id: 1 }), { status: 200 }))
		);

		// Act
		const result = await api.post('/upload', form);

		// Assert
		expect(result.ok).toBe(true);
	});
});

describe('api.put', () => {
	it('returns parsed JSON on success', async () => {
		// Arrange
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ id: 1, name: 'updated' }), { status: 200 }))
		);

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
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ id: 1, name: 'patched' }), { status: 200 }))
		);

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
		globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 204 })));

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
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response(JSON.stringify({ allow: 'GET, POST' }), { status: 200 }))
		);

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
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
		});

		// Act
		await api.post('/upload', form, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(form);
	});

	it('passes URLSearchParams through unchanged when compressed', async () => {
		// Arrange
		const params = new URLSearchParams({ q: 'test' });
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
		});

		// Act
		await api.post('/search', params, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(params);
	});

	it('pipes a ReadableStream through CompressionStream', async () => {
		// Arrange
		const stream = new ReadableStream();
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
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
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
		});

		// Act
		await api.post('/data', small, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(small);
	});

	it('compresses a large string into a ReadableStream and sets Content-Encoding header', async () => {
		// Arrange
		const large = 'x'.repeat(2000);
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
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
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
		});

		// Act
		await api.post('/upload', blob, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(blob);
	});

	it('passes a small ArrayBuffer through unchanged (below compression threshold)', async () => {
		// Arrange
		const buffer = new ArrayBuffer(16);
		globalThis.fetch = mock((_, init) => {
			capturedInit = init as RequestInit;
			return Promise.resolve(new Response(null, { status: 204 }));
		});

		// Act
		await api.post('/upload', buffer, { compression: CompressionMethod.GZIP });

		// Assert
		expect(capturedInit?.body).toBe(buffer);
	});
});
