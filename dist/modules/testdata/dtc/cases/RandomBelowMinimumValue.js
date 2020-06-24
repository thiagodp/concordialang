"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomBelowMinimumValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
const limits_1 = require("modules/testdata/limits/limits");
/**
 * Evaluate `DataTestCase.RANDOM_BELOW_MINIMUM_VALUE`
 */
class RandomBelowMinimumValue {
    /** @inheritdoc */
    pre(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // No free values bellow
        if (cfg.minimumValue === limits_1.minLimitOfType(cfg.dataType)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.minimumValueWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomBelowMinimumValue = RandomBelowMinimumValue;
