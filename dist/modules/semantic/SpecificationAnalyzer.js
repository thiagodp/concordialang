"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DuplicationChecker_1 = require("../util/DuplicationChecker");
/**
 * Specification semantic analyzer.
 *
 * @author Thiago Delgado Pinto
 */
class SpecificationAnalyzer {
    constructor() {
        this._checker = new DuplicationChecker_1.DuplicationChecker();
    }
}
exports.SpecificationAnalyzer = SpecificationAnalyzer;
