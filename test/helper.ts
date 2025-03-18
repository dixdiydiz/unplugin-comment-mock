import type { Comment } from "oxc-parser";

export function createComment(code: string): Comment {
	return {
		type: "Line",
		value: `#comment-mock ${code}`,
		start: 0,
		end: code.length + 7,
	};
}

export function normalizedTemplate(code: string) {
	return code.replace(/\s+/g, "\n").trim();
}
