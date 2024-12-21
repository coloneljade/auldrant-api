import {
	CompressionMethod,
	HttpMethod,
	HttpStatus,
	MimeType,
	type IRequestArgs,
} from "@static";

/**
 * Compresses content using compression algorithm
 * @param content Data to be compressed
 * @param method Compression algorithm. Currently only 'gzip' and 'deflate' are supported
 * @returns Compressed content as a readable stream. If an unsupported compression method is passed, the original content is returned uncompressed.
 */
function compress(content: BodyInit, method?: CompressionMethod): BodyInit {
	//TODO: technically this only really works with objects, need better support for large streams
	//since this is a client app, must use client compatible options https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
	switch (method) {
		case CompressionMethod.GZIP:
		case CompressionMethod.DEFLATE:
			const stream = new Blob([JSON.stringify(content)]).stream();
			return stream.pipeThrough(new CompressionStream(method));
		default: //no supported compression
			return content;
	}
}

/**
 * Used to make API calls
 * @param url URL of resource
 * @param method HTTP Method
 * @param requestArgs Arguments to construct request
 * @param controller Abort controller to cancel request before results are returned
 * @returns JSON data from HTTP and Http Status. When the status is not a 2xx code, data is null.
 */
const apiCall = async <T>(
	url: string | URL,
	method: HttpMethod,
	requestArgs: IRequestArgs,
	controller: AbortController
): Promise<{ data: T | null; status: HttpStatus }> => {
	try {
		const { body, contentType, accept, compression } = requestArgs;
		const sendBody = body ? compress(body, compression) : undefined;
		const { signal } = controller;

		const resp = await fetch(url, {
			signal,
			method,
			body: sendBody,
			headers: new Headers({
				"Content-Type": contentType as string,
				Accept: accept as string,
				"Content-Encoding": compression as string,
			}),
		});

		if (!resp.ok) {
			console.error(`Encountered error ${resp.status}`);
			return { data: null, status: resp.status };
		}

		switch (accept) {
			case MimeType.JSON:
				return await resp.json();
			case MimeType.PLAIN:
			case MimeType.HTML:
			case MimeType.CSV:
			case MimeType.XML:
			case MimeType.CSS:
			case MimeType.JAVASCRIPT:
				return { data: (await resp.text()) as T, status: resp.status };
			default:
				return { data: (await resp.blob()) as T, status: resp.status };
		}
	} catch (error: any) {
		console.error(error.message);
		return { data: null, status: HttpStatus.INTERNAL_SERVER_ERROR };
	}
};

export default apiCall;
