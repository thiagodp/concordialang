import { StringLimits } from "../limits/StringLimits";
import { MinMaxChecker } from "../util/MinMaxChecker";
/**
 * String generator.
 *
 * @author Thiago Delgado Pinto
 */
export class StringGenerator {
    /**
     * Constructor.
     *
     * @param _random   Random generator
     * @param minLength Minimum length. Optional. Assumes StringLimits.MIN if undefined.
     * @param maxLength Maximum length. Optional. Assumes StringLimits.MAX_USUAL if undefined.
     * @param maxPossibleLength Maximum possible length. Optional. Assumes StringLimits.MAX if undefined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomString, minLength, maxLength, maxPossibleLength) {
        this._randomString = _randomString;
        (new MinMaxChecker()).check(minLength, maxLength); // may throw Error
        // Additional verifications
        if (minLength && minLength < StringLimits.MIN) {
            throw Error('Minimum string length is ' + StringLimits.MIN);
        }
        if (maxLength && maxLength > StringLimits.MAX) {
            throw Error('Maximum string length is ' + StringLimits.MAX);
        }
        if (maxPossibleLength && maxPossibleLength > StringLimits.MAX) {
            throw Error('Maximum possible string length is ' + StringLimits.MAX);
        }
        this._minLength = minLength ? minLength : StringLimits.MIN; // 0
        this._maxLength = maxLength ? maxLength : StringLimits.MAX_USUAL; // 255
        this._maxPossibleLength = (maxPossibleLength == undefined || maxPossibleLength === null)
            ? StringLimits.MAX
            : maxPossibleLength;
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
        return this._minLength > StringLimits.MIN;
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._maxLength < StringLimits.MAX;
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
        return this._randomString.between(StringLimits.MIN, this._minLength - 1);
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
        return this._randomString.between(this._maxLength + 1, this._maxPossibleLength);
    }
    /** @inheritDoc */
    greatest() {
        return this._randomString.exactly(this._maxPossibleLength);
    }
}
