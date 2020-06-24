"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.EMPTY`
 */
class Empty {
    /** @inheritdoc */
    analyze(cfg) {
        // Required
        if (cfg.required) {
            if (cfg.requiredWithOnlyValidDTC) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            return ExpectedResult_1.ExpectedResult.INVALID;
        }
        // Value
        if ('' === cfg.value) {
            return ExpectedResult_1.ExpectedResult.VALID;
        }
        // Minimum length
        if (TypeChecking_1.isDefined(cfg.minimumLength)) {
            if (0 === cfg.minimumLength) {
                return ExpectedResult_1.ExpectedResult.VALID;
            }
            if (cfg.minimumLengthWithOnlyValidDTC) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            return ExpectedResult_1.ExpectedResult.INVALID;
        }
        // Format
        if (TypeChecking_1.isDefined(cfg.format)) {
            try {
                if (new RegExp(cfg.format).test('')) {
                    return ExpectedResult_1.ExpectedResult.VALID;
                }
                if (cfg.formatWithOnlyValidDTC) {
                    return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
                }
                return ExpectedResult_1.ExpectedResult.INVALID;
            }
            catch (_a) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
        }
        // Maximum length ignored -> irrelevant
        // Minimum value -> incompatible
        // Maximum value -> incompatible
        return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
    }
}
exports.Empty = Empty;
