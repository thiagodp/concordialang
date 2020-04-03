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
const read_file_1 = require("../util/read-file");
class FSFileReader {
    constructor(_fs, _encoding = 'utf8') {
        this._fs = _fs;
        this._encoding = _encoding;
    }
    read(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                fs: this._fs,
                encoding: this._encoding
            };
            return yield read_file_1.readFileAsync(filePath, options);
        });
    }
}
exports.FSFileReader = FSFileReader;
