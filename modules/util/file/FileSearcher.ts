
export type FileSearchOptions = {
    directory: string,
    recursive: boolean,
    extensions: string[],
    files: string[],
    ignore: string[],
};

export interface FileSearcher {

    /**
     * Return a list of files, according to the given options.
     * The list should contain the absolute paths.
     *
     * @param options Options
     * @return List of files
     */
    searchFrom( options: FileSearchOptions ): Promise< string[] >;

}