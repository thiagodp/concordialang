"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StateMapper {
    constructor() {
        this._cache = new Map();
    }
    add(ref) {
        let refs = this._cache.get(ref.doc) || null;
        if (null === refs) {
            this._cache.set(ref.doc, [ref]);
        }
        else {
            refs.push(ref);
        }
    }
    stateProducersInDocument(stateName, doc) {
        let refs = this._cache.get(doc) || null;
        if (null === refs) {
            return [];
        }
        return refs.filter(sr => sr.hasPostconditionNamed(stateName));
    }
    stateProducersFromImports(stateName, imports, spec) {
        let refs = [];
        for (let imp of imports) {
            let importedDoc = spec.docWithPath(imp.resolvedPath);
            if (!importedDoc) {
                continue;
            }
            let foundRefs = this.stateProducersInDocument(stateName, importedDoc);
            if (foundRefs.length > 0) {
                refs.push.apply(refs, foundRefs);
            }
        }
        return refs;
    }
}
exports.StateMapper = StateMapper;
//# sourceMappingURL=StateMapper.js.map