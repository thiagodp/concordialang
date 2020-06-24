"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreatestLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const StringLimits_1 = require("../../limits/StringLimits");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.GREATEST_LENGTH`
 */
class GreatestLength {
    /** @inheritdoc */
    analyze(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (TypeChecking_1.isDefined(cfg.format)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (TypeChecking_1.isDefined(cfg.maximumLength)) {
            // Equal to the MAX ? Not needed since there is EqualToMaximumLength
            if (cfg.maximumLength === StringLimits_1.StringLimits.MAX) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            if (cfg.maximumLengthWithOnlyValidDTC) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            return ExpectedResult_1.ExpectedResult.INVALID;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.GreatestLength = GreatestLength;
