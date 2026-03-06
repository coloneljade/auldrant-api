import {
	type ApiResponse,
	type CompressionMethod,
	HttpMethod,
	MimeType,
	type RequestBodyOptions,
	type RequestOptions,
} from './static.ts';

/** Payloads smaller than this threshold are not worth the CompressionStream setup overhead. */
const MIN_COMPRESSION_BYTES = 1024;

/**
 * Compresses a request body using the CompressionStream API.
 * @param content - Body content to compress
 * @param method - Compression algorithm
 * @returns Compressed body as a ReadableStream, or the original content if no method specified
 */
function compress(content: BodyInit, method?: CompressionMethod): BodyInit {
	if (method == null) {
		return content;
	}

	// FormData and URLSearchParams cannot be compressed at this layer —
	// the browser serializes them internally. Pass through unchanged.
	if (content instanceof FormData || content instanceof URLSearchParams) {
		return content;
	}

	// ReadableStream can pipe directly — no Blob wrapping needed.
	if (content instanceof ReadableStream) {
		return content.pipeThrough(new CompressionStream(method));
	}

	// Skip compression for small payloads — streaming overhead outweighs benefit.
	const size =
		typeof content === 'string'
			? content.length
			: content instanceof Blob
				? content.size
				: content.byteLength; // ArrayBuffer / ArrayBufferView
	if (size < MIN_COMPRESSION_BYTES) {
		return content;
	}

	// string, Blob, ArrayBuffer, ArrayBufferView — wrap in Blob for streaming.
	// Workaround: CompressionStream requires a ReadableStream input.
	return new Blob([content as BlobPart]).stream().pipeThrough(new CompressionStream(method));
}

/**
 * Builds a Headers object, only setting headers that have defined values.
 * Skips Content-Type for FormData/URLSearchParams (browser sets boundary automatically).
 */
function buildHeaders(
	contentType: MimeType | undefined,
	accept: MimeType,
	compression: CompressionMethod | undefined,
	extra: HeadersInit | undefined,
	body: BodyInit | undefined
): Headers {
	const headers = new Headers(extra);

	if (!headers.has('Accept')) {
		headers.set('Accept', accept);
	}

	// Per Fetch spec, let the browser set Content-Type for FormData and URLSearchParams
	// so the correct boundary/encoding is included automatically.
	const browserManaged = body instanceof FormData || body instanceof URLSearchParams;
	if (contentType != null && !browserManaged && !headers.has('Content-Type')) {
		headers.set('Content-Type', contentType);
	}

	if (compression != null && !headers.has('Content-Encoding')) {
		headers.set('Content-Encoding', compression);
	}

	return headers;
}

/**
 * Parses a Response body based on the Accept MIME type.
 * Unrecognized MIME types are returned as a Blob.
 */
async function parseBody<T>(resp: Response, accept: MimeType): Promise<T> {
	switch (accept) {
		case MimeType.JSON:
			return (await resp.json()) as T;
		case MimeType.PLAIN:
		case MimeType.HTML:
		case MimeType.CSV:
		case MimeType.XML:
		case MimeType.CSS:
		case MimeType.JAVASCRIPT:
			return (await resp.text()) as T;
		default:
			return (await resp.blob()) as T;
	}
}

/**
 * Core fetch wrapper. All method helpers delegate to this.
 * @param url - Request URL
 * @param method - HTTP method
 * @param body - Request body (for POST/PUT/PATCH)
 * @param options - Request options
 * @returns Discriminated ApiResponse — check `ok` to narrow the type
 */
async function request<T>(
	url: string | URL,
	method: HttpMethod,
	body: BodyInit | undefined,
	options: RequestBodyOptions = {}
): Promise<ApiResponse<T>> {
	const {
		accept = MimeType.JSON,
		contentType = MimeType.JSON,
		compression,
		headers: extraHeaders,
		signal,
	} = options;

	try {
		// Per RFC 9110 §9.3.1, GET requests MUST NOT have a body
		const sendBody =
			body != null && method !== HttpMethod.GET && method !== HttpMethod.HEAD
				? compress(body, compression)
				: null;

		const headers = buildHeaders(
			body != null ? contentType : undefined,
			accept,
			body != null ? compression : undefined,
			extraHeaders,
			body
		);

		const init: RequestInit = {
			method,
			body: sendBody,
			headers,
		};
		if (signal != null) {
			init.signal = signal;
		}

		const resp = await fetch(url, init);

		if (!resp.ok) {
			return { ok: false, data: null, status: resp.status };
		}

		// Per RFC 9110 §9.3.5, HEAD responses have no body; 204 means No Content.
		if (method === HttpMethod.HEAD || resp.status === 204) {
			return { ok: true, data: null, status: resp.status };
		}

		const data = await parseBody<T>(resp, accept);
		return { ok: true, data, status: resp.status };
	} catch (_error: unknown) {
		// Network errors, aborts, and other client-side failures get status 0
		// (not 500 — that would misrepresent a server error)
		return { ok: false, data: null, status: 0 };
	}
}

function serializeBody(body: unknown): BodyInit {
	if (
		body instanceof FormData ||
		body instanceof URLSearchParams ||
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		body instanceof ReadableStream ||
		typeof body === 'string'
	) {
		return body;
	}
	return JSON.stringify(body);
}

/**
 * RESTful API client with method helpers.
 *
 * @example
 * ```ts
 * const result = await api.get<User[]>('/api/users');
 * if (result.ok) {
 *   console.log(result.data); // User[]
 * }
 * ```
 */
export const api = {
	/**
	 * Sends a GET request.
	 * @param url - Request URL
	 * @param options - Request options (accept, headers, signal)
	 */
	get<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>> {
		return request<T>(url, HttpMethod.GET, undefined, options);
	},

	/**
	 * Sends a POST request.
	 * @param url - Request URL
	 * @param body - Request body (auto-serialized to JSON if plain object)
	 * @param options - Request options (contentType, accept, headers, signal, compression)
	 */
	post<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>> {
		return request<T>(
			url,
			HttpMethod.POST,
			body != null ? serializeBody(body) : undefined,
			options
		);
	},

	/**
	 * Sends a PUT request.
	 * @param url - Request URL
	 * @param body - Request body (auto-serialized to JSON if plain object)
	 * @param options - Request options (contentType, accept, headers, signal, compression)
	 */
	put<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>> {
		return request<T>(url, HttpMethod.PUT, body != null ? serializeBody(body) : undefined, options);
	},

	/**
	 * Sends a PATCH request.
	 * @param url - Request URL
	 * @param body - Request body (auto-serialized to JSON if plain object)
	 * @param options - Request options (contentType, accept, headers, signal, compression)
	 */
	patch<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>> {
		return request<T>(
			url,
			HttpMethod.PATCH,
			body != null ? serializeBody(body) : undefined,
			options
		);
	},

	/**
	 * Sends a DELETE request.
	 * @param url - Request URL
	 * @param options - Request options (accept, headers, signal)
	 */
	delete<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>> {
		return request<T>(url, HttpMethod.DELETE, undefined, options);
	},

	/**
	 * Sends a HEAD request. Returns status and headers only (no body).
	 * @param url - Request URL
	 * @param options - Request options (headers, signal)
	 */
	head(url: string | URL, options?: RequestOptions): Promise<ApiResponse<null>> {
		return request<null>(url, HttpMethod.HEAD, undefined, options);
	},

	/**
	 * Sends an OPTIONS request. Returns allowed methods and CORS info.
	 * @param url - Request URL
	 * @param options - Request options (accept, headers, signal)
	 */
	options<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>> {
		return request<T>(url, HttpMethod.OPTIONS, undefined, options);
	},
};
