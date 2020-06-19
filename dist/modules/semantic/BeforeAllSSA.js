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
exports.BeforeAllSSA = void 0;
const error_1 = require("../error");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Analyzes Before All events.
 *
 * It checks for:
 * - more than one declarations in the specification
 *
 * @author Thiago Delgado Pinto
 */
class BeforeAllSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(problems, spec, graph) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            this.checkForMoreThanOneDeclaration(spec, errors);
            const ok1 = 0 === errors.length;
            if (!ok1) {
                problems.addGenericError(...errors);
            }
            return ok1;
        });
    }
    checkForMoreThanOneDeclaration(spec, errors) {
        const found = [];
        for (const doc of spec.docs) {
            if (!doc.beforeAll) {
                continue;
            }
            found.push(doc.beforeAll.location);
        }
        const foundCount = found.length;
        if (foundCount > 1) {
            const msg = 'Only one event Before All is allowed in the specification. Found ' +
                foundCount + ": \n" +
                this._checker.jointLocations(found);
            errors.push(new error_1.SemanticException(msg));
        }
    }
}
exports.BeforeAllSSA = BeforeAllSSA;
