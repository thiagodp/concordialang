"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexBasedDataGenerator = void 0;
const jsesc = require("jsesc");
const RandExp = require("randexp");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const StringLimits_1 = require("./limits/StringLimits");
/**
 * Regular Expression -based data generator.
 *
 * Known limitations:
 * - It cannot negate all kinds of expressions. For instance, '.'.
 *
 * @author Thiago Delgado Pinto
 */
class RegexBasedDataGenerator {
    /**
     * Constructor
     *
     * @param _randomLong Random long value generator to use as random generator.
     * @param _randomString Random string value generator to use.
     * @param _expression Regular expression.
     * @param _randomTriesToInvalidValues How many tries to generate random invalid values.
     * @param _maxStringSize Maximum string size.
     */
    constructor(_randomLong, _randomString, _expression, _valueType = ValueTypeDetector_1.ValueType.STRING, _randomTriesToInvalidValues = 10, _maxStringSize) {
        this._randomLong = _randomLong;
        this._randomString = _randomString;
        this._expression = _expression;
        this._valueType = _valueType;
        this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
        this._maxStringSize = _maxStringSize;
        // Overrides the number generator in order to get "predictable" random values
        RandExp.prototype.randInt = (from, to) => {
            return _randomLong.between(from, to);
        };
        if (this._randomTriesToInvalidValues < 0) {
            this._randomTriesToInvalidValues = 0;
        }
        if (this._maxStringSize <= 0) {
            this._maxStringSize = StringLimits_1.StringLimits.MAX;
        }
    }
    /**
     * Returns a value considered valid.
     */
    valid() {
        return this.generateFor(this._expression, this._valueType);
    }
    /**
     * Returns a value considered invalid.
     */
    invalid() {
        const max = this._maxStringSize || StringLimits_1.StringLimits.MAX;
        // Generates a random string, hoping that it does not match the expression.
        // This is faster and possibly less error prone than negate the expression.
        const regex = new RegExp(this._expression);
        for (let i = 0; i < this._randomTriesToInvalidValues; ++i) {
            let val = this._randomString.between(0, max);
            // If the value does not match the regex, it is considered invalid
            if (!regex.test(val)) {
                // console.log( 'EXPRESSION', this._expression, 'value', val );
                return val;
            }
        }
        // Try to generate a value based on the negated expression
        const negatedExp = this.negateExpression(this._expression);
        const value = this.generateFor(negatedExp, this._valueType);
        // console.log( 'NEGATED EXPRESSION', negatedExp, 'value', value );
        // Limit the value to the maximum size, if needed
        if (value.length >= max) {
            return value.substr(0, max);
        }
        return value;
    }
    /**
     * Negates the given expression.
     *
     * @param expression Expression
     */
    negateExpression(expression) {
        if (expression.startsWith('[^')) {
            return '[' + expression.substring(2);
        }
        if (expression.startsWith('[')) {
            return '[^' + expression.substring(1);
        }
        return '[^(' + expression + ')]';
    }
    /**
     * Generates a value for the given expression.
     *
     * @param expression Expression
     */
    generateFor(expression, valueType = ValueTypeDetector_1.ValueType.STRING) {
        const value = new RandExp(expression).gen();
        if (ValueTypeDetector_1.ValueType.STRING === valueType) {
            // @see https://github.com/mathiasbynens/jsesc#api
            return jsesc(value, { quotes: 'double' });
        }
        return ValueTypeDetector_1.adjustValueToTheRightType(value, valueType);
    }
}
exports.RegexBasedDataGenerator = RegexBasedDataGenerator;
