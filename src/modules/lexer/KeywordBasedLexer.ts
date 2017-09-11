/**
 * Defines a common interface for lexers based on keywords.
 * 
 * @author  Thiago Delgado Pinto
 */
export interface KeywordBasedLexer {

    /**
     * Returns the keyword of the lexer.
     */
    keyword(): string;

    /**
     * Update the words.
     * 
     * @param words Words to be updated.
     */
    updateWords( words: string[] );

}