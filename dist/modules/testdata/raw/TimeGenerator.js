"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeGenerator = void 0;
const TimeLimits_1 = require("../limits/TimeLimits");
const TypeChecking_1 = require("../../util/TypeChecking");
const js_joda_1 = require("js-joda");
class TimeGenerator {
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
        this.ZERO = TimeLimits_1.TimeLimits.MIN;
        if (TypeChecking_1.isDefined(min) && TypeChecking_1.isDefined(max) && min.isAfter(max)) {
            throw new Error('min time should not be greater than max');
        }
        this._min = TypeChecking_1.isDefined(min) ? min : TimeLimits_1.TimeLimits.MIN;
        this._max = TypeChecking_1.isDefined(max) ? max : TimeLimits_1.TimeLimits.MAX;
    }
    diffInSeconds() {
        return this._min.until(this._max, js_joda_1.ChronoUnit.SECONDS);
    }
    // RANGE ANALYSIS
    /** @inheritDoc */
    hasValuesBetweenMinAndMax() {
        return this.diffInSeconds() > 0;
    }
    /** @inheritDoc */
    hasValuesBelowMin() {
        return this._min.isAfter(TimeLimits_1.TimeLimits.MIN);
    }
    /** @inheritDoc */
    hasValuesAboveMax() {
        return this._max.isBefore(TimeLimits_1.TimeLimits.MAX);
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
        return TimeLimits_1.TimeLimits.MIN;
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
        return this._min.plusSeconds(Math.round((this.diffInSeconds() - 1) / 2));
    }
    /** @inheritDoc */
    randomBetweenMinAndMax() {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomTimeGen.between(this._min.plusSeconds(1), this._max.minusSeconds(1))
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
            ? this._randomTimeGen.after(this._max)
            : this.greatest();
    }
    /** @inheritDoc */
    greatest() {
        return TimeLimits_1.TimeLimits.MAX;
    }
}
exports.TimeGenerator = TimeGenerator;
