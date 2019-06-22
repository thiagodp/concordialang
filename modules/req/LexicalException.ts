import { LocatedException } from "../dbi/LocatedException";

/**
 * Lexical exception.
 *
 * @author Thiago Delgado Pinto
 */
export class LexicalException extends LocatedException {
    name = 'LexicalError'
}