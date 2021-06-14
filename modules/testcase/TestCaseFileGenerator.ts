import { Location } from 'concordialang-types';

import { Document } from '../ast/Document';
import { dictionaryForLanguage } from '../language/data/map';
import { KeywordDictionary } from '../language/KeywordDictionary';
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
import { upperFirst } from '../util/CaseConversor';


/**
 * Generates files for Documents with Test Cases.
 * @author Thiago Delgado Pinto
 */
export class TestCaseFileGenerator {

    public readonly fileHeader: string[] = [
        '# Generated with ❤ by Concordia',
        '#',
        '# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !',
        ''
    ];

    private _dict: KeywordDictionary;

    constructor( language: string ) {
        this._dict = dictionaryForLanguage( language ).keywords;
    }


    /**
     * Generates lines from a document.
     *
     * @param doc Document
     * @param errors Errors found, probably because of language loading.
     * @param ignoreHeader If true, does not include the header.
     * @param indentation Characters used as indentation. Defaults to double spaces.
     */
    createLinesFromDoc(
        doc: Document,
        errors: Error[],
        ignoreHeader: boolean = false,
        indentation: string = '  '
    ): string[] {

        let dict = this._dict;
        let lines: string[] = [];

        // Add header lines
        if ( ! ignoreHeader ) {
            lines.push.apply( lines, this.fileHeader );
        }

        // Generate language, if declared
        if ( doc.language ) {

            // Get dictionary
            dict = dictionaryForLanguage( doc.language.value ).keywords;
            // Transform to text
            let line = this.generateLanguageLine( doc.language.value, dict );

            // Adjust location
            doc.language.location = {
                line: lines.length + 1,
                column: 1 + line.length - line.trimLeft().length
            } as Location;

            lines.push( line );
            lines.push( '' ); // empty line
        }

        // Imports
        for ( let imp of doc.imports || [] ) {

            // Transform to text
            let line = this.generateImportLine( imp.value, dict );

            // Adjust location
            imp.location = {
                line: lines.length + 1,
                column: 1 + line.length - line.trimLeft().length
            } as Location;

            lines.push( line );
        }

        // Test Cases
        let lastTagsContent: string = '';
        for ( let testCase of doc.testCases || [] ) {

            lines.push( '' ); // empty line

            let newTagsContent = testCase.tags.map( t => ( t.content || '' ) ).join( '' );
            if ( lastTagsContent != newTagsContent ) {
                if ( lastTagsContent !== '' ) {
                    lines.push( Symbols.COMMENT_PREFIX + ' ' + '-'.repeat( 80 - 2 ) );
                    lines.push( '' ); // empty line
                }
                lastTagsContent = newTagsContent;
            }

            // Tags
            for ( let tag of testCase.tags || [] ) {

                // Transform to text
                let line = this.generateTagLine( tag.name, tag.content );

                // Adjust location
                tag.location = {
                    line: lines.length + 1,
                    column: 1 + line.length - line.trimLeft().length
                } as Location;

                lines.push( line );
            }

            // Header
            let line = this.generateTestCaseHeader( testCase.name, dict );
            lines.push( line );

            if ( ! testCase.location ) {
                testCase.location = {} as any;
            }
            testCase.location.column = line.length - line.trimLeft.length;
            testCase.location.line = lines.length;

            const baseLineNumber = testCase.location.line;
            let lineNumber = 1 + baseLineNumber;

            // Sentences
            for ( let sentence of testCase.sentences || [] ) {

                if ( ! sentence ) {
                    continue;
                }

                // Transform into text
                let ind = indentation;
                if ( NodeTypes.STEP_AND === sentence.nodeType ) {
                    ind += indentation;
                }
                let line = ind + sentence.content +
                    ( ! sentence.comment ? '' : '  ' + Symbols.COMMENT_PREFIX + sentence.comment );

                // Adjust location
                sentence.location = {
                    line: lineNumber++,
                    column: line.length - line.trimLeft().length
                } as Location;

                lines.push( line );
            }
        }

        return lines;
    }

    generateLanguageLine( language: string, dict: KeywordDictionary ): string {
        return Symbols.COMMENT_PREFIX +
            ( ! dict.language ? 'language' : dict.language[ 0 ] || 'language' ) +
            Symbols.LANGUAGE_SEPARATOR + language;
    }

    generateImportLine( path: string, dict: KeywordDictionary ): string  {
        return ( ! dict.import ? 'import' : dict.import[ 0 ] || 'import' ) + ' ' +
            Symbols.IMPORT_PREFIX + path + Symbols.IMPORT_SUFFIX;
    }

    generateTagLine( name: string, content: string ): string {
        return Symbols.TAG_PREFIX + name + ( ! content ? '' : '(' + content + ')' );
    }

    generateTestCaseHeader( name: string, dict: KeywordDictionary ): string  {
        return upperFirst( ! dict ? 'Test Case' : dict.testCase[ 0 ] || 'Test Case' ) +
            Symbols.TITLE_SEPARATOR + ' ' + name;
    }

}