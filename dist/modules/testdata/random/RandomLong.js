"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LongLimits_1 = require("../limits/LongLimits");
/**
 * Generates random long integer values.
 *
 * @author Thiago Delgado Pinto
 */
class RandomLong {
    constructor(_random) {
        this._random = _random;
    }
    /**
     * Generates a random number between a minimum and a maximum value, both
     * inclusive.
     *
     * @param min	The minimum value (inclusive).
     * @param max	The maximum value (inclusive).
     * @return		A number between the minimum and the maximum.
     */
    between(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this._random.generate() * (max - min + 1)) + min;
    }
    /**
     * Generates a random value less than a maximum value.
     *
     * @param max	The maximum value.
     * @return		A random value less than a maximum value.
     */
    before(max) {
        return this.between(LongLimits_1.LongLimits.MIN, max - 1);
    }
    /**
     * Generates a random value greater than a minimum value.
     *
     * @param min	The minimum value.
     * @return		A random value greater than a minimum value.
     */
    after(min) {
        return this.between(min + 1, LongLimits_1.LongLimits.MAX);
    }
}
exports.RandomLong = RandomLong;
//# sourceMappingURL=RandomLong.js.map