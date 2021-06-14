import { LocatedException } from "../error/LocatedException";
/**
 * Lexical exception.
 *
 * @author Thiago Delgado Pinto
 */
export class LexicalException extends LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'LexicalError';
    }
}
