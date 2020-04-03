
export interface FileReader {

    /**
     * Reads a file content from a path.
     *
     * @param filePath File path
     */
    read( filePath: string ): Promise< string >;

}