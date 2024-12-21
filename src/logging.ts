export function logRequest(req: Request) {
	console.log(`Path: ${new URL(req.url).pathname}`);
	console.log(`Method: ${req.method}`);
	console.log("Headers:");
	req.headers.forEach((val, key) => console.log(`${key}=${val}`));
}
