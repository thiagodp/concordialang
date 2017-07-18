import { NodeExtractor } from './NodeExtractor';
import { ASTNode } from '../ast/ASTNode';
import { LineChecker } from './LineChecker';

export abstract class DictionaryBasedNodeExtractor< T extends ASTNode > implements NodeExtractor< T > {

    protected _lineChecker: LineChecker = new LineChecker();

    constructor( protected _dictionary ) {
    }

    /** @inheritDoc */
    public abstract extract( line: string ): T;

}