"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zero = void 0;
const util_1 = require("modules/util");
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.ZERO`
 */
class Zero {
    /** @inheritdoc */
    analyze(cfg) {
        if (cfg.dataType !== util_1.ValueType.INTEGER &&
            cfg.dataType !== util_1.ValueType.DOUBLE) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (TypeChecking_1.isDefined(cfg.format) ||
            TypeChecking_1.isDefined(cfg.value) ||
            TypeChecking_1.isDefined(cfg.minimumLength) ||
            TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Minimum value
        if ('number' === typeof cfg.minimumValue) {
            // There is already data test cases that cover these situations:
            if (0 === cfg.minimumValue ||
                0 === +cfg.minimumValue - 1 ||
                0 === +cfg.minimumValue + 1) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            if (cfg.minimumValue > 0) {
                if (cfg.minimumValueWithOnlyValidDTC) {
                    return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
                }
                return ExpectedResult_1.ExpectedResult.INVALID;
            }
        }
        // Maximum value
        if ('number' === typeof cfg.maximumValue) {
            // There is already data test cases that cover these situations:
            if (0 === cfg.maximumValue ||
                0 === +cfg.maximumValue - 1 ||
                0 === +cfg.maximumValue + 1) {
                return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
            }
            if (cfg.maximumValue < 0) {
                if (cfg.maximumValueWithOnlyValidDTC) {
                    return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
                }
                return ExpectedResult_1.ExpectedResult.INVALID;
            }
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.Zero = Zero;
