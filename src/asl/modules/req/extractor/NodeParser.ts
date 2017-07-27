import { Node } from '../ast/Node';

/**
 * Node parser
 */
export interface NodeParser< T extends Node > {

    /**
     * Parses a node from a line and returns it. Returns null if a node is not found.
     * 
     * @param line Line.
     * @param lineNumber Line number.
     * @returns The extracted node or null.
     * 
     * @throws LocatedException In case of an invalid format.
     */
    parse( line: string, lineNumber?: number ): T | null;

}