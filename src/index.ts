import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { resolveOptions } from "./core/options";
import { transform as coreTransform } from "./core/transform";
import type { Options } from "./types";

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options,
) => ({
	name: "unplugin-comment-mock",
	buildStart() {
		resolveOptions(options);
	},
	transform(code, id) {
		return coreTransform(code, id);
	},
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
