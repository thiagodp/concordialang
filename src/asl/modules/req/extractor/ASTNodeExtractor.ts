import { ASTNode } from '../ast/ASTNode';

export interface ASTNodeExtractor< T extends ASTNode > {

    /**
     * Extracts a node from a line and returns it. Returns null if a node
     * is not found.
     * 
     * @param line Line.
     * @param lineNumber Line number.
     * @returns The extracted node or null.
     * 
     * @throws LocatedException In case of an invalid format.
     */
    extract( line: string, lineNumber?: number ): T | null;

}