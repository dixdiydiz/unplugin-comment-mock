import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { resolve } from "pathe";
import { getResolveOptions } from "./options";

let specifierFiles: string[] | null = null;

export async function lookupSpecifierWithOptions(
	filePath: string,
): Promise<string | undefined> {
	if (!specifierFiles) {
		const { mockFileName, mockFileExt } = getResolveOptions();
		specifierFiles = mockFileExt.reduce((matches, ext) => {
			const files = mockFileName.flatMap((name) => [
				`${name}${ext}`,
				`${name}/index${ext}`,
			]);
			matches.push(...files);
			return matches;
		}, [] as string[]);
	}
	return await lookupFiles(path.dirname(filePath), specifierFiles);
}

async function lookupFiles(
	dir: string,
	files: string[],
): Promise<string | undefined> {
	if (!dir || dir === process.cwd()) {
		return;
	}
	for (const file of files) {
		const path = resolve(dir, `./${file}`);
		const isExits = await fs
			.access(path)
			.then(() => true)
			.catch(() => false);
		if (isExits) {
			return path;
		}
	}
	return lookupFiles(resolve(dir, "../"), files);
}
