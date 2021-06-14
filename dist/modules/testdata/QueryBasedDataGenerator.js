/**
 * Query-based data generator.
 *
 * Known limitations:
 * - It always generates values from the first column returned by the query.
 *
 * @author Thiago Delgado Pinto
 */
export class QueryBasedDataGenerator {
    /**
     * Constructor
     *
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator
     * @param _queryable Queryable
     * @param _queryCache Query cache
     * @param _query SQL query
     * @param _maxTries Max tries to generate an element which does not belong to the set
     */
    constructor(_random, _rawDataGenerator, _queryable, _queryCache, _query, _maxTries = 10) {
        this._random = _random;
        this._rawDataGenerator = _rawDataGenerator;
        this._queryable = _queryable;
        this._queryCache = _queryCache;
        this._query = _query;
        this._maxTries = _maxTries;
    }
    // DATA GENERATION
    async firstElement() {
        const values = await this.queryValues();
        return values.length > 0
            ? this.valueOfTheFirstColumn(values[0])
            : null;
    }
    async secondElement() {
        const values = await this.queryValues();
        return values.length > 1
            ? this.valueOfTheFirstColumn(values[1])
            : null;
    }
    async randomElement() {
        /// TO-DO: use LIMIT and OFFSET to generate the random number
        // e.g.: LIMIT 1 OFFSET random( 1, COUNT( * ) )
        const values = await this.queryValues();
        if (values.length < 1) {
            return null;
        }
        const index = this._random.between(0, values.length - 1);
        return this.valueOfTheFirstColumn(values[index]);
    }
    async penultimateElement() {
        const values = await this.queryValues();
        const len = values.length;
        return len > 1
            ? this.valueOfTheFirstColumn(values[len - 2])
            : null;
    }
    async lastElement() {
        const values = await this.queryValues();
        const len = values.length;
        return len > 0
            ? this.valueOfTheFirstColumn(values[len - 1])
            : null;
    }
    async notInSet() {
        for (let i = 0; i < this._maxTries; ++i) {
            const val = this._rawDataGenerator.randomBetweenMinAndMax();
            const found = await this.hasValue(val);
            if (!found) {
                return val;
            }
        }
        return null;
    }
    // UTIL
    valueOfTheFirstColumn(row) {
        if (!row) {
            return null;
        }
        for (let key in row) { // works for both an object or an array of values
            return row[key];
        }
        return null;
    }
    async queryValues() {
        if (this._queryCache.has(this._query)) {
            return this._queryCache.get(this._query);
        }
        const result = await this._queryable.query(this._query);
        this._queryCache.put(this._query, result);
        return result;
    }
    async hasValue(value) {
        const values = await this.queryValues();
        for (let row of values) {
            const val = this.valueOfTheFirstColumn(row);
            if (val == value) {
                return true;
            }
        }
        return false;
    }
}
