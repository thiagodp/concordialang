import { LocatedException } from "concordialang-types/req";

/**
 * Syntatic exception
 *
 * @author Thiago Delgado Pinto
 */
export class SyntaticException extends LocatedException {
    name = 'SyntaxError'
}