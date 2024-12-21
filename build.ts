import dts from "bun-plugin-dts";

console.log("Building package...");
const result = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	minify: true,
	plugins: [dts()], //TODO: migrate to bun once possible. https://github.com/oven-sh/bun/issues/5141
});

if (!result.success) {
	throw new AggregateError(result.logs); //TODO: once bun ships 1.2 this will be the default behavior on failed build. https://bun.sh/docs/bundler#throw
}
