import { KeywordDictionary } from '../../modules/req/KeywordDictionary';
import { Lexer } from '../../modules/req/alt-lexer/Lexer';
import { Token } from "../../modules/req/alt-lexer/Token";
import { TokenTypes } from "../../modules/req/alt-lexer/TokenTypes";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'Lexer Test', () => {

    let dictionary: KeywordDictionary = {
        // Non-Gherkin keywords
        import: [ 'import' ],
        // Gherkin keywords
        background: [ 'background' ],
        examples: [ 'examples' ],
        feature: [ 'feature' ],
        language: [ 'language' ],
        outline: [ 'outline' ],
        scenario: [ 'scenario' ],
        step: [ 'given', 'when', 'then', 'and', 'but' ],
        stepAnd: [ 'and' ],
        stepBut: [ 'but' ],
        stepGiven: [ 'given' ],
        stepThen: [ 'then' ],
        stepWhen: [ 'when' ]
    };

    let lexer: Lexer = new Lexer( dictionary );

    // Helper functions

    let shouldDetectTokenType = function (
            text: string,
            tokenType: string,
            consumeFirstToken = false
        ): void {
        lexer.analyze( text );
        let token: Token = lexer.nextToken();
        if ( consumeFirstToken ) {
            token = lexer.nextToken();
        }
        expect( token ).not.toBeNull();
        expect( token.type ).toBe( tokenType );        
    };

    let text = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.TEXT );
    };    

    let feature = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.FEATURE );
    };

    let scenario = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.SCENARIO );
    };

    let language = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.LANGUAGE );
    };
    
    let step = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.STEP );
    };

    let tag = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.TAG );
    };

    let table = function ( text: string ): void {
        shouldDetectTokenType( text, TokenTypes.TABLE_ROW, true );
    };     

    // Feature tests

    it( 'detects feature in a case insensitive way', () => {
        feature( "Feature: Some name 1" );
        feature( "feature: Some name 1" );
    } );

    it( 'detects feature with spaces or tabs', () => {
        feature( " feature : Some name  1" );
        feature( "\tfeature\t: Some name 1\t" );
    } );    

    it( 'should not detect a feature without a title', () => {
        text( "feature: " );
    } );

    // Scenario tests

    it( 'detects scenario in a case insensitive way', () => {
        scenario( "Scenario: Some name 1" );
        scenario( "scenario: Some name 1" );
    } );

    it( 'detects scenario with spaces or tabs', () => {
        scenario( " scenario : Some name  1" );
        scenario( "\tscenario\t:\tSome name 1\t" );
    } );

    it( 'should not detect a scenario without a title', () => {
        text( "scenario: " );
    } );

    // Language tests

    it( 'detects language in a case insensitive way', () => {
        language( "#language:pt-br" );
        language( "#Language:pt-br" );
    } );

    it( 'detects language with spaces or tabs', () => {
        language( " #language : pt-br " );
        language( "\t#language\t:\tpt-br\t" );        
    } );

    it( 'detects language separated from its prefix', () => {
        language( "# language:pt-br" );
    } );

    it( 'should not detect language without a value', () => {
        // it should be recognized as a text
        text( "# language: " );
    } );

    // Steps

    it( 'detects "given"', () => {
        step( "Given that I can see the main screen" );
    } );

    it( 'detects "when"', () => {
        step( "When something occours" );
    } );

    it( 'detects "then"', () => {
        step( "Then something happens" );
    } );

    it( 'detects "and"', () => {
        step( "And other thing happens" );
    } );

    it( 'detects "but"', () => {
        step( "But another thing also happens" );
    } );

    // Tags

    it( 'detects tags', () => {
        tag( "@important" );
    } );

    // Tables

    it( 'detects table after a step', () => {
        table( "Given something\n|one| two | three|" );
    } );    

} );