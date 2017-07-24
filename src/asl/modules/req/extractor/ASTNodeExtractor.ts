import { ASTNode } from '../ast/ASTNode';

export interface ASTNodeExtractor< T extends ASTNode > {

    /**
     * Extracts the node.
     * 
     * @param line Line to extract the node.
     * @param lineNumber Line number.
     * @returns The extracted node, or null if the node does not exist.
     * 
     * @throws LocatedException In case of an invalid format.
     */
    extract( line: string, lineNumber?: number ): T | null;

}