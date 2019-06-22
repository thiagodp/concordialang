import { LocatedException } from '../dbi/LocatedException';

/**
 * Natural Language Processing Exception
 *
 * @author Thiago Delgado Pinto
 */
export class NLPException extends LocatedException {
    name = 'NLPError'
}