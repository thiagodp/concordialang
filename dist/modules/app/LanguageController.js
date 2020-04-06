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
const LanguageDrawer_1 = require("./LanguageDrawer");
const LanguageManager_1 = require("./LanguageManager");
class LanguageController {
    constructor(_cli, _fileSearcher) {
        this._cli = _cli;
        this._fileSearcher = _fileSearcher;
    }
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.languageList) {
                const lm = new LanguageManager_1.LanguageManager(this._fileSearcher, options.languageDir);
                const languages = yield lm.availableLanguages();
                const ld = new LanguageDrawer_1.LanguageDrawer(this._cli);
                ld.drawLanguages(languages);
            }
        });
    }
}
exports.LanguageController = LanguageController;
