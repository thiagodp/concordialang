import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";
import { DataTestCase, DataTestCaseGroupDef, DataTestCaseGroup } from "./DataTestCase";
import { DocumentUtil } from "../util/DocumentUtil";
import { UIElement, UIProperty } from "../ast/UIElement";
import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";
import { DataTestCaseVsValueType } from "./DataTestCaseVsValueType";
import { ValueType, ValueTypeDetector, adjustValueToTheRightType } from "../util/ValueTypeDetector";
import { toEnumValue } from "../util/ToEnumValue";
import { UIPropertyTypes } from "../util/UIPropertyTypes";
import { isDefined } from "../util/TypeChecking";
import { Entities } from "../nlp/Entities";
import { UIElementOperatorChecker } from "../util/UIElementOperatorChecker";
import { RuntimeException } from "../req/RuntimeException";
import { Constant } from "../ast/Constant";
import { DataGeneratorBuilder } from "./DataGeneratorBuilder";
import * as arrayDiff from 'arr-diff';
import * as enumUtil from 'enum-util';
import { Pair } from "ts-pair";
import { Step } from "../ast/Step";


/**
 * Data test case analysis result
 *
 * @author Thiago Delgado Pinto
 */
export enum DTCAnalysisResult {
    INCOMPATIBLE,
    INVALID,
    VALID
}

/**
 * Data test case analyzer
 *
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseAnalyzer {

    private readonly _docUtil = new DocumentUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _nlpUtil = new NLPUtil();
    private readonly _vsType = new DataTestCaseVsValueType();
    private readonly _opChecker = new UIElementOperatorChecker();
    private readonly _dataGenBuilder;

    constructor(
        seed: string
    ) {
        this._dataGenBuilder = new DataGeneratorBuilder( seed );
    }

    /**
     * Analysis a UI Element and returns a map with the available data test cases and
     * their analysis result.
     *
     * @param uie UI Element (input).
     * @param errors Errors found during the analysis (output).
     *
     * @returns A map for every DataTestCase with its result and an array of Otherwise steps,
     *          if applicable. Only when the analysis result is INVALID and the property
     *          explored by the DataTestCase has Otherwise steps, these steps are included.
     *          In all other cases, they receive an empty list.
     */
    analyzeUIElement(
        uie: UIElement,
        errors: Error[]
    ): Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > {

        let map = new Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > >();

        // Returns if not editable
        if ( ! this._uiePropExtractor.extractIsEditable( uie ) ) {
            return map; // empty
        }

        // Let's analyze the data type of the UI Element
        const dataType: string = this._uiePropExtractor.extractDataType( uie );
        // Converts to a system value type
        const valType: ValueType = toEnumValue( dataType, ValueType ) || ValueType.STRING;
        // Gets compatible data test cases
        let compatibles: DataTestCase[] = this._vsType.compatibleWith( valType );

        if ( compatibles.length < 1 ) { // Empty ?
            compatibles.push( DataTestCase.REQUIRED_FILLED ); // Should produce a random value
        }

        // Analyzes compatible rules (valid/invalid)
        for ( let dtc of compatibles ) {
            const result = this.analyzeProperties( valType, dtc, uie, errors );
            map.set( dtc, result );
        }

        // Sets incompatible ones
        const incompatibles: DataTestCase[] = arrayDiff( compatibles, enumUtil.getValues( DataTestCase ) );
        const incompatiblePair = new Pair( DTCAnalysisResult.INCOMPATIBLE, [] );
        for ( let dtc of incompatibles ) {
            map.set( dtc, incompatiblePair );
        }

        return map;
    }


    /**
     * Analyzes the various properties to decide for the result of the given data test case.
     *
     * @param valueType
     * @param dtc
     * @param uie
     */
    analyzeProperties(
        valueType: ValueType,
        dtc: DataTestCase,
        uie: UIElement,
        errors: RuntimeException[]
    ): Pair< DTCAnalysisResult, Step[] > {

        // Note: assumes that properties were validated previously, and conflicting properties were already solved.

        const groupDef = new DataTestCaseGroupDef();
        const group = groupDef.groupOf( dtc );

        const propertiesMap = this._uiePropExtractor.mapFirstProperty( uie );

        // Properties
        const pRequired = propertiesMap.get( UIPropertyTypes.REQUIRED ) || null;
        const pValue = propertiesMap.get( UIPropertyTypes.VALUE ) || null;
        const pMinLength = propertiesMap.get(  UIPropertyTypes.MIN_LENGTH ) || null;
        const pMaxLength = propertiesMap.get( UIPropertyTypes.MAX_LENGTH ) || null;
        const pMinValue = propertiesMap.get( UIPropertyTypes.MIN_VALUE ) || null;
        const pMaxValue = propertiesMap.get( UIPropertyTypes.MAX_VALUE ) || null;
        const pFormat = propertiesMap.get( UIPropertyTypes.FORMAT ) || null;

        const validPair = new Pair( DTCAnalysisResult.VALID, [] );
        const incompatiblePair = new Pair( DTCAnalysisResult.INCOMPATIBLE, [] );

        switch ( group ) {

            case DataTestCaseGroup.FORMAT: { // negation is not valid here
                if ( ! pFormat ) {
                    return incompatiblePair;
                }

                switch ( dtc ) {
                    case DataTestCase.FORMAT_VALID   : return validPair;
                    case DataTestCase.FORMAT_INVALID : return new Pair( DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || [] );
                }
                return incompatiblePair;
            }


            case DataTestCaseGroup.REQUIRED: { // negation is not valid here
                const isRequired: boolean = this._uiePropExtractor.extractIsRequired( uie );
                switch ( dtc ) {
                    case DataTestCase.REQUIRED_FILLED: return validPair;
                    case DataTestCase.REQUIRED_NOT_FILLED:
                        return isRequired
                            ? new Pair( DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || [] )
                            : validPair;
                }
                return incompatiblePair;
            }


            case DataTestCaseGroup.SET: {

                if ( ! pValue ) {
                    return incompatiblePair;
                }

                const hasValue = this._nlpUtil.hasEntityNamed( Entities.VALUE, pValue.nlpResult );
                const hasConstant = this._nlpUtil.hasEntityNamed( Entities.CONSTANT, pValue.nlpResult );

                if ( ! hasValue
                    && ! hasConstant
                    && ! this._nlpUtil.hasEntityNamed( Entities.QUERY, pValue.nlpResult )
                    && ! this._nlpUtil.hasEntityNamed( Entities.VALUE_LIST, pValue.nlpResult )
                ) {
                    return incompatiblePair;
                }

                const hasNegation = this.hasNegation( pValue ); // e.g., "value NOT IN ..."

                const invalidPair = new Pair( DTCAnalysisResult.INVALID, pValue.otherwiseSentences || [] );

                // Diminush the number of applicable test cases if it is a value or a constant
                if ( hasValue || hasConstant ) {
                    if (  DataTestCase.SET_FIRST_ELEMENT === dtc ) {
                        return hasNegation ? invalidPair : validPair;
                    } else if ( DataTestCase.SET_NOT_IN_SET === dtc ) {
                        return hasNegation ? validPair : invalidPair;
                    }
                    return incompatiblePair;
                }

                switch ( dtc ) {
                    case DataTestCase.SET_FIRST_ELEMENT  : ; // next
                    case DataTestCase.SET_LAST_ELEMENT   : ; // next
                    case DataTestCase.SET_RANDOM_ELEMENT : return hasNegation ? invalidPair : validPair;
                    case DataTestCase.SET_NOT_IN_SET     : return hasNegation ? validPair : invalidPair;
                }

                return incompatiblePair;
            }


            case DataTestCaseGroup.VALUE: {

                const hasMinValue = isDefined( pMinValue );
                const hasMaxValue = isDefined( pMaxValue );

                if ( ! hasMinValue && ! hasMaxValue ) {
                    return incompatiblePair;
                }

                let [ minValue, isToFakeMinValue ] = hasMinValue
                    ? this.resolvePropertyValue( UIPropertyTypes.MIN_VALUE, pMinValue, valueType )
                    : [ null, false ];

                let [ maxValue, isToFakeMaxValue ] = hasMaxValue
                    ? this.resolvePropertyValue( UIPropertyTypes.MAX_VALUE, pMaxValue, valueType )
                    : [ null, false ];


                const invalidMinPair = new Pair( DTCAnalysisResult.INVALID, hasMinValue ? pMinValue.otherwiseSentences || [] : [] );
                const invalidMaxPair = new Pair( DTCAnalysisResult.INVALID, hasMaxValue ? pMaxValue.otherwiseSentences || [] : [] );

                // Since we are simulating min value and max value when they come from a QUERY or a UI_ELEMENT,
                // the data test VALUE_ZERO may be invalid or incompatible in some cases
                if ( DataTestCase.VALUE_ZERO === dtc ) {

                    // VALUE_ZERO considered INVALID when min > 0 || max < 0
                    if ( isDefined( maxValue ) && maxValue < 0 || isDefined( minValue ) && minValue > 0 ) {

                        if ( isDefined( maxValue ) ) {
                            return invalidMaxPair;
                        }

                        return invalidMinPair;

                    // VALUE_ZERO not generated when min_value comes from a QUERY or a UI_ELEMENT
                    } else if ( isToFakeMinValue || isToFakeMaxValue ) {
                        return incompatiblePair;
                    }
                }

                if ( isToFakeMinValue ) {
                    if ( isToFakeMaxValue ) {
                        // Both need to be faked, let's generate random min and max
                        minValue = this._dataGenBuilder.raw( valueType ).randomBetweenMinAndMax();
                        maxValue = this._dataGenBuilder.raw( valueType, minValue ).randomBetweenMinAndMax();
                        isToFakeMaxValue = false;
                    } else {
                        minValue = this._dataGenBuilder.raw( valueType, null, maxValue ).randomBetweenMinAndMax();
                    }
                }

                if ( isToFakeMaxValue ) {
                    maxValue = this._dataGenBuilder.raw( valueType, minValue ).randomBetweenMinAndMax();
                }

                let analyzer = this._dataGenBuilder.rawAnalyzer( valueType, minValue, maxValue );

                // When there is no min/max restriction, any value equal to or less/greater is considered valid.

                switch ( dtc ) {

                    case DataTestCase.VALUE_LOWEST                  : ; // next
                    case DataTestCase.VALUE_RANDOM_BELOW_MIN        : ; // next
                    case DataTestCase.VALUE_JUST_BELOW_MIN          :
                        return analyzer.hasValuesBelowMin() ? invalidMinPair : validPair;

                    case DataTestCase.VALUE_MIN                     : ; // next
                    case DataTestCase.VALUE_MEDIAN                  : ; // next
                    case DataTestCase.VALUE_MAX                     : return validPair;

                    case DataTestCase.VALUE_JUST_ABOVE_MIN          : ; // next
                    case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX  : ; // next
                    case DataTestCase.VALUE_JUST_BELOW_MAX          :
                        return analyzer.hasValuesBetweenMinAndMax()
                            ? validPair
                            : hasMinValue ? invalidMinPair : invalidMaxPair;

                    case DataTestCase.VALUE_ZERO                    :
                        return analyzer.isZeroBetweenMinAndMax()
                            ? validPair
                            : hasMinValue ? invalidMinPair : invalidMaxPair;

                    case DataTestCase.VALUE_JUST_ABOVE_MAX          : ; // next
                    case DataTestCase.VALUE_RANDOM_ABOVE_MAX        : ; // next
                    case DataTestCase.VALUE_GREATEST                :
                        return analyzer.hasValuesAboveMax() ? invalidMaxPair : validPair;
                }

                return incompatiblePair;
            }


            case DataTestCaseGroup.LENGTH: {

                const hasMinLength = isDefined( pMinLength );
                const hasMaxLength = isDefined( pMaxLength );

                if ( ! hasMinLength && ! hasMaxLength ) {
                    return incompatiblePair;
                }

                // We are simulating min length and max length when they come from a QUERY or a UI_ELEMENT

                let [ minLength, isToFakeMinLength ] = hasMinLength
                    ? this.resolvePropertyValue( UIPropertyTypes.MIN_LENGTH, pMinLength, valueType )
                    : [ null, false ];

                let [ maxLength, isToFakeMaxLength ] = hasMaxLength
                    ? this.resolvePropertyValue( UIPropertyTypes.MAX_LENGTH, pMaxLength, valueType )
                    : [ null, false ];

                if ( isToFakeMinLength ) {
                    minLength = 2;  // fake with fixed value - does not matter, since it is to evaluate data test case
                }

                if ( isToFakeMaxLength ) {
                    maxLength = 60; // fake with fixed value - does not matter, since it is to evaluate data test case
                }

                let analyzer = this._dataGenBuilder.buildRawAnalyzer( valueType, minLength, maxLength );

                const invalidMinPair = new Pair( DTCAnalysisResult.INVALID, hasMinLength ? pMinLength.otherwiseSentences || [] : [] );
                const invalidMaxPair = new Pair( DTCAnalysisResult.INVALID, hasMaxLength ? pMaxLength.otherwiseSentences || [] : [] );

                // When there is no min/max restriction, any value equal to or less/greater is considered valid.

                switch ( dtc ) {

                    case DataTestCase.LENGTH_LOWEST                  : ; // next
                    case DataTestCase.LENGTH_RANDOM_BELOW_MIN        : ; // next
                    case DataTestCase.LENGTH_JUST_BELOW_MIN          :
                        return analyzer.hasValuesBelowMin() ? invalidMinPair : validPair;

                    case DataTestCase.LENGTH_MIN                     : ; // next
                    case DataTestCase.LENGTH_MEDIAN                  : ; // next
                    case DataTestCase.LENGTH_MAX                     :
                        return validPair;

                    case DataTestCase.LENGTH_JUST_ABOVE_MIN          : ; // next
                    case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX  : ; // next
                    case DataTestCase.LENGTH_JUST_BELOW_MAX          :
                        return analyzer.hasValuesBetweenMinAndMax()
                            ? validPair
                            : hasMinLength ? invalidMinPair : invalidMaxPair;

                    case DataTestCase.LENGTH_JUST_ABOVE_MAX          : ; // next
                    case DataTestCase.LENGTH_RANDOM_ABOVE_MAX        : ; // next
                    case DataTestCase.LENGTH_GREATEST                :
                        return analyzer.hasValuesAboveMax() ? invalidMaxPair : validPair;
                }

                return incompatiblePair;
            }


            case DataTestCaseGroup.COMPUTATION: { // not supported yet
                return incompatiblePair;
            }

            default: return incompatiblePair;
        }
    }


    /**
     * Resolve VALUE, NUMBER, CONSTANT and mark QUERY and UI_ELEMENT to be faked.
     *
     * @param propType
     * @param uip
     * @param valueType
     * @returns Array whose first element is the value and second element is the indication whether it is faked.
     */
    resolvePropertyValue( propType: UIPropertyTypes, uip: UIProperty, valueType: ValueType ): [ any, boolean ] {

        if ( ! uip ) {
            return [ null, false ];
        }

        switch ( uip.value.entity ) {

            case Entities.CONSTANT: {
                const constant = uip.value.references[ 0 ] as Constant;
                if ( isDefined( constant ) ) {
                    return [ adjustValueToTheRightType( constant.value ), false ];
                }
                return [ null, false ];
            }

            // case Entities.COMPUTATION: ; // next
            case Entities.QUERY: ; // next
            case Entities.UI_ELEMENT: {
                return [ null, true ]; // << FAKED !
            }

            default: return [ uip.value.value, false ];
        }
    }

    hasNegation( uip: UIProperty ): boolean {
        return this._nlpUtil.hasEntityNamed( Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult );
    }

}