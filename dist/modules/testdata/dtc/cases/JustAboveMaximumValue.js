"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustAboveMaximumValue = void 0;
const limits_1 = require("modules/testdata/limits/limits");
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_ABOVE_MAXIMUM_VALUE`
 */
class JustAboveMaximumValue {
    /** @inheritdoc */
    analyze(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // It should have at least one free above
        if (cfg.maximumValue === limits_1.maxLimitOfType(cfg.dataType)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumValueWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.JustAboveMaximumValue = JustAboveMaximumValue;
