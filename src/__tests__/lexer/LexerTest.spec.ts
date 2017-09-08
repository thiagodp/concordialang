import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { Lexer } from "../../modules/lexer/Lexer";
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { Keywords } from "../../modules/req/Keywords";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LexerTest', () => {

    const enDictionary: KeywordDictionary = {
        // Non-Gherkin keywords
        import: [ 'import' ],
        regex: [ 'regex' ],
        testcase: [ 'test case' ],

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

    const ptDictionary: KeywordDictionary = {
        // Non-Gherkin keywords
        import: [ 'importe' ],
        regex: [ 'expressão' ],
        testcase: [ 'caso de teste' ],

        // Gherkin keywords
        background: [ 'background' ],
        examples: [ 'examplos' ],
        feature: [ 'funcionalidade', 'característica' ],
        language: [ 'language', 'idioma', 'língua' ],
        outline: [ 'esboço' ],
        scenario: [ 'cenário' ],
        step: [ 'dado', 'quando', 'então', 'e', 'mas' ],
        stepAnd: [ 'e' ],
        stepBut: [ 'mas' ],
        stepGiven: [ 'dado' ],
        stepThen: [ 'então' ],
        stepWhen: [ 'quando' ]
    };    

    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        {
            'en': enDictionary,
            'pt': ptDictionary
        }
    );

    let lexer: Lexer = new Lexer( 'en', loader );

    beforeEach( () => {
        lexer.reset();
    } );

    it( 'ignores empty lines', () => {
        expect( lexer.addNodeFromLine( '', 1 ) ).toBeFalsy();
    } );

    it( 'detects correctly in english', () => {
        [
            '#language:en',
            '',
            'import "somefile.ext"',
            '',                        
            '@important',
            'feature: my feature',
            ' \t',
            'scenario: hello',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
            '  then the result is anything',
            '    and another result could also happen',
            '',
            'test case for "my scenario": my test case',
            '  given that I can see the screen "home"',
            '  when I click on "Price" ',
            '  then I see "Our Plans"',
            '',            
            'regex "my regex": /some regex/',
            '',
            'this must be recognized as text'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let nodes = lexer.nodes();
        expect( nodes.length ).toBe( 18 );

        let i = 0;
        expect( nodes[ i++ ].keyword ).toBe( Keywords.LANGUAGE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.IMPORT );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TAG );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.FEATURE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.SCENARIO );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_GIVEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_WHEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_BUT );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_THEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TEST_CASE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_GIVEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_WHEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_THEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.REGEX );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TEXT );
    } );


    it( 'detects correctly in portuguese', () => {
        [
            '#language:pt',
            '',
            'importe "somefile"',
            '',
            '@importante',
            'característica: my feature',
            ' \t',
            'cenário: hello',
            '  dado something',
            '    e another thing',
            '  quando anything happens',
            '    e other thing happens',
            '    mas other thing does not happen',
            '  então the result is anything',
            '    e another result could also happen',
            '',
            'caso de teste for "my scenario": my test case',
            '  dado that I can see the screen "home"',
            '  quando I click on "Price" ',
            '  então I see "Our Plans"',
            '',            
            'expressão "my regex": /some regex/',
            '',
            'isso must be recognized as text'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let nodes = lexer.nodes();
        expect( nodes.length ).toBe( 18 );

        let i = 0;
        expect( nodes[ i++ ].keyword ).toBe( Keywords.LANGUAGE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.IMPORT );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TAG );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.FEATURE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.SCENARIO );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_GIVEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_WHEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_BUT );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_THEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_AND );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TEST_CASE );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_GIVEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_WHEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.STEP_THEN );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.REGEX );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TEXT );
    } );    

} );