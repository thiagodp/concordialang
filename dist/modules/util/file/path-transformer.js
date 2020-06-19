"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWindowsPath = exports.toUnixPath = void 0;
function toUnixPath(path) {
    return path ? path.replace(/\\\\?/g, '/') : '';
}
exports.toUnixPath = toUnixPath;
function toWindowsPath(path) {
    return path ? path.replace(/\//g, '\\\\') : '';
}
exports.toWindowsPath = toWindowsPath;
