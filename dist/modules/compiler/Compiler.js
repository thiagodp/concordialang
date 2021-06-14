import { dirname, resolve } from 'path';
import { FileProblemMapper } from '../error/FileProblemMapper';
import { RuntimeException } from '../error/RuntimeException';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { BatchSpecificationAnalyzer } from '../semantic/BatchSpecificationAnalyzer';
import { toUnixPath } from '../util/file/path-transformer';
import { runAllWithoutThrow } from '../util/p-all';
import { ImportBasedGraphBuilder } from './ImportBasedGraphBuilder';
var FileStatus;
(function (FileStatus) {
    FileStatus[FileStatus["PENDING"] = 0] = "PENDING";
    FileStatus[FileStatus["COMPILED"] = 1] = "COMPILED";
    FileStatus[FileStatus["DONE"] = 2] = "DONE";
})(FileStatus || (FileStatus = {}));
const DEFAULT_COMPILER_OPTIONS = {
    concurrency: 10,
    stopOnTheFirstError: false
};
export class CompilerOutput {
    constructor(problems, spec, graph) {
        this.problems = problems;
        this.spec = spec;
        this.graph = graph;
    }
}
export class Compiler {
    constructor(_fileReader, _singleFileCompiler, _lineBreaker = "\n") {
        this._fileReader = _fileReader;
        this._singleFileCompiler = _singleFileCompiler;
        this._lineBreaker = _lineBreaker;
    }
    makeOptions(compilerOptions = {}) {
        const options = Object.assign(DEFAULT_COMPILER_OPTIONS, compilerOptions);
        return options;
    }
    /**
     * Compile files to produce a specification.
     */
    async compile(files, basePath = '.', options = DEFAULT_COMPILER_OPTIONS) {
        const problems = new FileProblemMapper();
        const spec = new AugmentedSpec(basePath || '.');
        // Nothing to compile ?
        if (files.length < 1) {
            return new CompilerOutput(problems, spec);
        }
        const cOptions = this.makeOptions(options);
        const status = {}; // file path -> FileStatus
        // Create a promise for every file
        const filePromises = [];
        for (const path of files) {
            const promise = this.compileFile(problems, path, status, spec, cOptions);
            filePromises.push(promise);
        }
        // Compile
        // await Promise.all( filePromises );
        const tasks = filePromises.map(p => () => p);
        await runAllWithoutThrow(tasks, {
            concurrency: cOptions.concurrency || Infinity,
            stopOnError: cOptions.stopOnTheFirstError
        });
        // Generate graph
        const graph = (new ImportBasedGraphBuilder()).buildFrom(spec);
        // Perform semantic analysis
        if (spec.docs.length > 0) {
            (new BatchSpecificationAnalyzer()).analyze(problems, spec, graph);
        }
        return new CompilerOutput(problems, spec, graph);
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
    async compileFile(problems, filePath, statusMap, spec, options) {
        // Check existence
        if (!statusMap[filePath]) {
            statusMap[filePath] = FileStatus.PENDING;
        }
        // Not pending ? -> exit
        if (statusMap[filePath] !== FileStatus.PENDING) {
            return true;
        }
        // Read
        let content;
        try {
            content = await this._fileReader.read(filePath);
        }
        catch {
            const msg = `Could not read "${filePath}"`;
            const err = new RuntimeException(msg, { filePath: filePath, line: 0, column: 0 });
            problems.addGenericError(err);
            return false;
        }
        // Remove potential UTF Byte Order Mark (UTF-8 or UTF16)
        if (content && content.charAt(0) == '\uFEFF') {
            content = content.slice(1);
        }
        // Compile content
        const doc = await this.compileContent(problems, spec.basePath, filePath, content);
        // Set as compiled to avoid others to compile again
        statusMap[filePath] = FileStatus.COMPILED;
        // Add to the spec
        spec.addDocument(doc);
        // Compile imports
        await this.compileImports(problems, doc, filePath, statusMap, spec, options);
    }
    /**
     * Compiles the imports from a given file recursively.
     */
    async compileImports(problems, doc, filePath, statusMap, spec, options) {
        // Only accepts COMPILED files
        if (statusMap[filePath] !== FileStatus.COMPILED) {
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
        if (!doc.imports) {
            doc.imports = [];
        }
        // No imports? -> set status to DONE and exit
        if (doc.imports.length < 1) {
            statusMap[filePath] = FileStatus.DONE;
            return;
        }
        // Process all the imports
        const promises = [];
        for (const imp of doc.imports) {
            const promise = this.compileFile(problems, imp.resolvedPath, statusMap, spec, options);
            promises.push(promise);
        }
        // await Promise.all( promises );
        const tasks = promises.map(p => () => p);
        await runAllWithoutThrow(tasks, {
            concurrency: options.concurrency || Infinity,
            stopOnError: options.stopOnTheFirstError
        });
        // Set status to DONE
        statusMap[filePath] = FileStatus.DONE;
    }
    /**
     * Compiles the content of a file without reading it from a storage or processing its imports.
     */
    async compileContent(problems, basePath, filePath, content) {
        const fullPath = toUnixPath(resolve(dirname(basePath), filePath));
        return await this._singleFileCompiler.process(problems, fullPath, content, this._lineBreaker);
    }
}
