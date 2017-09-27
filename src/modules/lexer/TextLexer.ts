import { NodeTypes } from '../req/NodeTypes';
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { Text } from '../ast/Text';
import { LineChecker } from "../req/LineChecker";

/**
 * Detects anything not empty.
 * 
 * @author Thiago Delgado Pinto
 */
export class TextLexer implements NodeLexer< Text > {

    private _lineChecker: LineChecker = new LineChecker();

    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Text > {
        
        if ( 0 === line.trim().length ) { // Empty line not accepted
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