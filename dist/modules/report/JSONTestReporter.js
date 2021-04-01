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
exports.JSONTestReporter = void 0;
const FileBasedTestReporter_1 = require("./FileBasedTestReporter");
/**
 * JSON-based test script execution reporter.
 *
 * @author Thiago Delgado Pinto
 */
class JSONTestReporter extends FileBasedTestReporter_1.FileBasedTestReporter {
    /** @inheritdoc */
    report(result, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = this.makeFilename(options);
            yield this._fileWriter.write(fileName, JSON.stringify(result, undefined, "\t"));
        });
    }
    /** @inheritdoc */
    fileExtension() {
        return '.json';
    }
}
exports.JSONTestReporter = JSONTestReporter;
