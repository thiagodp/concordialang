import { ValuedNode } from './Node';

/**
 * Import node.
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Import extends ValuedNode {

    // Path according to the location of the current document. For instance,
    // if the current document is in "some/dir" and the import is "../file.ext",
    // then the resolved path will be "some/file.ext".
    // @see ImportSDA
    resolvedPath?: string;
}