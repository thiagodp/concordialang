import { QueryParser } from '../../../modules/data-gen/db/QueryParser';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'QueryParserTest', () => {

    let parser = new QueryParser(); // under test

    it( 'parses all variables correctly', () => {
        let result = parser.parseAnyVariables( 'SELECT a, b FROM ${one}, ${two} WHERE ${three} and ${foo:bar}' );
        let [ r1, r2, r3, r4 ] = result;
        expect( r1 ).toBe( 'one' );
        expect( r2 ).toBe( 'two' );
        expect( r3 ).toBe( 'three' );
        expect( r4 ).toBe( 'foo:bar' );
    } );

    it( 'parses all constants correctly', () => {
        let result = parser.parseAnyConstants( 'SELECT a, b FROM {{one}}, {{two}} WHERE {{three}}' );
        expect( result ).toHaveLength( 3 );
        let [ x, y, z ] = result;
        expect( x ).toBe( 'one' );
        expect( y ).toBe( 'two' );
        expect( z ).toBe( 'three' );
    } );

} );