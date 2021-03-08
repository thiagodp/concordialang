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
exports.FeatureSSA = void 0;
const deepcopy = require("deepcopy");
const QueryParser_1 = require("../db/QueryParser");
const RuntimeException_1 = require("../error/RuntimeException");
const SemanticException_1 = require("../error/SemanticException");
const Entities_1 = require("../nlp/Entities");
const VariantStateDetector_1 = require("../testscenario/VariantStateDetector");
const TypeChecking_1 = require("../util/TypeChecking");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Analyzes Features and its cross-document declarations.
 *
 * It checks for:
 * - duplicated names of Features
 * - duplicated names of GLOBAL UI Elements
 * - UI elements' references
 * - Variants Preconditions
 *
 * It changes:
 * - make a cache of UI Elements for the Spec
 * - retrieve UI Element references' values
 *
 * @author Thiago Delgado Pinto
 */
class FeatureSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(problems, spec, graph) {
        return __awaiter(this, void 0, void 0, function* () {
            // DUPLICATED FEATURE NAMES
            const errors1 = [];
            this._checker.checkDuplicatedNamedNodes(spec.features(), errors1, 'feature');
            const ok1 = 0 === errors1.length;
            if (!ok1) {
                problems.addGenericError(...errors1);
            }
            // DUPLICATED GLOBAL UI ELEMENTS
            const errors2 = [];
            this._checker.checkDuplicatedNamedNodes(spec.uiElements(), errors2, 'global UI Element');
            const ok2 = 0 === errors2.length;
            if (!ok2) {
                problems.addGenericError(...errors2);
            }
            // REFERENCES
            const ok3 = this.analyzeReferences(problems, spec, graph);
            return ok1 && ok2 && ok3;
        });
    }
    analyzeReferences(problems, spec, graph) {
        // Since the graph is being traversed in topological order,
        // the current document should only contain UI elements with
        // properties that refer already mapped UI Elements.
        let hasError = false;
        const availableStates = new Map();
        for (let [/* key */ , value] of graph.vertices_topologically()) {
            let doc = value;
            if (!doc) {
                continue;
            }
            // Maps documents' declarations
            // spec.mapEverythingFromDocument( doc );
            const ok1 = this.detectPreconditionsWithoutProducers(problems, spec, doc, availableStates);
            // Analyzes all the references from UIProperties to UI Elements, including
            // queries, tables, databases, constants and features
            const ok2 = this.analyzePropertiesReferences(doc, spec, problems);
            if (!ok1 || !ok2) {
                hasError = true;
            }
        }
        return !hasError;
    }
    /**
     * Detect precondition without producers.
     * Returns true if no problems are found.
     *
     * @param problems Problems.
     * @param spec Specification.
     * @param doc Current document.
     * @param availableStates Maps files to their available states.
     */
    detectPreconditionsWithoutProducers(problems, spec, doc, availableStates) {
        if (!doc.feature ||
            !doc.feature.scenarios ||
            doc.feature.scenarios.length < 1) {
            return true;
        }
        const path = doc.fileInfo.path;
        // States of the current file
        let states = availableStates.get(path);
        if (!states) {
            states = new Set();
            availableStates.set(path, states);
        }
        const checkStates = (v, variantStates, stateName, errors) => {
            if (!variantStates || variantStates.length < 1) {
                return;
            }
            for (const st of variantStates) {
                // Check the state in the same file
                if (states.has(st.name)) {
                    continue;
                }
                const importedDocs = spec.importedDocumentsOf(doc);
                let found = false;
                for (const d of importedDocs) {
                    const importedStates = availableStates.get(d.fileInfo.path);
                    if (importedStates && importedStates.has(st.name)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    st.notFound = true; // Mark as not found
                    const msg = `${stateName} not found: ${st.name}`;
                    const step = v.sentences[st.stepIndex];
                    const err = new RuntimeException_1.RuntimeException(msg, step.location);
                    errors.push(err);
                }
            }
        };
        const detector = new VariantStateDetector_1.VariantStateDetector();
        const errors = [];
        for (const sc of doc.feature.scenarios) {
            if (!sc.variants || sc.variants.length < 1) {
                continue;
            }
            for (const v of sc.variants) {
                detector.update(v); // Fill variant's properties
                // Add variant's postconditions to the map
                if (v.postconditions && v.postconditions.length > 0) {
                    v.postconditions.forEach(s => states.add(s.name));
                }
                checkStates(v, v.preconditions, 'Precondition', errors);
                checkStates(v, v.stateCalls, 'State', errors);
            }
        }
        if (errors.length > 0) {
            problems.addError(path, ...errors);
            return false;
        }
        return true;
    }
    analyzePropertiesReferences(doc, spec, problems) {
        let errors = [];
        // Analyze UI elements from the Feature, when declared
        if (TypeChecking_1.isDefined(doc.feature)) {
            for (let uie of doc.feature.uiElements || []) {
                this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
            }
        }
        // Analyze GLOBAL UI elements
        for (let uie of doc.uiElements || []) {
            this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
        }
        if (errors.length > 0) {
            problems.addError(doc.fileInfo.path, ...errors);
            return false;
        }
        return true;
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
exports.FeatureSSA = FeatureSSA;
