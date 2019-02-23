"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnglishKeywordDictionary_1 = require("../dict/EnglishKeywordDictionary");
const Symbols_1 = require("../req/Symbols");
const NodeTypes_1 = require("../req/NodeTypes");
const CaseConversor_1 = require("../util/CaseConversor");
/**
 * Generates files for Documents with Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseFileGenerator {
    constructor(_languageContentLoader, language) {
        this._languageContentLoader = _languageContentLoader;
        this.language = language;
        this.fileHeader = [
            '# Generated with ❤ by Concordia',
            '#',
            '# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !',
            ''
        ];
        // Loads/gets the dictionary according to the current language
        let langContent = _languageContentLoader.load(language);
        this._dict = langContent.keywords || new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
    }
    /**
     * Generates lines from a document.
     *
     * @param doc Document
     * @param errors Errors found, probably because of language loading.
     * @param ignoreHeader If true, does not include the header.
     * @param indentation Characters used as indentation. Defaults to double spaces.
     */
    createLinesFromDoc(doc, errors, ignoreHeader = false, indentation = '  ') {
        let dict = this._dict;
        let lines = [];
        // Add header lines
        if (!ignoreHeader) {
            lines.push.apply(lines, this.fileHeader);
        }
        let lineNumber = 1 + lines.length;
        // Generate language, if declared
        if (doc.language) {
            // Get dictionary
            dict = this.dictionaryForLanguage(doc.language.value, errors) || this._dict;
            // Transform to text
            let line = this.generateLanguageLine(doc.language.value, dict);
            // Adjust location
            doc.language.location = {
                line: lineNumber++,
                column: 1 + line.length - line.trimLeft().length
            };
            lines.push(line);
            lines.push(''); // empty line
        }
        lineNumber++;
        // Imports
        for (let imp of doc.imports || []) {
            // Transform to text
            let line = this.generateImportLine(imp.value, dict);
            // Adjust location
            imp.location = {
                line: lineNumber++,
                column: 1 + line.length - line.trimLeft().length
            };
            lines.push(line);
        }
        let lastLineNumber = lineNumber;
        // Test Cases
        let lastTagsContent = '';
        for (let testCase of doc.testCases || []) {
            lines.push(''); // empty line
            let newTagsContent = testCase.tags.map(t => (t.content || '')).join('');
            if (lastTagsContent != newTagsContent) {
                if (lastTagsContent !== '') {
                    lines.push(Symbols_1.Symbols.COMMENT_PREFIX + ' ' + '-'.repeat(80 - 2));
                    lines.push(''); // empty line
                }
                lastTagsContent = newTagsContent;
            }
            // Tags
            for (let tag of testCase.tags || []) {
                // Transform to text
                let line = this.generateTagLine(tag.name, tag.content);
                // Adjust location
                tag.location = {
                    line: lineNumber++,
                    column: 1 + line.length - line.trimLeft().length
                };
                lines.push(line);
            }
            // Header
            let line = this.generateTestCaseHeader(testCase.name, dict);
            lines.push(line);
            // Adjust location
            if ((testCase.tags || []).length < 1) {
                testCase.location = {
                    line: lineNumber++,
                    column: 1 + line.length - line.trimLeft().length
                };
            }
            else {
                testCase.location = {
                    line: testCase.tags[testCase.tags.length - 1].location.line - 1,
                    column: 1 + line.length - line.trimLeft().length
                };
                lineNumber++;
            }
            lineNumber++;
            // Sentences
            for (let sentence of testCase.sentences || []) {
                if (!sentence) {
                    continue;
                }
                // Transform to text
                let ind = indentation;
                if (NodeTypes_1.NodeTypes.STEP_AND === sentence.nodeType) {
                    ind += indentation;
                }
                let line = ind + sentence.content +
                    (!sentence.comment ? '' : '  ' + Symbols_1.Symbols.COMMENT_PREFIX + sentence.comment);
                // Adjust location
                sentence.location = {
                    line: lineNumber++,
                    column: 1 + line.length - line.trimLeft().length
                };
                lines.push(line);
            }
        }
        return lines;
    }
    dictionaryForLanguage(language, errors) {
        try {
            return this._languageContentLoader.load(language).keywords || null;
        }
        catch (err) {
            errors.push(err);
            return null;
        }
    }
    generateLanguageLine(language, dict) {
        return Symbols_1.Symbols.COMMENT_PREFIX +
            (!dict.language ? 'language' : dict.language[0] || 'language') +
            Symbols_1.Symbols.LANGUAGE_SEPARATOR + language;
    }
    generateImportLine(path, dict) {
        return (!dict.import ? 'import' : dict.import[0] || 'import') + ' ' +
            Symbols_1.Symbols.IMPORT_PREFIX + path + Symbols_1.Symbols.IMPORT_SUFFIX;
    }
    generateTagLine(name, content) {
        return Symbols_1.Symbols.TAG_PREFIX + name + (!content ? '' : '(' + content + ')');
    }
    generateTestCaseHeader(name, dict) {
        return CaseConversor_1.upperFirst(!dict ? 'Test Case' : dict.testCase[0] || 'Test Case') +
            Symbols_1.Symbols.TITLE_SEPARATOR + ' ' + name;
    }
}
exports.TestCaseFileGenerator = TestCaseFileGenerator;
