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
const util_1 = require("util");
class FSFileHandler {
    constructor(_fs, _encoding = 'utf8') {
        this._fs = _fs;
        this._encoding = _encoding;
    }
    /** @inheritDoc */
    read(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const readFile = util_1.promisify(this._fs.readFile);
            const options = {
                encoding: this._encoding,
                flag: 'r'
            };
            return yield readFile(filePath, options);
            // try {
            //     return await readFile( filePath, options );
            // } catch ( err ) {
            //     if ( 'ENOENT' == err.code && silentIfNotExists ) {
            //         return null;
            //     }
            //     throw err;
            // }
        });
    }
    /** @inheritDoc */
    readSync(filePath) {
        const options = {
            encoding: this._encoding,
            flag: 'r'
        };
        return this._fs.readFileSync(filePath, options);
    }
    /** @inheritDoc */
    exists(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const pAccess = util_1.promisify(this._fs.access);
            try {
                yield pAccess(filePath, this._fs.constants.R_OK);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    /** @inheritDoc */
    existsSync(filePath) {
        return this._fs.existsSync(filePath);
    }
    /** @inheritDoc */
    write(filePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeFile = util_1.promisify(this._fs.writeFile);
            return yield writeFile(filePath, content);
        });
    }
    /** @inheritDoc */
    erase(filePath, checkIfExists) {
        return __awaiter(this, void 0, void 0, function* () {
            if (checkIfExists) {
                const ok = yield this.exists(filePath);
                if (!ok) {
                    return false;
                }
            }
            const unlinkFile = util_1.promisify(this._fs.unlink);
            yield unlinkFile(filePath);
            return true;
        });
    }
}
exports.FSFileHandler = FSFileHandler;
