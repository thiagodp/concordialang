import { Step } from './Step';

/**
 * VariantLike is **not** a node.
 *
 * @author Thiago Delgado Pinto
 */
export interface VariantLike {

    sentences: Step[];

    // Detected during test scenario generation:

    preconditions?: State[];
    stateCalls?: State[];
}


/**
 * State is **not** a node.
 *
 * @author Thiago Delgado Pinto
 */
export class State {

    constructor(
        public name: string,
        public stepIndex: number
    ) {
    }

    toString(): string {
        return name;
    }

    equals( state: State ): boolean {
        return this.nameEquals( state.name );
    }

    nameEquals( name: string ): boolean {
        return this.name.toLowerCase() === name.toLowerCase();
    }
}