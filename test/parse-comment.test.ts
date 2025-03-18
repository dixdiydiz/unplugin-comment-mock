import { describe, expect, it } from "vitest";
import { parseMockComment } from "../src/core/comment";
import { createComment } from "./helper";

describe("support expression", () => {
	it("importIdentifiers", async () => {
		expect(
			(await parseMockComment(createComment("foo"))).importIdentifiers,
		).toEqual(["foo"]);
	});
	it("staticMemberExpression/chainExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo?.bar.car"))).importIdentifiers,
		).toEqual(["foo"]);
	});
	it("callExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo?.(bar, car)")))
				.importIdentifiers,
		).toEqual(["foo"]);
	});
	it("callExpression/staticMemberExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo?.bar()"))).importIdentifiers,
		).toEqual(["foo"]);
	});
	it("callExpression/ParenthesizedExpression/ArrowFunctionExpression", async () => {
		expect(
			(await parseMockComment(createComment("((bar, car) => {})(foo)")))
				.importIdentifiers,
		).toEqual(["foo"]);
	});
	it("computedMemberExpression", async () => {
		expect(
			(await parseMockComment(createComment(`foo?.['bar'][foo?.['bar']]`)))
				.importIdentifiers,
		).toEqual(["foo"]);
	});
	it("other thisExpression", async () => {
		expect(
			(await parseMockComment(createComment("globalThis.foo")))
				.importIdentifiers,
		).toEqual(["globalThis"]);
	});
	it("sequenceExpression", async () => {
		expect(
			(await parseMockComment(createComment("foo.k,(bar,car)")))
				.importIdentifiers,
		).toEqual(["foo", "bar", "car"]);
	});
});

describe("do not support expression", () => {
	it("variableDeclaration", async () => {
		expect(
			(await parseMockComment(createComment("(let foo = 1;)")))
				.importIdentifiers,
		).toEqual([]);
	});
	it("thisExpression", async () => {
		expect(
			(await parseMockComment(createComment(`this.foo?.['bar'][foo?.['bar']]`)))
				.importIdentifiers,
		).toEqual([]);
	});
	it("literal", async () => {
		expect(
			(await parseMockComment(createComment("null"))).importIdentifiers,
		).toEqual([]);
	});
	it("compare", async () => {
		expect(
			(await parseMockComment(createComment("foo > bar"))).importIdentifiers,
		).toEqual([]);
	});
	it("error program", async () => {
		expect(
			(await parseMockComment(createComment("foo....bar"))).importIdentifiers,
		).toEqual([]);
	});
	it("multiple expression, error in the back", async () => {
		expect(
			(await parseMockComment(createComment("bar????.b"))).importIdentifiers,
		).toEqual([]);
	});
});
