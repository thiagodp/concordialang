import { LocatedException } from "./LocatedException";
/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
export class RuntimeException extends LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'RuntimeException';
    }
    static createFrom(error) {
        const e = new RuntimeException(error.message);
        e.stack = error.stack;
        return e;
    }
}
