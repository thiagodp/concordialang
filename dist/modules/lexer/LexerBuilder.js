"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerBuilder = void 0;
const dict_1 = require("../dict");
const Lexer_1 = require("./Lexer");
class LexerBuilder {
    constructor(_langLoader = null) {
        this._langLoader = _langLoader;
    }
    build(options, language = 'en') {
        let langLoader = this._langLoader;
        if (!langLoader) {
            langLoader = new dict_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
        }
        // Loads the english language content
        let englishContent = langLoader.load('en'); // may throw
        // If keywords are not defined, use the default dictionary
        if (englishContent && !englishContent.keywords) {
            englishContent.keywords = new dict_1.EnglishKeywordDictionary();
        }
        return new Lexer_1.Lexer(language, langLoader);
    }
}
exports.LexerBuilder = LexerBuilder;
