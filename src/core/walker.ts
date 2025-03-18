import type { Program, Statement } from "oxc-parser";

export type Visit = (
	node: Node,
	parent: Node | null,
	key: string,
	index: number | null,
	ctx: InstanceType<typeof Walker>["context"],
) => void | Promise<void>;

export type Node = Record<string, any>;

export class Walker {
	private isStop = false;
	private isContinue = false;
	private program: Program | Statement;
	private visitor: Record<string, any>;
	private context: { stop: () => void; continue: () => void };
	constructor(program: Program | Statement, visitor: Record<string, any>) {
		this.program = program;
		this.visitor = visitor;
		this.context = {
			continue: this.continue.bind(this),
			stop: this.stop.bind(this),
		};
	}

	async walk(): Promise<void> {
		if (!this.program || !this.visitor) return;
		await this.enter(this.program, null, this.program.type, 0);
	}

	private async walkNodes(
		nodes: Node | Node[],
		parent: Node | null,
		key: string,
	): Promise<void> {
		if (!Array.isArray(nodes)) return;
		for (let i = 0; i < nodes.length; i++) {
			if (this.isStop) return;
			const node = nodes[i];
			if (isNode(node)) {
				await this.enter(node, parent, key, i);
			}
		}
	}

	private async enter(
		node: Node,
		parent: Node | null,
		key: string,
		index: number | null,
	): Promise<void> {
		if (typeof this.visitor.enter === "function") {
			await this.visitor.enter(node, parent, key, index, this.context);
		}
		if (
			this.visitor[node.type] &&
			typeof this.visitor[node.type] === "function"
		) {
			await this.visitor[node.type](node, parent, key, index, this.context);
		}
		if (this.isContinue || this.isStop) {
			await this.leave(node, parent, key, index);
			this.isContinue = false;
			return;
		}
		const entries = Object.entries(node).filter(
			([_, childNode]) =>
				isNode(childNode) ||
				(Array.isArray(childNode) && childNode.every(isNode)),
		);
		for (const [key, childNode] of entries) {
			if (Array.isArray(childNode)) {
				await this.walkNodes(childNode, node, key);
			} else {
				await this.enter(childNode, node, key, null);
			}
		}
		await this.leave(node, parent, key, index);
	}

	private async leave(
		node: Node,
		parent: Node | null,
		key: string,
		index: number | null,
	): Promise<void> {
		if (typeof this.visitor.leave === "function") {
			await this.visitor.leave(node, parent, key, index, this.context);
		}
	}

	continue(): void {
		this.isContinue = true;
	}

	stop(): void {
		this.isStop = true;
	}
}

function isNode(value: unknown): value is Node {
	return (
		value !== null &&
		typeof value === "object" &&
		Object.hasOwn(value, "type") &&
		typeof (value as any).type === "string"
	);
}
