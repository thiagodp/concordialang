/**
 * @author Thiago Delgado Pinto
 */
import { ListItemLexer } from '../../modules/lexer/ListItemLexer';
describe( 'ListItemLexerTest', () => {

    let myNodeType = 'myType';
    let lexer = new ListItemLexer( myNodeType ); // under test

    it( 'detects a node with some content', () => {
        let line = '- foo';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.content ).toBe( 'foo' );
        expect( node.location.column ).toBe( 1 );
        expect( node.location.line ).toBe( 1 );
    } );

    it( 'detects a node with some content, ignoring spaces and tabs', () => {
        let line = '\t  \t - foo \t   \t';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.content ).toBe( 'foo' );
        expect( node.location.column ).toBe( 6 );
    } );

    it( 'detects a node with some content, ignoring comments', () => {
        let line = '- foo#comment';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.content ).toBe( 'foo' );
    } );

    it( 'detects an error when an empty node is given', () => {
        let line = '- ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 1 );
        expect( r.errors[ 0 ].message ).toMatch( /(empty)/ui );
    } );

} );