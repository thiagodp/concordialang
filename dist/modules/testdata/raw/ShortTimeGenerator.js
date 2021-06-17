import { ChronoUnit } from '@js-joda/core';
import { isDefined } from '../../util/type-checking';
import { ShortTimeLimits } from '../limits/TimeLimits';
export class ShortTimeGenerator {
    /**
     * Constructor.
     *
     * @param _randomTimeGen Random generator.
     * @param min Minimum value. Optional. Assumes the minimum time if not defined.
     * @param max Maximum value. Optional. Assumes the maximum time if not defined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomTimeGen, min, max) {
        this._randomTimeGen = _randomTimeGen;
        this.ZERO = ShortTimeLimits.MIN;
        if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
            throw new Error('min time should not be greater than max');
        }
        this._min = isDefined(min) ? min : ShortTimeLimits.MIN;
        this._max = isDefined(max) ? max : ShortTimeLimits.MAX;
    }
    diffInMinutes() {
        return this._min.until(this._max, ChronoUnit.MINUTES);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diffInMinutes() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min.isAfter(ShortTimeLimits.MIN);
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max.isBefore(ShortTimeLimits.MAX);
    }
    /** @inheritDoc */
    isZeroBetweenMinAndMax() {
        return (this._min.isBefore(this.ZERO) || this._min.equals(this.ZERO))
            && (this._max.isAfter(this.ZERO) || this._max.equals(this.ZERO));
    }
    /** @inheritDoc */
    isZeroBelowMin() {
        return this._min.isAfter(this.ZERO);
    }
    /** @inheritDoc */
    isZeroAboveMax() {
        return this._max.isBefore(this.ZERO);
    }
    // DATA GENERATION
    /** @inheritDoc */
    lowest() {
        return ShortTimeLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._randomTimeGen.before(this._min)
            : this.lowest();
    }
    /** @inheritDoc */
    justBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._min.minusMinutes(1)
            : this.lowest();
    }
    /** @inheritDoc */
    min() {
        return this._min;
    }
    /** @inheritDoc */
    justAboveMin() {
        return (this.hasValuesBetweenMinAndMax())
            ? this._min.plusMinutes(1)
            : this._min;
    }
    /** @inheritDoc */
    zero() {
        return this.lowest();
    }
    /** @inheritDoc */
    median() {
        return this._min.plusMinutes(Math.round((this.diffInMinutes() - 1) / 2));
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomTimeGen.between(this._min.plusMinutes(1), this._max.minusMinutes(1))
            : this._min;
    }
    /** @inheritDoc */
    justBelowMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusMinutes(1)
            : this._max;
    }
    /** @inheritDoc */
    max() {
        return this._max;
    }
    /** @inheritDoc */
    justAboveMax() {
        return this.hasValuesAboveMax()
            ? this._max.plusMinutes(1)
            : this.greatest();
    }
    /** @inheritDoc */
    randomAboveMax() {
        return this.hasValuesAboveMax()
            ? this._randomTimeGen.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return ShortTimeLimits.MAX;
    }
}
