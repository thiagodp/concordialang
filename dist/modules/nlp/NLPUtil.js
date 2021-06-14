/**
 * NLP utilities.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPUtil {
    entitiesNamed(name, nlpResult) {
        if (!name || !nlpResult) {
            return [];
        }
        return nlpResult.entities.filter(e => name === e.entity);
    }
    hasEntityNamed(name, nlpResult) {
        return this.entitiesNamed(name, nlpResult).length > 0;
    }
    /**
     * Returns true if the NLPResult has all the informed entity names.
     *
     * @param names
     * @param nlpResult
     */
    hasEntitiesNamed(names, nlpResult) {
        return names.every(name => this.hasEntityNamed(name, nlpResult));
    }
    entityNamed(name, nlpResult) {
        if (!name || !nlpResult) {
            return null;
        }
        return nlpResult.entities.find(e => name === e.entity) || null;
    }
    valuesOfEntitiesNamed(name, nlpResult) {
        if (!name || !nlpResult) {
            return [];
        }
        return nlpResult.entities.filter(e => name === e.entity).map(e => e.value);
    }
}
