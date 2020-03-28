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
const fwalker = require("fwalker");
const crypto_1 = require("crypto");
const SingleFileProcessor_1 = require("./SingleFileProcessor");
const Listeners_1 = require("./Listeners");
const SingleFileProcessor_2 = require("./SingleFileProcessor");
class MultiFileProcessor {
    constructor(_singleProcessor, _fileReadListener, _fileProcessorListener, _directoryReadListener, _multiFileProcessListener) {
        this._singleProcessor = _singleProcessor;
        this._fileReadListener = _fileReadListener;
        this._fileProcessorListener = _fileProcessorListener;
        this._directoryReadListener = _directoryReadListener;
        this._multiFileProcessListener = _multiFileProcessListener;
        this.process = (options) => {
            return new Promise((resolve, reject) => {
                const dir = options.directory;
                const hasFilesToConsider = options.files.length > 0;
                const matchRegExp = hasFilesToConsider
                    ? this.filesToRegExp(options.files)
                    : this.extensionsToRegExp(options.extensions);
                const hasFilesToIgnore = options.ignore.length > 0;
                const target = hasFilesToConsider
                    ? options.files
                    : this.prettyExtensions(options.extensions);
                const recursive = options.recursive;
                let filePromises = [];
                let processedFiles = [];
                let errors = [];
                const startTime = Date.now();
                this._directoryReadListener.directoryReadStarted(dir, target, hasFilesToConsider);
                this._multiFileProcessListener.multiProcessStarted();
                const walkerOptions = {
                    maxPending: -1,
                    maxAttempts: 0,
                    attemptTimeout: 1000,
                    matchRegExp: matchRegExp,
                    recursive: recursive
                };
                let walker = fwalker(dir, walkerOptions);
                walker
                    // .on( 'dir', ( p ) => {
                    //      console.log('dir:  %s', p);
                    // } )
                    .on('file', (p, s) => {
                    this._fileReadListener.fileReadStarted(p, s.size);
                })
                    .on('stream', (rs, p, s, fullPath) => {
                    if (hasFilesToIgnore) {
                        if (this.filesToIgnoreToRegExp(options.ignore).test(p)) {
                            this._fileReadListener.fileReadIgnored(p);
                            return;
                        }
                    }
                    rs._readableState.highWaterMark = 1024 * 1024; // 1 MB
                    let fileContent = '';
                    rs.on('data', (chunk) => {
                        fileContent += chunk;
                        this._fileReadListener.fileReadChunk(p, chunk.length);
                    });
                    rs.on('end', () => __awaiter(this, void 0, void 0, function* () {
                        const hashStr = crypto_1.createHash('md5')
                            .update(fileContent)
                            .digest('hex');
                        this._fileReadListener.fileReadFinished(p);
                        const fileStartTime = Date.now();
                        const fileMeta = new SingleFileProcessor_1.FileMeta(fullPath, s.size, hashStr);
                        try {
                            const fileData = new SingleFileProcessor_1.FileData(fileMeta, fileContent);
                            this._fileProcessorListener.processStarted(fileMeta);
                            let promise = this._singleProcessor.process(fileData);
                            filePromises.push(promise);
                            const processedData = yield promise; // executes
                            processedFiles.push(processedData);
                            this._fileProcessorListener.processFinished(processedData);
                        }
                        catch (err) {
                            // should not happen, since errors are catched internally by the processor
                            const processDurationMs = Date.now() - fileStartTime;
                            this._fileProcessorListener.processFinished(new SingleFileProcessor_2.ProcessedFileData(fileMeta, {}, processDurationMs, [err], []));
                        }
                    }));
                })
                    .on('error', (err) => {
                    errors.push(err);
                })
                    .on('done', () => __awaiter(this, void 0, void 0, function* () {
                    let durationMs = Date.now() - startTime;
                    // TO-DO: Remove the comparison and use fwalker.dirs when its Issue 20 is fixed.
                    // https://github.com/oleics/node-filewalker/issues/20
                    const dirCount = recursive ? walker.dirs || 1 : 1;
                    const data = new Listeners_1.DirectoryReadResult(dirCount, walker.files, walker.bytes, durationMs, errors.length);
                    this._directoryReadListener.directoryReadFinished(data);
                    yield Promise.all(filePromises);
                    durationMs = Date.now() - startTime;
                    this._multiFileProcessListener.multiProcessFinished(walker.files, durationMs);
                    return resolve(new MultiFileProcessedData(processedFiles, errors));
                }))
                    .walk();
            });
        };
        this.filesToRegExp = (files) => {
            const exp = '(' + files.map(f => f.replace('/', '\\\\')).join('|') + ')';
            return new RegExp(exp, 'ui');
        };
        this.filesToIgnoreToRegExp = (files) => {
            const exp = '(' + files.map(f => f.replace('\\', '/')).join('|') + ')';
            return new RegExp(exp, 'ui');
        };
        this.extensionsToRegExp = (extensions) => {
            const exp = '(' + extensions.map(e => e.indexOf('.') >= 0 ? '\\' + e : '\\.' + e).join('|') + ')$';
            return new RegExp(exp, 'ui');
        };
        this.prettyExtensions = (extensions) => {
            return extensions.map(e => e.indexOf('.') >= 0 ? e : '.' + e);
        };
    }
}
exports.MultiFileProcessor = MultiFileProcessor;
class MultiFileProcessedData {
    constructor(compiledFiles, readErrors) {
        this.compiledFiles = compiledFiles;
        this.readErrors = readErrors;
    }
}
exports.MultiFileProcessedData = MultiFileProcessedData;
