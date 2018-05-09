"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SemanticException_1 = require("./SemanticException");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
const path = require("path");
const deepcopy = require("deepcopy");
const EnglishKeywordDictionary_1 = require("../dict/EnglishKeywordDictionary");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * Executes semantic analysis of Test Cases in a specification.
 *
 * Checkings:
 *
 *  - A Test Case from a document without a Feature should:
 *    - Import a single file with a Feature OR
 *    - Import multiple files BUT have a tag @feature( <name> )
 *
 *  - Duplicated Test Case names
 *
 *  - Tag @variant without a tag @scenario
 *
 *  - Content of the tag @scenarios must be number greater than zero,
 *    and less than the number of scenarios in the feature.
 *
 *  - Content of the tag @variant must be number greater than zero,
 *    and less than the number of variant in the scenario.
 *
 * Changes:
 *
 *  - Tag @generated turns the flag 'generated' to true.
 *
 *  - Tag @scenario( <index> ) changes the property 'declaredScenarioIndex'
 *    when it is a number greater than zero.
 *
 *  - Tag @variant( <index> ) changes the property 'declaredVariantIndex'
 *    when it is a number greater than zero.
 *
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    // TODO: change it to receive a dictionary loader, according to the analyzed doc
    constructor(_keywords = new EnglishKeywordDictionary_1.EnglishKeywordDictionary()) {
        super();
        this._keywords = _keywords;
    }
    /** @inheritDoc */
    analyze(graph, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let doc of spec.docs) {
                this.analyzeDocument(spec, doc, errors);
            }
        });
    }
    analyzeDocument(spec, doc, errors) {
        // No Test Cases -> exit
        if (!doc.testCases || doc.testCases.length < 1) {
            return;
        }
        const hasFeature = TypeChecking_1.isDefined(doc.feature);
        const hasImport = TypeChecking_1.isDefined(doc.imports) && doc.imports.length > 0;
        // No Feature or Imports declared
        if (!hasFeature && !hasImport) {
            let firstTestCase = doc.testCases[0];
            const msg = 'No imports or feature declared before the test case.';
            const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(firstTestCase.location, doc.fileInfo.path));
            errors.push(err);
            return;
        }
        else if (hasFeature) {
            let availableFeatures = [doc.feature];
            let availableFeatureNames = [doc.feature.name.toLowerCase()];
            let availableFeaturePaths = doc.fileInfo ? [doc.fileInfo.path || ''] : [''];
            for (let testCase of doc.testCases) {
                this.checkFeatureTags(spec, doc, testCase, availableFeatures, availableFeatureNames, availableFeaturePaths, errors);
            }
        }
        else if (hasImport) {
            if (1 == doc.imports.length) {
                const singleImport = doc.imports[0];
                this.processSingleImport(spec, doc, singleImport, errors);
            }
            else {
                this.processMultipleImports(spec, doc, errors);
            }
        }
        // Duplicated test case names
        this._checker.checkDuplicatedNamedNodes(doc.testCases, errors, 'Test Case');
        // @variant without @scenario, tag values, @generated
        this.checkOtherTags(doc.testCases, spec, doc, errors);
    }
    processSingleImport(spec, doc, docImport, errors) {
        let feature = this.featureFromImport(spec, doc, docImport, errors);
        // It must have a feature
        if (!feature) {
            const msg = 'Imported document does not have a feature.';
            const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(docImport.location, doc.fileInfo.path));
            errors.push(err);
            return false;
        }
        return true;
    }
    featureFromImport(spec, doc, docImport, errors) {
        // Gets the imported document
        const filePath = docImport.value;
        const importedDoc = spec.docWithPath(filePath, doc.fileInfo.path);
        if (!importedDoc) {
            const msg = 'Imported document path not resolved: "' + filePath + '".';
            const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(docImport.location, doc.fileInfo.path));
            errors.push(err);
            return null;
        }
        return importedDoc.feature;
    }
    processMultipleImports(spec, doc, errors) {
        // Sanity checking
        if (0 === doc.imports.length) {
            return false;
        }
        // Gets available features
        let availableFeatures = [];
        let availableFeatureNames = [];
        let availableFeaturePaths = [];
        for (let docImport of doc.imports) {
            let feature = this.featureFromImport(spec, doc, docImport, errors);
            if (feature) {
                availableFeatures.push(feature);
                availableFeatureNames.push(feature.name.toLowerCase()); // Lower case
                availableFeaturePaths.push(docImport.value);
            }
        }
        // Checks the number of available features
        if (0 === availableFeatures.length) {
            const msg = 'None of the imported files has features.';
            const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(doc.imports[0].location, doc.fileInfo.path));
            errors.push(err);
            return false;
        }
        // Each variant must have a tag that references a feature
        // and the feature must exist in the imported files
        for (let variant of doc.testCases) {
            this.checkFeatureTags(spec, doc, variant, availableFeatures, availableFeatureNames, availableFeaturePaths, errors);
        }
        return true;
    }
    checkFeatureTags(spec, doc, testCases, availableFeatures, availableFeatureNames, availableFeaturePaths, errors) {
        // Sanity checking
        if (!testCases.tags) {
            testCases.tags = [];
        }
        const singleFeature = 1 === availableFeatures.length;
        // A Test Case must have a reference to a Feature, since no feature is declared in the file.
        // The referenced Feature must exist in a imported file.
        let featureName = null;
        let featureTag = null;
        for (let tag of testCases.tags) {
            // Found a tag @feature ? -> get the feature name
            if (this.isFeatureTag(tag.name)) {
                featureTag = tag;
                featureName = tag.content;
                break;
            }
        }
        if (singleFeature) {
            if (!featureName) {
                // Considers the available one
                featureName = availableFeatureNames[0];
            }
            // continue to check the feature
        }
        else {
            if (!featureName) {
                const msg = 'Test case has no tag that refers to its feature.';
                const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(testCases.location, doc.fileInfo.path));
                errors.push(err);
                return false;
            }
            // continue to check the feature
        }
        featureName = featureName.toLowerCase();
        // Not available -> error
        const featureIndex = availableFeatureNames.indexOf(featureName);
        if (featureIndex < 0) {
            const msg = 'Tag refers to a non existing feature.';
            const err = new SemanticException_1.SemanticException(msg, this.makeLocationWithPath(featureTag.location, doc.fileInfo.path));
            errors.push(err);
            return false;
        }
        let feature = availableFeatures[featureIndex];
        let featureFilePath = availableFeaturePaths[featureIndex];
        if (spec.basePath) {
            // Normalizes the path, according to the base path
            featureFilePath = path.join(spec.basePath, featureFilePath);
        }
        return true;
    }
    makeLocationWithPath(location, path) {
        let loc = !location ? {} : deepcopy(location);
        loc.filePath = path;
        return loc;
    }
    checkOtherTags(testCases, spec, doc, errors) {
        const msgNoFeature = 'Feature found.';
        const msgNoScenarios = 'The referenced Feature does not have Scenarios';
        const msgNoScenarioTag = 'Test Case has tag @variant but it does not have a tag @scenario. Please declare it.';
        const msgMinScenarioIndex = 'The index informed in @scenario is less than 1.';
        const msgMaxScenarioIndex = 'The index informed in @scenario is greater than the number of scenarios.';
        const msgNoScenario = 'No Scenario with the informed index.';
        const msgNoVariants = 'No Variants in the referenced Scenario.';
        const msgMinVariantIndex = 'The index informed in @variant is less than 1.';
        const msgMaxVariantIndex = 'The index informed in @variant is greater than the number of variants in the scenario.';
        for (let tc of testCases || []) {
            let hasFeatureTag = false;
            let hasScenarioTag = false;
            let hasVariantTag = false;
            for (let tag of tc.tags || []) {
                if (!hasFeatureTag && this.isFeatureTag(tag.name)) {
                    hasFeatureTag = true;
                    tc.declaredFeatureName = tag.content;
                }
                if (!hasScenarioTag && this.isScenarioTag(tag.name)) {
                    hasScenarioTag = true;
                    // Change the test case!
                    tc.declaredScenarioIndex = this.detectTagContentAsIndex(tag, errors); // 1+ or null
                }
                if (!hasVariantTag && this.isVariantTag(tag.name)) {
                    hasVariantTag = true;
                    // Change the test case!
                    tc.declaredVariantIndex = this.detectTagContentAsIndex(tag, errors); // 1+ or null
                }
                if (this.isGeneratedTag(tag.name)) {
                    // Change the test case!
                    tc.generated = true;
                }
            }
            // console.log( 'doc -> ', doc.fileInfo.path );
            // console.log( 'feature -> ', tc.declaredFeatureName );
            // console.log( 'scenario -> ', tc.declaredScenarioIndex );
            // console.log( 'variant -> ', tc.declaredVariantIndex );
            let feature = doc.feature;
            if (!feature) {
                let docs;
                if (hasFeatureTag) {
                    docs = docs = spec.importedDocumentsOf(doc)
                        .filter(impDoc => TypeChecking_1.isDefined(impDoc.feature)
                        && impDoc.feature.name.toLowerCase() == tc.declaredFeatureName.toLowerCase());
                }
                else {
                    docs = spec.importedDocumentsOf(doc)
                        .filter(impDoc => TypeChecking_1.isDefined(impDoc.feature));
                }
                // No feature
                if (docs.length < 1) {
                    errors.push(new SemanticException_1.SemanticException(msgNoFeature, tc.location));
                    continue;
                }
                feature = docs[0].feature;
            }
            if (hasScenarioTag) {
                const size = (feature.scenarios || []).length;
                // No scenarios
                if (size < 1) {
                    errors.push(new SemanticException_1.SemanticException(msgNoScenarios, tc.location));
                    continue;
                }
                // Index > size
                if (tc.declaredScenarioIndex > size) {
                    errors.push(new SemanticException_1.SemanticException(msgMaxScenarioIndex, tc.location));
                    continue;
                }
                // Index < 1
                if (tc.declaredScenarioIndex < 1) {
                    errors.push(new SemanticException_1.SemanticException(msgMinScenarioIndex, tc.location));
                    continue;
                }
            }
            if (hasVariantTag && !hasScenarioTag) {
                errors.push(new SemanticException_1.SemanticException(msgNoScenarioTag, tc.location));
                continue;
            }
            if (hasVariantTag) {
                const scenario = feature.scenarios[tc.declaredScenarioIndex - 1];
                if (!scenario) {
                    errors.push(new SemanticException_1.SemanticException(msgNoScenario, tc.location));
                    continue;
                }
                const size = (scenario.variants || []).length;
                // No variants
                if (size < 1) {
                    errors.push(new SemanticException_1.SemanticException(msgNoVariants, tc.location));
                    continue;
                }
                // Index > size
                if (tc.declaredVariantIndex > size) {
                    errors.push(new SemanticException_1.SemanticException(msgMaxVariantIndex, tc.location));
                    continue;
                }
                // Index < 1
                if (tc.declaredVariantIndex < 1) {
                    errors.push(new SemanticException_1.SemanticException(msgMinVariantIndex, tc.location));
                    continue;
                }
            }
        } // test cases
    }
    isFeatureTag(name) {
        return (this._keywords.tagFeature || ['feature']).indexOf(name.toLowerCase().trim()) >= 0;
    }
    isScenarioTag(name) {
        return (this._keywords.tagScenario || ['scenario']).indexOf(name.toLowerCase().trim()) >= 0;
    }
    isVariantTag(name) {
        return (this._keywords.tagVariant || ['variant']).indexOf(name.toLowerCase().trim()) >= 0;
    }
    isGeneratedTag(name) {
        return (this._keywords.tagGenerated || ['generated']).indexOf(name.toLowerCase().trim()) >= 0;
    }
    detectTagContentAsIndex(tag, errors) {
        let value = Array.isArray(tag.content) ? tag.content[0] : tag.content;
        if (!TypeChecking_1.isDefined(value)) {
            return value;
        }
        value = parseInt(value.trim());
        if (isNaN(value)) {
            const msg = 'This tag must have a number.';
            errors.push(new SemanticException_1.SemanticException(msg, tag.location));
        }
        else if (value <= 0) {
            const msg = 'The tag content must be a number greater than zero.';
            errors.push(new SemanticException_1.SemanticException(msg, tag.location));
        }
        return value;
    }
}
exports.TestCaseSSA = TestCaseSSA;
//# sourceMappingURL=TestCaseSSA.js.map