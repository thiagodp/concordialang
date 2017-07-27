import { Node } from '../ast/Node';
import { ASTContext } from './ASTContext';
import { SemanticException } from './SemanticException';

/**
 * Semantic node analyzer
 */
export interface NodeAnalyzer< T extends Node > {

    analyze( current: T, context: ASTContext, errors: Array< SemanticException > ): void;

}