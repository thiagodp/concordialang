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
const file_1 = require("../util/file");
const path_1 = require("path");
var FileStatus;
(function (FileStatus) {
    FileStatus[FileStatus["PENDING"] = 0] = "PENDING";
    FileStatus[FileStatus["COMPILED"] = 1] = "COMPILED";
    FileStatus[FileStatus["DONE"] = 2] = "DONE";
})(FileStatus || (FileStatus = {}));
class FileCompiler {
    constructor(_fileReader, _singleFileCompiler, _lineBreaker = "\n") {
        this._fileReader = _fileReader;
        this._singleFileCompiler = _singleFileCompiler;
        this._lineBreaker = _lineBreaker;
    }
    processFile(filePath, status, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check existence
            if (!status[filePath]) {
                status[filePath] = FileStatus.PENDING;
            }
            // Not pending ? -> exit
            if (status[filePath] !== FileStatus.PENDING || spec.docWithPath(filePath) !== null) {
                return;
            }
            // Read
            let content = yield this._fileReader.read(filePath);
            // Remove potential UTF Byte Order Mark
            if (!!content) {
                content = content.replace(/^\uFEFF/, '');
            }
            // Compile
            const processedData = yield this.compile(spec.basePath, filePath, content);
            const doc = processedData.content;
            // Add to the spec
            spec.addDocument(doc);
            status[filePath] = FileStatus.COMPILED;
        });
    }
    processImports(filePath, status, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            // Nothing to do ? -> exit
            if (FileStatus.DONE === status[filePath]) {
                return;
            }
            // Find document by path
            const doc = spec.docWithPath(filePath);
            if (!doc) {
                throw new Error('File not found in the specification: ' + filePath);
            }
            if (!doc.imports) {
                doc.imports = [];
            }
            // No imports? -> exit
            if (doc.imports.length < 1) {
                status[filePath] = FileStatus.DONE;
                return;
            }
            const promises = [];
            for (const imp of doc.imports) {
                const promise = this.processFile(imp.resolvedPath, status, spec);
                promises.push(promise);
            }
            yield Promise.all(promises);
            status[filePath] = FileStatus.DONE;
        });
    }
    compile(basePath, filePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileData = {
                content: content,
                meta: {
                    fullPath: file_1.toUnixPath(path_1.resolve(path_1.dirname(basePath), filePath))
                }
            };
            return yield this._singleFileCompiler.process(fileData, this._lineBreaker);
        });
    }
}
exports.FileCompiler = FileCompiler;
