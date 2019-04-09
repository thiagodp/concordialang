import { LocatedException } from "concordialang-types/req";

/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
export class RuntimeException extends LocatedException {
    name = 'RuntimeError'
}