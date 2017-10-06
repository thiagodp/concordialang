import { Expressions } from '../req/Expressions';
import { Location } from '../ast/Location';
import { TableRow } from '../ast/Table';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from '../req/Symbols';
import { LexicalException } from '../req/LexicalException';
import { NodeTypes } from '../req/NodeTypes';

/**
 * TableRow lexer.
 * 
 * @author Thiago Delgado Pinto
 */
export class TableRowLexer implements NodeLexer< TableRow > {

    private _lineChecker: LineChecker = new LineChecker();

    public analyze( line: string, lineNumber: number ): LexicalAnalysisResult< TableRow > | null {

        // Replace empty cells with cells with a space, in order to capture their value correctly.
        // That is, "||"" with "| |".
        line = line.replace(
            new RegExp( Expressions.escape( Symbols.TABLE_CELL_SEPARATOR + Symbols.TABLE_CELL_SEPARATOR ), 'g' ),
            Symbols.TABLE_CELL_SEPARATOR + ' ' + Symbols.TABLE_CELL_SEPARATOR
        );
        
        let index: number = line.indexOf( Symbols.TABLE_PREFIX );
        if ( index < 0 ) {
            return null;
        }

        let lastIndex: number = line.lastIndexOf( Symbols.TABLE_PREFIX );
        if ( lastIndex == index ) {
            return null;
        }

        // Captures the content between table prefixes
        const content: string = line.substring( index + Symbols.TABLE_PREFIX.length, lastIndex - Symbols.TABLE_PREFIX.length );
        // The cells are trimmed
        const cells: string[] = content.split( Symbols.TABLE_CELL_SEPARATOR ).map( value => value.trim() );

        const location: Location = { column: index, line: lineNumber };
        let errors = [];        
        if ( cells.length < 1 ) {
            errors.push( new LexicalException( 'Invalid table row declaration: "' + line + '".', location ) );
        }

        let node = {
            nodeType: NodeTypes.TABLE_ROW,
            location: location,
            cells: cells
        } as TableRow;

        return { nodes: [ node ], errors: errors };
    }
}