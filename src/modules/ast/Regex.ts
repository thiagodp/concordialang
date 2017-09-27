import { NamedNode } from './Node';

/**
 * Regular expression node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Regex extends NamedNode {
    content: string;
}