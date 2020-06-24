"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustAboveMinimumValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_ABOVE_MINIMUM_VALUE`
 */
class JustAboveMinimumValue {
    /** @inheritdoc */
    analyze(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumValue)) {
            // It should have at least one free value
            if (cfg.minimumValue === cfg.maximumValue) { // integer
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.JustAboveMinimumValue = JustAboveMinimumValue;
