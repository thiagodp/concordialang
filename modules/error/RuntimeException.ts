import { LocatedException } from "./LocatedException";

/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
export class RuntimeException extends LocatedException {
    name = 'RuntimeException';

    public static createFrom( error: Error ): RuntimeException {
        const e = new RuntimeException( error.message );
        e.stack = error.stack;
        return e;
    }
}