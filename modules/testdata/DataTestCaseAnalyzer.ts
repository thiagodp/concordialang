import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";
import { DataTestCase } from "./DataTestCase";
import { DocumentUtil, UIElementInfo } from "../util/DocumentUtil";
import { UIElement } from "../ast/UIElement";
import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";
import { DataTestCaseVsValueType } from "./DataTestCaseVsValueType";
import { ValueType } from "../util/ValueTypeDetector";
import * as enumUtil from 'enum-util';
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
        let info: UIElementInfo | null = null;

        // Finds the UI Element in the document
        let uie: UIElement | null = this._docUtil.findUIElementInTheDocument( uiElementVariable, doc );

        // If not found, finds in the spec
        if ( ! uie ) {
            info = spec.uiElementsVariableMap().get( uiElementVariable );
            // Not found in the spec, register an error
            if ( ! info ) {
                const msg = `UI Element not found in the specification: ${uiElementVariable}`;
                errors.push( new Error( msg ) );
                return map; // empty
            }
            uie = info.uiElement;
        } else {
            info = new UIElementInfo( doc, uie, null, doc.feature || null );
        }

        // Returns if it is a non editable UI Element
        if ( ! this._uiePropExtractor.extractIsEditable( uie ) ) {
            return map; // empty
        }

        // Let's analyze the data type of the UI Element
        const dataType: string = this._uiePropExtractor.extractDataType( uie );
        // Converts to a system value type
        const valType: ValueType = enumUtil.getValues( ValueType ).find( v => v === dataType )
            || ValueType.STRING;
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

        // const minLength = this._uiePropExtractor.extractMinLength( uie );
        // const maxLength = this._uiePropExtractor.extractMaxLength( uie );
        // const minValue = this._uiePropExtractor.extractMinValue( uie );
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