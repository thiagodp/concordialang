import { LocatedException } from "concordialang-types/req";

/**
 * Provides an exception that should be handled as a warning.
 *
 * @author Thiago Delgado Pinto
 */
export class Warning extends LocatedException {
    name = 'Warning';
}