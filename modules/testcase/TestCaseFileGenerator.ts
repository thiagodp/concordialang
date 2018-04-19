import { Document } from "../ast/Document";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import { promisify } from 'util';
import { EventEmitter } from "events";
import { Symbols } from "../req/Symbols";
import { NodeTypes } from "../req/NodeTypes";
import { upperFirst } from "../util/CaseConversor";

/**
 * Events related to the generation of files for Documents with Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
export enum TestCaseFileGeneratorEvents {
    NEW_FILE = 'concordia:testCase:newFile'
}


/**
 * Generates files for Documents with Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseFileGenerator extends EventEmitter {

    public readonly fileHeader: string[] = [
        '# Generated with ❤ by Concordia',
        '#',
        '# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !',
        ''
    ];

    private _dict: KeywordDictionary;

    constructor(
        private _languageContentLoader: LanguageContentLoader,
        private language: string
    ) {
        super();
        // Loads/gets the dictionary according to the current language
        let langContent = _languageContentLoader.load( language );
        this._dict = langContent.keywords || new EnglishKeywordDictionary();
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
            dict = this.dictionaryForLanguage( doc.language.value, errors ) || this._dict;
            lines.push( this.generateLanguageLine( doc.language.value, dict ) );
            lines.push( '' ); // empty line
        }

        // Imports
        for ( let imp of doc.imports || [] ) {
            lines.push( this.generateImportLine( imp.value, dict ) );
        }

        // Test Cases
        for ( let testCase of doc.testCases || [] ) {

            lines.push( '' ); // empty line

            // Tags
            for ( let tag of testCase.tags || [] ) {
                lines.push( this.generateTagLine( tag.name, tag.content ) );
            }

            // Header
            lines.push( this.generateTestCaseHeader( testCase.name, dict ) );

            // Sentences
            for ( let sentence of testCase.sentences || [] ) {
                let ind = indentation;
                if ( NodeTypes.STEP_AND === sentence.nodeType ) {
                    ind += indentation;
                }
                lines.push( ind + sentence.content );
            }
        }

        return lines;
    }


    async createFile(
        fs: any,
        path: string,
        lines: string[],
        lineBreaker: string = "\n"
    ): Promise< void > {
        const writeFileAsync = promisify( fs.writeFile );
        await writeFileAsync( path, lines.join( lineBreaker ) );
        this.emit( TestCaseFileGeneratorEvents.NEW_FILE, path );
    }


    dictionaryForLanguage( language: string, errors: Error[] ): KeywordDictionary | null {
        try {
            return this._languageContentLoader.load( language ).keywords || null;
        } catch ( err ) {
            errors.push( err );
            return null;
        }
    }

    generateLanguageLine( language: string, dict: KeywordDictionary ): string {
        return Symbols.COMMENT_PREFIX + ( dict.language[ 0 ] || 'language' ) +
            Symbols.LANGUAGE_SEPARATOR + language;
    }

    generateImportLine( path: string, dict: KeywordDictionary ): string  {
        return ( dict.import[ 0 ] || 'import' ) + ' ' +
            Symbols.IMPORT_PREFIX + path + Symbols.IMPORT_SUFFIX;
    }

    generateTagLine( name: string, content: string ): string {
        return Symbols.TAG_PREFIX + name +
            ( content && content.length > 0 ? '(' + content + ')' : '' );
    }

    generateTestCaseHeader( name: string, dict: KeywordDictionary ): string  {
        return upperFirst( dict.testCase[ 0 ] || 'Test Case' ) +
            Symbols.TITLE_SEPARATOR + ' ' + name;
    }

}