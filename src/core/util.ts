const objectToString = (value: unknown) =>
	Object.prototype.toString.call(value).slice(8, -1);

export const isFunction = (
	value: unknown,
): value is (...args: any[]) => any => {
	return objectToString(value) === "Function";
};

export const isAsyncFunction = (
	value: unknown,
): value is (...args: any[]) => Promise<any> => {
	return objectToString(value) === "AsyncFunction";
};

export const isRegExp = (value: unknown): value is RegExp => {
	return objectToString(value) === "RegExp";
};

export const isNumber = (value: unknown): value is number => {
	return objectToString(value) === "Number";
};
export const isPlainObject = (value: unknown): boolean => {
	if (objectToString(value) !== "Object" || value === null) {
		return false;
	}
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};
