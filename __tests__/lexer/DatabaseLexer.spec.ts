import { NodeTypes } from '../../modules/req/NodeTypes';
import { DatabaseLexer } from '../../modules/lexer/DatabaseLexer';

describe( 'DatabaseLexer', () => {

    // IMPORTANT: Since DatabaseLexer inherits from NamedNodeLexer and it does not add
    // behavior, the tests in NameNodeLexerTest already cover most important cases.

    let words = [ 'database' ];
    let lexer = new DatabaseLexer( words ); // under test

    it( 'detects correctly', () => {
        let r = lexer.analyze( 'Database: My DB', 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let n = r.nodes[ 0 ];
        expect( n.nodeType ).toBe( NodeTypes.DATABASE );
        expect( n.name ).toBe( 'My DB' );
    } );

    it( 'ignores a comment', () => {
        let r = lexer.analyze( 'Database: My DB#comment', 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let n = r.nodes[ 0 ];
        expect( n.name ).toBe( 'My DB' );
    } );

} );