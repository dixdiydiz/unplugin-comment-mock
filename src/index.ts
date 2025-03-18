import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { resolveOptions } from "./core/options";
import { transformComment } from "./core/transform-comment";
import type { Options } from "./types";

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options,
) => ({
	name: "unplugin-comment-mock",
	buildStart() {
		resolveOptions(options);
	},
	transform(code, id) {
		return transformComment(code, id);
	},
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
