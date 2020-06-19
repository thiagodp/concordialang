"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageBasedJsonFileLoader = void 0;
const path_1 = require("path");
const EnglishKeywordDictionary_1 = require("../language/EnglishKeywordDictionary");
/**
 * Language-based JSON file loader.
 *
 * @author  Thiago Delgado Pinto
 */
class LanguageBasedJsonFileLoader {
    /**
     * Constructs the loader.
     *
     * @param _baseDir Base directory to load the files.
     * @param _map Map with each language ( string => object ). Defaults to {}.
     * @param _fileReader File reader to use
     * @param _fileChecker File checker to use
     */
    constructor(_baseDir, _map = {}, _fileReader, _fileChecker) {
        this._baseDir = _baseDir;
        this._map = _map;
        this._fileReader = _fileReader;
        this._fileChecker = _fileChecker;
    }
    /**
     * Returns true whether the language file exists.
     *
     * @param language Language
     * @throws Error
     */
    has(language) {
        if (!!this._map[language]) {
            return true;
        }
        return this._fileChecker.existsSync(this.makeLanguageFilePath(language));
    }
    /**
     * Loads, caches and returns a content for the given language.
     * If the language was already used, just returns its cached content.
     *
     * @param language Language
     * @returns The content.
     *
     * @throws Error If cannot load the file.
     */
    load(language) {
        // Returns the content in cache, if available
        if (!!this._map[language]) {
            return this._map[language];
        }
        const filePath = this.makeLanguageFilePath(language);
        const fileExists = this._fileChecker.existsSync(filePath);
        if (!fileExists) {
            throw new Error('File not found: ' + filePath);
        }
        const content = this._fileReader.readSync(filePath);
        this._map[language] = JSON.parse(content);
        // Add keywords for English
        if ('en' === language && !this._map[language]['keywords']) {
            this._map[language]['keywords'] = new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
        }
        return this._map[language];
    }
    makeLanguageFilePath(language) {
        return path_1.join(this._baseDir, language + '.json');
    }
}
exports.LanguageBasedJsonFileLoader = LanguageBasedJsonFileLoader;
