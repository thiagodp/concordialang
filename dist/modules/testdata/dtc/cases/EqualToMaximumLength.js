"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualToMaximumLength = void 0;
const TypeChecking_1 = require("../../../util/TypeChecking");
const ValueTypeDetector_1 = require("../../../util/ValueTypeDetector");
const ExpectedResult_1 = require("../ExpectedResult");
/**
 * Evaluate `DataTestCase.EQUAL_TO_MAXIMUM_LENGTH`
 */
class EqualToMaximumLength {
    /** @inheritdoc */
    pre(cfg) {
        if (cfg.dataType !== ValueTypeDetector_1.ValueType.STRING) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        if (!TypeChecking_1.isDefined(cfg.maximumLength)) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        // Equal ? Then it's already covered by minimum length
        if (cfg.maximumLength === cfg.minimumLength) {
            return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        return ExpectedResult_1.ExpectedResult.VALID;
    }
}
exports.EqualToMaximumLength = EqualToMaximumLength;
