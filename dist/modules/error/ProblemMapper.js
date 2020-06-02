"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemMapper = exports.ProblemInfo = exports.GENERIC_ERROR_KEY = void 0;
/** Key for generic errors */
exports.GENERIC_ERROR_KEY = '*';
class ProblemInfo {
    constructor(errors = [], warnings = []) {
        this.errors = errors;
        this.warnings = warnings;
    }
    hasErrors() {
        return this.errors.length > 0;
    }
    hasWarnings() {
        return this.warnings.length > 0;
    }
    isEmpty() {
        return !this.hasErrors() && !this.hasWarnings();
    }
}
exports.ProblemInfo = ProblemInfo;
/**
 * Maps a key to a `ProblemInfo`.
 *
 * Note: `GENERIC_ERROR_KEY` is used for generic errors.
 */
class ProblemMapper {
    constructor(_needsToConvertKey = false) {
        this._needsToConvertKey = _needsToConvertKey;
        this._map = new Map();
    }
    convertKey(key) {
        return key;
    }
    addError(key, ...errors) {
        let target = this.get(key, true);
        target.errors.push.apply(target.errors, errors);
    }
    addGenericError(...errors) {
        this.addError(exports.GENERIC_ERROR_KEY, ...errors);
    }
    addWarning(key, ...errors) {
        let target = this.get(key, true);
        target.warnings.push.apply(target.warnings, errors);
    }
    addGenericWarning(...errors) {
        this.addWarning(exports.GENERIC_ERROR_KEY, ...errors);
    }
    get(key, assureExists = true) {
        const cKey = this._needsToConvertKey ? this.convertKey(key) : key;
        let target = this._map.get(cKey);
        if (assureExists && !target) {
            target = new ProblemInfo();
            this._map.set(cKey, target);
        }
        return target;
    }
    getGeneric(assureExists = true) {
        return this.get(exports.GENERIC_ERROR_KEY, assureExists);
    }
    getErrors(key) {
        const target = this.get(key, false);
        if (!target) {
            return [];
        }
        return target.errors;
    }
    getGenericErrors() {
        return this.getErrors(exports.GENERIC_ERROR_KEY);
    }
    getAllErrors() {
        const errors = [];
        for (const [, value] of this._map) {
            errors.push.apply(errors, value.errors);
        }
        return errors;
    }
    getWarnings(key) {
        const target = this.get(key, false);
        if (!target) {
            return [];
        }
        return target.warnings;
    }
    getGenericWarnings() {
        return this.getWarnings(exports.GENERIC_ERROR_KEY);
    }
    getAllWarnings() {
        const warnings = [];
        for (const [, value] of this._map) {
            warnings.push.apply(warnings, value.warnings);
        }
        return warnings;
    }
    nonGeneric() {
        const mapClone = new Map(this._map);
        mapClone.delete(exports.GENERIC_ERROR_KEY);
        return mapClone;
    }
    remove(key) {
        const cKey = this._needsToConvertKey ? this.convertKey(key) : key;
        this._map.delete(cKey);
    }
    clear() {
        this._map.clear();
    }
    isEmpty() {
        return 0 === this._map.size;
    }
    count() {
        return this._map.size;
    }
}
exports.ProblemMapper = ProblemMapper;
