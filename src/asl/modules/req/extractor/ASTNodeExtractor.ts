import { ASTNode } from '../ast/ASTNode';


export interface TokenDetection {
    keyword: string;
    position: number;
}


export interface ASTNodeExtractor< T extends ASTNode > {

    /**
     * Detects if a token is in the given line.
     * 
     * @param line
     */
    detect( line: string ): TokenDetection | null;

    /**
     * Extracts the node.
     * 
     * @param line Line to extract the node.
     * @param lineNumber Line number.
     * @returns The extracted node, or null if the node does not exist.
     * 
     * @throws LocatedException In case of an invalid format.
     */
    extract( line: string, lineNumber: number ): T;

}