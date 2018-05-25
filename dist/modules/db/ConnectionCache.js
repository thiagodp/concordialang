"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Connection cache.
 *
 * @author Thiago Delgado Pinto
 */
class ConnectionCache {
    constructor() {
        this._cache = new Map();
    }
    has(dbName) {
        return this._cache.has(dbName);
    }
    put(dbName, value) {
        this._cache.set(dbName, value);
    }
    get(dbName) {
        return this._cache.get(dbName);
    }
    remove(dbName) {
        return this._cache.delete(dbName);
    }
    clear() {
        this._cache.clear();
    }
}
exports.ConnectionCache = ConnectionCache;
