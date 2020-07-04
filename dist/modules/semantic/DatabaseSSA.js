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
exports.DatabaseSSA = void 0;
const DatabaseConnectionChecker_1 = require("../db/DatabaseConnectionChecker");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Executes semantic analysis of Databases in a specification.
 *
 * Checkings:
 * - duplicated names
 * - connection to the defined databases <<< NEEDED HERE ???
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    constructor() {
        super(...arguments);
        this.checkConnections = (spec, errors) => __awaiter(this, void 0, void 0, function* () {
            let checker = new DatabaseConnectionChecker_1.DatabaseConnectionChecker();
            // Important: errors and warnings are also added to the corresponding doc
            let r = yield checker.check(spec, errors);
            return r.success;
        });
    }
    /** @inheritDoc */
    analyze(graph, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checker.checkDuplicatedNamedNodes(spec.databases(), errors, 'database');
            yield this.checkConnections(spec, errors);
        });
    }
}
exports.DatabaseSSA = DatabaseSSA;
