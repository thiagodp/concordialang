
export interface SingleFileProcessor {
    process( data: FileData ): Promise< ProcessedFileData >;
}

export interface SingleFileProcessorListener {

    processStarted( meta: FileMeta ): void;

    processFinished( data: ProcessedFileData ): void;

}

export class FileMeta {
    constructor(
        public fullPath: string,
        public size: number,   
        public hash: string
    ) {
    }
}

export class FileData {
    constructor(
        public meta: FileMeta,
        public content: string
    ) {
    }
}

export class ProcessedFileData {
    constructor(
        public meta: FileMeta,
        public content: any,
        public durationMs: number,
        public errors: Error[] = [],
        public warnings: Error[] = []
    ) {
    }
}