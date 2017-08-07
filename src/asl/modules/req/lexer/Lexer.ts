import { Node } from '../ast/Node';
import { DocumentProcessor } from '../DocumentProcessor';
import { KeywordDictionary } from '../KeywordDictionary';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { LanguageLexer } from "./LanguageLexer";
import { TagLexer } from "./TagLexer";
import { ImportLexer } from './ImportLexer';
import { FeatureLexer } from './FeatureLexer';
import { ScenarioLexer } from './ScenarioLexer';
import { RegexLexer } from './RegexLexer';

/**
 * Lexer
 * 
 * @author Thiago Delgado Pinto
 */
export class Lexer {

    private _nodes: Array< Node >;
    private _errors: Array< Error >;
    private _lexers: Array< NodeLexer< Node > >;

    constructor( private _dictionary: KeywordDictionary, private _stopOnFirstError: boolean = false ) {
        this._lexers = [
            new LanguageLexer( _dictionary.language )
            , new TagLexer()
            , new ImportLexer( _dictionary.import )
            , new FeatureLexer( _dictionary.feature )
            , new ScenarioLexer( _dictionary.scenario )
            , new RegexLexer( _dictionary.regex )
        ];
        this.reset();
    }

    public reset() {
        this._nodes = [];
        this._errors = [];
    }

    public nodes(): Array< Node > {
        return this._nodes;
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
            if ( result ) {
                this._nodes.push( result.node );
                if ( result.errors ) {
                    // Add the "errors" array to "_errors"
                    this._errors.push.apply( this._errors, result.errors );
                }
                return true;
            }
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
}