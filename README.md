# @auldrant/api

@auldrant/api is a client-side library intended to simplify working with Web APIs so you can focus on your core application logic. It also provides some content useful for server-side applications as well. We recommend using [Bun](https://bun.sh) to work with @auldrant/api. To install

```bash
bun install
```

## Static Content

@auldrant/api is designed to provide simple, reusable code for common work with APIs. All static content can be found in [static.ts][static]. This includes common content like HTTP methods and status codes, as well as many types for the most common HTTP headers including MIME types and encodings, and some helper typings for working with requests and responses.

## Methods

@auldrant/api's main feature is [apiCall], which aims to provide a simpler interface for working with [fetch] that handles some of the technical operations automatically, behind the scenes. For example, it will automatically perform supported compression on content upon request and set the appropriate `Content-Encoding` header.

[static]: ./src/static.ts
[apiCall]: ./src/apiCall.ts
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
