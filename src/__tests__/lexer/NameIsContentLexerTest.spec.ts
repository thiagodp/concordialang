import { TokenTypes } from '../../modules/req/TokenTypes';
import { NameIsContentLexer } from '../../modules/lexer/NameIsContentLexer';

describe( 'NameIsContentLexerTest', () => {

    let words = [ 'is' ];
    let keyword = TokenTypes.REGEX;
    let lexer = new NameIsContentLexer( words, keyword );

    it( 'recognizes correctly', () => {
        let line = '- "foo" is "bar" ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                keyword: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                content: "bar"
            }
        );
    } );

} );