import { TagLexer } from "../../modules/req/lexer/TagLexer";
import { Keywords } from "../../modules/req/Keywords";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'TagLexerTest', () => {

    let lexer = new TagLexer();

    it( 'detects a tag in a line', () => {
        let line = '@hello';
        let r = lexer.analyze( line );
        expect( r ).not.toBeNull();

        let node = r.node;
        expect( node ).not.toBeNull();
        expect( node.keyword ).toBe( Keywords.TAG );
        expect( node.tags ).toContain( "hello" );
    } );

    it( 'detects more than one tag in a line', () => {
        let line = '@hello @world';
        let r = lexer.analyze( line );
        expect( r ).not.toBeNull();
        
        let node = r.node;
        expect( node.tags ).toEqual( [ "hello", "world" ] );
    } );

    it( 'detects tags separated by spaces and tabs', () => {
        let line = '\t @hello \t \t @world  \t';
        let node = lexer.analyze( line ).node;
        expect( node.tags ).toEqual( [ "hello", "world" ] );
    } );    

} );