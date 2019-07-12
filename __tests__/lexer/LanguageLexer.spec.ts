import { NodeTypes } from '../../modules/req/NodeTypes';
import { LanguageLexer } from "../../modules/lexer/LanguageLexer";

describe( 'LanguageLexer', () => {

    let words = [ 'language', 'lang' ];
    let lexer = new LanguageLexer( words );

    let expectIsDetected = function isDetected( line ) {
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.nodeType ).toBe( NodeTypes.LANGUAGE );
        expect( node.value ).toBe( "pt-br" );
    };

    it( 'detects in a line', () => {
        expectIsDetected( '#language: pt-br' );
        expectIsDetected( '#language:pt-br' );
    } );

    it( 'detects separated by spaces and tabs', () => {
        expectIsDetected( '# \tlanguage \t: \tpt-br ' );
    } );

    it( 'does not detect when it is not in a line', () => {
        let line = '#foo: bar';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'does not detect when not followed by a colon', () => {
        let line = '#foo bar';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'detects a feature in the correct position', () => {
        let line = '#language: pt-br';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.LANGUAGE,
                location: { line: 1, column: 1 },
                value: "pt-br"
            }
        );
    } );

    it( 'detects in the correct position even with additional spaces or tabs', () => {
        let line = ' \t # \t language \t : \t pt-br \t';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.LANGUAGE,
                location: { line: 1, column: 4 },
                value: "pt-br"
            }
        );
    } );

} );