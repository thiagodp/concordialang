"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomFromFormat = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.RANDOM_FROM_FORMAT`
 */
class RandomFromFormat {
    /** @inheritdoc */
    pre(cfg) {
        if (!TypeChecking_1.isDefined(cfg.format)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.RandomFromFormat = RandomFromFormat;
