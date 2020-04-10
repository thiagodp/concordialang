"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const deepcopy = require("deepcopy");
const TypeChecking_1 = require("../util/TypeChecking");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const DataTestCase_1 = require("./DataTestCase");
/**
 * Configuration (restrictions) used for generating test data.
 *
 * @author Thiago Delgado Pinto
 */
class DataGenConfig {
    constructor(_valueType = ValueTypeDetector_1.ValueType.STRING) {
        this._valueType = _valueType;
        this.required = false;
        this.minValue = null;
        this.maxValue = null;
        this.minLength = null;
        this.maxLength = null;
        this.format = null; // regex
        // public query: string = null;
        // public queryable: Queryable = null; // queryable to use to query the value - db or memory
        this.value = null; // for value and list-based generation
        this.invertedLogic = false; // for list-based generation, when operator "not in" is used
        this.computedBy = null; // expression
    }
    // minimum value or length
    get min() {
        return TypeChecking_1.isDefined(this.minValue) ? this.minValue : this.minLength;
    }
    // maximum value or length
    get max() {
        return TypeChecking_1.isDefined(this.maxValue) ? this.maxValue : this.maxLength;
    }
    set valueType(valType) {
        this._valueType = valType;
    }
    get valueType() {
        // console.log( '  internal type', this._valueType, 'minValue', this.minValue, 'maxValue', this.maxValue, 'value', this.value );
        if (TypeChecking_1.isDefined(this.minValue)) {
            return (new ValueTypeDetector_1.ValueTypeDetector()).detect(this.minValue);
        }
        if (TypeChecking_1.isDefined(this.maxValue)) {
            return (new ValueTypeDetector_1.ValueTypeDetector()).detect(this.maxValue);
        }
        if (TypeChecking_1.isDefined(this.value)) {
            const detector = new ValueTypeDetector_1.ValueTypeDetector();
            if (!Array.isArray(this.value)) {
                return detector.detect(this.value.toString());
            }
            if (this.value.length > 0) {
                return detector.detect(this.value[0]);
            }
        }
        return this._valueType;
    }
}
exports.DataGenConfig = DataGenConfig;
/**
 * Data generator
 *
 * @author Thiago Delgado Pinto
 */
class DataGenerator {
    constructor(_builder) {
        this._builder = _builder;
    }
    /**
     * Generates a value, according to the given test case and configuration.
     *
     * @param tc Target test case
     * @param cfg Configuration
     */
    generate(tc, cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log( '-> tc is', tc, 'cfg', cfg );
            switch (tc) {
                // VALUE or LENGTH
                case DataTestCase_1.DataTestCase.VALUE_LOWEST:
                case DataTestCase_1.DataTestCase.LENGTH_LOWEST:
                    return this.rawGeneratorFor(cfg).lowest();
                case DataTestCase_1.DataTestCase.VALUE_RANDOM_BELOW_MIN:
                    return this.rawGeneratorFor(cfg).randomBelowMin();
                case DataTestCase_1.DataTestCase.LENGTH_RANDOM_BELOW_MIN: {
                    // Generates a random number between 1 and min value
                    if (cfg.required && TypeChecking_1.isDefined(cfg.minValue)) {
                        let newCfg = deepcopy(cfg);
                        newCfg.minValue = 1;
                        newCfg.maxValue = cfg.minValue;
                        return this.rawGeneratorFor(newCfg).randomBetweenMinAndMax();
                    }
                    return this.rawGeneratorFor(cfg).randomBelowMin();
                }
                case DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MIN:
                case DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MIN:
                    return this.rawGeneratorFor(cfg).justBelowMin();
                case DataTestCase_1.DataTestCase.VALUE_MIN:
                case DataTestCase_1.DataTestCase.LENGTH_MIN:
                    return this.rawGeneratorFor(cfg).min();
                case DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MIN:
                case DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MIN:
                    return this.rawGeneratorFor(cfg).justAboveMin();
                case DataTestCase_1.DataTestCase.VALUE_ZERO:
                    //case DataTestCase.LENGTH_ZERO:
                    return this.rawGeneratorFor(cfg).zero();
                case DataTestCase_1.DataTestCase.VALUE_MEDIAN:
                case DataTestCase_1.DataTestCase.LENGTH_MEDIAN:
                    return this.rawGeneratorFor(cfg).median();
                case DataTestCase_1.DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX:
                case DataTestCase_1.DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX:
                    return this.rawGeneratorFor(cfg).randomBetweenMinAndMax();
                case DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MAX:
                case DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MAX:
                    return this.rawGeneratorFor(cfg).justBelowMax();
                case DataTestCase_1.DataTestCase.VALUE_MAX:
                case DataTestCase_1.DataTestCase.LENGTH_MAX:
                    return this.rawGeneratorFor(cfg).max();
                case DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MAX:
                case DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MAX:
                    return this.rawGeneratorFor(cfg).justAboveMax();
                case DataTestCase_1.DataTestCase.VALUE_RANDOM_ABOVE_MAX:
                case DataTestCase_1.DataTestCase.LENGTH_RANDOM_ABOVE_MAX:
                    return this.rawGeneratorFor(cfg).randomAboveMax();
                case DataTestCase_1.DataTestCase.VALUE_GREATEST:
                case DataTestCase_1.DataTestCase.LENGTH_GREATEST:
                    return this.rawGeneratorFor(cfg).greatest();
                // FORMAT
                case DataTestCase_1.DataTestCase.FORMAT_VALID:
                    return this.regexGeneratorFor(cfg).valid();
                case DataTestCase_1.DataTestCase.FORMAT_INVALID:
                    return this.regexGeneratorFor(cfg).invalid();
                // SET
                case DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT: {
                    // if ( isDefined( cfg.query ) ) {
                    // 	return await this.queryGeneratorFor( cfg ).firstElement();
                    // }
                    return this.listGeneratorFor(cfg).firstElement();
                }
                case DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT: {
                    // if ( isDefined( cfg.query ) ) {
                    // 	return await this.queryGeneratorFor( cfg ).randomElement();
                    // }
                    return this.listGeneratorFor(cfg).randomElement();
                }
                case DataTestCase_1.DataTestCase.SET_LAST_ELEMENT: {
                    // if ( isDefined( cfg.query ) ) {
                    // 	return await this.queryGeneratorFor( cfg ).lastElement();
                    // }
                    return this.listGeneratorFor(cfg).lastElement();
                }
                case DataTestCase_1.DataTestCase.SET_NOT_IN_SET: {
                    // if ( isDefined( cfg.query ) ) {
                    // 	return await this.queryGeneratorFor( cfg ).notInSet();
                    // }
                    return this.listGeneratorFor(cfg).notInSet();
                }
                // REQUIRED
                case DataTestCase_1.DataTestCase.REQUIRED_FILLED: {
                    // if ( isDefined( cfg.query ) || ( isDefined( cfg.value ) && Array.isArray( cfg.value ) ) ) {
                    // 	return await this.generate( DataTestCase.SET_RANDOM_ELEMENT, cfg );
                    // } else if ( isDefined( cfg.value ) && ! Array.isArray( cfg.value ) ) {
                    // 	return await this.generate( DataTestCase.SET_FIRST_ELEMENT, cfg );
                    // }
                    // return this.rawGeneratorFor( cfg ).randomBetweenMinAndMax();
                    if (TypeChecking_1.isDefined(cfg.value)) {
                        const dtc = Array.isArray(cfg.value) ? DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT : DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT;
                        return yield this.generate(dtc, cfg);
                    }
                    return this.rawGeneratorFor(cfg).randomBetweenMinAndMax();
                }
                case DataTestCase_1.DataTestCase.REQUIRED_NOT_FILLED: {
                    return ''; // empty value
                }
                // COMPUTATION
                // TO-DO: computation
                default: return null;
            }
        });
    }
    rawGeneratorFor(cfg) {
        // console.log( cfg.valueType, cfg.min, cfg.max );
        return this._builder.raw(cfg.valueType, cfg.min, cfg.max);
    }
    regexGeneratorFor(cfg) {
        return this._builder.regex(cfg.valueType, cfg.format);
    }
    // private queryGeneratorFor( cfg: DataGenConfig ): QueryBasedDataGenerator< any > | InvertedLogicQueryBasedDataGenerator< any > {
    // 	if ( true === cfg.invertedLogic ) {
    // 		return this._builder.invertedLogicQuery( cfg.valueType, cfg.query, cfg.queryable );
    // 	}
    // 	return this._builder.query( cfg.valueType, cfg.query, cfg.queryable );
    // }
    listGeneratorFor(cfg) {
        if (true === cfg.invertedLogic) {
            return this._builder.invertedLogicList(cfg.valueType, Array.isArray(cfg.value) ? cfg.value : [cfg.value]);
        }
        return this._builder.list(cfg.valueType, Array.isArray(cfg.value) ? cfg.value : [cfg.value]);
    }
}
exports.DataGenerator = DataGenerator;
