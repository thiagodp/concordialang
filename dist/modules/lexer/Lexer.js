"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const ast_1 = require("../ast");
const TestEventLexer_1 = require("../lexer/TestEventLexer");
const VariantLexer_1 = require("./VariantLexer");
const DatabasePropertyLexer_1 = require("./DatabasePropertyLexer");
const DatabaseLexer_1 = require("./DatabaseLexer");
const UIPropertyLexer_1 = require("./UIPropertyLexer");
const UIElementLexer_1 = require("./UIElementLexer");
const NodeTypes_1 = require("../req/NodeTypes");
const TestCaseLexer_1 = require("./TestCaseLexer");
const LanguageLexer_1 = require("./LanguageLexer");
const TagLexer_1 = require("./TagLexer");
const ImportLexer_1 = require("./ImportLexer");
const FeatureLexer_1 = require("./FeatureLexer");
const BackgroundLexer_1 = require("./BackgroundLexer");
const ScenarioLexer_1 = require("./ScenarioLexer");
const StepGivenLexer_1 = require("./StepGivenLexer");
const StepWhenLexer_1 = require("./StepWhenLexer");
const StepThenLexer_1 = require("./StepThenLexer");
const StepAndLexer_1 = require("./StepAndLexer");
const StepOtherwiseLexer_1 = require("./StepOtherwiseLexer");
const TextLexer_1 = require("./TextLexer");
const RegexBlockLexer_1 = require("./RegexBlockLexer");
const RegexLexer_1 = require("./RegexLexer");
const ConstantBlockLexer_1 = require("./ConstantBlockLexer");
const ConstantLexer_1 = require("./ConstantLexer");
const TableLexer_1 = require("./TableLexer");
const TableRowLexer_1 = require("./TableRowLexer");
const LongStringLexer_1 = require("./LongStringLexer");
const VariantBackgroundLexer_1 = require("./VariantBackgroundLexer");
/**
 * Lexer
 *
 * @author Thiago Delgado Pinto
 */
class Lexer {
    /**
     * Constructs the lexer.
     *
     * @param _defaultLanguage Default language (e.g.: "en")
     * @param _languageContentLoader Language content loader.
     * @param _stopOnFirstError True for stopping on the first error found.
     *
     * @throws Error if the given default language could not be found.
     */
    constructor(_defaultLanguage, _languageContentLoader, _stopOnFirstError = false) {
        this._defaultLanguage = _defaultLanguage;
        this._languageContentLoader = _languageContentLoader;
        this._stopOnFirstError = _stopOnFirstError;
        this._nodes = [];
        this._errors = [];
        this._lexers = [];
        this._lexersMap = new Map(); // iterable in insertion order
        this._lastLexer = null;
        this._tagSubLexers = [];
        this._inLongString = false;
        this._mustRecognizeAsText = false;
        const dictionary = this.loadDictionary(_defaultLanguage); // may throw Error
        if (!dictionary) {
            throw new Error('Cannot load a dictionary for the language: ' + _defaultLanguage);
        }
        this._tagSubLexers = [
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.IGNORE, dictionary.tagIgnore),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.GENERATED, dictionary.tagGenerated),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.FAIL, dictionary.tagFail),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.SCENARIO, dictionary.tagScenario),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.VARIANT, dictionary.tagVariant),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.FEATURE, dictionary.tagFeature),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.GENERATE_ONLY_VALID_VALUES, dictionary.tagGenerateOnlyValidValues),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.IMPORTANCE, dictionary.tagImportance),
            new TagLexer_1.TagSubLexer(ast_1.ReservedTags.GLOBAL, dictionary.tagGlobal)
        ];
        this._lexers = [
            new LongStringLexer_1.LongStringLexer(),
            new LanguageLexer_1.LanguageLexer(dictionary.language),
            new TagLexer_1.TagLexer(this._tagSubLexers),
            new ImportLexer_1.ImportLexer(dictionary.import),
            new FeatureLexer_1.FeatureLexer(dictionary.feature),
            new BackgroundLexer_1.BackgroundLexer(dictionary.background),
            new VariantBackgroundLexer_1.VariantBackgroundLexer(dictionary.variantBackground),
            new ScenarioLexer_1.ScenarioLexer(dictionary.scenario),
            new StepGivenLexer_1.StepGivenLexer(dictionary.stepGiven),
            new StepWhenLexer_1.StepWhenLexer(dictionary.stepWhen),
            new StepThenLexer_1.StepThenLexer(dictionary.stepThen),
            new StepAndLexer_1.StepAndLexer(dictionary.stepAnd),
            new StepOtherwiseLexer_1.StepOtherwiseLexer(dictionary.stepOtherwise),
            new VariantLexer_1.VariantLexer(dictionary.variant),
            new TestCaseLexer_1.TestCaseLexer(dictionary.testCase),
            new ConstantBlockLexer_1.ConstantBlockLexer(dictionary.constantBlock),
            new ConstantLexer_1.ConstantLexer(dictionary.is) // "name" is "value"
            ,
            new RegexBlockLexer_1.RegexBlockLexer(dictionary.regexBlock),
            new RegexLexer_1.RegexLexer(dictionary.is) // "name" is "value"
            ,
            new TableLexer_1.TableLexer(dictionary.table),
            new TableRowLexer_1.TableRowLexer(),
            new UIElementLexer_1.UIElementLexer(dictionary.uiElement),
            new UIPropertyLexer_1.UIPropertyLexer(),
            new DatabaseLexer_1.DatabaseLexer(dictionary.database),
            new DatabasePropertyLexer_1.DatabasePropertyLexer(),
            new TestEventLexer_1.BeforeAllLexer(dictionary.beforeAll),
            new TestEventLexer_1.AfterAllLexer(dictionary.afterAll),
            new TestEventLexer_1.BeforeFeatureLexer(dictionary.beforeFeature),
            new TestEventLexer_1.AfterFeatureLexer(dictionary.afterFeature),
            new TestEventLexer_1.BeforeEachScenarioLexer(dictionary.beforeEachScenario),
            new TestEventLexer_1.AfterEachScenarioLexer(dictionary.afterEachScenario),
            new TextLexer_1.TextLexer() // captures any non-empty
        ];
        // Building the map
        for (let lex of this._lexers) {
            this._lexersMap.set(lex.nodeType(), lex);
        }
    }
    defaultLanguage() {
        return this._defaultLanguage;
    }
    reset() {
        this._nodes = [];
        this._errors = [];
        this._inLongString = false;
        this._mustRecognizeAsText = false;
        // Also resets language to the defined default
        this.changeLanguage(this.defaultLanguage());
    }
    nodes() {
        return this._nodes;
    }
    hasErrors() {
        return this._errors.length > 0;
    }
    errors() {
        return this._errors;
    }
    stopOnFirstError(stop) {
        if (stop !== undefined) {
            this._stopOnFirstError = stop;
        }
        return this._stopOnFirstError;
    }
    /**
     * Returns true if the lexer was configured to stop on the first error
     * and an error was found.
     */
    shouldStop() {
        return this._stopOnFirstError && this._errors.length > 0;
    }
    longStringDetected() {
        this._inLongString = !this._inLongString;
        this._mustRecognizeAsText = !this._mustRecognizeAsText;
    }
    mustRecognizeAsText() {
        return this._mustRecognizeAsText;
    }
    changeResultToRecognizedAsText(result) {
        result.errors = [];
        result.warnings = [];
        for (let node of result.nodes) {
            node.nodeType = NodeTypes_1.NodeTypes.TEXT;
        }
    }
    /**
     * Tries to add a node from the given line. Returns true if added.
     *
     * @param line Line to be analyzed
     * @param lineNumber Line number
     */
    addNodeFromLine(line, lineNumber) {
        if (this.shouldStop()) {
            return false;
        }
        if (0 === line.trim().length) { // Ignore empty lines
            return false;
        }
        let result;
        // Analyze with lexers of the suggested node types
        if (this._lastLexer !== null) {
            const suggestedNodeTypes = this._lastLexer.suggestedNextNodeTypes();
            for (let nodeType of suggestedNodeTypes) {
                // Ignores text
                if (NodeTypes_1.NodeTypes.TEXT === nodeType) {
                    continue; // next lexer
                }
                let lexer = this._lexersMap.get(nodeType);
                if (!lexer) {
                    continue; // next lexer
                }
                result = lexer.analyze(line, lineNumber);
                if (!result) {
                    continue; // next lexer
                }
                // Stores the last valid lexer
                this._lastLexer = lexer;
                // Add the node and errors
                this.dealWithResult(result);
                return true; // found a node in the line
            }
        }
        // Analyze with all the lexers
        for (let lexer of this._lexers) {
            result = lexer.analyze(line, lineNumber);
            if (!result) {
                continue; // next lexer
            }
            // Stores the last valid lexer
            this._lastLexer = lexer;
            // Add the node and errors
            this.dealWithResult(result);
            return true; // found a node in the line
        }
        return false;
    }
    dealWithResult(result) {
        // Whether a Long String node was detected, indicates it.
        if (result.nodes.length > 0 && NodeTypes_1.NodeTypes.LONG_STRING === result.nodes[0].nodeType) {
            this.longStringDetected();
            // Else whether recognition is disabled, change node type to TEXT
        }
        else if (this.mustRecognizeAsText()) {
            this.changeResultToRecognizedAsText(result);
        }
        // Detects a language node and tries to change the language
        if (result.nodes.length > 0 && NodeTypes_1.NodeTypes.LANGUAGE === result.nodes[0].nodeType) {
            let language = result.nodes[0].value;
            if (language != this._defaultLanguage) { // needs to change ?
                try {
                    this.changeLanguage(language);
                }
                catch (e) {
                    this._errors.push(e);
                }
            }
        }
        // Add the "nodes" array to "_nodes"
        this._nodes.push.apply(this._nodes, result.nodes);
        if (result.errors) {
            // Add the "errors" array to "_errors"
            this._errors.push.apply(this._errors, result.errors);
        }
    }
    /**
     * Tries to add an error message. Returns true if added.
     *
     * @param message Error message to be added
     */
    addErrorMessage(message) {
        if (this.shouldStop()) {
            return false;
        }
        this._errors.push(new Error(message));
        return true;
    }
    /**
     * Change the language (of the internal lexers) iff it could be loaded.
     * This will *not* change the default lexer language.
     *
     * @param language Language
     * @return The loaded keyword dictionary.
     * @throws Error In case of the language is not available.
     */
    changeLanguage(language) {
        let dict = this.loadDictionary(language) // may throw Error
            || {};
        for (let lexer of this._lexers) {
            if (this.isAWordBasedLexer(lexer)) {
                this.updateKeywordBasedLexer(lexer, dict);
            }
        }
        for (let subLexer of this._tagSubLexers) {
            this.updateKeywordBasedLexer(subLexer, dict);
        }
        return dict;
    }
    /**
     * Loads a dictionary
     *
     * @param language Language
     * @throws Error
     */
    loadDictionary(language) {
        const content = this._languageContentLoader.load(language); // may throw Error
        return content ? content.keywords : null;
    }
    isAWordBasedLexer(obj) {
        return obj.updateWords !== undefined;
    }
    updateKeywordBasedLexer(kbl, dict) {
        const nodeType = kbl.affectedKeyword();
        const words = dict[nodeType];
        if (words) {
            kbl.updateWords(words);
        }
    }
}
exports.Lexer = Lexer;
