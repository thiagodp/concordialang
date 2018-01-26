import { Symbols } from '../req/Symbols';
import { NodeTypes } from '../req/NodeTypes';
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { LineChecker } from "../req/LineChecker";
import { LongString } from '../ast/LongString';

/**
 * Detects anything not empty.
 * 
 * @author Thiago Delgado Pinto
 */
export class LongStringLexer implements NodeLexer< LongString > {

    private _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    public nodeType(): string {
        return NodeTypes.LONG_STRING;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.LONG_STRING ];
    }    

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< LongString > {

        // Empty line is not accepted
        if ( 0 === line.trim().length ) {
            return null;
        }

        // It must start with three quotes ("""), exactly. It may have spaces
        let re = new RegExp( '^""" *(' + Symbols.COMMENT_PREFIX + '.*)?$', 'u' );
        if ( ! re.test( line ) ) {
            return null;
        }

        let node = {
            nodeType: NodeTypes.LONG_STRING,
            location: { line: lineNumber || 0, column: 1 }
        } as LongString;

        return { nodes: [ node ], errors: [] };
    }

}