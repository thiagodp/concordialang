import { Text } from 'concordialang-types';
import { Symbols } from '../req/Symbols';
import { NodeTypes } from '../req/NodeTypes';
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { LineChecker } from "../req/LineChecker";

/**
 * Detects anything not empty.
 *
 * @author Thiago Delgado Pinto
 */
export class TextLexer implements NodeLexer< Text > {

    private _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    public nodeType(): string {
        return NodeTypes.TEXT;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEXT ];
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Text > {

        let trimmedLine = line.trim();

        // Empty line is not accepted
        if ( 0 === trimmedLine.length ) {
            return null;
        }

        // Comment is not accepted
        const commentPos = trimmedLine.indexOf( Symbols.COMMENT_PREFIX );
        if ( 0 === commentPos ) {
            return null;
        }

        const pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: NodeTypes.TEXT,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: line
        };

        return { nodes: [ node ], errors: [] };
    }

}