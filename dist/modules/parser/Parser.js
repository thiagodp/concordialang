"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ListItemParser_1 = require("./ListItemParser");
const TableRowParser_1 = require("./TableRowParser");
const ConstantBlockParser_1 = require("./ConstantBlockParser");
const RegexBlockParser_1 = require("./RegexBlockParser");
const FeatureParser_1 = require("./FeatureParser");
const NodeTypes_1 = require("../req/NodeTypes");
const LanguageParser_1 = require("./LanguageParser");
const NodeIterator_1 = require("./NodeIterator");
const ParsingContext_1 = require("./ParsingContext");
const BackgroundParser_1 = require("./BackgroundParser");
const ScenarioParser_1 = require("./ScenarioParser");
const VariantParser_1 = require("./VariantParser");
const TestCaseParser_1 = require("./TestCaseParser");
const ImportParser_1 = require("./ImportParser");
const StepWhenParser_1 = require("./StepWhenParser");
const StepGivenParser_1 = require("./StepGivenParser");
const StepThenParser_1 = require("./StepThenParser");
const StepAndParser_1 = require("./StepAndParser");
const StepOtherwiseParser_1 = require("./StepOtherwiseParser");
const UIElementParser_1 = require("./UIElementParser");
const TableParser_1 = require("./TableParser");
const DatabaseParser_1 = require("./DatabaseParser");
const VariantBackgroundParser_1 = require("./VariantBackgroundParser");
/**
 * Builds an AST from the nodes detected by the lexer. It checks syntatic properties
 * of the model (e.g. the order of appearance), but it does not check semantic properties
 * (e.g. check if a import file exists).
 *
 * @author Thiago Delgado Pinto
 */
class Parser {
    constructor(_stopOnFirstError = false) {
        this._stopOnFirstError = _stopOnFirstError;
        this._errors = [];
        this._parsersMap = {};
        this._parsersMap[NodeTypes_1.NodeTypes.LANGUAGE] = new LanguageParser_1.LanguageParser();
        this._parsersMap[NodeTypes_1.NodeTypes.IMPORT] = new ImportParser_1.ImportParser();
        this._parsersMap[NodeTypes_1.NodeTypes.FEATURE] = new FeatureParser_1.FeatureParser();
        this._parsersMap[NodeTypes_1.NodeTypes.BACKGROUND] = new BackgroundParser_1.BackgroundParser();
        this._parsersMap[NodeTypes_1.NodeTypes.VARIANT_BACKGROUND] = new VariantBackgroundParser_1.VariantBackgroundParser();
        this._parsersMap[NodeTypes_1.NodeTypes.SCENARIO] = new ScenarioParser_1.ScenarioParser();
        this._parsersMap[NodeTypes_1.NodeTypes.STEP_GIVEN] = new StepGivenParser_1.StepGivenParser();
        this._parsersMap[NodeTypes_1.NodeTypes.STEP_WHEN] = new StepWhenParser_1.StepWhenParser();
        this._parsersMap[NodeTypes_1.NodeTypes.STEP_THEN] = new StepThenParser_1.StepThenParser();
        this._parsersMap[NodeTypes_1.NodeTypes.STEP_AND] = new StepAndParser_1.StepAndParser();
        this._parsersMap[NodeTypes_1.NodeTypes.STEP_OTHERWISE] = new StepOtherwiseParser_1.StepOtherwiseParser();
        this._parsersMap[NodeTypes_1.NodeTypes.CONSTANT_BLOCK] = new ConstantBlockParser_1.ConstantBlockParser();
        this._parsersMap[NodeTypes_1.NodeTypes.CONSTANT] = new ListItemParser_1.ListItemParser();
        this._parsersMap[NodeTypes_1.NodeTypes.REGEX_BLOCK] = new RegexBlockParser_1.RegexBlockParser();
        this._parsersMap[NodeTypes_1.NodeTypes.REGEX] = new ListItemParser_1.ListItemParser();
        this._parsersMap[NodeTypes_1.NodeTypes.TABLE] = new TableParser_1.TableParser();
        this._parsersMap[NodeTypes_1.NodeTypes.TABLE_ROW] = new TableRowParser_1.TableRowParser();
        this._parsersMap[NodeTypes_1.NodeTypes.UI_ELEMENT] = new UIElementParser_1.UIElementParser();
        this._parsersMap[NodeTypes_1.NodeTypes.UI_PROPERTY] = new ListItemParser_1.ListItemParser();
        this._parsersMap[NodeTypes_1.NodeTypes.DATABASE] = new DatabaseParser_1.DatabaseParser();
        this._parsersMap[NodeTypes_1.NodeTypes.DATABASE_PROPERTY] = new ListItemParser_1.ListItemParser();
        this._parsersMap[NodeTypes_1.NodeTypes.VARIANT] = new VariantParser_1.VariantParser();
        this._parsersMap[NodeTypes_1.NodeTypes.TEST_CASE] = new TestCaseParser_1.TestCaseParser();
    }
    reset() {
        this._errors = [];
    }
    stopOnFirstError(stop) {
        if (stop !== undefined) {
            this._stopOnFirstError = stop;
        }
        return this._stopOnFirstError;
    }
    hasErrors() {
        return this._errors.length > 0;
    }
    errors() {
        return this._errors;
    }
    /**
     * Analyze the given nodes and fill the document with the AST. Returns
     * ignored TokenTypes, that were not parsed because of the lack of parsers.
     *
     * @param nodes Nodes to be analyzed.
     * @param doc Document where to put the AST.
     */
    analyze(nodes, doc) {
        this.reset();
        let ignoredTokenTypes = [];
        let it = new NodeIterator_1.NodeIterator(nodes);
        let errors = [];
        let node = null;
        let nodeParser = null;
        let context = new ParsingContext_1.ParsingContext(doc);
        while (it.hasNext()) {
            node = it.next();
            // Retrieves the parser
            nodeParser = this._parsersMap[node.nodeType];
            if (!nodeParser) {
                // Remember ignored TokenTypes
                ignoredTokenTypes.push(node.nodeType);
                continue;
            }
            // Parses the current node
            nodeParser.analyze(node, context, it, errors);
            // Stop if needed
            if (this._stopOnFirstError && errors.length > 0) {
                break;
            }
        }
        // Add the "errors" array to "_errors"
        this._errors.push.apply(this._errors, errors);
        return ignoredTokenTypes;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map