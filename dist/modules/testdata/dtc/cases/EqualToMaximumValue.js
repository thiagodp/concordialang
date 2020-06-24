"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualToMaximumValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluates `DataTestCase.EQUAL_TO_MAXIMUM_VALUE`
 */
class EqualToMaximumValue {
    /** @inheritdoc */
    pre(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.EqualToMaximumValue = EqualToMaximumValue;
