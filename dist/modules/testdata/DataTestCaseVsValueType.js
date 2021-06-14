import { ValueType } from "../util/ValueTypeDetector";
import { DataTestCaseGroup, DataTestCaseGroupDef } from "./DataTestCase";
/**
 * Compatibility between data test cases and value types.
 *
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseVsValueType {
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
        const valueType = ValueType.STRING;
        this.addForGroup(valueType, false, DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, true, DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, true, DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, true, DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCaseGroup.COMPUTATION);
    }
    addIntegerDefs() {
        this.addValueDef(ValueType.INTEGER);
    }
    addDoubleDefs() {
        this.addValueDef(ValueType.DOUBLE);
    }
    addDateDefs() {
        this.addValueDef(ValueType.DATE);
    }
    addTimeDefs() {
        this.addValueDef(ValueType.TIME);
    }
    addDateTimeDefs() {
        this.addValueDef(ValueType.DATE_TIME);
    }
    addBooleanDefs() {
        const valueType = ValueType.BOOLEAN;
        this.addForGroup(valueType, false, DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, false, DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, false, DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, false, DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCaseGroup.COMPUTATION);
    }
    addValueDef(valueType) {
        this.addForGroup(valueType, true, DataTestCaseGroup.VALUE);
        this.addForGroup(valueType, false, DataTestCaseGroup.LENGTH);
        this.addForGroup(valueType, true, DataTestCaseGroup.FORMAT);
        this.addForGroup(valueType, true, DataTestCaseGroup.SET);
        this.addForGroup(valueType, true, DataTestCaseGroup.REQUIRED);
        this.addForGroup(valueType, true, DataTestCaseGroup.COMPUTATION);
    }
    with(valueType, compatible, tc) {
        return { val: valueType, compatible: compatible, tc: tc };
    }
    addForGroup(valueType, compatible, group) {
        const groupsDef = new DataTestCaseGroupDef();
        const testcases = groupsDef.ofGroup(group);
        for (let tc of testcases) {
            this._defs.push(this.with(valueType, compatible, tc));
        }
    }
}
