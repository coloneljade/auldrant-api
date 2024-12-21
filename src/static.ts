export const enum HttpStatus {
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

export const enum MimeType {
	// Text types
	HTML = "text/html",
	PLAIN = "text/plain",
	CSV = "text/csv",
	CSS = "text/css",
	JAVASCRIPT = "text/javascript",

	// Application types
	JSON = "application/json",
	XML = "application/xml",
	PDF = "application/pdf",
	ZIP = "application/zip",
	GZIP = "application/gzip",
	OCTET_STREAM = "application/octet-stream",

	// Image types
	JPEG = "image/jpeg",
	PNG = "image/png",
	GIF = "image/gif",
	SVG = "image/svg+xml",
	WEBP = "image/webp",

	// Video types
	MP4 = "video/mp4",
	WEBM = "video/webm",

	// Audio types
	MP3 = "audio/mpeg",
	OGG = "audio/ogg",
	WAV = "audio/wav",

	// Other types
	ICO = "image/x-icon",
	TAR = "application/x-tar",
}

export const enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
	OPTIONS = "OPTIONS",
	HEAD = "HEAD",
}

export const enum CompressionMethod {
	GZIP = "gzip",
	DEFLATE = "deflate",
}

export interface IRequestArgs {
	body?: BodyInit;
	contentType?: MimeType;
	accept?: MimeType;
	compression?: CompressionMethod;
}
