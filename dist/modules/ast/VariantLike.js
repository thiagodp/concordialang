/**
 * State is **not** a node.
 *
 * @author Thiago Delgado Pinto
 */
export class State {
    constructor(name, stepIndex, notFound // Occurs when the State reference is not found
    ) {
        this.name = name;
        this.stepIndex = stepIndex;
        this.notFound = notFound;
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
