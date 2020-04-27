
/** @see Options */
export type FileSearchOptions = {
    directory: string,
    recursive: boolean,
    extensions: string[],
    file: string[],
    ignore: string[],
};

export interface FileSearcher {

    /**
     * Return a list of files, according to the given options.
     * The returned list contains absolute paths.
     *
     * @param options Options
     * @return List of files
     */
    searchFrom( options: FileSearchOptions ): Promise< string[] >;

}