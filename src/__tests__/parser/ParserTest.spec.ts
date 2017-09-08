import { Lexer } from '../../modules/lexer/Lexer';
import { Parser } from '../../modules/parser/Parser';
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { Document } from '../../modules/ast/Document';
import { KeywordDictionaryLoader } from "../../modules/dict/KeywordDictionaryLoader";
import { InMemoryKeywordDictionaryLoader } from "../../modules/dict/InMemoryKeywordDictionaryLoader";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ParserTest', () => {

    const dictionary: KeywordDictionary = {
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

    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        { 'en': dictionary }
    );

    let lexer: Lexer = new Lexer( 'en', loader );

    let parser = new Parser();
    

    it( 'analyzes correctly 1', () => {

        [
            '#language:en',
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

        let nodes = lexer.nodes();
        let doc: Document = {};
        parser.analyze( nodes, doc );

        expect( parser.errors() ).toEqual( [] );

        expect( doc.language ).toBeDefined();
        expect( doc.language.content ).toBe( "en" );

        expect( doc.feature ).toBeDefined();
        expect( doc.feature.name ).toBe( "my feature" );

        expect( doc.feature.scenarios ).toBeDefined();
        expect( doc.feature.scenarios.length ).toBe( 1 );
        expect( doc.feature.scenarios[ 0 ].name ).toBe( "hello" );

        expect( doc.feature.testcases ).toBeDefined();
        expect( doc.feature.testcases.length ).toBe( 1 );
        expect( doc.feature.testcases[ 0 ].name ).toBe( "my test case" );
        expect( doc.feature.testcases[ 0 ].scenarioName ).toBe( "my scenario" );

    } );

} );