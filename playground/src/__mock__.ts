import { populateArray } from "unplugin-comment-mock/utils";

export function resetFruit(originalFruit: string, replaceFruit: string) {
	return `useState Initialize only "${originalFruit}",
	  but you can see that this sentence contains "${replaceFruit}"!!!`;
}

export const mockTodos = populateArray(
	{
		length: 20,
	},
	[() => true, "from __mock__.ts file"],
	[/2$/, (prev, index) => `${prev} index: ${index}`],
);
