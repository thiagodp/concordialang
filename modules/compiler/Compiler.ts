import Graph = require( 'graph.js/dist/graph.full.js' );
import { dirname, resolve } from "path";
import { Document } from "../ast/Document";
import { ProblemMapper } from '../error';
import { FileProblemMapper } from '../error/FileProblemMapper';
import { RuntimeException } from '../error/RuntimeException';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { BatchSpecificationAnalyzer } from '../semantic2/BatchSpecificationAnalyzer';
import { FileReader } from "../util/file/FileReader";
import { toUnixPath } from "../util/file/path-transformer";
import { runAllWithoutThrow } from '../util/p-all';
import { ImportBasedGraphBuilder } from './ImportBasedGraphBuilder';
import { SingleFileCompiler } from "./SingleFileCompiler";

enum FileStatus {
    PENDING = 0,
    COMPILED = 1,
    DONE = 2
}

export interface CompilerOptions {
    concurrency?: number;
    stopOnTheFirstError?: boolean;
}

const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
    concurrency: 10,
    stopOnTheFirstError: false
};

export class CompilerOutput {
    constructor(
        public readonly problems: ProblemMapper,
        public readonly spec: AugmentedSpec,
        public readonly graph?: Graph,
    ) {
    }
}

export class Compiler {

    constructor(
        private _fileReader: FileReader,
        private _singleFileCompiler: SingleFileCompiler,
        private _lineBreaker: string = "\n"
    ) {
    }

    makeOptions( compilerOptions: CompilerOptions = {} ) {
        const options: CompilerOptions = Object.assign( DEFAULT_COMPILER_OPTIONS, compilerOptions );
        return options;
    }

    /**
     * Compile files to produce a specification.
     */
    async compile(
        files: string[],
        basePath: string = '.',
        options: CompilerOptions = DEFAULT_COMPILER_OPTIONS
        ): Promise< CompilerOutput > {

        const problems = new FileProblemMapper();

        const spec: AugmentedSpec = new AugmentedSpec( basePath || '.' );

        // Nothing to compile ?
        if ( files.length < 1 ) {
            return new CompilerOutput( problems, spec );
        }

        const cOptions: CompilerOptions = this.makeOptions( options );

        const status: { [ filePath: string ]: FileStatus } = {}; // file path -> FileStatus

        // Create a promise for every file
        const filePromises: Array< Promise< boolean > > = [];
        for ( const path of files ) {
            const promise = this.compileFile( problems, path, status, spec, cOptions );
            filePromises.push( promise );
        }
        // Compile
        // await Promise.all( filePromises );
        const tasks = filePromises.map( p => () => p );
        await runAllWithoutThrow( tasks,
            {
                concurrency: cOptions.concurrency || Infinity,
                stopOnError: cOptions.stopOnTheFirstError
            } );

        // Generate graph
        const graph = ( new ImportBasedGraphBuilder() ).buildFrom( spec );

        // Perform semantic analysis
        if ( spec.docs.length > 0 ) {
            ( new BatchSpecificationAnalyzer() ).analyze( problems, spec, graph );
        }

        return new CompilerOutput( problems, spec, graph );
    }

    /**
     * Compiles a file after reading it from a storage.
     *
     * Compiled documents are put in the specification object.
     *
     * MUST NEVER THROW. Errors are set in the errorMapper.
     *
     * @param errorMapper Maps errors
     * @param filePath File path
     * @param statusMap Maps a file path to a FileStatus
     * @param spec Specification
     * @param options Compiler options
     * @returns `true` if successful.
     */
    async compileFile(
        problems: ProblemMapper,
        filePath: string,
        statusMap: { [ filePath: string ]: FileStatus },
        spec: AugmentedSpec,
        options: CompilerOptions
    ): Promise< boolean > {

        // Check existence
        if ( ! statusMap[ filePath ] ) {
            statusMap[ filePath ] = FileStatus.PENDING;
        }

        // Not pending ? -> exit
        if ( statusMap[ filePath ] !== FileStatus.PENDING ) {
            return true;
        }

        // Read
        let content: string;
        try {
            content = await this._fileReader.read( filePath );
        } catch {
            const msg = `Could not read "${filePath}"` ;
            const err = new RuntimeException( msg, { filePath: filePath, line: 0, column: 0 } );
            problems.addGenericError( err );
            return false;
        }
        // Remove potential UTF Byte Order Mark (UTF-8 or UTF16)
        if ( content && content.charAt( 0 ) == '\uFEFF' ) {
            content = content.slice( 1 );
        }

        // Compile content
        const doc = await this.compileContent(
            problems, spec.basePath, filePath, content );

        // Set as compiled to avoid others to compile again
        statusMap[ filePath ] = FileStatus.COMPILED;

        // Add to the spec
        spec.addDocument( doc );

        // Compile imports
        await this.compileImports( problems, doc, filePath, statusMap, spec, options );
    }

    /**
     * Compiles the imports from a given file recursively.
     */
    async compileImports(
        problems: ProblemMapper,
        doc: Document,
        filePath: string,
        statusMap: { [ filePath: string ]: FileStatus },
        spec: AugmentedSpec,
        options: CompilerOptions
    ): Promise< void > {

        // Only accepts COMPILED files
        if ( statusMap[ filePath ] !== FileStatus.COMPILED ) {
            return;
        }

        // Find document by path
        // const doc = spec.docWithPath( filePath );
        // if ( ! doc ) {
        //     const msg = 'File not found in the specification: ' + filePath;
        //     const loc = { filePath: filePath, line: 0, column: 0 };
        //     const err = new RuntimeException( msg, loc );
        //     errorMapper.add( filePath, err );
        //     return;
        // }
        if ( ! doc.imports ) {
            doc.imports = [];
        }
        // No imports? -> set status to DONE and exit
        if ( doc.imports.length < 1 ) {
            statusMap[ filePath ] = FileStatus.DONE;
            return;
        }

        // Process all the imports
        const promises: Array< Promise< boolean > > = [];
        for ( const imp of doc.imports ) {
            const promise = this.compileFile( problems, imp.resolvedPath, statusMap, spec, options );
            promises.push( promise );
        }
        // await Promise.all( promises );
        const tasks = promises.map( p => () => p );
        await runAllWithoutThrow( tasks,
            {
                concurrency: options.concurrency || Infinity,
                stopOnError: options.stopOnTheFirstError
            }
        );

        // Set status to DONE
        statusMap[ filePath ] = FileStatus.DONE;
    }

    /**
     * Compiles the content of a file without reading it from a storage or processing its imports.
     */
    async compileContent(
        problems: ProblemMapper,
        basePath: string,
        filePath: string,
        content: string
    ): Promise< Document > {

        const fullPath = toUnixPath( resolve( dirname( basePath ), filePath ) );

        return await this._singleFileCompiler.process(
            problems, fullPath, content, this._lineBreaker );
    }

}