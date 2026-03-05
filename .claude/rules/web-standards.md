# Web Standards

This library wraps browser Web APIs. Implementations MUST adhere to published standards.

## Authoritative Sources

| Standard | Source | Key URLs |
|----------|--------|----------|
| Fetch API | WHATWG | https://fetch.spec.whatwg.org/ |
| URL | WHATWG | https://url.spec.whatwg.org/ |
| Compression Streams | W3C | https://wicg.github.io/compression/ |
| HTTP Semantics | IETF | RFC 9110 (methods, status codes, headers) |
| HTTP Caching | IETF | RFC 9111 |
| MIME Types | IANA | https://www.iana.org/assignments/media-types/ |
| FormData | WHATWG | https://xhr.spec.whatwg.org/#interface-formdata |
| AbortController | WHATWG | https://dom.spec.whatwg.org/#interface-abortcontroller |

## Rules

- When implementing or reviewing: verify behavior against the spec, not blog posts
- When adding new MIME types, status codes, or methods: verify against the IANA registry or RFC 9110
- **Client-side only**: no Node.js APIs (no `http`, `fs`, `Buffer`). Only APIs available in browsers.
- Prefer `URL` class over string concatenation for URL manipulation
- Reference specs in code comments for non-obvious behavior (e.g., `// Per RFC 9110 §9.3.1, GET requests MUST NOT have a body`)
