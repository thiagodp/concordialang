"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const DataTestCase_1 = require("./DataTestCase");
/**
 * Compatibility between data test cases and value types.
 *
 * @author Thiago Delgado Pinto
 */
class DataTestCaseVsValueType {
    constructor() {
        this._defs = [];
        this.addStringDefs();
        this.addIntegerDefs();
        this.addDoubleDefs();
        this.addDateDefs();
        this.addTimeDefs();
        this.addDateTimeDefs();
        this.addBooleanDefs();
    }
    all() {
        return this._defs;
    }
    isCompatible(valueType, tc) {
        let def = this._defs.find((v) => v.val === valueType && v.tc === tc);
        return def ? def.compatible : false;
    }
    compatibleWith(valueType) {
        return this._defs.filter(v => v.compatible && v.val === valueType).map(v => v.tc);
    }
    addStringDefs() {
        const valueType = ValueTypeDetector_1.ValueType.STRING;
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.COMPUTATION);
    }
    addIntegerDefs() {
        this.addValueDef(ValueTypeDetector_1.ValueType.INTEGER);
    }
    addDoubleDefs() {
        this.addValueDef(ValueTypeDetector_1.ValueType.DOUBLE);
    }
    addDateDefs() {
        this.addValueDef(ValueTypeDetector_1.ValueType.DATE);
    }
    addTimeDefs() {
        this.addValueDef(ValueTypeDetector_1.ValueType.TIME);
    }
    addDateTimeDefs() {
        this.addValueDef(ValueTypeDetector_1.ValueType.DATETIME);
    }
    addBooleanDefs() {
        const valueType = ValueTypeDetector_1.ValueType.BOOLEAN;
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.COMPUTATION);
    }
    addValueDef(valueType) {
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, false, DataTestCase_1.DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCase_1.DataTestCaseGroup.COMPUTATION);
    }
    with(valueType, compatible, tc) {
        return { val: valueType, compatible: compatible, tc: tc };
    }
    addForGroup(valueType, compatible, group) {
        const groupsDef = new DataTestCase_1.DataTestCaseGroupDef();
        const testcases = groupsDef.ofGroup(group);
        for (let tc of testcases) {
            this._defs.push(this.with(valueType, compatible, tc));
        }
    }
}
exports.DataTestCaseVsValueType = DataTestCaseVsValueType;
//# sourceMappingURL=DataTestCaseVsValueType.js.map