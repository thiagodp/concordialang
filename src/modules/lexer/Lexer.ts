import { DatabasePropertyLexer } from './DatabasePropertyLexer';
import { DatabaseLexer } from './DatabaseLexer';
import { UIPropertyLexer } from './UIPropertyLexer';
import { UIElementLexer } from './UIElementLexer';
import { ConstantBlock } from '../ast/ConstantBlock';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { KeywordDictionaryLoader } from '../dict/KeywordDictionaryLoader';
import { Language } from '../ast/Language';
import { NodeTypes } from '../req/NodeTypes';
import { TestCaseLexer } from './TestCaseLexer';
import { Node } from '../ast/Node';
import { DocumentProcessor } from '../req/DocumentProcessor';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { LanguageLexer } from "./LanguageLexer";
import { TagLexer } from "./TagLexer";
import { ImportLexer } from './ImportLexer';
import { FeatureLexer } from './FeatureLexer';
import { ScenarioLexer } from './ScenarioLexer';
import { StepGivenLexer } from "./StepGivenLexer";
import { StepWhenLexer } from "./StepWhenLexer";
import { StepThenLexer } from "./StepThenLexer";
import { StepAndLexer } from "./StepAndLexer";
import { StepOtherwiseLexer } from './StepOtherwiseLexer';
import { TextLexer } from "./TextLexer";
import { StateLexer } from "./StateLexer";
import { RegexBlockLexer } from './RegexBlockLexer';
import { RegexLexer } from './RegexLexer';
import { ConstantBlockLexer } from './ConstantBlockLexer';
import { ConstantLexer } from './ConstantLexer';
import { KeywordDictionary } from '../dict/KeywordDictionary';
import { TableLexer } from './TableLexer';
import { TableRowLexer } from './TableRowLexer';

/**
 * Lexer
 * 
 * @author Thiago Delgado Pinto
 */
export class Lexer {

    private _nodes: Node[] = [];
    private _errors: Error[] = [];
    private _lexers: Array< NodeLexer< Node > > = [];

    /**
     * Constructs the lexer.
     * 
     * @param _defaultLanguage Default language (e.g.: "en")
     * @param _dictionaryLoader Keyword dictionary loader.
     * @param _stopOnFirstError True for stopping on the first error found.
     * 
     * @throws Error if the given default language could not be found.
     */
    constructor(
        private _defaultLanguage: string,
        private _dictionaryLoader: KeywordDictionaryLoader,
        private _stopOnFirstError: boolean = false,
    ) {
        let dictionary = _dictionaryLoader.load( _defaultLanguage ); // may throw
        if ( ! dictionary ) {
            throw new Error( 'Cannot load a dictionary for the language: ' + _defaultLanguage );
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
            , new StepOtherwiseLexer( dictionary.stepOtherwise )
            , new TestCaseLexer( dictionary.testcase )
            , new ConstantBlockLexer( dictionary.constantBlock )
            , new ConstantLexer( dictionary.is ) // "name" is "value"
            , new RegexBlockLexer( dictionary.regexBlock )
            , new RegexLexer( dictionary.is ) // "name" is "value"
            , new StateLexer( dictionary.state )
            , new TableLexer( dictionary.table )
            , new TableRowLexer()            
            , new UIElementLexer( dictionary.uiElement )
            , new UIPropertyLexer()
            , new DatabaseLexer( dictionary.database )
            , new DatabasePropertyLexer()
            , new TextLexer() // captures any non-empty
        ];
    }

    public defaultLanguage(): string {
        return this._defaultLanguage;
    }

    public reset() {
        this._nodes = [];
        this._errors = [];
        // Also resets language to the defined default
        this.changeLanguage( this.defaultLanguage() );
    }

    public nodes(): Node[] {
        return this._nodes;
    }

    public hasErrors(): boolean {
        return this._errors.length > 0;
    }

    public errors(): Error[] {
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
            if ( result.nodes.length > 0 && NodeTypes.LANGUAGE === result.nodes[ 0 ].nodeType ) {
                let language = ( result.nodes[ 0 ] as Language ).value;
                if ( language != this._defaultLanguage ) { // needs to change ?
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
     * Change the language (of the internal lexers) iff it could be loaded.
     * This will *not* change the default lexer language.
     * 
     * @param language Language
     * @return The loaded keyword dictionary.
     * @throws Error In case of the language is not available.
     */
    public changeLanguage( language: string ): KeywordDictionary {
        let dict = this._dictionaryLoader.load( language ); // throws Error
        for ( let lexer of this._lexers ) {
            if ( this.isAWordBasedLexer( lexer ) ) {
                let nodeType = lexer.affectedKeyword();
                let words = dict[ nodeType ];
                if ( words ) {
                    lexer.updateWords( words );
                }
            }
        }
        return dict;
    }

    private isAWordBasedLexer( obj: any ): obj is KeywordBasedLexer {
        return ( < KeywordBasedLexer > obj ).updateWords !== undefined;
    }
}