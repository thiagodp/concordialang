"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cfg = void 0;
const ValueTypeDetector_1 = require("../../util/ValueTypeDetector");
class Cfg {
    constructor() {
        this.withOnlyValidDTC = false;
        this.invertedLogic = false;
        this.dataType = ValueTypeDetector_1.ValueType.STRING;
        this.valueWithOnlyValidDTC = false;
        this.requiredWithOnlyValidDTC = false;
        this.minimumLengthWithOnlyValidDTC = false;
        this.maximumLengthWithOnlyValidDTC = false;
        this.minimumValueWithOnlyValidDTC = false;
        this.maximumValueWithOnlyValidDTC = false;
        this.formatWithOnlyValidDTC = false;
    }
}
exports.Cfg = Cfg;
