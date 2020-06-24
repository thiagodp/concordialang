"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustBelowMinimumValue = void 0;
const limits_1 = require("modules/testdata/limits/limits");
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_BELOW_MINIMUM_VALUE`
 */
class JustBelowMinimumValue {
    /** @inheritdoc */
    analyze(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // It should have at least one free value above
        if (cfg.minimumValue === limits_1.minLimitOfType(cfg.dataType)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.minimumValueWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.JustBelowMinimumValue = JustBelowMinimumValue;
