import { ReservedTags } from '../ast';
import { AfterAllLexer, AfterEachScenarioLexer, AfterFeatureLexer, BeforeAllLexer, BeforeEachScenarioLexer, BeforeFeatureLexer, } from '../lexer/TestEventLexer';
import { NodeTypes } from '../req/NodeTypes';
import { BackgroundLexer } from './BackgroundLexer';
import { ConstantBlockLexer } from './ConstantBlockLexer';
import { ConstantLexer } from './ConstantLexer';
import { DatabaseLexer } from './DatabaseLexer';
import { DatabasePropertyLexer } from './DatabasePropertyLexer';
import { FeatureLexer } from './FeatureLexer';
import { ImportLexer } from './ImportLexer';
import { LanguageLexer } from './LanguageLexer';
import { LongStringLexer } from './LongStringLexer';
import { RegexBlockLexer } from './RegexBlockLexer';
import { RegexLexer } from './RegexLexer';
import { ScenarioLexer } from './ScenarioLexer';
import { StepAndLexer } from './StepAndLexer';
import { StepGivenLexer } from './StepGivenLexer';
import { StepOtherwiseLexer } from './StepOtherwiseLexer';
import { StepThenLexer } from './StepThenLexer';
import { StepWhenLexer } from './StepWhenLexer';
import { TableLexer } from './TableLexer';
import { TableRowLexer } from './TableRowLexer';
import { TagLexer, TagSubLexer } from './TagLexer';
import { TestCaseLexer } from './TestCaseLexer';
import { TextLexer } from './TextLexer';
import { UIElementLexer } from './UIElementLexer';
import { UIPropertyLexer } from './UIPropertyLexer';
import { VariantBackgroundLexer } from './VariantBackgroundLexer';
import { VariantLexer } from './VariantLexer';
/**
 * Lexer
 *
 * @author Thiago Delgado Pinto
 */
export class Lexer {
    /**
     * Constructs the lexer.
     *
     * @param _defaultLanguage Default language (e.g.: "en")
     * @param _languageContentLoader Language content loader.
     * @param _stopOnFirstError True for stopping on the first error found.
     *
     * @throws Error if the given default language could not be found.
     */
    constructor(_defaultLanguage, _languageMap, _stopOnFirstError = false) {
        this._defaultLanguage = _defaultLanguage;
        this._languageMap = _languageMap;
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
            new TagSubLexer(ReservedTags.IGNORE, dictionary.tagIgnore),
            new TagSubLexer(ReservedTags.GENERATED, dictionary.tagGenerated),
            new TagSubLexer(ReservedTags.FAIL, dictionary.tagFail),
            new TagSubLexer(ReservedTags.SCENARIO, dictionary.tagScenario),
            new TagSubLexer(ReservedTags.VARIANT, dictionary.tagVariant),
            new TagSubLexer(ReservedTags.FEATURE, dictionary.tagFeature),
            new TagSubLexer(ReservedTags.GENERATE_ONLY_VALID_VALUES, dictionary.tagGenerateOnlyValidValues),
            new TagSubLexer(ReservedTags.IMPORTANCE, dictionary.tagImportance),
            new TagSubLexer(ReservedTags.GLOBAL, dictionary.tagGlobal)
        ];
        this._lexers = [
            new LongStringLexer(),
            new LanguageLexer(dictionary.language),
            new TagLexer(this._tagSubLexers),
            new ImportLexer(dictionary.import),
            new FeatureLexer(dictionary.feature),
            new BackgroundLexer(dictionary.background),
            new VariantBackgroundLexer(dictionary.variantBackground),
            new ScenarioLexer(dictionary.scenario),
            new StepGivenLexer(dictionary.stepGiven),
            new StepWhenLexer(dictionary.stepWhen),
            new StepThenLexer(dictionary.stepThen),
            new StepAndLexer(dictionary.stepAnd),
            new StepOtherwiseLexer(dictionary.stepOtherwise),
            new VariantLexer(dictionary.variant),
            new TestCaseLexer(dictionary.testCase),
            new ConstantBlockLexer(dictionary.constantBlock),
            new ConstantLexer(dictionary.is) // "name" is "value"
            ,
            new RegexBlockLexer(dictionary.regexBlock),
            new RegexLexer(dictionary.is) // "name" is "value"
            ,
            new TableLexer(dictionary.table),
            new TableRowLexer(),
            new UIElementLexer(dictionary.uiElement),
            new UIPropertyLexer(),
            new DatabaseLexer(dictionary.database),
            new DatabasePropertyLexer(),
            new BeforeAllLexer(dictionary.beforeAll),
            new AfterAllLexer(dictionary.afterAll),
            new BeforeFeatureLexer(dictionary.beforeFeature),
            new AfterFeatureLexer(dictionary.afterFeature),
            new BeforeEachScenarioLexer(dictionary.beforeEachScenario),
            new AfterEachScenarioLexer(dictionary.afterEachScenario),
            new TextLexer() // captures any non-empty
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
            node.nodeType = NodeTypes.TEXT;
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
                if (NodeTypes.TEXT === nodeType) {
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
        if (result.nodes.length > 0 && NodeTypes.LONG_STRING === result.nodes[0].nodeType) {
            this.longStringDetected();
            // Else whether recognition is disabled, change node type to TEXT
        }
        else if (this.mustRecognizeAsText()) {
            this.changeResultToRecognizedAsText(result);
        }
        // Detects a language node and tries to change the language
        if (result.nodes.length > 0 && NodeTypes.LANGUAGE === result.nodes[0].nodeType) {
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
     */
    loadDictionary(language) {
        return this._languageMap[language]?.keywords;
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
