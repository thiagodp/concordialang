import { Node } from './Node';

// Example:
// ```
// Regex "Person Name": /[A-Za-z][A-Za-z '-.]{1,59}/
// ```
//
export interface Regex extends Node {
    name: string;
    content: string;
}