"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Query-based data generator.
 *
 * Known limitations:
 * - It always generates values from the first column returned by the query.
 *
 * @author Thiago Delgado Pinto
 */
class QueryBasedDataGenerator {
    /**
     * Constructor
     *
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator
     * @param _queriable Queriable
     * @param _queryCache Query cache
     * @param _query SQL query
     * @param _maxTries Max tries to generate an element which does not belong to the set
     */
    constructor(_random, _rawDataGenerator, _queriable, _queryCache, _query, _maxTries = 10) {
        this._random = _random;
        this._rawDataGenerator = _rawDataGenerator;
        this._queriable = _queriable;
        this._queryCache = _queryCache;
        this._query = _query;
        this._maxTries = _maxTries;
    }
    // DATA GENERATION
    firstElement() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.queryValues();
            return values.length > 0
                ? this.valueOfTheFirstColumn(values[0])
                : null;
        });
    }
    secondElement() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.queryValues();
            return values.length > 1
                ? this.valueOfTheFirstColumn(values[1])
                : null;
        });
    }
    randomElement() {
        return __awaiter(this, void 0, void 0, function* () {
            /// TO-DO: use LIMIT and OFFSET to generate the random number
            // e.g.: LIMIT 1 OFFSET random( 1, COUNT( * ) )
            const values = yield this.queryValues();
            if (values.length < 1) {
                return null;
            }
            const index = this._random.between(0, values.length - 1);
            return this.valueOfTheFirstColumn(values[index]);
        });
    }
    penultimateElement() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.queryValues();
            const len = values.length;
            return len > 1
                ? this.valueOfTheFirstColumn(values[len - 2])
                : null;
        });
    }
    lastElement() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.queryValues();
            const len = values.length;
            return len > 0
                ? this.valueOfTheFirstColumn(values[len - 1])
                : null;
        });
    }
    notInSet() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._maxTries; ++i) {
                const val = this._rawDataGenerator.randomBetweenMinAndMax();
                const found = yield this.hasValue(val);
                if (!found) {
                    return val;
                }
            }
            return null;
        });
    }
    // UTIL
    valueOfTheFirstColumn(row) {
        if (!row) {
            return null;
        }
        for (let key in row) {
            return row[key];
        }
        return null;
    }
    queryValues() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._queryCache.has(this._query)) {
                return this._queryCache.get(this._query);
            }
            const result = yield this._queriable.query(this._query);
            this._queryCache.put(this._query, result);
            return result;
        });
    }
    hasValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield this.queryValues();
            for (let row of values) {
                const val = this.valueOfTheFirstColumn(row);
                if (val == value) {
                    return true;
                }
            }
            return false;
        });
    }
}
exports.QueryBasedDataGenerator = QueryBasedDataGenerator;
//# sourceMappingURL=QueryBasedDataGenerator.js.map