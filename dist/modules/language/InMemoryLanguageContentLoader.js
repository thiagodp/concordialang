"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLanguageContentLoader = void 0;
/**
 * In-memory language content loader
 *
 * @author Thiago Delgado Pinto
 */
class InMemoryLanguageContentLoader {
    /**
     * @param map Maps a language to a language content.
     */
    constructor(_map) {
        this._map = _map;
    }
    /** @inheritDoc */
    has(language) {
        return this._map.has(language);
    }
    /** @inheritDoc */
    load(language) {
        return this._map.get(language);
    }
}
exports.InMemoryLanguageContentLoader = InMemoryLanguageContentLoader;
