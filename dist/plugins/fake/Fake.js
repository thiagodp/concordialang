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
const concordialang_types_1 = require("concordialang-types");
/**
 * Fake plugin.
 *
 * @author Thiago Delgado Pinto
 */
class Fake {
    /** @inheritDoc */
    generateCode(abstractTestScripts, options, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            return []; // No files
        });
    }
    ;
    /** @inheritDoc */
    executeCode(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = new concordialang_types_1.TestScriptExecutionResult();
            r.sourceFile = 'nofile.json';
            r.schemaVersion = '1.0';
            r.started = (new Date()).toUTCString();
            r.finished = (new Date()).toUTCString();
            r.durationMs = 0;
            r.results = [];
            r.total = {
                tests: 4,
                passed: 1,
                error: 1,
                failed: 1,
                skipped: 1,
                unknown: 0
            };
            return r;
        });
    }
    ;
    /** @inheritDoc */
    convertReportFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented: convertReportFile.");
        });
    }
    /** @inheritDoc */
    defaultReportFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return 'fake-output.json';
        });
    }
}
exports.Fake = Fake;
