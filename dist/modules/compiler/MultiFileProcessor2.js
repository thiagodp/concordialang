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
const req_1 = require("../req");
class MultiFileProcessor {
    constructor(_fileProcessor) {
        this._fileProcessor = _fileProcessor;
    }
    process(files, basePath = '.') {
        return __awaiter(this, void 0, void 0, function* () {
            const status = {}; // file path -> FileStatus
            const spec = new req_1.AugmentedSpec(basePath);
            // Create a promise for every file
            const filePromises = [];
            for (const path of files) {
                const promise = this._fileProcessor.processFile(path, status, spec);
                filePromises.push(promise);
            }
            // Compile
            yield Promise.all(filePromises);
            // Compile imports
            for (const path of files) {
                yield this._fileProcessor.processImports(path, status, spec);
            }
            return spec;
        });
    }
}
exports.MultiFileProcessor = MultiFileProcessor;
