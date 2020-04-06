
export type DirSearchOptions = {
    directory: string,
    recursive: boolean,
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