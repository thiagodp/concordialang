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
const LanguageManager_1 = require("../../modules/app/LanguageManager");
const Options_1 = require("../../modules/app/Options");
const path_1 = require("path");
/**
 * @author Thiago Delgado Pinto
 */
describe('LanguageManagerTest', () => {
    const langDir = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/')).languageDir;
    it('detects files correctly', () => __awaiter(this, void 0, void 0, function* () {
        const m = new LanguageManager_1.LanguageManager(langDir);
        const files = yield m.languageFiles();
        expect(files).toContain('pt.json');
    }));
    it('detects available correctly', () => __awaiter(this, void 0, void 0, function* () {
        const m = new LanguageManager_1.LanguageManager(langDir);
        const languages = yield m.availableLanguages();
        expect(languages).toContain('en');
    }));
});
