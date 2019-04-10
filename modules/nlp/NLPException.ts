import { LocatedException } from 'concordialang-types';

/**
 * Natural Language Processing Exception
 *
 * @author Thiago Delgado Pinto
 */
export class NLPException extends LocatedException {
    name = 'NLPError'
}