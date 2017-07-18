import { ASTNode } from '../ast/ASTNode';

export interface NodeExtractor< T extends ASTNode > {
    
    extract( line: string ): T;

}