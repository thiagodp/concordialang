"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomBelowMinimumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH`
 */
class RandomBelowMinimumLength {
    /** @inheritdoc */
    analyze(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Since RandomBelowMinimumLength covers SOME predecessor,
        // Empty covers 0, and BelowMinimumLength covers 1,
        // minimumLength should be 3+ to have at least one uncovered value.
        if (cfg.minimumLength <= 2) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.minimumLengthWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomBelowMinimumLength = RandomBelowMinimumLength;
