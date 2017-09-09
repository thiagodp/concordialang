import { ContentNode } from './Node';

// IMPORT
//
// Example 1
// ```
// Import "path/to/file.ext"
// ```
//
// Example 2
// ```
// Import "path/to/file.ext", "path/to/some/otherfile.ext"
// ```

/**
 * Import node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Import extends ContentNode {

    // Path according to the location of the current document. For instance,
    // if the current document is in "some/dir" and the import is "../file.ext",
    // then the resolved path will be "some/file.ext".
    // @see ImportSDA
    resolvedPath?: string;
}