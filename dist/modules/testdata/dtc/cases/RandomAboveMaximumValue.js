"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomAboveMaximumValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
const limits_1 = require("modules/testdata/limits/limits");
/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE`
 */
class RandomAboveMaximumValue {
    /** @inheritdoc */
    pre(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // No free values above
        if (cfg.maximumValue === limits_1.maxLimitOfType(cfg.dataType)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumValueWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomAboveMaximumValue = RandomAboveMaximumValue;
