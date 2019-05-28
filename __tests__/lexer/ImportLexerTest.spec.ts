import { ImportLexer } from '../../modules/lexer/ImportLexer';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ImportLexerTest', () => {

    // IMPORTANT: ImportLexer inherits from QuotedNodeLexer and the latter has tests.

    const keyword = 'import';
    const word = 'import';

    let lexer = new ImportLexer( [ word ] ); // under test

    function expectNodeWithValue( line: string, value: string ): void {
        const r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );

        const node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 + line.length - line.trim().length },
                value: value
            }
        );
    }

    it( 'ignores a comment after the value', () => {
        const value = 'Hello world';
        const line = `  \t \t${word} \t "${value}"#comment`;
        expectNodeWithValue( line, value );
    } );

    describe( 'consider a unix file path as a valid name', () => {

        it( 'full path', () => {
           const value = "/foo/bar/foo.bar";
           const line = `${word} "${value}"`;
           expectNodeWithValue( line, value );
        } );

        it( 'current path', () => {
            const value = "./foo.bar";
            const line = `${word} "${value}"`;
            expectNodeWithValue( line, value );
         } );

        it( 'parent path', () => {
            const value = "../../bar/foo.bar";
            const line = `${word} "${value}"`;
            expectNodeWithValue( line, value );
         } );

    } );


    describe( 'consider a windows file path as a valid name', () => {

        it( 'full path', () => {
           const value = "C:\\foo\\bar\\foo.bar";
           const line = `${word} "${value}"`;
           expectNodeWithValue( line, value );
        } );

        it( 'current path', () => {
            const value = ".\\foo.bar";
            const line = `${word} "${value}"`;
            expectNodeWithValue( line, value );
         } );

        it( 'parent path', () => {
            const value = "..\\..\\bar\\foo.bar";
            const line = `${word} "${value}"`;
            expectNodeWithValue( line, value );
         } );

    } );

} );