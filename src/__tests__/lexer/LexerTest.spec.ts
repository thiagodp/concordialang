import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { Lexer } from "../../modules/lexer/Lexer";
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { NodeTypes } from "../../modules/req/NodeTypes";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LexerTest', () => {

    const enDictionary: KeywordDictionary = new EnglishKeywordDictionary();

    const ptDictionary: KeywordDictionary = {

        // Not available in Gherkin
        import: [ 'importe' ],
        regexBlock: [ 'expressões regulares' ],
        constantBlock: [ 'constantes' ],
        is: [ 'é' ],
        state: [ 'estado' ],
        testcase: [ 'caso de teste' ],
        
        // Also available in Gherkin

        language: [ 'language', 'idioma', 'língua' ],

        feature: [ 'funcionalidade', 'característica' ],
        scenario: [ 'cenário' ],

        stepGiven: [ 'dado' ],
        stepWhen: [ 'quando' ],
        stepThen: [ 'então' ],
        stepAnd: [ 'e', 'mas' ]
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
            expect( node.nodeType ).toBe( expectations[ index ] ) ); // same index as the expectation
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
            { l: '#language:en', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'import "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@important', e: NodeTypes.TAG },
            { l: 'feature: my feature', e: NodeTypes.FEATURE },
            { l: ' \t', e: null },
            { l: 'scenario: hello', e: NodeTypes.SCENARIO },
            { l: '  given something', e: NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes.STEP_AND },
            { l: '  when anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  then the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Test Case: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Given that I see the url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  When I fill "#username" with ""', e: NodeTypes.STEP_WHEN },
            { l: '    And I fill "#password" with "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '    And I click "Enter"', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Constants:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" is "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" is 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" is 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Regular Expressions:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "name" is "[A-Za-z]{2,60}"', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'this must be recognized as text', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );


    it( 'detects correctly in portuguese', () => {
        let lines = 
        [
            { l: '#language:pt', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes.TAG },
            { l: 'característica: my feature', e: NodeTypes.FEATURE },
            { l: ' \t', e: null },
            { l: 'cenário: hello', e: NodeTypes.SCENARIO },
            { l: '  dado something', e: NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Caso de Teste: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Dado que vejo a url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho "#username" com ""', e: NodeTypes.STEP_WHEN },
            { l: '  E preencho "#password" com "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '  E clico "Enter"', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Constantes:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" é "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" é 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" é 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Expressões Regulares:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "nome" é "[A-Za-z]{2,60}"', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'isso must be recognized as text', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );

} );