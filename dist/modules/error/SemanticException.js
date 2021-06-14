import { RuntimeException } from './RuntimeException';
/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
export class SemanticException extends RuntimeException {
    constructor() {
        super(...arguments);
        this.name = 'SemanticException';
    }
}
