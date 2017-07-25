import { ContentASTNode } from './ASTNode';

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

export interface Import extends ContentASTNode {
}