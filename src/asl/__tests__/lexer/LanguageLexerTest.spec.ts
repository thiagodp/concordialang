import { Keywords } from '../../modules/req/Keywords';
import { LanguageLexer } from "../../modules/req/lexer/LanguageLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LanguageLexerTest', () => {

    let words = [ 'language', 'lang' ];
    let lexer = new LanguageLexer( words );

    it( 'detects in a line', () => {
        let line = '#language: pt-br';
        let r = lexer.analyze( line );
        expect( r ).not.toBeNull();

        let node = r.node;
        expect( node.keyword ).toBe( Keywords.LANGUAGE );
        expect( node.content ).toBe( "pt-br" );
    } );

    it( 'detects separated by spaces and tabs', () => {
        let line = '# \tlanguage \t: \tpt-br ';
        let r = lexer.analyze( line );
        expect( r ).not.toBeNull();

        let node = r.node;
        expect( node.keyword ).toBe( Keywords.LANGUAGE );
        expect( node.content ).toBe( "pt-br" );
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
        let node = lexer.analyze( line, 1 ).node;
        expect( node ).toEqual(
            {
                keyword: Keywords.LANGUAGE,
                location: { line: 1, column: 1 },
                content: "pt-br"
            }
        );
    } );

    it( 'detects in the correct position even with additional spaces or tabs', () => {
        let line = ' \t # \t language \t : \t pt-br \t';
        let node = lexer.analyze( line, 1 ).node;
        expect( node ).toEqual(
            {
                keyword: Keywords.LANGUAGE,
                location: { line: 1, column: 4 },
                content: "pt-br"
            }
        );
    } );

} );