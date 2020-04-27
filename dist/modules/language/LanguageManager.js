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
const path_1 = require("path");
const EnglishKeywordDictionary_1 = require("./EnglishKeywordDictionary");
/**
 * Language manager
 *
 * @author Thiago Delgado Pinto
 */
class LanguageManager {
    /**
     * Constructor
     *
     * @param _languageDir Directory to search language files.
     */
    constructor(_fileSearcher, _languageDir, _languageCache = new Map()) {
        this._fileSearcher = _fileSearcher;
        this._languageDir = _languageDir;
        this._languageCache = _languageCache;
        this.ENGLISH_LANGUAGE = 'en';
    }
    /**
     * Returns available languages.
     *
     * @param ignoreCache Whether it should ignore cached content. Defaults to false.
     */
    availableLanguages(ignoreCache = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ignoreCache && this._languageCache.size > 0) {
                return [...this._languageCache.keys()];
            }
            this._languageCache.clear();
            // Adds the english language
            this._languageCache.set(this.ENGLISH_LANGUAGE, new EnglishKeywordDictionary_1.EnglishKeywordDictionary());
            // Add file names, without content
            const files = yield this.languageFiles();
            for (let file of files) {
                const language = path_1.parse(file).name;
                this._languageCache.set(language, null); // No content yet - will be loaded on demand
            }
            return [...this._languageCache.keys()];
        });
    }
    /**
     * Returns available language files.
     */
    languageFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._fileSearcher.searchFrom({
                directory: this._languageDir,
                recursive: true,
                extensions: ['.json'],
                file: [],
                ignore: []
            });
        });
    }
    /**
     * Returns the directory used to search files.
     */
    dir() {
        return this._languageDir;
    }
}
exports.LanguageManager = LanguageManager;
