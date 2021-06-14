import { LocatedException } from "../error/LocatedException";
/**
 * Syntactic exception
 *
 * @author Thiago Delgado Pinto
 */
export class SyntacticException extends LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SyntacticError';
    }
}
