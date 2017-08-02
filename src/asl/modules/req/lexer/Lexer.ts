import { Expressions } from '../Expressions';
import { KeywordDictionary } from '../KeywordDictionary';
import { Keywords } from '../Keywords';
import { Symbols } from './Symbols';
import { Token } from './Token';
import { TokenTypes } from './TokenTypes';

/**
 * Lexer
 * 
 * @author Thiago Delgado Pinto
 */
 export class Lexer {

     private _language: string = 'en';
     private _lines: string[] = [];
     private _linesCount: number = -1;     
     private _line: string = ''; // current line
     private _lineNumber: number = -1;     
     private _trimmedLine: string = '';
     private _eoc: boolean = false; // end of content

     private _inPyString: boolean = false;
     private _pyStringSwallow: number = 0;
     private _featureStarted: boolean = false;
     private _allowMultilineArguments: boolean = false;
     private _allowSteps: boolean = false;     

     private _keywordDictionary: KeywordDictionary;
     private _keywordsCache: Object; // map

     private _tokenAnalyzers: Array< () => Token > = []; // functions that analyze tokens
     private _deferredTokens: Token[] = [];
     private _stashedToken: Token = null;

    constructor( dictionary: KeywordDictionary ) {
        this._keywordDictionary = dictionary;

        this._tokenAnalyzers = [
            this.deferredToken,
            this.scanEOC,
            this.scanLanguage,
            this.scanComment,
            this.scanPyStringOp,
            this.scanPyStringContent,
            this.scanStep,
            this.scanScenario,
            this.scanBackground,
            this.scanOutline,
            this.scanExamples,
            this.scanFeature,
            this.scanTags,
            this.scanTableRow,
            this.scanNewline,
            this.scanText
        ];
    }

    /**
     * Sets lexer input.
     * 
     * @param input Input string
     * @param language Language code
     */
    public analyze( input: string, language = 'en' ) {

        this._language = language;
        // Replace Windows and Mac EOL by Unix EOL, then split the input into lines
        this._lines = input
            .replace( "\r\n", "\n" )
            .replace( "\r", "\n" )
            .split( "\n" )
            ;
        this._linesCount = this._lines.length;
        this._line = this._lines[ 0 ];
        this._lineNumber = 1;
        this._trimmedLine = null;
        this._eoc = false;

        this._deferredTokens = [];
        this._stashedToken = null;

        this._inPyString = false;
        this._pyStringSwallow = 0;
        this._featureStarted = false;
        this._allowMultilineArguments = false;
        this._allowSteps = false;

        this._keywordsCache = {};
    }

    /**
     * Returns the current lexer language.
     */
    public language(): string {
        return this._language;
    }

    /**
     * Returns the next token or the previously stashed one.
     */
    public advancedToken(): Token {
        let stashed = this.stashedToken();
        return stashed ? stashed : this.nextToken();
    }

    /**
     * Returns stashed token or null if hasn't.
     */
    public stashedToken(): Token {
        let stashed: Token = this._stashedToken;
        this._stashedToken = null;
        return stashed;
    }

    /**
     * Returns next token from input.
     */
    public nextToken(): Token | null {
        let token: Token;
        for ( let a of this._tokenAnalyzers ) {
            token = a.call( this );
            if ( token ) {
                return token;
            }
        }
        return null;
    }

    /**
     * Returns deferred token or null if hasn't.
     */
    public deferredToken(): Token | null {
        // removes the first object and returns it
        let removed = this._deferredTokens.shift();
        return removed ? removed : null;
    }

    /**
     * Defers a token.
     * 
     * @param token Token
     */
    public deferToken( token: Token ): void {
        token.deferred = true;
        this._deferredTokens.push( token );
    }    

    /**
     * Predicts for number of tokens.
     */
    public predictToken(): Token | null {
        if ( null === this._stashedToken ) {
            this._stashedToken = this.nextToken();
        }
        return this._stashedToken;
    }


    /**
     * Scans EOC from input & returns it if found.
     */
    protected scanEOC(): Token | null {
        if ( ! this._eoc ) {
            return null;
        }
        return this.makeToken( TokenTypes.EOC );
    }

    /**
     * Scans Language specifier from input & returns it if found.
     */
    protected scanLanguage(): Token | null {
        if ( this._featureStarted
            || this._inPyString
            || ! this.lineStartsWith( Symbols.LANGUAGE_PREFIX ) ) {
            return null;
        }

        // e.g. "language|lang"
        let keywords: string = this._keywordDictionary.language.join( '|' );

        let regex = Expressions.SPACES_OR_TABS + Expressions.escape( Symbols.LANGUAGE_PREFIX )
            + Expressions.SPACES_OR_TABS + '(' + keywords + ')'
            + Expressions.SPACES_OR_TABS + Expressions.escape( Symbols.LANGUAGE_SEPARATOR ) + Expressions.SPACES_OR_TABS
            + '[A-Za-z]{2}(?:(?:\-|\_)[A-Za-z]{2})?' + Expressions.SPACES_OR_TABS + '$';

        return this.scanInput( new RegExp( regex, 'ui' ), Keywords.LANGUAGE );
    }

    /**
     * Scans Comment from input & returns it if found.
     */
    protected scanComment(): Token | null {
        if ( this._inPyString
            || ! this.lineStartsWith( Symbols.COMMENT_PREFIX ) ) {
            return null;
        }
        
        let token = this.makeToken( TokenTypes.COMMENT, this.trimmedLine() );
        this.consumeLine();
        return token ? token : null;
    }

    /**
     * Scans PyString from input & returns it if found.
     */
    protected scanPyStringOp(): Token | null {
        if ( ! this._allowMultilineArguments
            || ! this.lineStartsWith( Symbols.PY_STRING_PREFIX ) ) {
            return null;
        }
        
        this._inPyString = ! this._inPyString;
        this._pyStringSwallow = this.line().indexOf( Symbols.PY_STRING_PREFIX );

        let token = this.makeToken( TokenTypes.PY_STRING_OP );        
        this.consumeLine();
        return token;
    }

    /**
     * Scans PyString content.
     */
    protected scanPyStringContent(): Token | null {
        if ( ! this._inPyString ) {
            return null;
        }
        let token = this.scanText();
        // Swallow trailing spaces
        token.value = token.value.replace( 
            new RegExp( '^\s{0,' + this._pyStringSwallow + '}', 'u' ),
            '' );

        return token;
    }

    /**
     * Scans Step from input & returns it if found.
     */
    protected scanStep(): Token | null {
        /* by TDP
        if ( ! this._allowSteps ) {
            return null;
        }
        */
        let keywords = this._keywordDictionary.step.join( '|' );
        let regex = new RegExp(
            Expressions.SPACES_OR_TABS + '(' + keywords + ')'
                + Expressions.SPACES_OR_TABS + Expressions.ANYTHING
            , 'ui' );

        let result = regex.exec( this.line() );
        if ( ! result ) {
            return null;
        }

        let keyword = result[ 1 ].trim();
        let token = this.makeToken( TokenTypes.STEP, keyword );
        token.keywordType = this.stepKeywordType( keyword );
        token.text = result[ 2 ];

        this.consumeLine();
        this._allowMultilineArguments = true;

        return token;
    }

    /**
     * Scans Scenario from input & returns it if found.
     */    
    protected scanScenario(): Token | null {
        return this.scanInputForKeywords(
            this._keywordDictionary.scenario,
            Symbols.TITLE_SEPARATOR,
            TokenTypes.SCENARIO
        );
    }

    /**
     * Scans Background from input & returns it if found.
     */    
    protected scanBackground(): Token | null {
        return this.scanInputForKeywords(
            this._keywordDictionary.background,
            Symbols.TITLE_SEPARATOR,
            TokenTypes.BACKGROUND
        );
    }

    /**
     * Scans Outline from input & returns it if found.
     */    
    protected scanOutline(): Token | null {
        return this.scanInputForKeywords(
            this._keywordDictionary.outline,
            Symbols.TITLE_SEPARATOR,
            TokenTypes.OUTLINE
        );
    }

    /**
     * Scans Examples from input & returns it if found.
     */    
    protected scanExamples(): Token | null {
        return this.scanInputForKeywords(
            this._keywordDictionary.examples,
            Symbols.TITLE_SEPARATOR,
            TokenTypes.EXAMPLES
        );
    }

    /**
     * Scans Feature from input & returns it if found.
     */    
    protected scanFeature(): Token | null {
        return this.scanInputForKeywords(
            this._keywordDictionary.feature,
            Symbols.TITLE_SEPARATOR,
            TokenTypes.FEATURE
        );
    }

    /**
     * Scans Tags from input & returns it if found.
     */
    protected scanTags(): Token | null {

        let trimmedLine = this.trimmedLine();
        if ( trimmedLine.length <= 1 || Symbols.TAG_PREFIX != trimmedLine.charAt( 0 ) ) {
            return null;
        }

        let token = this.makeToken( TokenTypes.TAG );
        // Detects all the tags in the line and trims their content
        token.tags = trimmedLine.split( Symbols.TAG_PREFIX ).map( ( val ) => val.trim() );

        this.consumeLine();

        return token;
    }

    /**
     * Scans TableRow from input & returns it if found.
     */    
    protected scanTableRow(): Token | null {

        if ( ! this._allowMultilineArguments ) {
            return null;    
        }

        let trimmedLine = this.trimmedLine();
        if ( trimmedLine.length <= 1 || Symbols.TABLE_PREFIX != trimmedLine.charAt( 0 ) ) {
            return null;
        }

        let token = this.makeToken( TokenTypes.TABLE_ROW );
        let lastSeparator = trimmedLine.lastIndexOf( Symbols.TABLE_PREFIX );
        // Ignores the first and the last separator to retrieve the columns.
        // Retrieved values are trimmed.
        token.columns = trimmedLine.substring( 1, lastSeparator - 1 )
            .split( Symbols.TABLE_CELL_SEPARATOR )
            .map( ( val ) => val.trim() );

        this.consumeLine();

        return token;
    }

    /**
     * Scans Newline from input & returns it if found.
     */
    protected scanNewline(): Token | null {
        if ( 0 !== this.trimmedLine().length ) {
            return null;
        }
        let token = this.makeToken( TokenTypes.NEW_LINE, this.line().length );
        this.consumeLine();
        return token;
    }

    /**
     * Scans text from input & returns it if found.
     */
    protected scanText(): Token | null {
        let token = this.makeToken( TokenTypes.TEXT, this.line() );
        this.consumeLine();
        return token;
    }
   


    /**
     * Constructs token with specified parameters.
     * 
     * @param type Token type
     * @param value Token value
     */
    protected makeToken( type: string, value = null ): Token {
        return {
            type: type,
            value: value,
            line: this._lineNumber,
            deferred: false
        };
    }

    /**
     * Returns true if the current line starts with the given content.
     * The comparison is case insensitive.
     * 
     * @param content Content to evaluate.
     */
    protected lineStartsWith( content: string ): boolean {
        
        return this.trimmedLine().toLowerCase().startsWith( content.toLowerCase() );
    }

    /**
     * Returns trimmed version of line.
     */
    protected trimmedLine(): string {
        if ( ! this._trimmedLine ) {
            this._trimmedLine = this.line().trim();
        }
        return this._trimmedLine;
    }

    /**
     * Returns current line.
     */    
    protected line(): string {
        return this._line || '';
    }

    /**
     * Scans for token with specified regex.
     * 
     * @param regex Regular expression
     * @param tokenType Token type
     * @param matchGroupIndex Index used to get the result. Optional. Defaults to 0.
     */
    protected scanInput( regex: RegExp, tokenType: string, matchGroupIndex = 0 ): Token | null {
        let result = regex.exec( this._line );
        if ( ! result ) {
            return null;
        }
        let token = this.makeToken( tokenType, result[ matchGroupIndex ] );
        this.consumeLine();
        return token ? token : null;
    }

    /**
     * Consumes line from input & increments line counter.
     */
    protected consumeLine() {
        ++this._lineNumber;

        if ( ( this._lineNumber - 1 ) === this._linesCount ) {
            this._eoc = true;
            return;
        }

        this._line = this._lines[ this._lineNumber - 1 ];
        this._trimmedLine = null;
    }

    /**
     * Returns step type keyword (Given, When, Then, etc.).
     * 
     * @param keyword Step keyword in provided language
     */
    protected stepKeywordType( keyword: string ): string {

        // Consider "*" as a AND keyword so that it is normalized to the previous step type
        if ( Keywords.STEP_AND_GENERIC === keyword ) {
            return Keywords.STEP_AND;
        }

        // Search in the dictionary
        if ( this._keywordDictionary.stepGiven.includes( keyword ) ) {
            return Keywords.STEP_GIVEN;
        }
        if ( this._keywordDictionary.stepWhen.includes( keyword ) ) {
            return Keywords.STEP_WHEN;
        }
        if ( this._keywordDictionary.stepThen.includes( keyword ) ) {
            return Keywords.STEP_THEN;
        }
        if ( this._keywordDictionary.stepAnd.includes( keyword ) ) {
            return Keywords.STEP_AND;
        }
        if ( this._keywordDictionary.stepBut.includes( keyword ) ) {
            return Keywords.STEP_BUT;
        }        

        return Keywords.STEP_GIVEN;
    }

    /**
     * Scans for token with specified keywords.
     * 
     * @param keywords Array of keywords.
     * @param tokenType Expected token type.
     */
    protected scanInputForKeywords( keywords: string[], separator: string, tokenType: string ): Token | null {

        let regex = Expressions.SPACES_OR_TABS + '(' + keywords.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS + Expressions.escape( separator )
            + Expressions.SPACES_OR_TABS + '(' + Expressions.ANYTHING + ')'
            ;
        let result = new RegExp( regex, 'ui' ).exec( this.line() );
        if ( ! result ) {
            return null;
        }

        let token = this.makeToken( tokenType, result[ 3 ] );
        token.keyword = result[ 2 ];
        token.ident = result[ 1 ].length;

        this.consumeLine();

        // Turn off language searching
        if ( TokenTypes.FEATURE === tokenType ) {
            this._featureStarted = true;
        }

        // Turn off PyString and Table searching
        if ( TokenTypes.FEATURE === tokenType
            || TokenTypes.SCENARIO === tokenType
            || TokenTypes.OUTLINE === tokenType ) {
            
            this._allowMultilineArguments = false;
        } else if ( TokenTypes.EXAMPLES === tokenType ) {
            this._allowMultilineArguments = true;
        }

        //console.log( 'Token type:' + tokenType );

        // Turn on steps searching
        if ( TokenTypes.FEATURE === tokenType
            || TokenTypes.BACKGROUND === tokenType
            || TokenTypes.OUTLINE === tokenType
            || TokenTypes.SCENARIO === tokenType // by TDP
        ) {
            this._allowSteps = true;
        }        

        return token;
    }

 }