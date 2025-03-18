import {
	isAsyncFunction,
	isFunction,
	isNumber,
	isPlainObject,
	isRegExp,
} from "../util";

type KeyFn<T> = (partialTarget: T, index: number) => boolean;
type ValueFn<T> = (partialTarget: T, index: number) => T;

type InventoryKey<T> = number | RegExp | KeyFn<T>;
type InventoryValue<T> = T | ValueFn<T>;

export function populateArray<T = Record<string, any>>(
	...inventory: (
		| Record<string | symbol, any>
		| [InventoryKey<T>, InventoryValue<T>]
	)[]
) {
	const result: T[] = [];
	if (!Array.isArray(inventory)) {
		return result;
	}

	const [properties, mergeRules] = inventory.reduce(
		(
			res: [Record<string, any>, Array<[InventoryKey<T>, InventoryValue<T>]>],
			member,
		) => {
			if (isPlainObject(member)) {
				res[0] = Object.assign(res[0], member);
			} else if (Array.isArray(member)) {
				const [rule] = member;
				if (
					isNumber(rule) ||
					isRegExp(rule) ||
					isFunction(rule) ||
					isAsyncFunction(rule)
				) {
					res[1].push(member as [InventoryKey<T>, InventoryValue<T>]);
				}
			}
			return res;
		},
		[{}, []],
	);

	for (const key of Reflect.ownKeys(properties)) {
		// @ts-ignore
		result[key] = properties[key];
	}
	/**
	 * The priority for setting the length of result Array is as follows:
	 * First, check if the inventory Map has an explicitly set length property.
	 * If not, find the maximum value among all numeric properties of the inventory Map and add 1 to it.
	 * If neither of the above exists, generate a random number between 1 and 10.
	 */
	if (!Object.hasOwn(properties, "length")) {
		const indexes = mergeRules
			.filter(([rule]) => isNumber(rule))
			.map(([rule]) => rule as number);
		if (indexes.length) {
			result.length = Math.max(-1, ...indexes) + 1; // index + 1
		} else {
			// random length 1-10
			result.length = Math.floor(Math.random() * 10) + 1;
		}
	}
	for (const [rule, value] of mergeRules) {
		if (isNumber(rule)) {
			result[rule] = mergeObject(result, rule, value);
		} else if (isRegExp(rule)) {
			for (let index = 0; index < result.length; index++) {
				if (rule.test(String(index))) {
					result[index] = mergeObject(result, index, value);
				}
			}
		} else if (isFunction(rule)) {
			for (let index = 0; index < result.length; index++) {
				const previousValue = result[index];
				if (rule(previousValue, index)) {
					result[index] = mergeObject(result, index, value);
				}
			}
		}
	}
	return result;
}

function mergeObject<T>(target: T[], index: number, combine: any): T {
	const overridePreviousValue = Object.hasOwn(target, index);
	const originValue = target[index];
	const transformedValue =
		isFunction(combine) || isAsyncFunction(combine)
			? combine(originValue, index)
			: combine;
	if (
		overridePreviousValue &&
		isPlainObject(originValue) &&
		isPlainObject(transformedValue)
	) {
		return Object.assign({}, originValue, transformedValue);
	}
	return isPlainObject(transformedValue)
		? { ...transformedValue }
		: transformedValue;
}
