import type { Comment } from "oxc-parser";
import { parseAsync } from "oxc-parser";
import { type Visit, Walker } from "./walker";

// #comment-mock syntax
const COMMENT_SYNTAX_RE = /^\s*#comment-mock\s+(?<code>.*)/;

// replace self expression
const mockSelf = ["__origin", "__o"];

interface MockComment extends Comment {
	code: string;
	importIdentifiers: string[];
	selfIdentifiers: { start: number; end: number }[];
}

export async function seekMockComment(
	comments: Comment[],
): Promise<MockComment[]> {
	const mockComments = await Promise.all(comments.map(parseMockComment));
	return mockComments.filter((c) => !!c.code);
}

export async function parseMockComment(comment: Comment): Promise<MockComment> {
	const code = comment.value.match(COMMENT_SYNTAX_RE)?.[1];
	const program = code
		? await parseAsync("_.js", code, {
				sourceType: "module",
				preserveParens: true,
			})
				.then((r) => r.program)
				.catch(() => null)
		: null;
	const collection: Collection = {
		importIdentifiers: [],
		selfIdentifiers: [],
	};
	if (program) {
		await new Walker(program, commentVisitorFactory(collection)).walk();
	}

	return {
		...comment,
		code: code ?? "",
		importIdentifiers: collection.importIdentifiers,
		selfIdentifiers: collection.selfIdentifiers,
	};
}

type Collection = Pick<MockComment, "importIdentifiers" | "selfIdentifiers">;

interface CommentVisitor {
	enter: Visit;
	leave: Visit;
	Identifier: Visit;
	ThisExpression: Visit;
}

function commentVisitorFactory(collection: Collection): CommentVisitor {
	let legalHierarchy = true;
	return {
		enter(node) {
			if (
				![
					"Identifier",
					"Program",
					"ExpressionStatement",
					"ThisExpression",
					"ChainExpression",
					"MemberExpression",
					"StaticMemberExpression",
					"ComputedMemberExpression",
					"CallExpression",
					"ParenthesizedExpression",
					"SequenceExpression",
				].includes(node.type)
			) {
				legalHierarchy = false;
			}
		},
		leave(node, parent) {
			if (
				["SequenceExpression", "Program"].includes(parent?.type) ||
				(node.type === "ParenthesizedExpression" &&
					parent?.type === "CallExpression")
			) {
				legalHierarchy = true;
			}
		},
		Identifier(node) {
			if (mockSelf.includes(node.name)) {
				collection.selfIdentifiers.push({ start: node.start, end: node.end });
			} else if (legalHierarchy) {
				collection.importIdentifiers.push(node.name);
			}
			legalHierarchy = false;
		},
		// exclude this keyword
		ThisExpression() {
			legalHierarchy = false;
		},
	};
}
