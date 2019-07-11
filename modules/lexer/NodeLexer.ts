import { Node } from '../ast/Node';
import { LexicalException } from "./LexicalException";


export interface LexicalAnalysisResult< T extends Node > {
    nodes: Array< T >,
    errors: Array< LexicalException >
    warnings?: Array< LexicalException >
}

/**
 * Node lexer
 *
 * @author Thiago Delgado Pinto
 */
export interface NodeLexer< T extends Node > {

    /**
     * Returns the target node type.
     */
    nodeType(): string;

    /**
     * Suggests nodes types as the next ones to verify.
     */
    suggestedNextNodeTypes(): string[];

    /**
     * Perform a lexical analysis of a line. Returns null if the line
     * does not contain the node, or a lexical analysis result otherwise.
     *
     * @param line Line.
     * @param lineNumber Line number.
     */
    analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > | null;

}