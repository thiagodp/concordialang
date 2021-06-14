/**
 * Entity handler
 *
 * @author Thiago Delgado Pinto
 */
export class EntityHandler {
    with(r, target) {
        if (!r.entities) {
            return [];
        }
        return r.entities.filter(e => e.entity === target);
    }
    count(r, target) {
        return this.with(r, target).length;
    }
    has(r, target) {
        return this.count(r, target) > 0;
    }
    values(r, target) {
        return this.with(r, target).map(e => e.value);
    }
}
