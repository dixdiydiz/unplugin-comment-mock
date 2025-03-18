import { describe, expect, it } from "vitest";
import { populateArray } from "../src/utils";

describe("populateArray", () => {
	it("simple", async () => {
		expect(
			populateArray(
				{
					length: 4,
				},
				[0, { foo: 1 }],
				[(_, i) => i === 3, { bar: 3 }],
				[
					/.*/,
					(_, index) => ({
						index,
					}),
				],
			),
		).toStrictEqual([
			{ foo: 1, index: 0 },
			{ index: 1 },
			{ index: 2 },
			{ bar: 3, index: 3 },
		]);
	});
	it("deep regexp key", async () => {
		expect(
			populateArray(
				{
					length: 3,
				},
				[
					/.*/,
					(_, index) => ({
						index,
					}),
				],
				[/^2/, (_) => "override"],
			),
		).toStrictEqual([{ index: 0 }, { index: 1 }, "override"]);
	});
	it("deep function key", async () => {
		expect(
			populateArray(
				{
					length: 3,
				},
				[
					() => true,
					(_, index) => ({
						index,
					}),
				],
				[
					// @ts-ignore
					(prev) => prev?.index === 2,
					{
						foo: 2,
					},
				],
			),
		).toStrictEqual([{ index: 0 }, { index: 1 }, { index: 2, foo: 2 }]);
	});
});
