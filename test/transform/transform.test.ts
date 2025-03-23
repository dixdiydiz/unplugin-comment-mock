import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { transform } from "../../src/core/transform";
import { normalizedTemplate } from "../helper";

describe("transform code with mock comments", () => {
  it("exportNamedDeclaration and exportDefaultDeclaration", async () => {
    const code = `
      // #comment-mock 2
      export { foo1 as bar } from 'virtual';
      // #comment-mock 2
      export const foo2 = 1;
      // #comment-mock 2
      export default function() { return {} };
      // #comment-mock 2
      export default () => {};
      // #comment-mock 2
      export default a = 1;
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        // #comment-mock 2
        export { foo1 as bar } from 'virtual';
        // #comment-mock 2
        export const foo2 = 2;
        // #comment-mock 2
        export default function() { return {} };
        // #comment-mock 2
        export default () => 2;
        // #comment-mock 2
        export default a = 2;
  		`),
    );
  });

  it("expressionStatement", async () => {
    const code = `
      // #comment-mock 2
  		foo += 1;
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        // #comment-mock 2
        foo += 2;
  		`),
    );
  });

  it("variableDeclaration", async () => {
    const code = `
      // #comment-mock 2
  		let foo, bar = 1;
  		// #comment-mock Symbol('d')
  		let foo2 = 1, bar2 = 1;
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        // #comment-mock 2
        let foo, bar = 2;
        // #comment-mock Symbol('d')
        let foo2 = Symbol('d'), bar2 = Symbol('d');
  		`),
    );
  });

  it("arrowFunctionExpression", async () => {
    const code = `
      export const foo = () => 
        // #comment-mock 2
        () => 1;
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
      export const foo = () => 
        // #comment-mock 2
        () => 2;
  		`),
    );
  });

  it("returnStatement", async () => {
    const code = `
      export const foo = () => {
        // #comment-mock 2
        return () => 1;
      };
      function bar () {
        // #comment-mock 2
        return 1
      };
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        export const foo = () => {
          // #comment-mock 2
          return 2;
        };
        function bar () {
          // #comment-mock 2
          return 2
        };
  		`),
    );
  });

  it("property", async () => {
    const code = `
  		const foo = {
  		  // #comment-mock 2
  		  bar: 1,
  		  bar2: 2,
  		};
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        const foo = {
          // #comment-mock 2
          bar: 2,
          bar2: 2,
        };
  		`),
    );
  });

  it("literal and identifier", async () => {
    const code = `
      // #comment-mock 2
  		foo;
  		// #comment-mock 2
  		1;
  		`;
    const id = "file:///path/to/file.ts";
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        // #comment-mock 2
        2;
        // #comment-mock 2
        2;
  		`),
    );
  });

  it("importIdentifiers", async () => {
    const code = `
		  import _ from 'virtual';
			// #comment-mock mockFoo(1)
			const foo = 1;
			// #comment-mock mockBar()
			const bar = 1;
		`;
    const id = fileURLToPath(import.meta.url);
    const result = await transform(code, id);
    expect(normalizedTemplate(result!.code)).toMatch(
      normalizedTemplate(`
        import { mockFoo, mockBar } from './__mock__.ts'
        import _ from 'virtual';
        // #comment-mock mockFoo(1)
        const foo = mockFoo(1);
        // #comment-mock mockBar()
        const bar = mockBar();
	   `),
    );
  });

});
