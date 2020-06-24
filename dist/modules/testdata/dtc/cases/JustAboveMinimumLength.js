"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustAboveMinimumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.JUST_ABOVE_MINIMUM_LENGTH`
 */
class JustAboveMinimumLength {
    /** @inheritdoc */
    analyze(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // It should have at least one free value between them
        if (cfg.maximumLength === cfg.minimumLength) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.JustAboveMinimumLength = JustAboveMinimumLength;
