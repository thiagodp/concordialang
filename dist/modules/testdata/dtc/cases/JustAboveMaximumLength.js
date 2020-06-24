"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustAboveMaximumLength = void 0;
const StringLimits_1 = require("../../../testdata/limits/StringLimits");
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH`
 */
class JustAboveMaximumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumLength === StringLimits_1.StringLimits.MAX) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumLengthWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.JustAboveMaximumLength = JustAboveMaximumLength;
