// user options
export interface Options {
	/**  specify the name of the file/dir where the mock data is stored */
	mockFileName?: string | string[];
	/**  mock file extension */
	mockFileExt?: string | string[];
}

export interface ResolvedOptions extends Options {
	mockFileName: string[];
	mockFileExt: string[];
}

const resolvedOptions: ResolvedOptions = {
	mockFileName: ["mock", "__mock__"],
	mockFileExt: [".js", ".ts"],
};

export function getResolveOptions(): ResolvedOptions {
	return resolvedOptions;
}

export function resolveOptions(
	options?: Options | Partial<ResolvedOptions>,
): void {
	// @ts-ignore
	const { mockFileName, mockFileExt } = options ?? {};

	Object.assign(
		resolvedOptions,
		options,
		mockFileName && {
			mockFileName: Array.isArray(mockFileName)
				? mockFileName.filter(Boolean)
				: [mockFileName].filter(Boolean),
		},
		mockFileExt && {
			mockFileExt: Array.isArray(mockFileExt)
				? mockFileExt.filter(Boolean)
				: [mockFileExt].filter(Boolean),
		},
	);
}
