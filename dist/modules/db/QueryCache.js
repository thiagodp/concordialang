/**
 * Query cache.
 *
 * @author Thiago Delgado Pinto
 */
export class QueryCache {
    constructor() {
        // query => [ { field1 => value1, field2 => value2, ... }, { ... } ]
        // ex: 'SELECT bla' => [ { 'col1': 'valA', 'col2': 'valB' }, { 'col1': 'valC', 'col2': 'valD' } ]
        this._cache = new Map();
    }
    has(query) {
        return this._cache.has(query);
    }
    put(query, values) {
        this._cache.set(query, values);
    }
    get(query) {
        return this._cache.get(query);
    }
    remove(query) {
        return this._cache.delete(query);
    }
    clear() {
        this._cache.clear();
    }
}
