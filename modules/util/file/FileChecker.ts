
export interface FileChecker {

    /**
     * Returns `true` whether the given file exists.
     *
     * @param filePath File path
     */
    exists( filePath: string ): Promise< boolean >;

    /**
     * Returns `true` whether the given file exists.
     *
     * @param filePath File path
     */
    existsSync( filePath: string ): boolean;

}