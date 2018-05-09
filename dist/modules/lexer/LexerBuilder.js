"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = require("./Lexer");
const LanguageContentLoader_1 = require("../dict/LanguageContentLoader");
const EnglishKeywordDictionary_1 = require("../dict/EnglishKeywordDictionary");
class LexerBuilder {
    constructor(_langLoader = null) {
        this._langLoader = _langLoader;
    }
    build(options, language = 'en') {
        let langLoader = this._langLoader;
        if (!langLoader) {
            langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
        }
        // Loads the english language content
        let englishContent = langLoader.load('en'); // may throw
        // If keywords are not defined, use the default dictionary
        if (englishContent && !englishContent.keywords) {
            englishContent.keywords = new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
        }
        return new Lexer_1.Lexer(language, langLoader);
    }
}
exports.LexerBuilder = LexerBuilder;
//# sourceMappingURL=LexerBuilder.js.map