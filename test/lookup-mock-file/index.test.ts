import { resolve } from "pathe";
import { describe, expect, it } from "vitest";
import { lookupSpecifierWithOptions } from "../../src/core/resolver";

describe("lookup-mock-file files", () => {
	it("parent directory", async () => {
		const file = resolve(__filename, "../", "deep/deep-two/index.ts");
		expect(await lookupSpecifierWithOptions(file)).toBeTruthy();
	});
	it("current directory", async () => {
		const file = resolve(__filename, "../", "deep/index.ts");
		expect(await lookupSpecifierWithOptions(file)).toBeTruthy();
	});
	it("not found", async () => {
		const file = resolve(__filename);
		expect(await lookupSpecifierWithOptions(file)).toBeUndefined();
	});
});
