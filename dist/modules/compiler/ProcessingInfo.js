"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingInfo = void 0;
class ProcessingInfo {
    constructor(durationMs, errors, warnings) {
        this.durationMs = durationMs;
        this.errors = errors;
        this.warnings = warnings;
    }
}
exports.ProcessingInfo = ProcessingInfo;
