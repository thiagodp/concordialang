export interface FileEraser {

    erase( filePath: string, checkIfExists: boolean ): Promise< boolean >;

}