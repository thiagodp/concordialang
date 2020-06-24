"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomInSet = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.RANDOM_IN_SET`
 */
class RandomInSet {
    /** @inheritdoc */
    pre(cfg) {
        if (TypeChecking_1.isDefined(cfg.value) &&
            Array.isArray(cfg.value) &&
            cfg.value.length >= 2) {
            return ExpectedResult_1.ExpectedResult.VALID;
        }
        return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
    }
}
exports.RandomInSet = RandomInSet;
