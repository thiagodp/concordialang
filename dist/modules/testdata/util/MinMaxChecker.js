"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeChecking_1 = require("../../util/TypeChecking");
/**
 * Checks minimum and maximum values.
 *
 * @author Thiago Delgado Pinto
 */
class MinMaxChecker {
    /**
     * Check the given values, throwing an exception whether one of them is invalid.
     *
     * @param min
     * @param max
     * @param delta
     *
     * @throws Error
     */
    check(min, max, delta) {
        // min
        if (TypeChecking_1.isDefined(min) && isNaN(min)) {
            throw new Error("min is NaN.");
        }
        // max
        if (TypeChecking_1.isDefined(max) && isNaN(max)) {
            throw new Error("max is NaN.");
        }
        // min > max
        if (TypeChecking_1.isDefined(min) && TypeChecking_1.isDefined(max) && Number(min) > Number(max)) {
            throw new Error("The minimum value cannot be greater than the maximum value.");
        }
        // delta
        if (TypeChecking_1.isDefined(delta) && delta < 0) {
            throw new Error("delta can't be negative.");
        }
    }
    /**
     * Return the greatest fractional part, according to the precision of
     * minimum and maximum values.
     *
     * These values are given as *strings* because JavaScript ignores zeros
     * as decimal places when converting a string to a number (e.g.,
     * '1.0' becomes 1 instead of 1.0).
     *
     * Examples:
     *    min = 2,    max = 10     -> 1
     *    min = 2.0,  max = 10     -> 0.1
     *    min = 2.00, max = 10     -> 0.01
     *    min = 2.00, max = 10.000 -> 0.001
     *
     * @param defaultDelta Delta to be used when both min and max are undefined.
     * @param min The minimum value as string.
     * @param max The maximum value as string.
     */
    greatestFractionalPart(defaultDelta, min, max) {
        const minFracLength = this.fractionalPartLength(min);
        const maxFracLength = this.fractionalPartLength(max);
        let greatestLength = maxFracLength > minFracLength ? maxFracLength : minFracLength;
        return 1 / Math.pow(10, greatestLength);
    }
    /**
     * Returns the length of the fractional part of a number.
     * E.g., "10.25" has ".25" as its fractional part and "25" has length 2.
     *
     * @param num Number
     */
    fractionalPartLength(num) {
        if (!TypeChecking_1.isDefined(num) || '' === num)
            return 0;
        const numStr = num.toString(); // Just to guarantee the right type in the conversion to JS
        const idx = numStr.lastIndexOf('.');
        if (idx < 0)
            return 0;
        return numStr.substring(idx + 1).length;
    }
}
exports.MinMaxChecker = MinMaxChecker;
