import { LocatedException } from "../error/LocatedException";

/**
 * Syntactic exception
 *
 * @author Thiago Delgado Pinto
 */
export class SyntacticException extends LocatedException {
    name = 'SyntacticError'
}