import { KeywordBasedLexer } from './KeywordBasedLexer';
import { KeywordDictionaryLoader } from '../dict/KeywordDictionaryLoader';
import { Language } from '../ast/Language';
import { Keywords } from '../req/Keywords';
import { TestCaseLexer } from './TestCaseLexer';
import { Node } from '../ast/Node';
import { DocumentProcessor } from '../req/DocumentProcessor';
import { KeywordDictionary } from '../dict/KeywordDictionary';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { LanguageLexer } from "./LanguageLexer";
import { TagLexer } from "./TagLexer";
import { ImportLexer } from './ImportLexer';
import { FeatureLexer } from './FeatureLexer';
import { ScenarioLexer } from './ScenarioLexer';
import { RegexLexer } from './RegexLexer';
import { StepGivenLexer } from "./StepGivenLexer";
import { StepWhenLexer } from "./StepWhenLexer";
import { StepThenLexer } from "./StepThenLexer";
import { StepAndLexer } from "./StepAndLexer";
import { TextLexer } from "./TextLexer";
import { StateLexer } from "./StateLexer";

/**
 * Lexer
 * 
 * @author Thiago Delgado Pinto
 */
export class Lexer {

    private _nodes: Array< Node > = [];
    private _errors: Array< Error > = [];
    private _lexers: Array< NodeLexer< Node > > = [];

    constructor(
        private _language: string = 'en',
        private _dictionaryLoader: KeywordDictionaryLoader,
        private _stopOnFirstError: boolean = false,
    ) {
        let dictionary = _dictionaryLoader.load( _language );
        if ( ! dictionary ) {
            throw new Error( 'Cannot load language: ' + _language );
        }

        this._lexers = [
            new LanguageLexer( dictionary.language )
            , new TagLexer()
            , new ImportLexer( dictionary.import )
            , new FeatureLexer( dictionary.feature )
            , new ScenarioLexer( dictionary.scenario )
            , new StepGivenLexer( dictionary.stepGiven )
            , new StepWhenLexer( dictionary.stepWhen )
            , new StepThenLexer( dictionary.stepThen )
            , new StepAndLexer( dictionary.stepAnd )
            , new TestCaseLexer( dictionary.testcase )
            , new RegexLexer( dictionary.regex )
            , new StateLexer( dictionary.state )
            , new TextLexer() // captures any non-empty
        ];
    }

    public reset() {
        this._nodes = [];
        this._errors = [];
        // Also resets the language
        this.changeLanguage( this._language = 'en' );
    }

    public nodes(): Array< Node > {
        return this._nodes;
    }

    public hasErrors(): boolean {
        return this._errors.length > 0;
    }

    public errors(): Array< Error > {
        return this._errors;
    }

    public stopOnFirstError( stop?: boolean ): boolean {
        if ( stop !== undefined ) {
            this._stopOnFirstError = stop;
        }
        return this._stopOnFirstError;
    }

    /**
     * Returns true if the lexer was configured to stop on the first error
     * and an error was found.
     */
    public shouldStop(): boolean {
        return this._stopOnFirstError && this._errors.length > 0;
    }

    /**
     * Tries to add a node from the given line. Returns true if added.
     * 
     * @param line Line to be analyzed
     * @param lineNumber Line number
     */
    public addNodeFromLine( line: string, lineNumber: number ): boolean {

        if ( this.shouldStop() ) {
            return false;
        }

        if ( 0 === line.trim().length ) { // Ignore empty lines
            return false;
        }
        
        let result: LexicalAnalysisResult< Node >;
        let node: Node;
        for ( let lexer of this._lexers ) {
            result = lexer.analyze( line, lineNumber );
            if ( ! result ) {
                continue; // Analyze with another lexer
            }

            // Detects a language node and tries to change the language
            if ( result.nodes.length > 0 && Keywords.LANGUAGE === result.nodes[ 0 ].keyword ) {
                let language = ( result.nodes[ 0 ] as Language ).content;
                if ( language != this._language ) { // needs to change ?
                    try {
                        this.changeLanguage( language );
                    } catch ( e ) {
                        this._errors.push( e );
                    }
                }
            }

            // Add the "nodes" array to "_nodes"
            this._nodes.push.apply( this._nodes, result.nodes );

            if ( result.errors ) {
                // Add the "errors" array to "_errors"
                this._errors.push.apply( this._errors, result.errors );
            }

            return true; // found a node in the line
        }

        return false;
    }
    
    /**
     * Tries to add an error message. Returns true if added.
     * 
     * @param message Error message to be added
     */
    public addErrorMessage( message: string ): boolean {
        if ( this.shouldStop() ) {
            return false;
        }        
        this._errors.push( new Error( message ) );
        return true;
    }

    /**
     * Change the current language iff the given language could be loaded.
     * 
     * @param language Language
     * @throws Error
     */
    private changeLanguage( language: string ): void {
        let dict = this._dictionaryLoader.load( language ); // throws Error
        for ( let lexer of this._lexers ) {
            if ( this.isAWordBasedLexer( lexer ) ) {
                let keyword = lexer.keyword();
                lexer.updateWords( dict[ keyword ] );
            }
        }
    }

    private isAWordBasedLexer( obj: any ): obj is KeywordBasedLexer {
        return ( < KeywordBasedLexer > obj ).updateWords !== undefined;
    }
}