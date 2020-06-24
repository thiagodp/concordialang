"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualToValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.EQUAL_TO_VALUE`
 */
class EqualToValue {
    /** @inheritdoc */
    analyze(cfg) {
        // Doesn't it have a value ?
        if (!TypeChecking_1.isDefined(cfg.value)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Is it an array ?
        if (Array.isArray(cfg.value)) {
            // More than one value ?
            if (cfg.value.length > 1) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
        }
        const value = Array.isArray(cfg.value) ? cfg.value[0] : cfg.value;
        // Is it required ?
        if (true === cfg.required) {
            // Required but empty
            if ('' === value) {
                if (cfg.requiredWithOnlyValidDTC) {
                    return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
                }
                return ExpectedResult_1.ExpectedResult.INVALID;
            }
            // Required and not empty
            return ExpectedResult_1.ExpectedResult.VALID;
        }
        // Not required
        else if (false === cfg.required) {
            return ExpectedResult_1.ExpectedResult.VALID;
        }
        // Required not defined
        return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
    }
}
exports.EqualToValue = EqualToValue;
