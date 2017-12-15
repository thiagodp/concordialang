import { QueryParser } from '../../../modules/data-gen/db/QueryParser';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'QueryParserTest', () => {

    let parser = new QueryParser(); // under test

    // const query1 = 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY ' +
    //     'FROM ${db}.${table1}, ${table2}, tbl3 ' +
    //     'WHERE ${table1}.fieldX = ${fieldA} OR ' +
    //     '${table2}.fieldY = {{const1}}';

    it( 'parses all variables correctly', () => {
        let result = parser.parseAnyVariables( 'SELECT a, b FROM ${one}, ${two} WHERE ${three}' );
        expect( result ).toHaveLength( 3 );
        let [ x, y, z ] = result;
        expect( x ).toBe( 'one' );
        expect( y ).toBe( 'two' );
        expect( z ).toBe( 'three' );
    } );

    it( 'parses all constants correctly', () => {
        let result = parser.parseAnyConstants( 'SELECT a, b FROM {{one}}, {{two}} WHERE {{three}}' );
        expect( result ).toHaveLength( 3 );
        let [ x, y, z ] = result;
        expect( x ).toBe( 'one' );
        expect( y ).toBe( 'two' );
        expect( z ).toBe( 'three' );
    } );

    // it( 'parses tables variables', () => {
    //     const result = parser.parseTablesVariables( query1 );
    //     expect( result ).toEqual( [ 'table1', 'table2' ] );
    // } );

    // it( 'parses databases variables', () => {
    //     const result = parser.parseDatabasesVariables( query1 );
    //     expect( result ).toEqual( [ 'db' ] );
    // } );

    // it( 'parses field values', () => {
    //     const result = parser.parseFieldVariables( query1 );
    //     expect( result ).toEqual( [ 'fieldA' ] );
    // } );

    // it( 'parses constants', () => {
    //     const result = parser.parseConstants( query1 );
    //     expect( result ).toEqual( [ 'const1' ] );
    // } );

} );