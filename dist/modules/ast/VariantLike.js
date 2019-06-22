"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * State is **not** a node.
 *
 * @author Thiago Delgado Pinto
 */
class State {
    constructor(name, stepIndex) {
        this.name = name;
        this.stepIndex = stepIndex;
    }
    toString() {
        return name;
    }
    equals(state) {
        return this.nameEquals(state.name);
    }
    nameEquals(name) {
        return this.name.toLowerCase() === name.toLowerCase();
    }
}
exports.State = State;
