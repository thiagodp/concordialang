import * as arrayDiff from 'arr-diff';
import * as enumUtil from 'enum-util';

import { Constant, ReservedTags, Step, UIElement, UIProperty } from '../ast';
import { UIPropertyTypes } from '../ast/UIPropertyTypes';
import { RuntimeException } from '../error/RuntimeException';
import { Entities, NLPUtil } from '../nlp';
import { isDefined } from '../util/TypeChecking';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';
import { adjustValueToTheRightType, ValueType } from '../util/ValueTypeDetector';
import { DataGeneratorBuilder } from './DataGeneratorBuilder';
import { DataTestCase, DataTestCaseGroup, DataTestCaseGroupDef } from './DataTestCase';
import { RangeAnalyzer } from './raw/RangeAnalyzer';


/**
 * Data test case analysis result
 *
 * @author Thiago Delgado Pinto
 */
export enum DTCAnalysisResult {
    INCOMPATIBLE = 'incompatible',
    INVALID = 'invalid',
    VALID = 'valid'
}

export class DTCAnalysisData {
    constructor(
        public result: DTCAnalysisResult,
        public oracles: Step[] = [],
        public uieVariableDependencies: string[] = []
    ) {
    }
}

export type DTCMap = Map< DataTestCase, DTCAnalysisData >;

/**
 * A map from UI Element Variables to another map containing all available DataTestCases
 * and their respective expected result (valid, invalid or incompatible) plus the eventual
 * Oracle steps applicable in case of a invalid result.
 */
export type UIEVariableToDTCMap = Map< string, DTCMap >;


/**
 * Data test case analyzer
 *
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseAnalyzer {

    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _nlpUtil = new NLPUtil();
    private readonly _dataGenBuilder: DataGeneratorBuilder;

    constructor( seed: string ) {
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
        errors: RuntimeException[]
    ): DTCMap {

        let map: DTCMap = new Map< DataTestCase, DTCAnalysisData >();

        // Returns if not editable
        if ( ! this._uiePropExtractor.extractIsEditable( uie ) ) {
            // console.log( 'NOT EDITABLE:', uie.name);
            return map; // empty
        }

        // // Let's analyze the data type of the UI Element
        // const dataType: string = this._uiePropExtractor.extractDataType( uie );
        // // Converts to a system value type
        // const valType: ValueType = toEnumValue( dataType, ValueType ) || ValueType.STRING;
        // // Gets compatible data test cases
        // let compatibles: DataTestCase[] = this._vsType.compatibleWith( valType );

        // if ( compatibles.length < 1 ) { // Empty ?
        //     // console.log( 'NO COMPATIBLES:', uie.name );
        //     compatibles.push( DataTestCase.REQUIRED_FILLED ); // Should produce a random value
        // }

        let compatibles: DataTestCase[] = enumUtil.getValues( DataTestCase );
        const incompatiblePair = new DTCAnalysisData( DTCAnalysisResult.INCOMPATIBLE, [] );

        // Analyzes compatible rules (valid/invalid)
        for ( let dtc of compatibles ) {
            try {
                // Result, Otherwise steps
                const result: DTCAnalysisData = this.analyzeProperties( dtc, uie, errors );
                // console.log( 'Analysis', dtc, result.getFirst() );
                map.set( dtc, result );
            } catch ( e ) {
                map.set( dtc, incompatiblePair );
                // errors.push( new RuntimeException( e.message, uie.location ) );
                // Variable errors already consumes the error
            }
        }

        // Sets incompatible ones
        const incompatibles: DataTestCase[] = arrayDiff( compatibles, enumUtil.getValues( DataTestCase ) );
        for ( let dtc of incompatibles ) {
            map.set( dtc, incompatiblePair );
        }

        return map;
    }


    /**
     * Analyzes the various properties to decide for the result of the given data test case.
     *
     * @param dtc
     * @param uie
     * @param errors
     */
    analyzeProperties(
        dtc: DataTestCase,
        uie: UIElement,
        errors: RuntimeException[]
    ): DTCAnalysisData {

        // Note: assumes that properties were validated previously, and conflicting properties were already solved.

        const groupDef = new DataTestCaseGroupDef();
        const group = groupDef.groupOf( dtc );

        const propertiesMap = this._uiePropExtractor.mapFirstPropertyOfEachType( uie );

        // Properties
        const pRequired = propertiesMap.get( UIPropertyTypes.REQUIRED ) || null;
        const pValue = propertiesMap.get( UIPropertyTypes.VALUE ) || null;
        const pMinLength = propertiesMap.get(  UIPropertyTypes.MIN_LENGTH ) || null;
        const pMaxLength = propertiesMap.get( UIPropertyTypes.MAX_LENGTH ) || null;
        const pMinValue = propertiesMap.get( UIPropertyTypes.MIN_VALUE ) || null;
        const pMaxValue = propertiesMap.get( UIPropertyTypes.MAX_VALUE ) || null;
        const pFormat = propertiesMap.get( UIPropertyTypes.FORMAT ) || null;

        // Tags
        const propertyHasTagGenerateOnlyValidValues = ( p: UIProperty ): boolean => {
            return p.tags && p.tags.length > 0
                && p.tags.findIndex( tag => tag.subType === ReservedTags.GENERATE_ONLY_VALID_VALUES ) >= 0;
        };
        const pRequiredHasTagGenerateOnlyValidValues = pRequired && propertyHasTagGenerateOnlyValidValues( pRequired );
        const pValueHasTagGenerateOnlyValidValues = pValue && propertyHasTagGenerateOnlyValidValues( pValue );
        const pMinLengthHasTagGenerateOnlyValidValues = pMinLength && propertyHasTagGenerateOnlyValidValues( pMinLength );
        const pMaxLengthHasTagGenerateOnlyValidValues = pMaxLength && propertyHasTagGenerateOnlyValidValues( pMaxLength );
        const pMinValueHasTagGenerateOnlyValidValues = pMinValue && propertyHasTagGenerateOnlyValidValues( pMinValue );
        const pMaxValueHasTagGenerateOnlyValidValues = pMaxValue && propertyHasTagGenerateOnlyValidValues( pMaxValue );
        const pFormatHasTagGenerateOnlyValidValues = pFormat && propertyHasTagGenerateOnlyValidValues( pFormat );

        // Data type

        // let valueType = ValueType.STRING;
        // if ( propertiesMap.has( UIPropertyTypes.DATA_TYPE ) ) {
        //     valueType = this._uiePropExtractor.extractDataType( uie );
        // } else {
        //     //
        //     // Assumes INTEGER if it has some of the following properties, aiming at to
        //     // be compatible with some data test cases. The right type is maybe not important
        //     // since the test cases of the group VALUE will fit.
        //     //
        //     if ( isDefined( pValue ) || isDefined( pMinValue ) || isDefined( pMaxValue ) ) {
        //         valueType = ValueType.INTEGER;
        //     }
        // }

        // v2.0
        let valueType = this._uiePropExtractor.guessDataType( propertiesMap );

        // console.log( 'group', group, 'valueType', valueType, 'propertiesMap', propertiesMap.keys() );

        const validPair = new DTCAnalysisData( DTCAnalysisResult.VALID, [] );
        const incompatiblePair = new DTCAnalysisData( DTCAnalysisResult.INCOMPATIBLE, [] );

        switch ( group ) {

            case DataTestCaseGroup.FORMAT: { // negation is not valid here
                if ( ! pFormat ) {
                    return incompatiblePair;
                }

                switch ( dtc ) {
                    case DataTestCase.FORMAT_VALID: {

                        // Does not consider FORMAT_VALID whether it has a value-related property
                        const hasAnyValueOrLengthProperty = isDefined( pValue ) ||
                            isDefined( pMinValue ) || isDefined( pMaxValue ) ||
                            isDefined( pMinLength ) || isDefined( pMaxLength );

                        return hasAnyValueOrLengthProperty ? incompatiblePair : validPair;
                    }
                    case DataTestCase.FORMAT_INVALID: {

                        if ( pFormatHasTagGenerateOnlyValidValues ) {
                            return incompatiblePair;
						}

						const val = pFormat.value.value.toString();

						const someExpressionsWithoutInvalidValues = [
							'.', '^.', '(.)', '.*', '^.*',
						];
						if ( someExpressionsWithoutInvalidValues.includes( val ) ) {
							return incompatiblePair;
						}

                        return new DTCAnalysisData( DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || [] );
                    }
                }
                return incompatiblePair;
            }


			case DataTestCaseGroup.REQUIRED: { // negation is not valid here

				const isRequired: boolean = this._uiePropExtractor.extractIsRequired( uie );

                switch ( dtc ) {

                    case DataTestCase.REQUIRED_FILLED: {

                        // Check whether the value has a reference to another UI Element
                        if ( isDefined( pValue ) ) {
                            const hasQuery = this._nlpUtil.hasEntityNamed( Entities.QUERY, pValue.nlpResult );
                            if ( hasQuery ) {
                                // return new Pair( DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || [] );
                                return incompatiblePair;
                            }
						}

						if ( pFormat ) {
							return incompatiblePair;
						}

                        return validPair;
                    }

                    case DataTestCase.REQUIRED_NOT_FILLED: {

						// console.log( 'Analyzing REQUIRED_NOT_FILLED', 'isRequired', isRequired );

                        // // Incompatible if value comes from a query
                        // if ( isDefined( pValue )
                        //     && this._nlpUtil.hasEntityNamed( Entities.QUERY, pValue.nlpResult ) ) {
                        //     return incompatiblePair;
                        // }

                        if ( isRequired && pRequiredHasTagGenerateOnlyValidValues ) {
                            return incompatiblePair;
						}

						if ( isRequired ) {
							return new DTCAnalysisData( DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || [] );
						}

						if ( pFormat ) {
							// Check if an empty string is compatible with the regex
							try {
								const val = pFormat.value.value.toString();
								// console.log( 'REQUIRED_NOT_FILLED - expression', val );
								const r = new RegExp( val );
								if ( ! r.test( '' ) ) {
									return new DTCAnalysisData(
										DTCAnalysisResult.INVALID,
										pFormat.otherwiseSentences || [] // from format
									);
								}
								// If continue is because it passes the regex
							} catch {
								return incompatiblePair;
							}
						}

						return validPair;
                    }
                }
                return incompatiblePair;
            }


            case DataTestCaseGroup.SET: {

                // TO-DO:   Analyze if the has QUERY and the QUERY depends on another UI Element
                //          If it depends and the data test case of the other element is INVALID,
                //          the result should also be invalid.

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

                const invalidPair = new DTCAnalysisData( DTCAnalysisResult.INVALID, pValue.otherwiseSentences || [] );

                // Diminish the number of applicable test cases if it is a value or a constant
                if ( hasValue || hasConstant ) {
                    if (  DataTestCase.SET_FIRST_ELEMENT === dtc ) {

                        if ( hasNegation ) {

                            if ( pValueHasTagGenerateOnlyValidValues ) {
                                return incompatiblePair;
                            }
                            return invalidPair;
                        }

                        return validPair;

                    } else if ( DataTestCase.SET_NOT_IN_SET === dtc ) {

                        if ( hasNegation ) {
                            return validPair;
                        }

                        if ( pValueHasTagGenerateOnlyValidValues ) {
                            return incompatiblePair;
                        }

                        return invalidPair;
                    }
                    return incompatiblePair;
                }


                // // Check whether the value has a reference to another UI Element
                // if ( isDefined( pValue ) ) {
                //     const hasQuery = this._nlpUtil.hasEntityNamed( Entities.QUERY, pValue.nlpResult );

                //     const hasRefToUIE = isDefined( pValue.value.references.find(
                //         node => node.nodeType === NodeTypes.UI_ELEMENT ) );

                //     if ( hasQuery && hasRefToUIE ) {
                //         const invalidPair = new Pair( DTCAnalysisResult.INVALID, pValue.otherwiseSentences || [] );
                //         return invalidPair;
                //     }
                // }

                switch ( dtc ) {
                    case DataTestCase.SET_FIRST_ELEMENT  : // next
                    case DataTestCase.SET_LAST_ELEMENT   : // next
                    case DataTestCase.SET_RANDOM_ELEMENT : {

                        if ( hasNegation ) {

                            if ( pValueHasTagGenerateOnlyValidValues ) {
                                return incompatiblePair;
                            }
                            return invalidPair;
                        }

                        return validPair;
                    }

                    case DataTestCase.SET_NOT_IN_SET: {

                        if ( hasNegation ) {
                            return validPair;
                        }

                        if ( pValueHasTagGenerateOnlyValidValues ) {
                            return incompatiblePair;
                        }

                        return invalidPair;
                    }
                }

                return incompatiblePair;
            }


            case DataTestCaseGroup.VALUE: {

                // If it has VALUE property:
                // - it must NOT generate VALID length values but it must generate invalid.
                // - if it has negation, it must generate VALID as valid, and INVALID as invalid.
                const hasValueProperty = isDefined( pValue );
                const valueHasNegation = hasValueProperty && this.hasNegation( pValue ); // e.g., "value NOT IN ..."

                const shouldGenerateValid = ! hasValueProperty || ( hasValueProperty && valueHasNegation );

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

                const invalidMinPair = new DTCAnalysisData( DTCAnalysisResult.INVALID, hasMinValue ? pMinValue.otherwiseSentences || [] : [] );
                const invalidMaxPair = new DTCAnalysisData( DTCAnalysisResult.INVALID, hasMaxValue ? pMaxValue.otherwiseSentences || [] : [] );

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

                let analyzer: RangeAnalyzer = this._dataGenBuilder.rawAnalyzer( valueType, minValue, maxValue );

                switch ( dtc ) {

                    case DataTestCase.VALUE_LOWEST: // next
                    case DataTestCase.VALUE_RANDOM_BELOW_MIN: // next
                    case DataTestCase.VALUE_JUST_BELOW_MIN: {

                        if ( hasMinValue || isToFakeMinValue ) {

                            if ( analyzer.hasValuesBelowMin() ) {

                                if ( pMinValueHasTagGenerateOnlyValidValues ) {
                                    return incompatiblePair;
                                }

                                return invalidMinPair;
                            } else {
                                return shouldGenerateValid ? validPair : incompatiblePair;
                            }
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.VALUE_JUST_ABOVE_MIN: // next
                    case DataTestCase.VALUE_MIN: {
                        if ( hasMinValue || isToFakeMinValue ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX: // next
                    case DataTestCase.VALUE_MEDIAN: {
                        if ( ( hasMinValue || isToFakeMinValue ) && ( hasMaxValue || isToFakeMaxValue ) ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.VALUE_JUST_BELOW_MAX: // next
                    case DataTestCase.VALUE_MAX: {
                        if ( hasMaxValue || isToFakeMaxValue ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.VALUE_ZERO: {
                        if ( ( hasMinValue || isToFakeMinValue ) && ( hasMaxValue || isToFakeMaxValue ) ) {
                            if ( analyzer.isZeroBetweenMinAndMax()  ) {
                                return shouldGenerateValid ? validPair : incompatiblePair;
                            }

                            if ( pMinValueHasTagGenerateOnlyValidValues || pMaxValueHasTagGenerateOnlyValidValues ) {
                                return incompatiblePair;
                            }

                            return analyzer.isZeroBelowMin() ? invalidMinPair : invalidMaxPair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.VALUE_JUST_ABOVE_MAX: // next
                    case DataTestCase.VALUE_RANDOM_ABOVE_MAX: // next
                    case DataTestCase.VALUE_GREATEST: {
                        if ( hasMaxValue || isToFakeMaxValue ) {

                            if ( analyzer.hasValuesAboveMax() ) {

                                if ( pMaxValueHasTagGenerateOnlyValidValues ) {
                                    return incompatiblePair;
                                }

                                return invalidMaxPair;
                            }

                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                }

                return incompatiblePair;
            }


            case DataTestCaseGroup.LENGTH: {

                const isRequired: boolean = this._uiePropExtractor.extractIsRequired( uie );

                // If it has VALUE property:
                // - it must NOT generate VALID length values but it must generate invalid.
                // - if it has negation, it must generate VALID as valid, and INVALID as invalid.
                const hasValueProperty = isDefined( pValue );
                const valueHasNegation = hasValueProperty && this.hasNegation( pValue ); // e.g., "value NOT IN ..."

                const shouldGenerateValid = ! hasValueProperty || ( hasValueProperty && valueHasNegation );


                // // Does not consider FORMAT_VALID whether it has a value-related property
                // const hasAnyValueOrLengthProperty = isDefined( pValue ) ||
                //     isDefined( pMinValue ) || isDefined( pMaxValue ) ||
                //     isDefined( pMinLength ) || isDefined( pMaxLength );

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

                let analyzer: RangeAnalyzer = this._dataGenBuilder.rawAnalyzer( valueType, minLength, maxLength );

                const invalidMinPair = new DTCAnalysisData( DTCAnalysisResult.INVALID, hasMinLength ? pMinLength.otherwiseSentences || [] : [] );
                const invalidMaxPair = new DTCAnalysisData( DTCAnalysisResult.INVALID, hasMaxLength ? pMaxLength.otherwiseSentences || [] : [] );


                switch ( dtc ) {

                    case DataTestCase.LENGTH_LOWEST: // next
                    case DataTestCase.LENGTH_RANDOM_BELOW_MIN: // next
                    case DataTestCase.LENGTH_JUST_BELOW_MIN: {

                        if ( isRequired ) {

                            if ( dtc === DataTestCase.LENGTH_LOWEST ) {
                                return incompatiblePair;
                            }

                            if ( dtc === DataTestCase.LENGTH_RANDOM_BELOW_MIN &&
                                2 === minLength && ! isToFakeMinLength ) {
                                return incompatiblePair;
                            }

                            if ( dtc === DataTestCase.LENGTH_JUST_BELOW_MIN &&
                                1 === minLength && ! isToFakeMinLength ) {
                                return incompatiblePair;
                            }
                        }

                        if ( hasMinLength || isToFakeMinLength ) {

                            if ( analyzer.hasValuesBelowMin() ) {

                                if ( pMinLengthHasTagGenerateOnlyValidValues ) {
                                    return incompatiblePair;
                                }

                                return invalidMinPair;
                            }

                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.LENGTH_JUST_ABOVE_MIN: // next
                    case DataTestCase.LENGTH_MIN: {
                        if ( hasMinLength || isToFakeMinLength ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX: // next
                    case DataTestCase.LENGTH_MEDIAN: {
                        if ( ( hasMinLength || isToFakeMinLength ) && ( hasMaxLength || isToFakeMaxLength ) ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.LENGTH_JUST_BELOW_MAX: // next
                    case DataTestCase.LENGTH_MAX: {
                        if ( hasMaxLength || isToFakeMaxLength ) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

                    case DataTestCase.LENGTH_JUST_ABOVE_MAX: // next
                    case DataTestCase.LENGTH_RANDOM_ABOVE_MAX: // next
                    case DataTestCase.LENGTH_GREATEST: {
                        if ( hasMaxLength || isToFakeMaxLength ) {

                            if ( analyzer.hasValuesAboveMax() ) {

                                if ( pMaxLengthHasTagGenerateOnlyValidValues ) {
                                    return incompatiblePair;
                                }
                                return invalidMaxPair;
                            }

                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }

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

            // case Entities.COMPUTATION: // next
            case Entities.QUERY: // next
            case Entities.UI_ELEMENT_REF: {
                return [ null, true ]; // << FAKED !
            }

            default: return [ uip.value.value, false ];
        }
    }

    hasNegation( uip: UIProperty ): boolean {
        return this._nlpUtil.hasEntityNamed( Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult );
    }

}
