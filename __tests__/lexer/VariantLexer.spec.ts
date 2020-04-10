import { VariantLexer } from "../../modules/lexer/VariantLexer";
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'VariantLexer', () => {

    // IMPORTANT: This lexer inherits from NamedNodeLexerTest and
    // since it does not add behavior, few additional tests are necessary.

    let word = 'variant';
    let words = [ word ];

    let lexer = new VariantLexer( words ); // under test

    it( 'detects in a line', () => {
        let line = word + ': foo bar';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.VARIANT );
        expect( r.nodes[ 0 ].name ).toBe( 'foo bar' );
    } );

    it( 'ignores comments', () => {
        let line = word + ': foo bar#comment here';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.VARIANT );
        expect( r.nodes[ 0 ].name ).toBe( 'foo bar' );
    } );


    it( 'detects with a number', () => {
        let line = word + '1: foo bar';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.VARIANT );
        expect( r.nodes[ 0 ].name ).toBe( 'foo bar' );
    } );

} );