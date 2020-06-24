"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomDifferentFromFormat = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT`
 */
class RandomDifferentFromFormat {
    /** @inheritdoc */
    analyze(cfg) {
        if (!TypeChecking_1.isDefined(cfg.format)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.formatWithOnlyValidDTC) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.INVALID;
    }
}
exports.RandomDifferentFromFormat = RandomDifferentFromFormat;
