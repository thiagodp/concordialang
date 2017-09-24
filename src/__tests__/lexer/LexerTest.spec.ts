import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { Lexer } from "../../modules/lexer/Lexer";
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { Keywords } from "../../modules/req/Keywords";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LexerTest', () => {

    const enDictionary: KeywordDictionary = new EnglishKeywordDictionary();

    const ptDictionary: KeywordDictionary = {
        // Non-Gherkin keywords
        import: [ 'importe' ],
        regex: [ 'expressão' ],
        state: [ 'estado' ],
        testcase: [ 'caso de teste' ],

        // Gherkin keywords
        background: [ 'background' ],
        examples: [ 'examplos' ],
        feature: [ 'funcionalidade', 'característica' ],
        language: [ 'language', 'idioma', 'língua' ],
        outline: [ 'esboço' ],
        scenario: [ 'cenário' ],
        stepGiven: [ 'dado' ],
        stepWhen: [ 'quando' ],
        stepThen: [ 'então' ],
        stepAnd: [ 'e', 'mas' ],
    };    

    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        {
            'en': enDictionary,
            'pt': ptDictionary
        }
    );

    let lexer: Lexer = new Lexer( 'en', loader ); // under test

    // Helper function
    function assertLineExpectations( lines: any[] ) {
        lines.forEach( ( val, index ) => lexer.addNodeFromLine( val.l, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let expectations = lines
            .filter( val => val.e !== null ) // only the defined expectations
            .map( val => val.e ); // return the expectations

        lexer.nodes().forEach( ( node, index ) =>
            expect( node.keyword ).toBe( expectations[ index ] ) ); // same index as the expectation
    }


    beforeEach( () => {
        lexer.reset();
    } );

    it( 'ignores empty lines', () => {
        expect( lexer.addNodeFromLine( '', 1 ) ).toBeFalsy();
    } );

    it( 'detects correctly in english', () => {
        let lines = 
        [
            { l: '#language:en', e: Keywords.LANGUAGE },
            { l: '', e: null },
            { l: 'import "somefile"', e: Keywords.IMPORT },
            { l: '', e: null },
            { l: '@important', e: Keywords.TAG },
            { l: 'feature: my feature', e: Keywords.FEATURE },
            { l: ' \t', e: null },
            { l: 'scenario: hello', e: Keywords.SCENARIO },
            { l: '  given something', e: Keywords.STEP_GIVEN },
            { l: '    and another thing', e: Keywords.STEP_AND },
            { l: '  when anything happens', e: Keywords.STEP_WHEN },
            { l: '    and other thing happens', e: Keywords.STEP_AND },
            { l: '    but other thing does not happen', e: Keywords.STEP_AND },
            { l: '  then the result is anything', e: Keywords.STEP_THEN },
            { l: '    and another result could also happen', e: Keywords.STEP_AND },
            { l: '', e: null },
            { l: 'Test Case: my test case', e: Keywords.TEST_CASE },
            { l: '  Given that I see the url "/login"', e: Keywords.STEP_GIVEN },
            { l: '  When I fill "#username" with ""', e: Keywords.STEP_WHEN },
            { l: '    And I fill "#password" with "bobp4ss"', e: Keywords.STEP_AND },
            { l: '    And I click "Enter"', e: Keywords.STEP_AND },
            { l: '', e: null },
            { l: 'Regex "my regex": /some regex/', e: Keywords.REGEX },
            { l: '', e: null },
            { l: 'this must be recognized as text', e: Keywords.TEXT }
        ];

        assertLineExpectations( lines );
    } );


    it( 'detects correctly in portuguese', () => {
        let lines = 
        [
            { l: '#language:pt', e: Keywords.LANGUAGE },
            { l: '', e: null },
            { l: 'importe "somefile"', e: Keywords.IMPORT },
            { l: '', e: null },
            { l: '@importante', e: Keywords.TAG },
            { l: 'característica: my feature', e: Keywords.FEATURE },
            { l: ' \t', e: null },
            { l: 'cenário: hello', e: Keywords.SCENARIO },
            { l: '  dado something', e: Keywords.STEP_GIVEN },
            { l: '    e another thing', e: Keywords.STEP_AND },
            { l: '  quando anything happens', e: Keywords.STEP_WHEN },
            { l: '    e other thing happens', e: Keywords.STEP_AND },
            { l: '    mas other thing does not happen', e: Keywords.STEP_AND },
            { l: '  então the result is anything', e: Keywords.STEP_THEN },
            { l: '    e another result could also happen', e: Keywords.STEP_AND },
            { l: '', e: null },
            { l: 'Caso de Teste: my test case', e: Keywords.TEST_CASE },
            { l: '  Dado que vejo a url "/login"', e: Keywords.STEP_GIVEN },
            { l: '  Quando preencho "#username" com ""', e: Keywords.STEP_WHEN },
            { l: '  E preencho "#password" com "bobp4ss"', e: Keywords.STEP_AND },
            { l: '  E clico "Enter"', e: Keywords.STEP_AND },
            { l: '', e: null },
            { l: 'expressão "my regex": /some regex/', e: Keywords.REGEX },
            { l: '', e: null },
            { l: 'isso must be recognized as text', e: Keywords.TEXT }
        ];

        assertLineExpectations( lines );
    } );

} );