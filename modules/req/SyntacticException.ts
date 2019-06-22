import { LocatedException } from "../dbi/LocatedException";

/**
 * Syntactic exception
 *
 * @author Thiago Delgado Pinto
 */
export class SyntacticException extends LocatedException {
    name = 'SyntacticError'
}