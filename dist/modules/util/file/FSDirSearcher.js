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
const fsWalk = require("@nodelib/fs.walk");
const util_1 = require("util");
class FSDirSearcher {
    constructor(_fs) {
        this._fs = _fs;
    }
    /** @inheritDoc */
    search(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryFilter = entry => {
                return entry.dirent.isDirectory()
                    && options.regexp.test(entry.name);
            };
            const walkOptions = {
                fs: this._fs,
                followSymbolicLinks: true,
                throwErrorOnBrokenSymbolicLink: false,
                // Entry filter
                entryFilter: entryFilter,
                // Skip all ENOENT errors
                errorFilter: error => 'ENOENT' == error.code,
                // Use deep filter when not recursive
                deepFilter: options.recursive ? undefined : entryFilter
            };
            const pWalk = util_1.promisify(fsWalk.walk);
            const entries = yield pWalk(options.directory, walkOptions);
            return entries.map(e => e.path);
        });
    }
}
exports.FSDirSearcher = FSDirSearcher;
