"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomDifferentFromValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.RANDOM_DIFFERENT_FROM_VALUE`
 */
class RandomDifferentFromValue {
    /** @inheritdoc */
    analyze(cfg) {
        // Doesn't it have a value ?
        if (!TypeChecking_1.isDefined(cfg.value)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Is it an array ?
        if (Array.isArray(cfg.value)) {
            // More than one value ?
            if (cfg.value.length > 1) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
        }
        if (cfg.valueWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomDifferentFromValue = RandomDifferentFromValue;
