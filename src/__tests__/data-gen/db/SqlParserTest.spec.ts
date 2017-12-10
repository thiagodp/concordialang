import { SqlParser } from '../../../modules/data-gen/db/SqlParser';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'SqlParserTest', () => {

    let parser = new SqlParser(); // under test

    const query1 = 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY ' +
        'FROM ${db}.${table1}, ${table2}, tbl3 ' +
        'WHERE ${table1}.fieldX = ${fieldA} OR ' +
        '${table2}.fieldY = {{const1}}';

    it( 'parses variables correctly', () => {
        let result = parser.parseVariables( 'SELECT a, b FROM ${one}, ${two} WHERE ${three}' );
        expect( result ).toHaveLength( 3 );
        let [ x, y, z ] = result;
        expect( x ).toBe( 'one' );
        expect( y ).toBe( 'two' );
        expect( z ).toBe( 'three' );
    } );

    it( 'parses constants correctly', () => {
        let result = parser.parseConstants( 'SELECT a, b FROM {{one}}, {{two}} WHERE {{three}}' );
        expect( result ).toHaveLength( 3 );
        let [ x, y, z ] = result;
        expect( x ).toBe( 'one' );
        expect( y ).toBe( 'two' );
        expect( z ).toBe( 'three' );
    } );

    it( 'parses tables from queries correctly', () => {
        const result = parser.parseTablesFromQuery( query1 );
        expect( result ).toEqual( [ 'table1', 'table2' ] );
    } );

    it( 'parses databases from queries correctly', () => {
        const result = parser.parseDatabasesFromQuery( query1 );
        expect( result ).toEqual( [ 'db' ] );
    } );

    it( 'parses field values from queries correctly', () => {
        const result = parser.parseFieldValuesFromQuery( query1 );
        expect( result ).toEqual( [ 'fieldA' ] );
    } );

    it( 'parses constant values from queries correctly', () => {
        const result = parser.parseConstantValuesFromQuery( query1 );
        expect( result ).toEqual( [ 'const1' ] );
    } );

} );