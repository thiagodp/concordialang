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
            '',
            'regex "my regex": /some regex/'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let nodes = lexer.nodes();
        expect( nodes.length ).toBe( 5 );

        expect( nodes[ 0 ].keyword ).toBe( Keywords.LANGUAGE );
        expect( nodes[ 1 ].keyword ).toBe( Keywords.TAG );
        expect( nodes[ 2 ].keyword ).toBe( Keywords.FEATURE );
        expect( nodes[ 3 ].keyword ).toBe( Keywords.SCENARIO );
        expect( nodes[ 4 ].keyword ).toBe( Keywords.REGEX );
    } );

} );