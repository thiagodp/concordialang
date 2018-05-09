"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeChecking_1 = require("../util/TypeChecking");
const AbstractTestScript_1 = require("./AbstractTestScript");
const NLPResult_1 = require("../nlp/NLPResult");
/**
 * Generates Abstract Test Script
 */
class AbstractTestScriptGenerator {
    /**
     * Generate an abstract test script with the test cases of a document.
     *
     * @param doc Document
     * @param spec Specification
     */
    generateFromDocument(doc, spec) {
        // console.log( 'DOC is', doc.fileInfo.path );
        // console.log( 'Test cases', doc.testCases );
        if (!doc.testCases || doc.testCases.length < 1) {
            return null;
        }
        // Get from the document
        let feature = !doc.feature ? null : doc.feature;
        if (!feature) {
            const docsWithFeature = spec.importedDocumentsOf(doc)
                .filter(impDoc => TypeChecking_1.isDefined(impDoc.feature));
            // Not found -> get the first feature of a imported document
            if (docsWithFeature.length > 0) {
                feature = docsWithFeature[0].feature;
            }
        }
        // console.log( 'Feature', feature.name );
        // Not found -> assumes a name and location
        const location = !feature
            ? { column: 1, line: 1, filePath: doc.fileInfo.path }
            : feature.location;
        const featureName = !feature ? 'Unknown feature' : feature.name;
        // ASTRACT TEST SCRIPT
        let ats = new AbstractTestScript_1.AbstractTestScript();
        // feature, location, sourceFile
        ats.sourceFile = doc.fileInfo.path;
        ats.feature = new AbstractTestScript_1.NamedATSElement(location, featureName);
        // scenarios
        let scenarioNames = [];
        if (TypeChecking_1.isDefined(feature)) {
            for (let s of feature.scenarios || []) {
                ats.scenarios.push(new AbstractTestScript_1.NamedATSElement(s.location, s.name));
                scenarioNames.push(s.name);
            }
        }
        // test cases
        const nlpUtil = new NLPResult_1.NLPUtil();
        for (let tc of doc.testCases) {
            let absTC = new AbstractTestScript_1.ATSTestCase(tc.location, tc.name);
            absTC.scenario = scenarioNames[(tc.declaredScenarioIndex || 1) - 1] || 'Unknown scenario';
            absTC.invalid = tc.shoudFail;
            for (let sentence of tc.sentences) {
                let cmd = new AbstractTestScript_1.ATSCommand();
                cmd.location = sentence.location;
                cmd.action = sentence.action;
                cmd.modifier = sentence.actionModifier;
                cmd.options = sentence.actionOptions;
                cmd.targets = sentence.targets;
                cmd.targetTypes = sentence.targetTypes;
                cmd.values = sentence.values;
                cmd.invalid = sentence.isInvalidValue;
                cmd.comment = sentence.comment;
                absTC.commands.push(cmd);
            }
            // console.log( absTC );
            ats.testcases.push(absTC);
        }
        return ats;
    }
}
exports.AbstractTestScriptGenerator = AbstractTestScriptGenerator;
//# sourceMappingURL=AbstractTestScriptGenerator.js.map