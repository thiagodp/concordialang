import { Document } from 'concordialang-types/ast';
import { SemanticException } from '../SemanticException';

/**
 * Document analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export interface DocumentAnalyzer {

    analyze( doc: Document, errors: SemanticException[] );

}