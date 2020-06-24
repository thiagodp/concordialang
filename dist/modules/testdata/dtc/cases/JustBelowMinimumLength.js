"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustBelowMinimumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_BELOW_MINIMUM_LENGTH`
 */
class JustBelowMinimumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Since JustBelowMinimumLength covers the predecessor and Empty
        // covers 0, minimumLength should be 2+ in order to cover 1+
        if (cfg.minimumLength <= 1) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.minimumLengthWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.JustBelowMinimumLength = JustBelowMinimumLength;
