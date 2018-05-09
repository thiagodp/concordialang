"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const InstrumentationReader_1 = require("./InstrumentationReader");
const Warning_1 = require("../req/Warning");
const fs = require("fs");
const util_1 = require("util");
/**
 * Default script file instrumentation.
 *
 * @author Thiago Delgado Pinto
 */
class FileInstrumentationReader {
    constructor(_reader = new InstrumentationReader_1.DefaultInstrumentationReader(), _fs = fs, _encoding = 'utf-8') {
        this._reader = _reader;
        this._fs = _fs;
        this._encoding = _encoding;
    }
    /**
     * Retrieves specification location from a script file location.
     *
     * @param scriptFilePath Script file path.
     * @param scriptLineNumber Script line number.
     */
    retrieveSpecLocation(scriptLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            const readFileAsync = util_1.promisify(this._fs.readFile);
            let lines = (yield readFileAsync(scriptLoc.filePath, this._encoding))
                .toString().split("\n");
            let count = 0;
            let specFilePath = null;
            let specLineNumber = 0;
            for (let content of lines) {
                ++count;
                if (null === specFilePath) {
                    specFilePath = this._reader.retrieveSpecFile(content);
                }
                // Retrive the specification column from the code instrumentation,
                // i.e., an annotation with the specification column
                if (count === scriptLoc.line) {
                    specLineNumber = this._reader.retrieveSpecLineNumber(content);
                    break; // nothing to do anymore
                }
            }
            lines = null; // free content
            // Specification info not found, reject it
            if (null === specFilePath || 0 === specLineNumber) {
                const msg = 'Specification information could not be retrieved from "' + scriptLoc.filePath + '".';
                throw new Warning_1.Warning(msg, scriptLoc);
            }
            const specLoc = {
                filePath: specFilePath,
                line: specLineNumber,
                column: 1
            };
            return specLoc;
        });
    }
}
exports.FileInstrumentationReader = FileInstrumentationReader;
//# sourceMappingURL=FileInstrumentationReader.js.map