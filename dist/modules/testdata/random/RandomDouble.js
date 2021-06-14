import { DoubleLimits } from '../limits/DoubleLimits';
/**
 * Generates random double values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomDouble {
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
        let num = this._random.generate();
        return min + (num * (max - min));
    }
    /**
     * Generates a random value before a maximum value.
     *
     * @param max	The maximum value.
     * @return		A random value before the maximum value.
     */
    before(value, delta) {
        return this.between(DoubleLimits.MIN, value - delta);
    }
    /**
     * Generates a random value after a minimum value.
     *
     * @param min	The minimum value.
     * @return		A random value after the minimum value.
     */
    after(value, delta) {
        return this.between(value + delta, DoubleLimits.MAX);
    }
}
