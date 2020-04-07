export interface FileWriter {

    /**
     * Writes a file
     *
     * @param filePath File path
     * @param cotent Content to write
     */
    write( filePath: string, content: string ): Promise< void >;

}