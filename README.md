# @auldrant/api

@auldrant/api is a client-side library that makes REST API calls simple and correct. It wraps the [Fetch API][fetch] with ergonomic method helpers, automatic JSON serialization, and a discriminated union response type so you always know whether a request succeeded.

We recommend using [Bun](https://bun.sh) to work with @auldrant/api.

```bash
bun install
```

## Usage

```ts
import { api } from '@auldrant/api';

const result = await api.get<User[]>('/api/users');
if (result.ok) {
  console.log(result.data); // User[]
} else {
  console.error(result.status); // HTTP status code, or 0 for network errors
}
```

## API

### Method helpers

All helpers return `Promise<ApiResponse<T>>`.

| Method | Signature |
|--------|-----------|
| `api.get` | `(url, options?)` |
| `api.post` | `(url, body?, options?)` |
| `api.put` | `(url, body?, options?)` |
| `api.patch` | `(url, body?, options?)` |
| `api.delete` | `(url, options?)` |
| `api.head` | `(url, options?)` |
| `api.options` | `(url, options?)` |

Plain objects passed as `body` are automatically serialized to JSON.

### ApiResponse

```ts
type ApiResponse<T> =
  | { ok: true;  data: T;    status: number }
  | { ok: false; data: null; status: number };
```

Use `ok` to narrow the type. Status `0` means a network error or aborted request.

### Options

```ts
interface RequestOptions {
  accept?: MimeType;      // Default: MimeType.JSON
  headers?: HeadersInit;
  signal?: AbortSignal;
}

interface RequestBodyOptions extends RequestOptions {
  contentType?: MimeType;           // Default: MimeType.JSON
  compression?: CompressionMethod;  // gzip or deflate
}
```

## Static Content

All enums and types are re-exported from the package root:

- `HttpMethod` — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- `HttpStatus` — common HTTP status codes
- `MimeType` — common MIME type strings
- `CompressionMethod` — gzip, deflate

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
