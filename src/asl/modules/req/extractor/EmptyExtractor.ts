import { TokenTypes } from './TokenTypes';
import { ASTNodeExtractor } from './ASTNodeExtractor';
import { LineChecker } from './LineChecker';
import { ASTNode } from "../ast/ASTNode";

/**
 * Empty token extractor.
 */
export class EmptyExtractor implements ASTNodeExtractor< ASTNode > {

    protected _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    public isInTheLine( line: string ): boolean {
        return this._lineChecker.isEmpty( line );
    }

    /** @inheritDoc */
    public extract( line: string, lineNumber: number ): ASTNode {
        return { 
            keyword: TokenTypes.EMPTY,
            location: { line: lineNumber, column: 0 }
        };
    }

}