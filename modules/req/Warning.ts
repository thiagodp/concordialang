import { LocatedException } from "../dbi/LocatedException";

/**
 * Provides an exception that should be handled as a warning.
 *
 * @author Thiago Delgado Pinto
 */
export class Warning extends LocatedException {
    name = 'Warning';
}