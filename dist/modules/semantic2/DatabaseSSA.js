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
const DatabaseConnectionChecker2_1 = require("../db/DatabaseConnectionChecker2");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Analyzes Databases in a specification.
 *
 * It checks for:
 * - duplicated names
 * - connection to the defined databases <<< NEEDED HERE ???
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(problems, spec, graph) {
        return __awaiter(this, void 0, void 0, function* () {
            let errors = [];
            this._checker.checkDuplicatedNamedNodes(spec.databases(), errors, 'database');
            const ok1 = 0 === errors.length;
            if (!ok1) {
                problems.addGenericError(...errors);
            }
            const ok2 = yield this.checkConnections(problems, spec);
            return ok1 && ok2;
        });
    }
    checkConnections(problems, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            let checker = new DatabaseConnectionChecker2_1.DatabaseConnectionChecker2();
            let r = yield checker.check(spec, problems);
            return r ? r.success : false;
        });
    }
}
exports.DatabaseSSA = DatabaseSSA;
