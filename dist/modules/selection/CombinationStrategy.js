"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Random_1 = require("../testdata/random/Random");
const cartesian = require("cartesian");
const oneWise = require("one-wise");
const suffleObjArrays = require("shuffle-obj-arrays");
const RandomLong_1 = require("../testdata/random/RandomLong");
/**
 * Performs a cartezian product of the elements.
 *
 * @author Thiago Delgado Pinto
 */
class CartesianProductStrategy {
    /** @inheritDoc */
    combine(map) {
        return cartesian(map);
    }
}
exports.CartesianProductStrategy = CartesianProductStrategy;
/**
 * Performs a 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
class OneWiseStrategy {
    constructor(seed) {
        this._random = new Random_1.Random(seed);
    }
    /** @inheritDoc */
    combine(map) {
        const rng = () => this._random.generate();
        return oneWise(map, rng);
    }
}
exports.OneWiseStrategy = OneWiseStrategy;
/**
 * Performs a shuffled 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
class ShuffledOneWiseStrategy {
    constructor(seed) {
        this._random = new Random_1.Random(seed);
    }
    /** @inheritDoc */
    combine(map) {
        const rng = () => this._random.generate();
        const options = { copy: true, rng: rng };
        return oneWise(suffleObjArrays(map, options), rng);
    }
}
exports.ShuffledOneWiseStrategy = ShuffledOneWiseStrategy;
/**
 * Selects a single, random element from each.
 *
 * @author Thiago Delgado Pinto
 */
class SingleRandomOfEachStrategy {
    constructor(seed) {
        this._randomLong = new RandomLong_1.RandomLong(new Random_1.Random(seed));
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
exports.SingleRandomOfEachStrategy = SingleRandomOfEachStrategy;
/**
 * Selects the given index of each element.
 *
 * Whether the index does not exist for a certain element, it selects the last element.
 *
 * This is useful for test purposes.
 *
 * @author Thiago Delgado Pinto
 */
class IndexOfEachStrategy {
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
exports.IndexOfEachStrategy = IndexOfEachStrategy;
