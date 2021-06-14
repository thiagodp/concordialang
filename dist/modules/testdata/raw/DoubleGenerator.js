import { DoubleLimits } from '../limits/DoubleLimits';
import { MinMaxChecker } from '../util/MinMaxChecker';
/**
 * Double generator.
 *
 * @author Thiago Delgado Pinto
 */
export class DoubleGenerator {
    /**
     * Constructor.
     *
     * @param _random	Random generator.
     * @param min		Minimum value. Optional. Assumes the minimum double if undefined.
     * @param max		Maximum value. Optional. Assumes the maximum double if undefined.
     * @param delta		Precision used to generate new values. Optional.
     * 					Assumes the greatest fractional part between min and max.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_random, min, max, delta) {
        this._random = _random;
        this.DEFAULT_DELTA = 0.01;
        const checker = new MinMaxChecker();
        checker.check(min, max, delta); // may throw Error
        this._min = min !== null && min !== undefined ? Number(min) : DoubleLimits.MIN;
        this._max = max !== null && max !== undefined ? Number(max) : DoubleLimits.MAX;
        this._delta = delta !== null && delta !== undefined
            ? delta
            : checker.greatestFractionalPart(this.DEFAULT_DELTA, min, max);
    }
    delta() {
        return this._delta;
    }
    diff() {
        return this._max - this._min;
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diff() > this.delta();
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min > DoubleLimits.MIN;
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max < DoubleLimits.MAX;
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
        return DoubleLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._random.before(this._min, this._delta)
            : this.lowest();
    }
    /** @inheritDoc */
    justBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._min - this._delta
            : this.lowest();
    }
    /** @inheritDoc */
    min() {
        return this._min;
    }
    /** @inheritDoc */
    justAboveMin() {
        return (this.hasValuesBetweenMinAndMax())
            ? this._min + this._delta
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
            ? this._max - this._delta
            : this._max;
    }
    /** @inheritDoc */
    max() {
        return this._max;
    }
    /** @inheritDoc */
    justAboveMax() {
        return this.hasValuesAboveMax()
            ? this._max + this._delta
            : this.greatest();
    }
    /** @inheritDoc */
    randomAboveMax() {
        return this.hasValuesAboveMax()
            ? this._random.after(this._max, this._delta)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return DoubleLimits.MAX;
    }
}
