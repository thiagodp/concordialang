import { LocatedException } from "concordialang-types";

/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
export class RuntimeException extends LocatedException {
    name = 'RuntimeError'
}