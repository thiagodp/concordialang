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
exports.UIElementSSA = void 0;
const deepcopy = require("deepcopy");
const Entities_1 = require("../nlp/Entities");
const QueryParser_1 = require("../db/QueryParser");
const TypeChecking_1 = require("../util/TypeChecking");
const SemanticException_1 = require("./SemanticException");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Executes semantic analysis of UI Elements in a specification.
 *
 * Checkings:
 * - duplicated names of global UI Elements
 * - references to declarations
 *
 * Changes:
 * - make a cache of UI Elements for the Spec
 * - retrieve references' values
 *
 * @author Thiago Delgado Pinto
 */
class UIElementSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(graph, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checker.checkDuplicatedNamedNodes(spec.uiElements(), errors, 'global UI Element');
            this.retriveReferences(graph, spec, errors);
        });
    }
    retriveReferences(graph, spec, errors) {
        // Since the graph is being traversed in topological order, according
        // to Imports declarations, the current document should only contain
        // UI elements with properties that may refer to already mapped UI Elements.
        // Otherwise, errors must are registred.
        for (let [/* key */ , value] of graph.vertices_topologically()) {
            let doc = value;
            // Maps documents' declarations
            spec.mapEverythingFromDocument(doc);
            // Analyzes all the references from UIProperties to UI Elements, including
            // queries, tables, databases, constants and features
            this.analyzePropertiesReferences(doc, spec, errors);
        }
    }
    analyzePropertiesReferences(doc, spec, errors) {
        if (!doc) {
            return;
        }
        // Analyze those UI elements of the Feature, if it is declared
        if (TypeChecking_1.isDefined(doc.feature)) {
            for (let uie of doc.feature.uiElements || []) {
                this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
            }
        }
        // Analyze global UI elements
        for (let uie of doc.uiElements || []) {
            this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
        }
    }
    analyzePropertiesReferencesOf(uie, doc, spec, errors) {
        for (let uiProperty of uie.items || []) {
            if (!uiProperty) {
                continue;
            }
            const propValue = uiProperty.value;
            if (!propValue) {
                continue;
            }
            const content = propValue.value.toString();
            // We will just deal with references to declarations!
            switch (propValue.entity) {
                case Entities_1.Entities.CONSTANT: {
                    this.analyzeConstant(content, uiProperty, doc, spec, propValue.references, errors);
                    break;
                }
                case Entities_1.Entities.UI_ELEMENT_REF: {
                    this.analyzeUIElement(content, uiProperty, doc, spec, propValue.references, errors);
                    break;
                }
                case Entities_1.Entities.QUERY: {
                    this.analyzeQuery(content, uiProperty, doc, spec, propValue.references, errors);
                    break;
                }
                // No default!
            }
        }
    }
    analyzeConstant(variable, uiProperty, doc, spec, references, errors) {
        const node = spec.constantWithName(variable);
        if (TypeChecking_1.isDefined(node)) {
            references.push(node);
        }
        else {
            const msg = 'Referenced constant not found: ' + variable;
            errors.push(this.makeError(msg, uiProperty.location, doc));
        }
    }
    analyzeUIElement(variable, uiProperty, doc, spec, references, errors) {
        const node = spec.uiElementByVariable(variable, doc);
        if (TypeChecking_1.isDefined(node)) {
            references.push(node);
        }
        else {
            const msg = 'Referenced UI Element not found: ' + variable;
            errors.push(this.makeError(msg, uiProperty.location, doc));
        }
    }
    analyzeQuery(query, uiProperty, doc, spec, references, errors) {
        const queryParser = new QueryParser_1.QueryParser(); // stateless
        // Databases, tables or constants. Their names are unique.
        const names = Array.from(new Set(queryParser.parseAnyNames(query)));
        this.analyzeNames(names, uiProperty, doc, spec, references, errors);
        // UI elements
        const variables = Array.from(new Set(queryParser.parseAnyVariables(query)));
        for (let v of variables) {
            this.analyzeUIElement(v, uiProperty, doc, spec, references, errors);
        }
    }
    analyzeNames(names, uiProperty, doc, spec, references, errors) {
        for (let name of names || []) {
            let node = null;
            // Constant ?
            node = spec.constantWithName(name);
            // Table ?
            if (!node) {
                node = spec.tableWithName(name);
            }
            // Database ?
            if (!node) {
                node = spec.databaseWithName(name);
            }
            // Not found? Error!
            if (!node) {
                const msg = 'Referenced name not found: ' + name;
                errors.push(this.makeError(msg, uiProperty.location, doc));
                // Otherwise, adds the reference
            }
            else {
                references.push(node);
            }
        }
    }
    makeError(msg, location, doc) {
        let loc = deepcopy(location);
        if (!loc.filePath) {
            loc.filePath = doc.fileInfo.path;
        }
        return new SemanticException_1.SemanticException(msg, loc);
    }
}
exports.UIElementSSA = UIElementSSA;
