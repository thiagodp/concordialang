"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustBelowMaximumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_LENGTH`
 */
class JustBelowMaximumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (TypeChecking_1.isDefined(cfg.minimumLength)) {
            const freeValues = cfg.maximumLength - cfg.minimumLength;
            // It should have at least 2 values between them, since
            // JustAboveMinimumLength will cover one of them.
            if (freeValues <= 1) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.JustBelowMaximumLength = JustBelowMaximumLength;
