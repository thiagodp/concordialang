
/** @see Options */
export type FileSearchOptions = {
    directory: string,
    recursive: boolean,
    extensions: string[],
    file: string[],
    ignore: string[],
};

export type FileSearchResults = {
	files: string[],
	warnings: string[]
};

export interface FileSearcher {

    /**
     * Returns a search result with a list of files and warnings, according to
	 * the given options. Returned files have absolute paths.
     *
     * @param options Options
     * @return Search results
	 *
	 * @throws Error When a given directory does not exist.
     */
    searchFrom( options: FileSearchOptions ): Promise< FileSearchResults >;

}
