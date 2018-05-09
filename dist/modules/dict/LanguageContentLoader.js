"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LanguageBasedJsonFileLoader_1 = require("../util/LanguageBasedJsonFileLoader");
/**
 * In-memory language content loader
 *
 * @author Thiago Delgado Pinto
 */
class InMemoryLanguageContentLoader {
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
/**
 * Json language content loader
 *
 * @author Thiago Delgado Pinto
 */
class JsonLanguageContentLoader extends LanguageBasedJsonFileLoader_1.LanguageBasedJsonFileLoader {
}
exports.JsonLanguageContentLoader = JsonLanguageContentLoader;
//# sourceMappingURL=LanguageContentLoader.js.map