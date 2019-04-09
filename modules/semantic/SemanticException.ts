import { LocatedException } from 'concordialang-types/req';

/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
export class SemanticException extends LocatedException {
    name = 'SemanticError'
}