import { LocatedException } from '../req/LocatedException';

/**
 * Semantic exception.
 * 
 * @author Thiago Delgado Pinto
 */
export class SemanticException extends LocatedException {
    name = 'SemanticError'
}