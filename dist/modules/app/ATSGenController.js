"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATSGenController = void 0;
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
            let ats = gen.generateFromDocument(doc, spec);
            if (TypeChecking_1.isDefined(ats)) {
                all.push(ats);
            }
        }
        return all;
    }
}
exports.ATSGenController = ATSGenController;
