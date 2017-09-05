import { NamedNode } from './Node';

// Example:
// ```
// Regex "Person Name": /[A-Za-z][A-Za-z '-.]{1,59}/
// ```
//

/**
 * Regular expression node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Regex extends NamedNode {
    content: string;
}