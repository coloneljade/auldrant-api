# @auldrant/api

[![npm](https://img.shields.io/npm/v/@auldrant/api?color=blue)](https://www.npmjs.com/package/@auldrant/api)
[![CI](https://img.shields.io/github/actions/workflow/status/coloneljade/auldrant-api/ci.yml?label=CI)](https://github.com/coloneljade/auldrant-api/actions)
[![license](https://img.shields.io/github/license/coloneljade/auldrant-api)](https://github.com/coloneljade/auldrant-api/blob/main/LICENSE)

@auldrant/api is a client-side library that makes REST API calls simple and correct. It wraps the [Fetch API][fetch] with ergonomic method helpers, automatic JSON serialization, and a discriminated union response type so you always know whether a request succeeded.

We recommend using [Bun](https://bun.sh) to work with @auldrant/api.

```bash
bun install
```

## Quick start

```ts
import { createApi } from '@auldrant/api';

const api = createApi();

const result = await api.get<User[]>('/api/users');
if (result.ok) {
  console.log(result.data); // User[]
} else {
  console.error(result.status); // HTTP status code, or 0 for network errors
}
```

## Configured instance

Pass options to `createApi` to set defaults that apply to every request:

```ts
const api = createApi({
  baseUrl: 'https://api.example.com',
  headers: { Authorization: `Bearer ${token}` },
  timeout: 5000,
});

// Relative paths are resolved against baseUrl
const users = await api.get<User[]>('/users');
```

Per-request options always override instance defaults.

## Method helpers

All helpers are methods on the instance returned by `createApi` and return `Promise<ApiResponse<T>>`.

| Method | Signature |
|--------|-----------|
| `.get` | `(url, options?)` |
| `.post` | `(url, body?, options?)` |
| `.put` | `(url, body?, options?)` |
| `.patch` | `(url, body?, options?)` |
| `.delete` | `(url, options?)` |
| `.head` | `(url, options?)` |
| `.options` | `(url, options?)` |

Plain objects passed as `body` are automatically serialized to JSON.

## ApiResponse

```ts
type ApiResponse<T> =
  | { ok: true;  data: T | null; status: number }
  | { ok: false; data: null;     status: number };
```

Use `ok` to narrow the type. Status `0` means a network error, timeout, or aborted request.

## Options reference

### `RequestOptions` (GET, DELETE, HEAD, OPTIONS)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `accept` | `MimeType` | `MimeType.JSON` | Expected response MIME type |
| `headers` | `HeadersInit` | — | Additional headers |
| `signal` | `AbortSignal` | — | Cancel the request |
| `timeout` | `number` | — | Abort after N milliseconds |
| `retry` | `number` | `0` | Max additional attempts on network failure |
| `retryDelay` | `number` | `0` | Milliseconds to wait between retries |

### `RequestBodyOptions` (POST, PUT, PATCH)

Extends `RequestOptions` with:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `contentType` | `MimeType` | `MimeType.JSON` | Request body content type |
| `compression` | `CompressionMethod` | — | Compress the request body |

### `ApiConfig` (createApi)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `baseUrl` | `string \| URL` | — | Prepended to all relative request paths |
| `headers` | `HeadersInit` | — | Default headers for every request |
| `accept` | `MimeType` | `MimeType.JSON` | Default Accept type for every request |
| `timeout` | `number` | — | Default timeout for every request |

## Timeout

```ts
// Per-request
const result = await api.get('/data', { timeout: 3000 });

// Or set a default for all requests
const api = createApi({ timeout: 5000 });
const result = await api.get('/data'); // uses 5s timeout
```

Timed-out requests return `{ ok: false, status: 0 }`.

## Retry

Retries apply only to network failures (status 0). Server responses (4xx, 5xx) are never
retried. The wait between attempts doubles on each retry (exponential backoff).

```ts
const result = await api.get('/data', {
  retry: 3,         // up to 3 additional attempts
  retryDelay: 500,  // 500ms → 1000ms → 2000ms
});
```

## Abort

```ts
const controller = new AbortController();

const result = await api.get('/slow', { signal: controller.signal });

// Cancel from elsewhere
controller.abort();
```

Aborted requests return `{ ok: false, status: 0 }`.

## Compression

Compress request bodies before sending (useful for large payloads):

```ts
const data = largeJsonPayload;

await api.post('/ingest', data, {
  compression: CompressionMethod.GZIP,
});
```

`FormData` and `URLSearchParams` bodies are always passed through unchanged — the browser manages their encoding. Small payloads (under 1 KB) are skipped automatically.

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `createApi` | function | Creates a configured API instance |
| `ApiConfig` | type | Config object for `createApi` |
| `ApiInstance` | type | Return type of `createApi` |
| `ApiResponse` | type | Discriminated union response type |
| `RequestOptions` | type | Options for GET/DELETE/HEAD/OPTIONS |
| `RequestBodyOptions` | type | Options for POST/PUT/PATCH |
| `HttpMethod` | enum | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS |
| `HttpStatus` | enum | Common HTTP status codes |
| `MimeType` | enum | Common MIME type strings |
| `CompressionMethod` | enum | gzip, deflate |

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
