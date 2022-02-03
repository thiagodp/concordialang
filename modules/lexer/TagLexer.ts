// const XRegExp = require( 'xregexp' );
import XRegExp from 'xregexp';

import { ReservedTags, Tag } from '../ast/Tag';
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalException } from './LexicalException';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a Tag.
 *
 * @author Thiago Delgado Pinto
 */
export class TagLexer implements NodeLexer< Tag > {

    constructor( private readonly _subLexers: TagSubLexer[] = [] ) {
    }


    /** @inheritDoc */
    public nodeType(): string {
        return NodeTypes.TAG;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [
            NodeTypes.TAG,
            NodeTypes.VARIANT,
            NodeTypes.FEATURE,
            NodeTypes.SCENARIO,
            NodeTypes.UI_ELEMENT,
            NodeTypes.UI_PROPERTY
        ];
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Tag > {

        let trimmedLine = line.trim();
        if ( ! trimmedLine.startsWith( Symbols.TAG_PREFIX ) ) {
            return null;
        }

        trimmedLine = ( new CommentHandler() ).removeComment( trimmedLine );

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

            // Try to decide what subtype the tag has.
            // An undefined subtype is valid and it means that the tag is not a reserved tag.
            for ( let subLexer of this._subLexers ) {
                if ( subLexer.containsName( node.name ) ) {
                    node.subType = <ReservedTags> subLexer.affectedKeyword();
                }
            }

            nodes.push( node );
        }

        return { nodes: nodes, errors: errors };
    }

}


/**
 * Allows to compare a tag name against a set of words in order to detect its subtype.
 *
 * @author Thiago Delgado Pinto
 */
export class TagSubLexer implements KeywordBasedLexer {

    constructor(
        private _affectedKeyword: string,
        private _words: string[]
    ) {
    }

    /** @inheritDoc */
    affectedKeyword(): string {
        return this._affectedKeyword;
    }

    /** @inheritDoc */
    updateWords( words: string[] ) {
        this._words = words.map( w => w.toLowerCase() );
    }

    /**
     * Compares if the tag's name is in the set of words.
     *
     * @param name Name to compare
     */
    containsName( name: string ): boolean {
        return this._words.indexOf( name.toLowerCase() ) >= 0;
    }
}
