"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MinMaxChecker_1 = require("../util/MinMaxChecker");
const LongLimits_1 = require("../limits/LongLimits");
/**
 * Long generator.
 *
 * @author Thiago Delgado Pinto
 */
class LongGenerator {
    /**
     * Constructor.
     *
     * @param _random	Random generator
     * @param min		Minimum value. Optional. Assumes the minimum long if undefined.
     * @param max		Maximum value. Optional. Assumes the maximum long if undefined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_random, min, max) {
        this._random = _random;
        (new MinMaxChecker_1.MinMaxChecker()).check(min, max); // may throw Error
        this._min = min !== null && min !== undefined ? min : LongLimits_1.LongLimits.MIN;
        this._max = max !== null && max !== undefined ? max : LongLimits_1.LongLimits.MAX;
    }
    diff() {
        return this._max - this._min;
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diff() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min > LongLimits_1.LongLimits.MIN;
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max < LongLimits_1.LongLimits.MAX;
    }
    /** @inheritDoc */
    isZeroBetweenMinAndMax() {
        return this._min <= 0 && 0 <= this._max;
    }
    /** @inheritDoc */
    isZeroBelowMin() {
        return 0 < this._min;
    }
    /** @inheritDoc */
    isZeroAboveMax() {
        return 0 > this._max;
    }
    // DATA GENERATION
    /** @inheritDoc */
    lowest() {
        return LongLimits_1.LongLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._random.before(this._min)
            : this.lowest();
    }
    /** @inheritDoc */
    justBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._min - 1
            : this.lowest();
    }
    /** @inheritDoc */
    min() {
        return this._min;
    }
    /** @inheritDoc */
    justAboveMin() {
        return (this.hasValuesBetweenMinAndMax())
            ? this._min + 1
            : this._min;
    }
    /** @inheritDoc */
    zero() {
        return 0;
    }
    /** @inheritDoc */
    median() {
        return this._min + (this.diff() / 2);
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._random.between(this._min + 1, this._max - 1)
            : this._min;
    }
    /** @inheritDoc */
    justBelowMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._max - 1
            : this._max;
    }
    /** @inheritDoc */
    max() {
        return this._max;
    }
    /** @inheritDoc */
    justAboveMax() {
        return this.hasValuesAboveMax()
            ? this._max + 1
            : this.greatest();
    }
    /** @inheritDoc */
    randomAboveMax() {
        return this.hasValuesAboveMax()
            ? this._random.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return LongLimits_1.LongLimits.MAX;
    }
}
exports.LongGenerator = LongGenerator;
