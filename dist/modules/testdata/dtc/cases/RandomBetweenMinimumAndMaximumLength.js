"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomBetweenMinimumAndMaximumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH`
 */
class RandomBetweenMinimumAndMaximumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumLength) ||
            !TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        const freeValues = cfg.maximumLength - cfg.minimumLength;
        // It should have 3+ free values, since two of them will be covered
        // by JustAboveMinimumLength and JustBelowMaximumLength
        if (freeValues <= 2) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.RandomBetweenMinimumAndMaximumLength = RandomBetweenMinimumAndMaximumLength;
