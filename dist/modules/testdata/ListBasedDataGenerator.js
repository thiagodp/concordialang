/**
 * List-based data generator
 *
 * @author Thiago Delgado Pinto
 */
export class ListBasedDataGenerator {
    /**
     * Constructor
     *
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator.
     * @param _values Values.
     * @param _maxTries Max tries to generate a value that is not in the set.
     */
    constructor(_random, _rawDataGenerator, _values, _maxTries = 10) {
        this._random = _random;
        this._rawDataGenerator = _rawDataGenerator;
        this._values = _values;
        this._maxTries = _maxTries;
    }
    isEmpty() {
        return 0 === this._values.length;
    }
    // DATA GENERATION
    firstElement() {
        return this.isEmpty() ? null : this._values[0];
    }
    secondElement() {
        return this._values.length > 1 ? this._values[1] : null;
    }
    randomElement() {
        if (this.isEmpty()) {
            return null;
        }
        const index = this._random.between(0, this._values.length - 1);
        return this._values[index];
    }
    penultimateElement() {
        const len = this._values.length;
        return len > 1 ? this._values[len - 2] : null;
    }
    lastElement() {
        if (this.isEmpty()) {
            return null;
        }
        return this._values[this._values.length - 1];
    }
    notInSet() {
        for (let i = 0; i < this._maxTries; ++i) {
            let val = this._rawDataGenerator.randomBetweenMinAndMax();
            if (this._values.indexOf(val) < 0) {
                return val;
            }
        }
        return null;
    }
}
