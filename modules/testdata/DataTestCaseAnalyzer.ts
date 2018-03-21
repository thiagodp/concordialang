import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";
import { DataTestCase } from "./DataTestCase";
import { DocumentUtil } from "../util/DocumentUtil";
import { UIElement } from "../ast/UIElement";
import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";
import { DataTestCaseVsValueType } from "./DataTestCaseVsValueType";
import { ValueType } from "../util/ValueTypeDetector";
import { toEnumValue } from "../util/ToEnumValue";
import { UIPropertyTypes } from "../util/UIPropertyTypes";
import { isDefined } from "../util/TypeChecking";

export class DataTestCaseAnalyzer {

    private readonly _docUtil = new DocumentUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _nlpUtil = new NLPUtil();
    private readonly _vsType = new DataTestCaseVsValueType();

    /**
     * Returns the compatible test cases and whether they are considered valid or not.
     *
     * @param uiElementVariable
     * @param doc
     * @param spec
     * @param errors
     */
    compatibleDataTestCases(
        uiElementVariable: string,
        doc: Document,
        spec: Spec,
        errors: Error[]
    ): Map< DataTestCase, boolean > {

        let map = new Map< DataTestCase, boolean >();

        // Finds the UI Element
        let uie = spec.uiElementByVariable( uiElementVariable, doc );
        if ( ! uie ) {
            const msg = `UI Element not found in the specification: ${uiElementVariable}`;
            errors.push( new Error( msg ) );
            return map; // empty
        }

        // Returns if not editable
        if ( ! this._uiePropExtractor.extractIsEditable( uie ) ) {
            return map; // empty
        }

        // Let's analyze the data type of the UI Element
        const dataType: string = this._uiePropExtractor.extractDataType( uie );
        // Converts to a system value type
        const valType: ValueType = toEnumValue( dataType, ValueType ) || ValueType.STRING;
        // Gets the compatible data test cases
        const dataTestCases: DataTestCase[] = this._vsType.compatibleWith( valType );

        // Now analyzes the rules, to define expect test result (valid or invalid)
        for ( let dtc of dataTestCases ) {
            const valid: boolean = this.isConsideredValid( valType, dtc, uie );
            map.set( dtc, valid );
        }

        return map;
    }


    isConsideredValid( valueType: ValueType, dtc: DataTestCase, uie: UIElement ): boolean {

        const isRequiredDefined: boolean = this._uiePropExtractor.extractIsRequired( uie );

        // const minLength = this._uiePropExtractor.extractProperty( uie, UIPropertyTypes.MIN_LENGTH );
        // const maxLength = this._uiePropExtractor.extractProperty( uie, UIPropertyTypes.MAX_LENGTH );
        // const minValue = this._uiePropExtractor.extractProperty( uie, UIPropertyTypes.MIN_VALUE );
        // const maxValue = this._uiePropExtractor.extractMaxValue( uie );
        // const format = this._uiePropExtractor.extractFormat( uie );
        const format = null; // <<< TO-DO

        const analyzer: any = {}; //

        switch ( dtc ) {
            // value
            case DataTestCase.VALUE_LOWEST                  : return ! analyzer.hasValuesBelowMin();
            case DataTestCase.VALUE_RANDOM_BELOW_MIN        : return ! analyzer.hasValuesBelowMin();
            case DataTestCase.VALUE_JUST_BELOW_MIN          : return ! analyzer.hasValuesBelowMin();
            case DataTestCase.VALUE_MIN                     : return true;
            case DataTestCase.VALUE_JUST_ABOVE_MIN          : return analyzer.hasValuesBetweenMinAndMax();
            case DataTestCase.VALUE_ZERO                    : return analyzer.isZeroBetweenMinAndMax();
            case DataTestCase.VALUE_MEDIAN                  : return true;
            case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX  : return analyzer.hasValuesBetweenMinAndMax();
            case DataTestCase.VALUE_JUST_BELOW_MAX          : return analyzer.hasValuesBetweenMinAndMax();
            case DataTestCase.VALUE_MAX                     : return true;
            case DataTestCase.VALUE_JUST_ABOVE_MAX          : return ! analyzer.hasValuesAboveMax();
            case DataTestCase.VALUE_RANDOM_ABOVE_MAX        : return ! analyzer.hasValuesAboveMax();
            case DataTestCase.VALUE_GREATEST                : return ! analyzer.hasValuesAboveMax();
            // length
            // TODO: <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            // format
            case DataTestCase.FORMAT_VALID                  : return true;
            case DataTestCase.FORMAT_INVALID                : return isDefined( format );
            // set
            case DataTestCase.SET_FIRST_ELEMENT             : return true;
            case DataTestCase.SET_SECOND_ELEMENT            : return true;
            case DataTestCase.SET_RANDOM_ELEMENT            : return true;
            case DataTestCase.SET_PENULTIMATE_ELEMENT       : return true;
            case DataTestCase.SET_LAST_ELEMENT              : return true;
            case DataTestCase.SET_NOT_IN_SET                : return false;
            // required
            case DataTestCase.REQUIRED_FILLED               : return true;
            case DataTestCase.REQUIRED_NOT_FILLED           : return isRequiredDefined;
        }

        return false;
    }

}



class LimitAnalyzer {

    foo< T >( vt: ValueType, min?: T, max?: T) {
        // const gen = createGeneratorFor( vt, min, max );
        // gen.hasValuesBelowMin()
    }

}