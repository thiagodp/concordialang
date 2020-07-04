"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexBasedDataGenerator = void 0;
const RandExp = require("randexp");
const StringLimits_1 = require("./limits/StringLimits");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
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
     * @param _randomLong Random long value generator to be used as random generator.
     * @param _randomString Random string value generator
     * @param _expression Regular expression
     * @param _randomTriesToInvalidValues How many tries to generate random invalid values.
     */
    constructor(_randomLong, _randomString, _expression, _valueType = ValueTypeDetector_1.ValueType.STRING, _randomTriesToInvalidValues = 10) {
        this._randomLong = _randomLong;
        this._randomString = _randomString;
        this._expression = _expression;
        this._valueType = _valueType;
        this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
        // Overrides the number generator in order to get "predictable" random values
        RandExp.prototype.randInt = (from, to) => {
            return _randomLong.between(from, to);
        };
        if (this._randomTriesToInvalidValues < 0) {
            this._randomTriesToInvalidValues = 0;
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
        // Generates a random string, hoping that it does not match the expression.
        // This is faster and possibly less error prone than negate the expression.
        const regex = new RegExp(this._expression);
        for (let i = 0; i < this._randomTriesToInvalidValues; ++i) {
            let val = this._randomString.between(0, StringLimits_1.StringLimits.MAX);
            // If the value does not match the regex, it is considered invalid
            if (!regex.test(val)) {
                return val;
            }
        }
        // Try to generate a value based on the negated expression
        const negatedExp = this.negateExpression(this._expression);
        return this.generateFor(negatedExp, this._valueType);
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
            return value;
        }
        return ValueTypeDetector_1.adjustValueToTheRightType(value, valueType);
    }
}
exports.RegexBasedDataGenerator = RegexBasedDataGenerator;
