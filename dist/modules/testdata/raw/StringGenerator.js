"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MinMaxChecker_1 = require("../util/MinMaxChecker");
const StringLimits_1 = require("../limits/StringLimits");
/**
 * String generator.
 *
 * @author Thiago Delgado Pinto
 */
class StringGenerator {
    /**
     * Constructor.
     *
     * @param _random   Random generator
     * @param minLength Minimum length. Optional. Assumes the minimum string length if undefined.
     * @param maxLength Maximum length. Optional. Assumes the usual maximum string length if undefined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomString, minLength, maxLength) {
        this._randomString = _randomString;
        (new MinMaxChecker_1.MinMaxChecker()).check(minLength, maxLength); // may throw Error
        // Aditional checkings
        if (minLength && minLength < StringLimits_1.StringLimits.MIN) {
            throw Error('Minimum string length is ' + StringLimits_1.StringLimits.MIN);
        }
        if (maxLength && maxLength > StringLimits_1.StringLimits.MAX) {
            throw Error('Maximum string length is ' + StringLimits_1.StringLimits.MAX);
        }
        this._minLength = minLength ? minLength : StringLimits_1.StringLimits.MIN; // 0
        this._maxLength = maxLength ? maxLength : StringLimits_1.StringLimits.MAX_USUAL; // 255
    }
    minLength() {
        return this._minLength;
    }
    maxLength() {
        return this._maxLength;
    }
    lengthDiff() {
        return this._maxLength - this._minLength;
    }
    medianLength() {
        return this._minLength + (this.lengthDiff() / 2);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.lengthDiff() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._minLength > StringLimits_1.StringLimits.MIN;
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._maxLength < StringLimits_1.StringLimits.MAX;
    }
    /** @inheritDoc */
    isZeroBetweenMinAndMax() {
        return this._minLength <= 0 && 0 <= this._maxLength;
    }
    /** @inheritDoc */
    isZeroBelowMin() {
        return 0 < this._minLength;
    }
    /** @inheritDoc */
    isZeroAboveMax() {
        return 0 > this._maxLength;
    }
    // DATA GENERATION
    /** @inheritDoc */
    lowest() {
        return '';
    }
    /** @inheritDoc */
    randomBelowMin() {
        if (!this.hasValuesBelowMin()) {
            return this.lowest();
        }
        return this._randomString.between(StringLimits_1.StringLimits.MIN, this._minLength - 1);
    }
    /** @inheritDoc */
    justBelowMin() {
        if (!this.hasValuesBelowMin()) {
            return this.lowest();
        }
        return this._randomString.exactly(this._minLength - 1);
    }
    /** @inheritDoc */
    min() {
        return this._randomString.exactly(this._minLength);
    }
    /** @inheritDoc */
    justAboveMin() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomString.exactly(this._minLength + 1)
            : this.min();
    }
    /** @inheritDoc */
    zero() {
        return '';
    }
    /** @inheritDoc */
    median() {
        return this._randomString.exactly(this.medianLength());
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomString.between(this._minLength + 1, this._maxLength - 1)
            : this.min();
    }
    /** @inheritDoc */
    justBelowMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomString.exactly(this._maxLength - 1)
            : this.max();
    }
    /** @inheritDoc */
    max() {
        return this._randomString.exactly(this._maxLength);
    }
    /** @inheritDoc */
    justAboveMax() {
        if (!this.hasValuesAboveMax()) {
            return this.max();
        }
        return this._randomString.exactly(this._maxLength + 1);
    }
    /** @inheritDoc */
    randomAboveMax() {
        if (!this.hasValuesAboveMax()) {
            return this.max();
        }
        return this._randomString.between(this._maxLength + 1, StringLimits_1.StringLimits.MAX);
    }
    /** @inheritDoc */
    greatest() {
        return this._randomString.exactly(StringLimits_1.StringLimits.MAX);
    }
}
exports.StringGenerator = StringGenerator;
//# sourceMappingURL=StringGenerator.js.map