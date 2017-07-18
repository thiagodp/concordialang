/**
 * Token detector.
 */
export interface TokenDetector {

    /**
     * Detects if a token is in the given line.
     * 
     * @param line
     */
    isInTheLine( line: string ): boolean;

    /**
     * Returns the type of the token detected.
     */
    tokenType(): string;

}