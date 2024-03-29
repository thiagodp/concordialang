import { RegexLexer } from "../../modules/lexer/RegexLexer";
import { NodeTypes } from "../../modules/req/NodeTypes";

describe( 'RegexLexer', () => {

    let words = [ 'is' ];
    let keyword = NodeTypes.REGEX;
    let lexer = new RegexLexer( words ); // under test

    // IMPORTANT: Since the lexer under test inherits from another lexer and
    // there are tests for the parent class, few additional tests are necessary.

    it( 'detects correctly with a text value', () => {
        let value = '/[0-9]/';
        let line = `- "foo" is "${value}"`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                content: `"foo" is "${value}"`,
                name: "foo",
                value: value
            }
        );
    } );

    it( 'detects correctly even with the regular expression has quotes', () => {
        let line = `- "foo" is "\\"bar"`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                content: '"foo" is "\\"bar"',
                name: "foo",
                value: '\\"bar'
            }
        );
    } );

    it( 'ignores a comment after the value', () => {
        let line = '- "foo" is "bar"#comment';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                content: '"foo" is "bar"',
                name: "foo",
                value: "bar"
            }
        );
    } );

} );