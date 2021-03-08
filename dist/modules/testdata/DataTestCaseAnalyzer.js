"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTestCaseAnalyzer = exports.DTCAnalysisData = exports.DTCAnalysisResult = void 0;
const arrayDiff = require("arr-diff");
const enumUtil = require("enum-util");
const ast_1 = require("../ast");
const UIPropertyTypes_1 = require("../ast/UIPropertyTypes");
const nlp_1 = require("../nlp");
const TypeChecking_1 = require("../util/TypeChecking");
const UIElementPropertyExtractor_1 = require("../util/UIElementPropertyExtractor");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const DataGeneratorBuilder_1 = require("./DataGeneratorBuilder");
const DataTestCase_1 = require("./DataTestCase");
/**
 * Data test case analysis result
 *
 * @author Thiago Delgado Pinto
 */
var DTCAnalysisResult;
(function (DTCAnalysisResult) {
    DTCAnalysisResult["INCOMPATIBLE"] = "incompatible";
    DTCAnalysisResult["INVALID"] = "invalid";
    DTCAnalysisResult["VALID"] = "valid";
})(DTCAnalysisResult = exports.DTCAnalysisResult || (exports.DTCAnalysisResult = {}));
class DTCAnalysisData {
    constructor(result, oracles = [], uieVariableDependencies = []) {
        this.result = result;
        this.oracles = oracles;
        this.uieVariableDependencies = uieVariableDependencies;
    }
}
exports.DTCAnalysisData = DTCAnalysisData;
/**
 * Data test case analyzer
 *
 * @author Thiago Delgado Pinto
 */
class DataTestCaseAnalyzer {
    constructor(seed) {
        this._uiePropExtractor = new UIElementPropertyExtractor_1.UIElementPropertyExtractor();
        this._nlpUtil = new nlp_1.NLPUtil();
        this._dataGenBuilder = new DataGeneratorBuilder_1.DataGeneratorBuilder(seed);
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
    analyzeUIElement(uie, errors) {
        let map = new Map();
        // Returns if not editable
        if (!this._uiePropExtractor.extractIsEditable(uie)) {
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
        let compatibles = enumUtil.getValues(DataTestCase_1.DataTestCase);
        const incompatiblePair = new DTCAnalysisData(DTCAnalysisResult.INCOMPATIBLE, []);
        // Analyzes compatible rules (valid/invalid)
        for (let dtc of compatibles) {
            try {
                // Result, Otherwise steps
                const result = this.analyzeProperties(dtc, uie, errors);
                // console.log( 'Analysis', dtc, result.getFirst() );
                map.set(dtc, result);
            }
            catch (e) {
                map.set(dtc, incompatiblePair);
                // errors.push( new RuntimeException( e.message, uie.location ) );
                // Variable errors already consumes the error
            }
        }
        // Sets incompatible ones
        const incompatibles = arrayDiff(compatibles, enumUtil.getValues(DataTestCase_1.DataTestCase));
        for (let dtc of incompatibles) {
            map.set(dtc, incompatiblePair);
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
    analyzeProperties(dtc, uie, errors) {
        // Note: assumes that properties were validated previously, and conflicting properties were already solved.
        const groupDef = new DataTestCase_1.DataTestCaseGroupDef();
        const group = groupDef.groupOf(dtc);
        const propertiesMap = this._uiePropExtractor.mapFirstPropertyOfEachType(uie);
        // Properties
        const pRequired = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.REQUIRED) || null;
        const pValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.VALUE) || null;
        const pMinLength = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MIN_LENGTH) || null;
        const pMaxLength = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MAX_LENGTH) || null;
        const pMinValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MIN_VALUE) || null;
        const pMaxValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MAX_VALUE) || null;
        const pFormat = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.FORMAT) || null;
        // Tags
        const propertyHasTagGenerateOnlyValidValues = (p) => {
            return p.tags && p.tags.length > 0
                && p.tags.findIndex(tag => tag.subType === ast_1.ReservedTags.GENERATE_ONLY_VALID_VALUES) >= 0;
        };
        const pRequiredHasTagGenerateOnlyValidValues = pRequired && propertyHasTagGenerateOnlyValidValues(pRequired);
        const pValueHasTagGenerateOnlyValidValues = pValue && propertyHasTagGenerateOnlyValidValues(pValue);
        const pMinLengthHasTagGenerateOnlyValidValues = pMinLength && propertyHasTagGenerateOnlyValidValues(pMinLength);
        const pMaxLengthHasTagGenerateOnlyValidValues = pMaxLength && propertyHasTagGenerateOnlyValidValues(pMaxLength);
        const pMinValueHasTagGenerateOnlyValidValues = pMinValue && propertyHasTagGenerateOnlyValidValues(pMinValue);
        const pMaxValueHasTagGenerateOnlyValidValues = pMaxValue && propertyHasTagGenerateOnlyValidValues(pMaxValue);
        const pFormatHasTagGenerateOnlyValidValues = pFormat && propertyHasTagGenerateOnlyValidValues(pFormat);
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
        let valueType = this._uiePropExtractor.guessDataType(propertiesMap);
        // console.log( 'group', group, 'valueType', valueType, 'propertiesMap', propertiesMap.keys() );
        const validPair = new DTCAnalysisData(DTCAnalysisResult.VALID, []);
        const incompatiblePair = new DTCAnalysisData(DTCAnalysisResult.INCOMPATIBLE, []);
        switch (group) {
            case DataTestCase_1.DataTestCaseGroup.FORMAT: { // negation is not valid here
                if (!pFormat) {
                    return incompatiblePair;
                }
                switch (dtc) {
                    case DataTestCase_1.DataTestCase.FORMAT_VALID: {
                        // Does not consider FORMAT_VALID whether it has a value-related property
                        const hasAnyValueOrLengthProperty = TypeChecking_1.isDefined(pValue) ||
                            TypeChecking_1.isDefined(pMinValue) || TypeChecking_1.isDefined(pMaxValue) ||
                            TypeChecking_1.isDefined(pMinLength) || TypeChecking_1.isDefined(pMaxLength);
                        return hasAnyValueOrLengthProperty ? incompatiblePair : validPair;
                    }
                    case DataTestCase_1.DataTestCase.FORMAT_INVALID: {
                        if (pFormatHasTagGenerateOnlyValidValues) {
                            return incompatiblePair;
                        }
                        const val = pFormat.value.value.toString();
                        const someExpressionsWithoutInvalidValues = [
                            '.', '^.', '(.)', '.*', '^.*',
                        ];
                        if (someExpressionsWithoutInvalidValues.includes(val)) {
                            return incompatiblePair;
                        }
                        return new DTCAnalysisData(DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || []);
                    }
                }
                return incompatiblePair;
            }
            case DataTestCase_1.DataTestCaseGroup.REQUIRED: { // negation is not valid here
                const isRequired = this._uiePropExtractor.extractIsRequired(uie);
                switch (dtc) {
                    case DataTestCase_1.DataTestCase.REQUIRED_FILLED: {
                        // Check whether the value has a reference to another UI Element
                        if (TypeChecking_1.isDefined(pValue)) {
                            const hasQuery = this._nlpUtil.hasEntityNamed(nlp_1.Entities.QUERY, pValue.nlpResult);
                            if (hasQuery) {
                                // return new Pair( DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || [] );
                                return incompatiblePair;
                            }
                        }
                        if (pFormat) {
                            return incompatiblePair;
                        }
                        return validPair;
                    }
                    case DataTestCase_1.DataTestCase.REQUIRED_NOT_FILLED: {
                        // console.log( 'Analyzing REQUIRED_NOT_FILLED', 'isRequired', isRequired );
                        // // Incompatible if value comes from a query
                        // if ( isDefined( pValue )
                        //     && this._nlpUtil.hasEntityNamed( Entities.QUERY, pValue.nlpResult ) ) {
                        //     return incompatiblePair;
                        // }
                        if (isRequired && pRequiredHasTagGenerateOnlyValidValues) {
                            return incompatiblePair;
                        }
                        if (isRequired) {
                            return new DTCAnalysisData(DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || []);
                        }
                        if (pFormat) {
                            // Check if an empty string is compatible with the regex
                            try {
                                const val = pFormat.value.value.toString();
                                // console.log( 'REQUIRED_NOT_FILLED - expression', val );
                                const r = new RegExp(val);
                                if (!r.test('')) {
                                    return new DTCAnalysisData(DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || [] // from format
                                    );
                                }
                                // If continue is because it passes the regex
                            }
                            catch (_a) {
                                return incompatiblePair;
                            }
                        }
                        return validPair;
                    }
                }
                return incompatiblePair;
            }
            case DataTestCase_1.DataTestCaseGroup.SET: {
                // TO-DO:   Analyze if the has QUERY and the QUERY depends on another UI Element
                //          If it depends and the data test case of the other element is INVALID,
                //          the result should also be invalid.
                if (!pValue) {
                    return incompatiblePair;
                }
                const hasValue = this._nlpUtil.hasEntityNamed(nlp_1.Entities.VALUE, pValue.nlpResult);
                const hasConstant = this._nlpUtil.hasEntityNamed(nlp_1.Entities.CONSTANT, pValue.nlpResult);
                if (!hasValue
                    && !hasConstant
                    && !this._nlpUtil.hasEntityNamed(nlp_1.Entities.QUERY, pValue.nlpResult)
                    && !this._nlpUtil.hasEntityNamed(nlp_1.Entities.VALUE_LIST, pValue.nlpResult)) {
                    return incompatiblePair;
                }
                const hasNegation = this.hasNegation(pValue); // e.g., "value NOT IN ..."
                const invalidPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, pValue.otherwiseSentences || []);
                // Diminish the number of applicable test cases if it is a value or a constant
                if (hasValue || hasConstant) {
                    if (DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT === dtc) {
                        if (hasNegation) {
                            if (pValueHasTagGenerateOnlyValidValues) {
                                return incompatiblePair;
                            }
                            return invalidPair;
                        }
                        return validPair;
                    }
                    else if (DataTestCase_1.DataTestCase.SET_NOT_IN_SET === dtc) {
                        if (hasNegation) {
                            return validPair;
                        }
                        if (pValueHasTagGenerateOnlyValidValues) {
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
                switch (dtc) {
                    case DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT: // next
                    case DataTestCase_1.DataTestCase.SET_LAST_ELEMENT: // next
                    case DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT: {
                        if (hasNegation) {
                            if (pValueHasTagGenerateOnlyValidValues) {
                                return incompatiblePair;
                            }
                            return invalidPair;
                        }
                        return validPair;
                    }
                    case DataTestCase_1.DataTestCase.SET_NOT_IN_SET: {
                        if (hasNegation) {
                            return validPair;
                        }
                        if (pValueHasTagGenerateOnlyValidValues) {
                            return incompatiblePair;
                        }
                        return invalidPair;
                    }
                }
                return incompatiblePair;
            }
            case DataTestCase_1.DataTestCaseGroup.VALUE: {
                // If it has VALUE property:
                // - it must NOT generate VALID length values but it must generate invalid.
                // - if it has negation, it must generate VALID as valid, and INVALID as invalid.
                const hasValueProperty = TypeChecking_1.isDefined(pValue);
                const valueHasNegation = hasValueProperty && this.hasNegation(pValue); // e.g., "value NOT IN ..."
                const shouldGenerateValid = !hasValueProperty || (hasValueProperty && valueHasNegation);
                const hasMinValue = TypeChecking_1.isDefined(pMinValue);
                const hasMaxValue = TypeChecking_1.isDefined(pMaxValue);
                if (!hasMinValue && !hasMaxValue) {
                    return incompatiblePair;
                }
                let [minValue, isToFakeMinValue] = hasMinValue
                    ? this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MIN_VALUE, pMinValue, valueType)
                    : [null, false];
                let [maxValue, isToFakeMaxValue] = hasMaxValue
                    ? this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MAX_VALUE, pMaxValue, valueType)
                    : [null, false];
                const invalidMinPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMinValue ? pMinValue.otherwiseSentences || [] : []);
                const invalidMaxPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMaxValue ? pMaxValue.otherwiseSentences || [] : []);
                if (isToFakeMinValue) {
                    if (isToFakeMaxValue) {
                        // Both need to be faked, let's generate random min and max
                        minValue = this._dataGenBuilder.raw(valueType).randomBetweenMinAndMax();
                        maxValue = this._dataGenBuilder.raw(valueType, minValue).randomBetweenMinAndMax();
                        isToFakeMaxValue = false;
                    }
                    else {
                        minValue = this._dataGenBuilder.raw(valueType, null, maxValue).randomBetweenMinAndMax();
                    }
                }
                if (isToFakeMaxValue) {
                    maxValue = this._dataGenBuilder.raw(valueType, minValue).randomBetweenMinAndMax();
                }
                let analyzer = this._dataGenBuilder.rawAnalyzer(valueType, minValue, maxValue);
                switch (dtc) {
                    case DataTestCase_1.DataTestCase.VALUE_LOWEST: // next
                    case DataTestCase_1.DataTestCase.VALUE_RANDOM_BELOW_MIN: // next
                    case DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MIN: {
                        if (hasMinValue || isToFakeMinValue) {
                            if (analyzer.hasValuesBelowMin()) {
                                if (pMinValueHasTagGenerateOnlyValidValues) {
                                    return incompatiblePair;
                                }
                                return invalidMinPair;
                            }
                            else {
                                return shouldGenerateValid ? validPair : incompatiblePair;
                            }
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MIN: // next
                    case DataTestCase_1.DataTestCase.VALUE_MIN: {
                        if (hasMinValue || isToFakeMinValue) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX: // next
                    case DataTestCase_1.DataTestCase.VALUE_MEDIAN: {
                        if ((hasMinValue || isToFakeMinValue) && (hasMaxValue || isToFakeMaxValue)) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MAX: // next
                    case DataTestCase_1.DataTestCase.VALUE_MAX: {
                        if (hasMaxValue || isToFakeMaxValue) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.VALUE_ZERO: {
                        if ((hasMinValue || isToFakeMinValue) && (hasMaxValue || isToFakeMaxValue)) {
                            if (analyzer.isZeroBetweenMinAndMax()) {
                                return shouldGenerateValid ? validPair : incompatiblePair;
                            }
                            if (pMinValueHasTagGenerateOnlyValidValues || pMaxValueHasTagGenerateOnlyValidValues) {
                                return incompatiblePair;
                            }
                            return analyzer.isZeroBelowMin() ? invalidMinPair : invalidMaxPair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MAX: // next
                    case DataTestCase_1.DataTestCase.VALUE_RANDOM_ABOVE_MAX: // next
                    case DataTestCase_1.DataTestCase.VALUE_GREATEST: {
                        if (hasMaxValue || isToFakeMaxValue) {
                            if (analyzer.hasValuesAboveMax()) {
                                if (pMaxValueHasTagGenerateOnlyValidValues) {
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
            case DataTestCase_1.DataTestCaseGroup.LENGTH: {
                const isRequired = this._uiePropExtractor.extractIsRequired(uie);
                // If it has VALUE property:
                // - it must NOT generate VALID length values but it must generate invalid.
                // - if it has negation, it must generate VALID as valid, and INVALID as invalid.
                const hasValueProperty = TypeChecking_1.isDefined(pValue);
                const valueHasNegation = hasValueProperty && this.hasNegation(pValue); // e.g., "value NOT IN ..."
                const shouldGenerateValid = !hasValueProperty || (hasValueProperty && valueHasNegation);
                // // Does not consider FORMAT_VALID whether it has a value-related property
                // const hasAnyValueOrLengthProperty = isDefined( pValue ) ||
                //     isDefined( pMinValue ) || isDefined( pMaxValue ) ||
                //     isDefined( pMinLength ) || isDefined( pMaxLength );
                const hasMinLength = TypeChecking_1.isDefined(pMinLength);
                const hasMaxLength = TypeChecking_1.isDefined(pMaxLength);
                if (!hasMinLength && !hasMaxLength) {
                    return incompatiblePair;
                }
                // We are simulating min length and max length when they come from a QUERY or a UI_ELEMENT
                let [minLength, isToFakeMinLength] = hasMinLength
                    ? this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MIN_LENGTH, pMinLength, valueType)
                    : [null, false];
                let [maxLength, isToFakeMaxLength] = hasMaxLength
                    ? this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MAX_LENGTH, pMaxLength, valueType)
                    : [null, false];
                if (isToFakeMinLength) {
                    minLength = 2; // fake with fixed value - does not matter, since it is to evaluate data test case
                }
                if (isToFakeMaxLength) {
                    maxLength = 60; // fake with fixed value - does not matter, since it is to evaluate data test case
                }
                let analyzer = this._dataGenBuilder.rawAnalyzer(valueType, minLength, maxLength);
                const invalidMinPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMinLength ? pMinLength.otherwiseSentences || [] : []);
                const invalidMaxPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMaxLength ? pMaxLength.otherwiseSentences || [] : []);
                switch (dtc) {
                    case DataTestCase_1.DataTestCase.LENGTH_LOWEST: // next
                    case DataTestCase_1.DataTestCase.LENGTH_RANDOM_BELOW_MIN: // next
                    case DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MIN: {
                        if (isRequired) {
                            if (dtc === DataTestCase_1.DataTestCase.LENGTH_LOWEST) {
                                return incompatiblePair;
                            }
                            if (dtc === DataTestCase_1.DataTestCase.LENGTH_RANDOM_BELOW_MIN &&
                                2 === minLength && !isToFakeMinLength) {
                                return incompatiblePair;
                            }
                            if (dtc === DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MIN &&
                                1 === minLength && !isToFakeMinLength) {
                                return incompatiblePair;
                            }
                        }
                        if (hasMinLength || isToFakeMinLength) {
                            if (analyzer.hasValuesBelowMin()) {
                                if (pMinLengthHasTagGenerateOnlyValidValues) {
                                    return incompatiblePair;
                                }
                                return invalidMinPair;
                            }
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MIN: // next
                    case DataTestCase_1.DataTestCase.LENGTH_MIN: {
                        if (hasMinLength || isToFakeMinLength) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX: // next
                    case DataTestCase_1.DataTestCase.LENGTH_MEDIAN: {
                        if ((hasMinLength || isToFakeMinLength) && (hasMaxLength || isToFakeMaxLength)) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MAX: // next
                    case DataTestCase_1.DataTestCase.LENGTH_MAX: {
                        if (hasMaxLength || isToFakeMaxLength) {
                            return shouldGenerateValid ? validPair : incompatiblePair;
                        }
                        return incompatiblePair;
                    }
                    case DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MAX: // next
                    case DataTestCase_1.DataTestCase.LENGTH_RANDOM_ABOVE_MAX: // next
                    case DataTestCase_1.DataTestCase.LENGTH_GREATEST: {
                        if (hasMaxLength || isToFakeMaxLength) {
                            if (analyzer.hasValuesAboveMax()) {
                                if (pMaxLengthHasTagGenerateOnlyValidValues) {
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
            case DataTestCase_1.DataTestCaseGroup.COMPUTATION: { // not supported yet
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
    resolvePropertyValue(propType, uip, valueType) {
        if (!uip) {
            return [null, false];
        }
        switch (uip.value.entity) {
            case nlp_1.Entities.CONSTANT: {
                const constant = uip.value.references[0];
                if (TypeChecking_1.isDefined(constant)) {
                    return [ValueTypeDetector_1.adjustValueToTheRightType(constant.value), false];
                }
                return [null, false];
            }
            // case Entities.COMPUTATION: // next
            case nlp_1.Entities.QUERY: // next
            case nlp_1.Entities.UI_ELEMENT_REF: {
                return [null, true]; // << FAKED !
            }
            default: return [uip.value.value, false];
        }
    }
    hasNegation(uip) {
        return this._nlpUtil.hasEntityNamed(nlp_1.Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult);
    }
}
exports.DataTestCaseAnalyzer = DataTestCaseAnalyzer;
