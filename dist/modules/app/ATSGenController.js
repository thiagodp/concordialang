"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractTestScriptGenerator_1 = require("../testscript/AbstractTestScriptGenerator");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * Abstract Test Script Generation Controller
 */
class ATSGenController {
    generate(spec) {
        let all = [];
        const gen = new AbstractTestScriptGenerator_1.AbstractTestScriptGenerator();
        for (let doc of spec.docs || []) {
            // Only test cases allowed
            if (!doc.testCases || doc.testCases.length < 1) {
                continue;
            }
            let ats = gen.generateFromDocument(doc, spec);
            if (TypeChecking_1.isDefined(ats)) {
                // console.log( 'CREATED ATS from', ats.sourceFile );
                all.push(ats);
            }
        }
        return all;
    }
}
exports.ATSGenController = ATSGenController;
