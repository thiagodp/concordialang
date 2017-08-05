import { RegexLexer } from '../../modules/req/lexer/RegexLexer';
import { Keywords } from '../../modules/req/Keywords';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'RegexLexer Test', () => {

    let words = [ 'regex' ];
    let lexer = new RegexLexer( words );

    it( 'detects in a line', () => {
        let line = 'Regex "name": some value';
        expect( lexer.analyze( line ) ).not.toBeNull();
    } );

    it( 'detects in a line with spaces and tabs', () => {
        let line = '  \t  \t regex \t "Hello World" \t : \tsome value ';
        expect( lexer.analyze( line ) ).not.toBeNull()
    } );

    it( 'does not detect when it is not in a line', () => {
        let line = 'Someelse: Hello world';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'does not detect when the word "regex" is not the first one', () => {
        let line = 'Not a regex "hello": world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect when the word "regex" is not followed by a name', () => {
        let line = 'Regex : world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'detects when the value is empty', () => {
        let line = 'Regex "hello" :';
        let node = lexer.analyze( line ).node;
        expect( node ).not.toBeNull();
        expect( node.content ).toHaveLength( 0 );
    } );    

    it( 'detects in the correct position', () => {
        let line = 'Regex "some name": some value';
        let node = lexer.analyze( line, 1 ).node;
        expect( node ).toEqual(
            {
                keyword: Keywords.REGEX,
                location: { line: 1, column: 1 },
                name: "some name",
                content: "some value"
            }
        );
    } );

    it( 'detects in the correct position even with additional spaces or tabs', () => {
        let line = '\t \t Regex "some name": some value';
        let node = lexer.analyze( line, 1 ).node;
        expect( node ).toEqual(
            {
                keyword: Keywords.REGEX,
                location: { line: 1, column: 5 },
                name: "some name",
                content: "some value"
            }
        );
    } );

} );