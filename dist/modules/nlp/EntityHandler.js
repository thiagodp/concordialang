"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityHandler = void 0;
/**
 * Entity handler
 *
 * @author Thiago Delgado Pinto
 */
class EntityHandler {
    with(r, target) {
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
exports.EntityHandler = EntityHandler;
