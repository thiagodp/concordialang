import { LocatedException } from "../LocatedException";

/**
 * Lexer exception
 *
 * @author Thiago Delgado Pinto
 */
export class LexerException extends LocatedException {
    name = 'LexerError'
}