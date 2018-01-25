export interface LanguageListener {
    defaultLanguageSelected( language: string );
}

export interface FileReadListener {

    fileReadStarted( path: string, size: number ): void;

    fileReadIgnored( path: string ): void;    

    fileReadChunk( path: string, chunkSize: number ): void;

    fileReadError( path: string, err: Error ): void;

    fileReadFinished( path: string ): void;

}


export interface DirectoryReadListener {
    
    directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean );

    directoryReadFinished( result: DirectoryReadResult );

}


export class DirectoryReadResult {
    constructor(
        public dirCount: number,
        public filesCount: number,
        public filesSize: number,
        public durationMs: number,
        public fileErrorCount: number
    ) {

    }
}