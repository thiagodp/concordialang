"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedianValue = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.MEDIAN_VALUE`
 */
class MedianValue {
    /** @inheritdoc */
    pre(cfg) {
        if (ValueTypeDetector_1.ValueType.STRING === cfg.dataType) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.minimumValue) ||
            !TypeChecking_1.isDefined(cfg.maximumValue)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (cfg.maximumLength === cfg.minimumLength) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.MedianValue = MedianValue;
