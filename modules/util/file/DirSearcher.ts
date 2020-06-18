
export type DirSearchOptions = {
	/** Base directory to search */
	directory: string,
	/** Recursive search */
	recursive: boolean,
	/**
	 * Regex to compare. If it evaluates to `true` the directory is included
	 * in the results.
	 */
    regexp: RegExp,
};

export interface DirSearcher {

    /**
     * Return a list of directories, according to the given options.
     * Returned list contains absolute paths.
     *
     * @param options Options
     * @return List of directories
     */
    search( options: DirSearchOptions ): Promise< string[] >;
}
