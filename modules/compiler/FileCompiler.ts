import { SingleFileCompiler } from "../app/SingleFileCompiler";
import { FileData, FileMeta, ProcessedFileData } from "../app/SingleFileProcessor";
import { Document } from "../ast";
import { AugmentedSpec } from "../req";
import { toUnixPath } from "../util/file-search";
import { FileReader } from "./FileReader";
import { normalize, dirname, join, resolve } from "path";

enum FileStatus {
    PENDING = 0,
    COMPILED = 1,
    DONE = 2
}

export class FileCompiler {

    constructor(
        private _fileReader: FileReader,
        private _singleFileCompiler: SingleFileCompiler,
        private _lineBreaker: string = "\n"
    ) {
    }


    async processFile( filePath: string, status, spec: AugmentedSpec ): Promise< void > {

        // Check existence
        if ( ! status[ filePath ] ) {
            status[ filePath ] = FileStatus.PENDING;
        }

        // Not pending ? -> exit
        if ( status[ filePath ] !== FileStatus.PENDING || spec.docWithPath( filePath ) !== null ) {
            return;
        }

        // Read
        let content: string | null = await this._fileReader.read( filePath );
        // Remove potential UTF Byte Order Mark
        if ( !! content ) {
            content = content.replace( /^\uFEFF/, '' );
        }

        // Compile
        const processedData = await this.compile( spec.basePath, filePath, content );
        const doc: Document = processedData.content;

        // Add to the spec
        spec.addDocument( doc );

        status[ filePath ] = FileStatus.COMPILED;
    }


    async processImports( filePath: string, status, spec: AugmentedSpec ): Promise< void > {

        // Nothing to do ? -> exit
        if ( FileStatus.DONE === status[ filePath ] ) {
            return;
        }

        // Find document by path
        const doc = spec.docWithPath( filePath );
        if ( ! doc ) {
            throw new Error( 'File not found in the specification: ' + filePath );
        }
        if ( ! doc.imports ) {
            doc.imports = [];
        }

        // No imports? -> exit
        if ( doc.imports.length < 1 ) {
            status[ filePath ] = FileStatus.DONE;
            return;
        }

        const promises: Promise< void >[] = [];
        for ( const imp of doc.imports ) {
            const promise = this.processFile( imp.resolvedPath, status, spec );
            promises.push( promise );
        }
        await Promise.all( promises );

        status[ filePath ] = FileStatus.DONE;
    }


    async compile( basePath: string, filePath: string, content: string ): Promise< ProcessedFileData > {

        const fileData: FileData = {
            content: content,
            meta: {
                fullPath: toUnixPath( resolve( dirname( basePath ), filePath ) )
            } as FileMeta
        } as FileData;

        return await this._singleFileCompiler.process( fileData, this._lineBreaker );
    }

}