import { ValueType } from "../util/ValueTypeDetector";
import { DataTestCase, DataTestCaseGroup, DataTestCaseGroupDef } from "./DataTestCase";

/**
 * Compatibility between data test cases and value types.
 * 
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseVsValueType {

    private _defs: DataTestCaseVsValueTypeDef[] = [];

	constructor() {
        this.addStringDefs();
        this.addIntegerDefs();
        this.addDoubleDefs();
        this.addDateDefs();
        this.addTimeDefs();
        this.addDateTimeDefs();
        this.addBooleanDefs();
    }
    
    all(): DataTestCaseVsValueTypeDef[] {
        return this._defs;
    }

    isCompatible( valueType: ValueType, tc: DataTestCase ): boolean {
        return this._defs.find( ( v ) => v.val === valueType && v.tc === tc ).compatible;
    }

	private addStringDefs(): void {
        const valueType = ValueType.STRING;
        this.addForGroup( valueType, false, DataTestCaseGroup.VALUE );
        this.addForGroup( valueType, true, DataTestCaseGroup.LENGTH );
        this.addForGroup( valueType, true, DataTestCaseGroup.FORMAT );
        this.addForGroup( valueType, true, DataTestCaseGroup.SET );
        this.addForGroup( valueType, true, DataTestCaseGroup.REQUIRED );
        this.addForGroup( valueType, true, DataTestCaseGroup.COMPUTATION );
    }
    
    private addIntegerDefs(): void {
        this.addValueDef( ValueType.INTEGER );
    }

    private addDoubleDefs(): void {
        this.addValueDef( ValueType.DOUBLE );
    }

    private addDateDefs(): void {
        this.addValueDef( ValueType.DATE );
    }

    private addTimeDefs(): void {
        this.addValueDef( ValueType.TIME );
    }
    
    private addDateTimeDefs(): void {
        this.addValueDef( ValueType.DATETIME );
    }
    
    private addBooleanDefs(): void {
        const valueType = ValueType.BOOLEAN;
        this.addForGroup( valueType, false, DataTestCaseGroup.VALUE );
        this.addForGroup( valueType, false, DataTestCaseGroup.LENGTH );
        this.addForGroup( valueType, false, DataTestCaseGroup.FORMAT );
        this.addForGroup( valueType, false, DataTestCaseGroup.SET );
        this.addForGroup( valueType, true, DataTestCaseGroup.REQUIRED );
        this.addForGroup( valueType, true, DataTestCaseGroup.COMPUTATION );
    }

    private addValueDef( valueType: ValueType ): void {
        this.addForGroup( valueType, true, DataTestCaseGroup.VALUE );
        this.addForGroup( valueType, false, DataTestCaseGroup.LENGTH );
        this.addForGroup( valueType, true, DataTestCaseGroup.FORMAT );
        this.addForGroup( valueType, true, DataTestCaseGroup.SET );
        this.addForGroup( valueType, true, DataTestCaseGroup.REQUIRED );
        this.addForGroup( valueType, true, DataTestCaseGroup.COMPUTATION );
    }

	private with( valueType: ValueType, compatible: boolean, tc: DataTestCase ): DataTestCaseVsValueTypeDef {
		return { val: valueType, compatible: compatible, tc: tc } as DataTestCaseVsValueTypeDef;
    }
    
    private addForGroup( valueType: ValueType, compatible: boolean, group: DataTestCaseGroup ): void {
        const groupsDef: DataTestCaseGroupDef = new DataTestCaseGroupDef();
        const testcases: DataTestCase[] = groupsDef.ofGroup( group );
        for ( let tc of testcases ) {
            this._defs.push( this.with( valueType, compatible, tc ) );
        }
    }

}


/**
 * Structure to hold the compatibility between a test case and a value type.
 * 
 * @author Thiago Delgado Pinto
 */
interface DataTestCaseVsValueTypeDef {
	tc: DataTestCase,
	val: ValueType,
	compatible: boolean
}