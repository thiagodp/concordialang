"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomAboveMaximumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const StringLimits_1 = require("../../limits/StringLimits");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH`
 */
class RandomAboveMaximumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        const freeValues = StringLimits_1.StringLimits.MAX - cfg.maximumLength;
        // It should have 2+ free values, since JustAboveMaximumLength covers
        // one of them
        if (freeValues <= 1) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumLengthWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomAboveMaximumLength = RandomAboveMaximumLength;
