import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { Text } from '../ast/Text';
import { Keywords } from "../Keywords";
import { LineChecker } from "../LineChecker";

/**
 * Detects a Text.
 * 
 * @author Thiago Delgado Pinto
 */
export class TextLexer implements NodeLexer< Text > {

    private _keyword: string = Keywords.TEXT;
    private _lineChecker: LineChecker = new LineChecker();

    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Text > {
        
        if ( 0 === line.trim().length ) { // Empty line not accepted
            return null;
        }

        const pos = this._lineChecker.countLeftSpacesAndTabs( line );

        return {
            node: {
                keyword: this._keyword,
                location: { line: lineNumber || 0, column: pos + 1 },
                content: line
            },
            errors: []
        };
    }

}