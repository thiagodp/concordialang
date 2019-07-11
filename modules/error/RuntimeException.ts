import { LocatedException } from "./LocatedException";

/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
export class RuntimeException extends LocatedException {
    name = 'RuntimeError'
}