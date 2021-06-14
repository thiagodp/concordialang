import { LocatedException } from "./LocatedException";
/**
 * Warning
 *
 * @author Thiago Delgado Pinto
 */
export class Warning extends LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
        this.isWarning = true;
    }
}
