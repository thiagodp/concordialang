import { LocatedException } from '../dbi/LocatedException';

/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
export class SemanticException extends LocatedException {
    name = 'SemanticError'
}