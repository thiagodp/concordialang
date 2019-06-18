import { LocatedException } from "concordialang-types";

/**
 * Syntactic exception
 *
 * @author Thiago Delgado Pinto
 */
export class SyntacticException extends LocatedException {
    name = 'SyntaxError'
}