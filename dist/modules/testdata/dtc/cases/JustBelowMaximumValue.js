"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustBelowMaximumValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_VALUE`
 */
class JustBelowMaximumValue {
    /** @inheritdoc */
    analyze(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // No free values between them
        if (cfg.maximumValue === cfg.minimumValue) { // integer only
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.JustBelowMaximumValue = JustBelowMaximumValue;
