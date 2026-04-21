/** Standard HTTP status codes. See RFC 9110 §15. */
export enum HttpStatus {
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NO_CONTENT = 204,
	PARTIAL_CONTENT = 206,
	MOVED_PERMANENTLY = 301,
	FOUND = 302,
	SEE_OTHER = 303,
	NOT_MODIFIED = 304,
	TEMPORARY_REDIRECT = 307,
	PERMANENT_REDIRECT = 308,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	PAYMENT_REQUIRED = 402,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	NOT_ACCEPTABLE = 406,
	PROXY_AUTHENTICATION_REQUIRED = 407,
	REQUEST_TIMEOUT = 408,
	CONFLICT = 409,
	GONE = 410,
	LENGTH_REQUIRED = 411,
	PRECONDITION_FAILED = 412,
	PAYLOAD_TOO_LARGE = 413,
	URI_TOO_LONG = 414,
	UNSUPPORTED_MEDIA_TYPE = 415,
	RANGE_NOT_SATISFIABLE = 416,
	EXPECTATION_FAILED = 417,
	IM_A_TEAPOT = 418,
	MISDIRECTED_REQUEST = 421,
	UNPROCESSABLE_ENTITY = 422,
	LOCKED = 423,
	FAILED_DEPENDENCY = 424,
	TOO_EARLY = 425,
	UPGRADE_REQUIRED = 426,
	PRECONDITION_REQUIRED = 428,
	TOO_MANY_REQUESTS = 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
	UNAVAILABLE_FOR_LEGAL_REASONS = 451,
	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504,
	HTTP_VERSION_NOT_SUPPORTED = 505,
	VARIANT_ALSO_NEGOTIATES = 506,
	INSUFFICIENT_STORAGE = 507,
	LOOP_DETECTED = 508,
	NOT_EXTENDED = 510,
	NETWORK_AUTHENTICATION_REQUIRED = 511,
}

/** Common MIME type strings. See IANA Media Types registry. */
export enum MimeType {
	// Text types
	HTML = 'text/html',
	PLAIN = 'text/plain',
	CSV = 'text/csv',
	CSS = 'text/css',
	JAVASCRIPT = 'text/javascript',

	// Application types
	JSON = 'application/json',
	XML = 'application/xml',
	PDF = 'application/pdf',
	ZIP = 'application/zip',
	GZIP = 'application/gzip',
	OCTET_STREAM = 'application/octet-stream',
	FORM_DATA = 'multipart/form-data',
	URL_ENCODED = 'application/x-www-form-urlencoded',

	// Image types
	JPEG = 'image/jpeg',
	PNG = 'image/png',
	GIF = 'image/gif',
	SVG = 'image/svg+xml',
	WEBP = 'image/webp',
	ICO = 'image/x-icon',

	// Video types
	MP4 = 'video/mp4',
	WEBM = 'video/webm',

	// Audio types
	MP3 = 'audio/mpeg',
	OGG = 'audio/ogg',
	WAV = 'audio/wav',

	// Other types
	TAR = 'application/x-tar',
}

/** HTTP request methods. See RFC 9110 §9.3. */
export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD',
}

/** Compression algorithms supported by the Compression Streams API. */
export enum CompressionMethod {
	GZIP = 'gzip',
	DEFLATE = 'deflate',
}

/** Options for requests that do not carry a body (GET, HEAD, OPTIONS, DELETE). */
export interface RequestOptions {
	/** Expected response MIME type. Defaults to `MimeType.JSON`. */
	accept?: MimeType;
	/** Additional headers to include in the request. */
	headers?: HeadersInit;
	/** AbortSignal to cancel the request. */
	signal?: AbortSignal;
	/** Abort the request after this many milliseconds (raises a TimeoutError). */
	timeout?: number;
	/**
	 * Maximum number of additional attempts on network failure (status 0).
	 * Server responses (4xx, 5xx) are never retried — they are intentional responses.
	 * Defaults to 0 (no retry).
	 */
	retry?: number;
	/**
	 * Base delay in milliseconds for exponential backoff between retry attempts.
	 * Attempt 1 waits `retryDelay` ms, attempt 2 waits `retryDelay * 2` ms, etc.
	 * Defaults to 0 (no delay).
	 */
	retryDelay?: number;
}

/** Options for requests that carry a body (POST, PUT, PATCH). */
export interface RequestBodyOptions extends RequestOptions {
	/** Request body content type. Defaults to `MimeType.JSON`. */
	contentType?: MimeType;
	/** Compress the request body before sending. */
	compression?: CompressionMethod;
}

/**
 * Discriminated union for API responses. Narrow with `ok` and `empty`:
 *
 * - `r.ok && !r.empty` → `r.data` is `T` (success with body, the common case)
 * - `r.ok && r.empty` → `r.data` is `null` (204 No Content or HEAD response)
 * - `!r.ok` → `r.data` is `null` (network failure, timeout, parse error, or non-2xx)
 */
export type ApiResponse<T> =
	| { ok: true; empty: false; data: T; status: number }
	| { ok: true; empty: true; data: null; status: number }
	| { ok: false; data: null; status: number };

/**
 * Response shape for HEAD requests. HEAD responses never carry a body per
 * RFC 9110 §9.3.5, so the success variant is always `empty: true`.
 */
export type HeadResponse =
	| { ok: true; empty: true; data: null; status: number }
	| { ok: false; data: null; status: number };

/**
 * Configuration for a {@link createApi} instance.
 * All fields are optional. Per-request options always take precedence over these defaults.
 */
export interface ApiConfig {
	/** Base URL prepended to all relative request paths. Absolute URLs and URL
	 *  instances bypass this automatically. */
	baseUrl?: string | URL;
	/** Default headers included in every request. Per-request headers take precedence. */
	headers?: HeadersInit;
	/** Default Accept MIME type for all requests. Defaults to {@link MimeType.JSON}. */
	accept?: MimeType;
	/** Default timeout in milliseconds for all requests. */
	timeout?: number;
}

/** A configured API client returned by {@link createApi}. */
export interface ApiInstance {
	get<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>>;
	post<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>>;
	put<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>>;
	patch<T>(
		url: string | URL,
		body?: BodyInit | object,
		options?: RequestBodyOptions
	): Promise<ApiResponse<T>>;
	delete<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>>;
	head(url: string | URL, options?: RequestOptions): Promise<HeadResponse>;
	options<T>(url: string | URL, options?: RequestOptions): Promise<ApiResponse<T>>;
}
