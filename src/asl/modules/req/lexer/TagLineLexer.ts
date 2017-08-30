import { TagLine } from '../ast/TagLine';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Keywords } from "../Keywords";
import { Symbols } from "../Symbols";
import { LineChecker } from "../LineChecker";

/**
 * Detects a Tag.
 * 
 * @author Thiago Delgado Pinto
 */
export class TagLineLexer implements NodeLexer< TagLine > {

    private _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< TagLine > {

        let trimmedLine = line.trim();
        if ( ! trimmedLine.startsWith( Symbols.TAG_PREFIX ) ) {
            return null;
        }

        // Detects all the tags in the line and trims their content
        const SPACE = ' ';
        let tags = ( SPACE + trimmedLine ).split( SPACE + Symbols.TAG_PREFIX )
            .map( ( val ) => val.trim() )
            .filter( ( val ) => val.length > 0 ); // only the non empty ones

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            keyword: Keywords.TAG,
            location: { line: lineNumber || 0, column: pos + 1 },
            tags: tags
        } as TagLine;

        return { node: node, errors: [] };
    }

}