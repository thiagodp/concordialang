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
const fs = require("fs");
const util_1 = require("util");
exports.DEFAULT_OPTIONS = {
    fs: fs,
    encoding: "utf8",
    flag: "r",
    silentIfNotExists: false
};
function readFileAsync(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const opt = Object.assign(exports.DEFAULT_OPTIONS, options || {});
        const readF = util_1.promisify(opt.fs.readFile);
        try {
            return yield readF(path, { encoding: opt.encoding, flag: opt.flag });
        }
        catch (err) {
            if ('ENOENT' == err.code && options.silentIfNotExists) {
                return null;
            }
            throw err;
        }
    });
}
exports.readFileAsync = readFileAsync;
