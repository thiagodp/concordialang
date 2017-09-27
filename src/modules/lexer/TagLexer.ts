import { LexicalException } from '../req/LexicalException';
import { Tag } from '../ast/Tag';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { NodeTypes } from "../req/NodeTypes";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";

const XRegExp = require( 'xregexp' );

/**
 * Detects a Tag.
 * 
 * @author Thiago Delgado Pinto
 */
export class TagLexer implements NodeLexer< Tag > {

    private _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Tag > {

        let trimmedLine = line.trim();
        if ( ! trimmedLine.startsWith( Symbols.TAG_PREFIX ) ) {
            return null;
        }

        // Detects all the tags in the line and trims their content
        const SPACE = ' ';
        let tags = ( SPACE + trimmedLine ).split( SPACE + Symbols.TAG_PREFIX )
            .map( ( val ) => val.trim() )
            .filter( ( val ) => val.length > 0 ); // only the non empty ones

        return this.analyzeEachTag( tags, line, lineNumber || 0 );
    }

    /**
     * Analyzes each tag that was found and returns the analysis result.
     * 
     * @param tags Tags to be analyzed.
     * @param line Line where the tags were detected.
     * @param lineNumber Line number.
     */
    private analyzeEachTag( tags: string[], line: string, lineNumber: number ): LexicalAnalysisResult< Tag > {

        let regex = XRegExp( '^([\\p{L}][\\p{L}0-9_-]*)(\((.*)\))?$', 'ui' );

        let errors = [];
        let nodes = [];
        let lastIndex = -1;
        let location;

        for ( let tag of tags ) {

            lastIndex = line.indexOf( tag );
            location = { line: lineNumber, column: lastIndex };

            let result = regex.exec( tag );
            if ( ! result || result.length < 4 ) {
                errors.push( new LexicalException( 'Invalid tag declaration: ' + tag, location ) );
                continue; // go to the next tag
            }

            let content = result[ 3 ]; 
            if ( content ) {
                content = content
                    .substr( 1, content.length - 2 ) // remove "(" and ")"
                    .split( Symbols.TAG_VALUE_SEPARATOR ) // separate values by comma
                    .map( ( s ) => s.trim() ); // trim values
            }

            let node = {
                nodeType: NodeTypes.TAG,
                location: location,
                name: result[ 1 ],
                content: content
            } as Tag;

            nodes.push( node );
        }

        return { nodes: nodes, errors: errors };
    }

}