import { describe, expect, it } from "vitest";
import { parseMockComment } from "../src/core/comment";
import { createComment } from "./helper";

describe("self identifiers", () => {
	it("staticMemberExpression/chainExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo.__origin"))).selfIdentifiers,
		).toEqual([{ start: 4, end: 12 }]);
	});
	it("callExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo(__o)"))).selfIdentifiers,
		).toEqual([{ start: 4, end: 7 }]);
	});
	it("computedMemberExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo[__o]"))).selfIdentifiers,
		).toEqual([{ start: 4, end: 7 }]);
	});
	it("callExpression/ParenthesizedExpression/ArrowFunctionExpression", async () => {
		expect(
			(await parseMockComment(createComment("((__origin, car) => {})(foo)")))
				.selfIdentifiers,
		).toEqual([{ start: 2, end: 10 }]);
	});
	it("sequenceExpression", async () => {
		expect(
			(await parseMockComment(createComment("(foo.__o,__origin)")))
				.selfIdentifiers,
		).toEqual([
			{ start: 5, end: 8 },
			{ start: 9, end: 17 },
		]);
	});
});
