"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualToMinimumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.EQUAL_TO_MINIMUM_LENGTH`
 */
class EqualToMinimumLength {
    /** @inheritdoc */
    analyze(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (0 === cfg.minimumLength && cfg.required) {
            if (cfg.minimumLengthWithOnlyValidDTC || cfg.requiredWithOnlyValidDTC) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            return ExpectedResult_1.ExpectedResult.INVALID;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.EqualToMinimumLength = EqualToMinimumLength;
