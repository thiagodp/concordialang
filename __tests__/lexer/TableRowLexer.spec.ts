import { TableRowLexer } from '../../modules/lexer/TableRowLexer';

describe( 'TableRowLexer', () => {

    let lexer = new TableRowLexer(); // under test

    it( 'recognizes a row with a single cell', () => {
        let r = lexer.analyze( '| hello |', 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes ).toHaveLength( 1 );

        let row = r.nodes[ 0 ];
        expect( row.cells ).toEqual( [ 'hello' ] );
    } );

    it( 'recognizes a row with many cells', () => {
        let r = lexer.analyze( '| the quick | brown fox | jumped over | the lazy |', 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes ).toHaveLength( 1 );

        let row = r.nodes[ 0 ];
        expect( row.cells ).toEqual( [ 'the quick', 'brown fox', 'jumped over', 'the lazy' ] );
    } );

    it( 'does not recognize a row without a cell', () => {
        let r = lexer.analyze( '| hello', 1 );
        expect( r ).toBeNull();
    } );

    it( 'recognize a row with an empty cell', () => {
        let r = lexer.analyze( '||', 1 );
        expect( r ).not.toBeNull();
        let row = r.nodes[ 0 ];
        expect( row.cells ).toEqual( [ '' ] );
    } );

    it( 'recognize empty cells between values', () => {
        let r = lexer.analyze( '|| the quick || brown | fox || jumped ||', 1 );
        expect( r ).not.toBeNull();
        let row = r.nodes[ 0 ];
        expect( row.cells ).toEqual( [ '', 'the quick', '', 'brown', 'fox', '', 'jumped', '' ] );
    } );

    it( 'ignores comments', () => {
        let r = lexer.analyze( '| foo | bar |#comment', 1 );
        expect( r ).not.toBeNull();
        let row = r.nodes[ 0 ];
        expect( row.cells ).toEqual( [ 'foo', 'bar' ] );
    } );

} );