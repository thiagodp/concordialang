"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.RANDOM_VALUE`
 */
class RandomValue {
    /** @inheritdoc */
    pre(cfg) {
        // All constraints but Required are accepted as incompatible
        if (TypeChecking_1.isDefined(cfg.value) ||
            TypeChecking_1.isDefined(cfg.format) ||
            TypeChecking_1.isDefined(cfg.minimumLength) ||
            TypeChecking_1.isDefined(cfg.maximumLength) ||
            TypeChecking_1.isDefined(cfg.minimumValue) ||
            TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.RandomValue = RandomValue;
