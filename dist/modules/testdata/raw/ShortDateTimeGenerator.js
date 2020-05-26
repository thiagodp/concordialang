"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const TypeChecking_1 = require("../../util/TypeChecking");
const DateTimeLimits_1 = require("../limits/DateTimeLimits");
class ShortDateTimeGenerator {
    /**
     * Constructor.
     *
     * @param _randomGen Random generator.
     * @param min Minimum value. Optional. Assumes the minimum datetime if not defined.
     * @param max Maximum value. Optional. Assumes the maximum datetime if not defined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomGen, min, max) {
        this._randomGen = _randomGen;
        this.ZERO = DateTimeLimits_1.ShortDateTimeLimits.MIN;
        if (TypeChecking_1.isDefined(min) && TypeChecking_1.isDefined(max) && min.isAfter(max)) {
            throw new Error('Minimum value should not be greater than the maximum value.');
        }
        this._min = TypeChecking_1.isDefined(min) ? min : DateTimeLimits_1.ShortDateTimeLimits.MIN;
        this._max = TypeChecking_1.isDefined(max) ? max : DateTimeLimits_1.ShortDateTimeLimits.MAX;
    }
    diffInMinutes() {
        return this._min.until(this._max, core_1.ChronoUnit.MINUTES);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diffInMinutes() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min.isAfter(DateTimeLimits_1.ShortDateTimeLimits.MIN);
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max.isBefore(DateTimeLimits_1.ShortDateTimeLimits.MAX);
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
        return DateTimeLimits_1.ShortDateTimeLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._randomGen.before(this._min)
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
        // const diffInDaysOfDates = Period.between( this._min.toLocalDate(), this._max.toLocalDate() ).days();
        const diffInDaysOfDates = this._min.toLocalDate().until(this._max.toLocalDate(), core_1.ChronoUnit.DAYS);
        const minTime = this._min.toLocalTime();
        const maxTime = this._max.toLocalTime();
        const diffInMinutesFromTime = minTime.until(maxTime, core_1.ChronoUnit.MINUTES);
        const days = Math.round((diffInDaysOfDates - 1) / 2);
        const minutes = Math.round((diffInMinutesFromTime - 1) / 2);
        let r = this._min.plusDays(days);
        if (maxTime.compareTo(minTime) > 0) { // maxTime greater than minTime
            return r.plusMinutes(minutes);
        }
        return r.minusMonths(minutes);
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomGen.between(this._min.plusMinutes(1), this._max.minusMinutes(1))
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
            ? this._randomGen.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return DateTimeLimits_1.ShortDateTimeLimits.MAX;
    }
}
exports.ShortDateTimeGenerator = ShortDateTimeGenerator;
