"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const TypeChecking_1 = require("../../util/TypeChecking");
const DateTimeLimits_1 = require("../limits/DateTimeLimits");
class DateTimeGenerator {
    /**
     * Constructor.
     *
     * @param _randomDateTimeGen Random generator.
     * @param min Minimum value. Optional. Assumes the minimum datetime if not defined.
     * @param max Maximum value. Optional. Assumes the maximum datetime if not defined.
     *
     * @throws Error In case of invalid values.
     */
    constructor(_randomDateTimeGen, min, max) {
        this._randomDateTimeGen = _randomDateTimeGen;
        this.ZERO = DateTimeLimits_1.DateTimeLimits.MIN;
        if (TypeChecking_1.isDefined(min) && TypeChecking_1.isDefined(max) && min.isAfter(max)) {
            throw new Error('min datetime should not be greater than max');
        }
        this._min = TypeChecking_1.isDefined(min) ? min : DateTimeLimits_1.DateTimeLimits.MIN;
        this._max = TypeChecking_1.isDefined(max) ? max : DateTimeLimits_1.DateTimeLimits.MAX;
    }
    diffInSeconds() {
        return this._min.until(this._max, core_1.ChronoUnit.SECONDS);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diffInSeconds() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min.isAfter(DateTimeLimits_1.DateTimeLimits.MIN);
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max.isBefore(DateTimeLimits_1.DateTimeLimits.MAX);
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
        return DateTimeLimits_1.DateTimeLimits.MIN;
    }
    /** @inheritDoc */
    randomBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._randomDateTimeGen.before(this._min)
            : this.lowest();
    }
    /** @inheritDoc */
    justBelowMin() {
        return (this.hasValuesBelowMin())
            ? this._min.minusSeconds(1)
            : this.lowest();
    }
    /** @inheritDoc */
    min() {
        return this._min;
    }
    /** @inheritDoc */
    justAboveMin() {
        return (this.hasValuesBetweenMinAndMax())
            ? this._min.plusSeconds(1)
            : this._min;
    }
    /** @inheritDoc */
    zero() {
        return this.lowest();
    }
    /** @inheritDoc */
    median() {
        const diffInDaysOfDates = core_1.Period.between(this._min.toLocalDate(), this._max.toLocalDate()).days();
        const minTime = this._min.toLocalTime();
        const maxTime = this._max.toLocalTime();
        const diffInSecondsOfTimes = minTime.until(maxTime, core_1.ChronoUnit.SECONDS);
        const days = Math.round((diffInDaysOfDates - 1) / 2);
        const seconds = Math.round((diffInSecondsOfTimes - 1) / 2);
        let r = this._min.plusDays(days);
        if (maxTime.compareTo(minTime) > 0) { // maxTime greater than minTime
            return r.plusSeconds(seconds);
        }
        return r.minusMonths(seconds);
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomDateTimeGen.between(this._min.plusSeconds(1), this._max.minusSeconds(1))
            : this._min;
    }
    /** @inheritDoc */
    justBelowMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusSeconds(1)
            : this._max;
    }
    /** @inheritDoc */
    max() {
        return this._max;
    }
    /** @inheritDoc */
    justAboveMax() {
        return this.hasValuesAboveMax()
            ? this._max.plusSeconds(1)
            : this.greatest();
    }
    /** @inheritDoc */
    randomAboveMax() {
        return this.hasValuesAboveMax()
            ? this._randomDateTimeGen.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return DateTimeLimits_1.DateTimeLimits.MAX;
    }
}
exports.DateTimeGenerator = DateTimeGenerator;
