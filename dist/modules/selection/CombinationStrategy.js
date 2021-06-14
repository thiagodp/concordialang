import cartesian from 'cartesian';
import oneWise from 'one-wise';
import shuffleObjArrays from 'shuffle-obj-arrays';
import { Random } from '../testdata/random/Random';
import { RandomLong } from '../testdata/random/RandomLong';
/**
 * Performs a cartesian product of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class CartesianProductStrategy {
    /** @inheritDoc */
    combine(map) {
        return cartesian(map);
    }
}
/**
 * Performs a 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class OneWiseStrategy {
    constructor(seed) {
        this._random = new Random(seed);
    }
    /** @inheritDoc */
    combine(map) {
        const rng = () => this._random.generate();
        return oneWise(map, rng);
    }
}
/**
 * Performs a shuffled 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class ShuffledOneWiseStrategy {
    constructor(seed) {
        this._random = new Random(seed);
    }
    /** @inheritDoc */
    combine(map) {
        const rng = () => this._random.generate();
        const options = { copy: true, rng: rng };
        return oneWise(shuffleObjArrays(map, options), rng);
    }
}
/**
 * Selects a single, random element from each.
 *
 * @author Thiago Delgado Pinto
 */
export class SingleRandomOfEachStrategy {
    constructor(seed) {
        this._randomLong = new RandomLong(new Random(seed));
    }
    /** @inheritDoc */
    combine(map) {
        let obj = {};
        for (let key in map) {
            let elements = map[key];
            if (Array.isArray(elements)) {
                const size = elements.length;
                const index = size > 1 ? this._randomLong.between(0, size - 1) : 0;
                obj[key] = elements[index];
            }
        }
        return [obj];
    }
}
/**
 * Selects the given index of each element.
 *
 * Whether the index does not exist for a certain element, it selects the last element.
 *
 * This is useful for test purposes.
 *
 * @author Thiago Delgado Pinto
 */
export class IndexOfEachStrategy {
    constructor(_index) {
        this._index = _index;
    }
    /** @inheritDoc */
    combine(map) {
        let obj = {};
        for (let key in map) {
            let elements = map[key];
            if (Array.isArray(elements)) {
                const size = elements.length;
                const index = (this._index >= size || this._index < 0) ? size - 1 : this._index;
                obj[key] = elements[index];
            }
        }
        return [obj];
    }
}
