"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs = require("fs");
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
     * @param _encoding File encoding. Defaults to 'utf8'.
     */
    constructor(_baseDir, _map = {}, _encoding = 'utf8', _fs = fs) {
        this._baseDir = _baseDir;
        this._map = _map;
        this._encoding = _encoding;
        this._fs = _fs;
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
        return this._fs.existsSync(this.makeLanguageFilePath(language));
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
        let filePath = this.makeLanguageFilePath(language);
        let fileExists = this._fs.existsSync(filePath);
        if (!fileExists) {
            throw new Error('File not found: ' + filePath);
        }
        return this._map[language] = JSON.parse(this.readFileContent(filePath));
    }
    makeLanguageFilePath(language) {
        return path_1.join(this._baseDir, language + '.json');
    }
    readFileContent(filePath) {
        return this._fs.readFileSync(filePath, this._encoding);
    }
}
exports.LanguageBasedJsonFileLoader = LanguageBasedJsonFileLoader;
//# sourceMappingURL=LanguageBasedJsonFileLoader.js.map