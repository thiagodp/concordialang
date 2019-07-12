import { TagLexer, TagSubLexer } from "../../modules/lexer/TagLexer";
import { NodeTypes } from "../../modules/req/NodeTypes";
import { ReservedTags } from "../../modules/ast";

describe( 'TagLexer', () => {

    let lexer = new TagLexer(); // under test

    it( 'detects a tag in a line', () => {
        let line = '@hello';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );

        let node = r.nodes[ 0 ];
        expect( node ).not.toBeNull();
        expect( node.nodeType ).toBe( NodeTypes.TAG );
        expect( node.name ).toContain( "hello" );
    } );

    it( 'detects more than one tag in a line', () => {
        let line = '@hello @world';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 2 );

        let names = r.nodes.map( ( node ) => node.name );
        expect( names ).toEqual( [ "hello", "world" ] );
    } );

    it( 'detects tags separated by spaces and tabs', () => {
        let line = '\t @hello \t \t @world  \t';
        let names = lexer.analyze( line ).nodes.map( ( node ) => node.name );
        expect( names ).toEqual( [ "hello", "world" ] );
    } );

    it( 'detects a tag with content', () => {
        let line = '@hello( world )';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );

        let node = r.nodes[ 0 ];
        expect( node.name ).toBe( 'hello' );
        expect( node.content ).toEqual( [ 'world' ] );
    } );

    it( 'detects values in a tag, separated by comma', () => {
        let line = '@say( hey, you, there )';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );

        let node = r.nodes[ 0 ];
        expect( node.name ).toBe( 'say' );
        expect( node.content ).toEqual( [ 'hey', 'you', 'there' ] );
    } );

    it( 'detects more than one tag with values separated by comma or not', () => {
        let line = '@one @hello( you, there ) @two @hi( my friend )';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 4 );

        let names = r.nodes.map( ( node ) => node.name );
        expect( names ).toEqual( [ 'one', 'hello', 'two', 'hi' ] );

        let nodeOne = r.nodes[ 0 ];
        expect( nodeOne.content ).toBeUndefined();

        let nodeHello = r.nodes[ 1 ];
        expect( nodeHello.content ).toEqual( [ 'you', 'there' ] );

        let nodeTwo = r.nodes[ 2 ];
        expect( nodeTwo.content ).toBeUndefined();

        let nodeHi = r.nodes[ 3 ];
        expect( nodeHi.content ).toEqual( [ 'my friend' ] );
    } );

    it( 'ignores comments', () => {
        let line = '@foo#comment';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let nodeOne = r.nodes[ 0 ];
        expect( nodeOne.name ).toEqual( 'foo' );

        r = lexer.analyze( '@foo(bar) @a(b, c)#comment' );
        expect( r.errors ).toHaveLength( 0 );
        nodeOne = r.nodes[ 0 ];
        expect( nodeOne.name ).toEqual( 'foo' );
        expect( nodeOne.content ).toEqual( [ 'bar' ] );
        let nodeTwo = r.nodes[ 1 ];
        expect( nodeTwo.name ).toEqual( 'a' );
        expect( nodeTwo.content ).toEqual( [ 'b', 'c' ] );
    } );



    it( 'detects subtypes', () => {

        const l = new TagLexer( [
            new TagSubLexer( ReservedTags.IGNORE, [ ReservedTags.IGNORE ] )
        ] );

        const r = l.analyze( '@ignore' );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );

        expect( r.nodes[ 0 ].subType ).toEqual( ReservedTags.IGNORE );
    } );

} );