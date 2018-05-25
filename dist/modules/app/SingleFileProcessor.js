"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileMeta {
    constructor(fullPath, size, hash) {
        this.fullPath = fullPath;
        this.size = size;
        this.hash = hash;
    }
}
exports.FileMeta = FileMeta;
class FileData {
    constructor(meta, content) {
        this.meta = meta;
        this.content = content;
    }
}
exports.FileData = FileData;
class ProcessedFileData {
    constructor(meta, content, durationMs, errors = [], warnings = []) {
        this.meta = meta;
        this.content = content;
        this.durationMs = durationMs;
        this.errors = errors;
        this.warnings = warnings;
    }
}
exports.ProcessedFileData = ProcessedFileData;
