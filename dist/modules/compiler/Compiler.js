"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = exports.CompilerOutput = void 0;
const path_1 = require("path");
const FileProblemMapper_1 = require("../error/FileProblemMapper");
const RuntimeException_1 = require("../error/RuntimeException");
const AugmentedSpec_1 = require("../req/AugmentedSpec");
const BatchSpecificationAnalyzer_1 = require("../semantic/BatchSpecificationAnalyzer");
const path_transformer_1 = require("../util/file/path-transformer");
const p_all_1 = require("../util/p-all");
const ImportBasedGraphBuilder_1 = require("./ImportBasedGraphBuilder");
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
class CompilerOutput {
    constructor(problems, spec, graph) {
        this.problems = problems;
        this.spec = spec;
        this.graph = graph;
    }
}
exports.CompilerOutput = CompilerOutput;
class Compiler {
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
    compile(files, basePath = '.', options = DEFAULT_COMPILER_OPTIONS) {
        return __awaiter(this, void 0, void 0, function* () {
            const problems = new FileProblemMapper_1.FileProblemMapper();
            const spec = new AugmentedSpec_1.AugmentedSpec(basePath || '.');
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
            yield p_all_1.runAllWithoutThrow(tasks, {
                concurrency: cOptions.concurrency || Infinity,
                stopOnError: cOptions.stopOnTheFirstError
            });
            // Generate graph
            const graph = (new ImportBasedGraphBuilder_1.ImportBasedGraphBuilder()).buildFrom(spec);
            // Perform semantic analysis
            if (spec.docs.length > 0) {
                (new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer()).analyze(problems, spec, graph);
            }
            return new CompilerOutput(problems, spec, graph);
        });
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
    compileFile(problems, filePath, statusMap, spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
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
                content = yield this._fileReader.read(filePath);
            }
            catch (_a) {
                const msg = `Could not read "${filePath}"`;
                const err = new RuntimeException_1.RuntimeException(msg, { filePath: filePath, line: 0, column: 0 });
                problems.addGenericError(err);
                return false;
            }
            // Remove potential UTF Byte Order Mark (UTF-8 or UTF16)
            if (content && content.charAt(0) == '\uFEFF') {
                content = content.slice(1);
            }
            // Compile content
            const doc = yield this.compileContent(problems, spec.basePath, filePath, content);
            // Set as compiled to avoid others to compile again
            statusMap[filePath] = FileStatus.COMPILED;
            // Add to the spec
            spec.addDocument(doc);
            // Compile imports
            yield this.compileImports(problems, doc, filePath, statusMap, spec, options);
        });
    }
    /**
     * Compiles the imports from a given file recursively.
     */
    compileImports(problems, doc, filePath, statusMap, spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield p_all_1.runAllWithoutThrow(tasks, {
                concurrency: options.concurrency || Infinity,
                stopOnError: options.stopOnTheFirstError
            });
            // Set status to DONE
            statusMap[filePath] = FileStatus.DONE;
        });
    }
    /**
     * Compiles the content of a file without reading it from a storage or processing its imports.
     */
    compileContent(problems, basePath, filePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = path_transformer_1.toUnixPath(path_1.resolve(path_1.dirname(basePath), filePath));
            return yield this._singleFileCompiler.process(problems, fullPath, content, this._lineBreaker);
        });
    }
}
exports.Compiler = Compiler;
