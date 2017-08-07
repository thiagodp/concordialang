import { Lexer } from "../../modules/req/lexer/Lexer";
import { KeywordDictionary } from "../../modules/req/KeywordDictionary";
import { Keywords } from "../../modules/req/Keywords";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LexerTest', () => {

    const dictionary: KeywordDictionary = {
        // Non-Gherkin keywords
        import: [ 'import' ],
        regex: [ 'regex' ],

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

    beforeEach( () => {
        lexer.reset();
    } );

    it( 'ignores empty lines', () => {
        expect( lexer.addNodeFromLine( '', 1 ) ).toBeFalsy();
    } );

    it( 'detects correctly 1', () => {
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
            'regex "my regex": /some regex/',
            '',
            'this must be recognized as text'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let nodes = lexer.nodes();
        expect( nodes.length ).toBe( 13 );

        let i = 0;
        expect( nodes[ i++ ].keyword ).toBe( Keywords.LANGUAGE );
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
        expect( nodes[ i++ ].keyword ).toBe( Keywords.REGEX );
        expect( nodes[ i++ ].keyword ).toBe( Keywords.TEXT );
    } );

} );