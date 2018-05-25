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
const filewalker = require("filewalker");
const path = require("path");
const EnglishKeywordDictionary_1 = require("../dict/EnglishKeywordDictionary");
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
    constructor(_languageDir, _languageCache = new Map()) {
        this._languageDir = _languageDir;
        this._languageCache = _languageCache;
        this.ENGLISH_LANGUAGE = 'en';
        /**
         * Returns available languages.
         *
         * @param ignoreCache Whether it should ignore cached content. Defaults to false.
         */
        this.availableLanguages = (ignoreCache = false) => __awaiter(this, void 0, void 0, function* () {
            if (!ignoreCache && this._languageCache.size > 0) {
                return [...this._languageCache.keys()];
            }
            this._languageCache.clear();
            // Adds the english language
            this._languageCache.set(this.ENGLISH_LANGUAGE, new EnglishKeywordDictionary_1.EnglishKeywordDictionary());
            // Add file names, without content
            const files = yield this.languageFiles();
            for (let file of files) {
                const language = file.substring(file.lastIndexOf(path.sep), file.lastIndexOf('.'));
                this._languageCache.set(language, null); // No content yet - will be loaded on demand
            }
            return [...this._languageCache.keys()];
        });
        /**
         * Returns available language files.
         */
        this.languageFiles = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const options = {
                    maxPending: -1,
                    maxAttempts: 0,
                    attemptTimeout: 1000,
                    matchRegExp: new RegExp('\\.json$'),
                    recursive: false
                };
                let files = [];
                filewalker(this._languageDir, options)
                    .on('file', (relPath, stats, absPath) => files.push(relPath))
                    .on('error', (err) => reject(err))
                    .on('done', () => resolve(files))
                    .walk();
            });
        });
        /**
         * Returns a content of a language.
         *
         * @param language Language to load.
         * @return Promise to the content, null or undefined.
         */
        /*
        public contentOf = async ( language: string, ignoreCache: boolean = false ): Promise< object | null | undefined > => {
            if ( ignoreCache ) {
                await this.availableLanguages( true );
            }
            if ( ! this._languageCache.has( language ) ) {
                return null;
            }
            let content = this._languageCache.get( language );
            if ( ! content ) {
                content = fse.readJson( this.makeLanguageFilePath( language ) );
                this._languageCache.set( language, content );
            }
            return content;
        };
        */
        /**
         * Returns the directory used to search files.
         */
        this.dir = () => {
            return this._languageDir;
        };
    }
    makeLanguageFilePath(language) {
        return path.join(this._languageDir, language + '.json');
    }
}
exports.LanguageManager = LanguageManager;
