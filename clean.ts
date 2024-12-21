import { rmdir } from "fs/promises";
import { join } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const clean = async (path: string): Promise<void> => {
	try {
		console.log(`Cleaning files in ${path}`);
		await rmdir(join(__dirname, path), { recursive: true });
	} catch (e) {
		console.log("An issue occurred cleaning files");
		console.log(e);
	}
};

const argv: { dir: string } = yargs(hideBin(process.argv)).option("dir", {
	type: "string",
	describe: "Directory to clean",
}).argv;

const cleanDir = argv.dir;

await clean(cleanDir);
