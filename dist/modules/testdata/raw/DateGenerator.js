import { ChronoUnit } from "@js-joda/core";
import { isDefined } from '../../util/TypeChecking';
import { DateLimits } from "../limits/DateLimits";
export class DateGenerator {
    /**
     * Constructor.
     *
     * @param _randomDateGen Random generator.
     * @param min Minimum value. Optional. Assumes the minimum date if not defined.
     * @param max Maximum value. Optional. Assumes the maximum date if not defined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomDateGen, min, max) {
        this._randomDateGen = _randomDateGen;
        this.ZERO = DateLimits.MIN;
        if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
            throw new Error('min date should not be greater than max');
        }
        this._min = isDefined(min) ? min : DateLimits.MIN;
        this._max = isDefined(max) ? max : DateLimits.MAX;
    }
    diffInDays() {
        return this._min.until(this._max, ChronoUnit.DAYS);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diffInDays() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min.isAfter(DateLimits.MIN);
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max.isBefore(DateLimits.MAX);
    }
    /** @inheritDoc */
    isZeroBetweenMinAndMax() {
        return (this._min.isBefore(this.ZERO) || this._min.isEqual(this.ZERO))
            && (this._max.isAfter(this.ZERO) || this._max.isEqual(this.ZERO));
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
        return DateLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._randomDateGen.before(this._min)
            : this.lowest();
    }
    /** @inheritDoc */
    justBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._min.minusDays(1)
            : this.lowest();
    }
    /** @inheritDoc */
    min() {
        return this._min;
    }
    /** @inheritDoc */
    justAboveMin() {
        return (this.hasValuesBetweenMinAndMax())
            ? this._min.plusDays(1)
            : this._min;
    }
    /** @inheritDoc */
    zero() {
        return this.lowest();
    }
    /** @inheritDoc */
    median() {
        return this._min.plusDays(Math.round((this.diffInDays() - 1) / 2));
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomDateGen.between(this._min.plusDays(1), this._max.minusDays(1))
            : this._min;
    }
    /** @inheritDoc */
    justBelowMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusDays(1)
            : this._max;
    }
    /** @inheritDoc */
    max() {
        return this._max;
    }
    /** @inheritDoc */
    justAboveMax() {
        return this.hasValuesAboveMax()
            ? this._max.plusDays(1)
            : this.greatest();
    }
    /** @inheritDoc */
    randomAboveMax() {
        return this.hasValuesAboveMax()
            ? this._randomDateGen.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return DateLimits.MAX;
    }
}
