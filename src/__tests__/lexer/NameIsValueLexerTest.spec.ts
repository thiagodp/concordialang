import { NodeTypes } from '../../modules/req/NodeTypes';
import { NameIsValueLexer } from '../../modules/lexer/NameIsValueLexer';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NameIsValueLexerTest', () => {

    let words = [ 'is' ];
    let keyword = NodeTypes.REGEX;
    let lexer = new NameIsValueLexer( words, keyword, keyword ); // under test

    it( 'detects correctly with a name and a value', () => {
        let line = '- "foo" is "bar"';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "bar"
            }
        );
    } );

    it( 'detects correctly even with tabs', () => {
        let line = '\t\t-\t"foo"\tis\t"bar"\t';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
    } );

    it( 'detects correctly even with additional spaces or tabs', () => {
        let line = '\t \t-\t "foo" \t is \t "bar" \t ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
    } );    

    it( 'detects correctly even if the word between the name and the value has no spaces around', () => {
        let line = '- "foo"is"bar"';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
    } );

    it( 'detects correctly when the value is empty', () => {
        let line = '- "foo" is "" ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 0 );
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
                name: "foo",
                value: "bar"
            }
        );        
    } );

    it( 'generates an error when the name is empty', () => {
        let line = '- "" is "bar" ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.errors ).toHaveLength( 1 );
    } );    

    it( 'does not recognize when there is no name', () => {
        let line = '- is "bar" ';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeNull();
    } );

    it( 'does not recognize when there is no value', () => {
        let line = '- "foo" is ';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeNull();
    } );

    it( 'does not recognize when there is no dash', () => {
        let line = ' "foo" is "bar"';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeNull();
    } );

} );