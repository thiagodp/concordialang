"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomNotInSet = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.RANDOM_NOT_IN_SET`
 */
class RandomNotInSet {
    /** @inheritdoc */
    analyze(cfg) {
        if (TypeChecking_1.isDefined(cfg.value) &&
            Array.isArray(cfg.value) &&
            cfg.value.length >= 2) {
            if (cfg.valueWithOnlyValidDTC) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            return ExpectedResult_1.ExpectedResult.INVALID;
        }
        return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
    }
}
exports.RandomNotInSet = RandomNotInSet;
