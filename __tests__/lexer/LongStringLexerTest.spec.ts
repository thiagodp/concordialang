import { Location } from 'concordialang-types';
import { LongStringLexer } from "../../modules/lexer/LongStringLexer";
import { NodeTypes } from "../../modules/req/NodeTypes";

describe( 'LongStringLexerTest', () => {

    let lexer = new LongStringLexer();
    const longString: string = '"""';

    it( 'detects in a line with just the long string', () => {
        const r = lexer.analyze( longString, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.LONG_STRING );
        expect( r.nodes[ 0 ].location ).toEqual( { column: 1, line: 1 } as Location );
    } );

    it( 'detects in a line with a long string and right spaces', () => {
        const r = lexer.analyze( longString + '     ', 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.LONG_STRING );
        expect( r.nodes[ 0 ].location ).toEqual( { column: 1, line: 1 } as Location );
    } );

    it( 'does not detect in a line with left spaces', () => {
        const r = lexer.analyze( '     ' + longString, 1 );
        expect( r ).toBeNull();
    } );

    it( 'does not detect in a line with non-comment characters at the right', () => {
        const r = lexer.analyze( longString + ' hello', 1 );
        expect( r ).toBeNull();
    } );

    it( 'detects in a line with a long string and characters after a comment', () => {
        const r = lexer.analyze( longString + '# hello', 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        expect( r.nodes[ 0 ].nodeType ).toBe( NodeTypes.LONG_STRING );
        expect( r.nodes[ 0 ].location ).toEqual( { column: 1, line: 1 } as Location );
    } );

} );