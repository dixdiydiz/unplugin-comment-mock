import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { transformComment } from "../../src/core/transform-comment";
import { normalizedTemplate } from "../helper";

describe("transformComment code with mock comments", () => {
	it("Literal", async () => {
		const code = `
      // #comment-mock 2
  		const foo = 1;
  		// #comment-mock Symbol('d')
  		let bar = 2;
  		// #comment-mock
  		bar = 3;
  		`;
		const id = "file:///path/to/file.ts";
		const result = await transformComment(code, id);
		expect(normalizedTemplate(result!.code)).toMatch(
			normalizedTemplate(`
	  // #comment-mock 2
  		const foo = 2;
  		// #comment-mock Symbol('d')
  		let bar = Symbol('d');
  		// #comment-mock
  		bar = 3;
  		`),
		);
	});

	it("importIdentifiers", async () => {
		const code = `
		  import _ from 'virtual';
			// #comment-mock mockFoo(1)
			const foo = 1;
			// #comment-mock
			const bar = 2;
		`;
		const id = fileURLToPath(import.meta.url);
		const result = await transformComment(code, id);
		expect(normalizedTemplate(result!.code)).toMatch(
			normalizedTemplate(`
		  import { mockFoo } from './__mock__.ts'
		  import _ from 'virtual';
	    // #comment-mock mockFoo(1)
	    const foo = mockFoo(1);
	    // #comment-mock
	    const bar = 2;
	   `),
		);
	});
});
