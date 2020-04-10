import { Document } from '../../ast/Document';
import { SemanticException } from '../../error/SemanticException';

/**
 * Document analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export interface DocumentAnalyzer {

    analyze( doc: Document, errors: SemanticException[] ): void;

}