import { LocatedException } from './LocatedException';

/**
 * External reference exception
 * 
 * @author Thiago Delgado Pinto
 */
export class ExternalReferenceException extends LocatedException {
    name = 'ExternalReferenceError'
}