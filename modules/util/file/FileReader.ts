
export interface FileReader {

    /**
     * Reads a file content from a path.
     *
     * @param filePath File path
     */
    read( filePath: string ): Promise< string >;

    /**
     * Reads a file content from a path.
     *
     * @param filePath File path
     */
    readSync( filePath: string ): string;

}