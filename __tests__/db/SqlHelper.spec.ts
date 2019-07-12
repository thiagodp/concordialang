import * as alasql from 'alasql';

import { SqlHelper } from "../../modules/db/SqlHelper";
import { ValueTypeDetector } from "../../modules/util/ValueTypeDetector";

describe( 'SqlHelper', () => {

    let helper = new SqlHelper(); // under test

    const columns = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ];
    const values = [
        [ 1, 2.01, "three", "2017-01-04", "05:06:07", "2017-01-06 08:09:10", true ],
        [ 2, 3.01, "four", "2017-01-05", "06:07:08", "2017-01-07 09:10:11", false ]
    ];


    it( 'converts values to insert values correctly', () => {
        const sqlValues = values.map( v  => helper.lineToSqlInsertValues( v ) );
        expect( sqlValues[ 0 ] ).toBe( '( 1, 2.01, "three", "2017-01-04", "05:06:07", "2017-01-06 08:09:10", true )' );
        expect( sqlValues[ 1 ] ).toBe( '( 2, 3.01, "four", "2017-01-05", "06:07:08", "2017-01-07 09:10:11", false )' );
    } );


    it( 'generates a valid create command', () => {
        const table = 'foo';
        const cmd = helper.generateCreate( table, columns );
        alasql( cmd );
        alasql( helper.generateDrop( table ) );
    } );


    it( 'generates columns correctly', () => {

        const sqlTypes: string[] =
            ( new ValueTypeDetector() ).detectAll( values[ 0 ] )
            .map( vt => helper.convertToSQLType( vt ) );

        const sqlColumns: string[] = helper.generateSqlColumns( columns, sqlTypes );
        expect( sqlColumns[ 0 ] ).toBe( '`a` INT' );
        expect( sqlColumns[ 1 ] ).toBe( '`b` DOUBLE' );
        expect( sqlColumns[ 2 ] ).toBe( '`c` STRING' );
        expect( sqlColumns[ 3 ] ).toBe( '`d` DATE' );
        expect( sqlColumns[ 4 ] ).toBe( '`e` TIME' );
        expect( sqlColumns[ 5 ] ).toBe( '`f` DATETIME' );
        expect( sqlColumns[ 6 ] ).toBe( '`g` BOOLEAN' );
    } );

} );