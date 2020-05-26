import { fillWithZero, isValidDate, isValidTime, isValidDateTime, isShortTime, isShortDateTime } from '../../modules/util/date-time-validation';

describe( 'date-time-validation', () => {

    describe( '#fillWithZero', () => {

        test.each( [
            // value, max, expected
            [ '', 0, '' ],
            [ '', 1, '0' ],
            [ '', 2, '00' ],
            [ '1', 1, '1' ],
            [ '1', 2, '01' ],
            [ '1', 3, '001' ],
        ] )( 'fillWithZero( "%s", %d ) is "%s"', ( value: string, maxLength: number, expected: string ) => {
            expect( fillWithZero( value, maxLength ) ).toEqual( expected );
        } );

    } );

    describe( '#isValidDate', () => {

        // valid
        test.each( [
            [ '2020/01/01' ],
            [ '2020-01-01' ],
            [ '2020-1-1' ],
            [ '0-1-1' ],
            [ '2020/12/31' ],
            [ '2020-12-31' ],
            [ '2020-02-29' ], // leap year
        ] )( '%s is valid', ( date: string ) => {
            expect( isValidDate( date ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ '' ],
            [ '2020' ],
            [ '2020/' ],
            [ '2020/12' ],
            [ '2020/12/' ],
            [ '2020/02/30' ], // february
            [ '2020-02-30' ], // february
            [ '0-0-1' ],
            [ '0-1-0' ],
            [ '0-0-0' ],
            [ '2020/11/31' ],
            [ '2020-12-32' ],

            [ '2020.01.01' ], // separator

        ] )( '%s is NOT valid', ( date: string ) => {
            expect( isValidDate( date ) ).toBeFalsy();
        } );

    } );

    describe( '#isValidTime', () => {

        // valid
        test.each( [
            [ '0:0' ],
            [ '00:0' ],
            [ '0:00' ],
            [ '00:00' ],
            [ '00:00:0' ],
            [ '00:00:00' ],
            [ '00:00:00.0' ],
            [ '00:00:00.00' ],
            [ '00:00:00.000' ],
            [ '23:59' ],
            [ '23:59:59' ],
            [ '23:59:59.999' ],
        ] )( '"%s" is valid', ( time: string ) => {
            expect( isValidTime( time ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ '' ],
            [ '24' ],
            [ ':59' ],
            [ '00:00:' ],
            [ '24:59' ],
            [ '23:60:59' ],
            [ '00:00:00.' ],
            [ '23:59:60.999' ],
            [ '23:59:59.9990' ],
        ] )( '"%s" is NOT valid', ( time: string ) => {
            expect( isValidTime( time ) ).toBeFalsy();
        } );

    } );


    describe( '#isValidDateTime', () => {

        // valid
        test.each( [
            [ '2020/01/01 00:00' ],
            [ '2020-02-29 23:59' ], // leap year
            [ '2020-02-29 23:59:59' ], // leap year
            [ '2020-02-29 23:59:59.999' ], // leap year
            [ '2020/12/31 23:59:59.999' ],

            [ '2020/01/01  00:00' ], // two spaces between
            [ '2020/01/01   00:00' ], // three spaces between
        ] )( '%s is valid', ( dateTime: string ) => {
            expect( isValidDateTime( dateTime ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ '2020/01/01 24:00' ],
            [ '2020/01/01 23:60' ],
            [ '2020/01/01 23:59:60' ],
            [ '2020/01/01 23:59:59.9990' ],
            [ '2020/01/32 00:00' ],

            [ '2020.01.01 00:00' ], // separator
        ] )( '%s is NOT valid', ( dateTime: string ) => {
            expect( isValidDateTime( dateTime ) ).toBeFalsy();
        } );

    } );


    describe( '#isShortTime', () => {

        // valid
        test.each( [
            [ '00:00' ],
            [ '0:0' ],
            [ '23:59' ]
        ] )( '%s is valid', ( time: string ) => {
            expect( isShortTime( time ) ).toBeTruthy();
        } );

        // not valid
        test.each( [
            [ '0000' ],
            [ '00:00:00' ],
            [ '23-59' ]
        ] )( '%s is NOT valid', ( time: string ) => {
            expect( isShortTime( time ) ).toBeFalsy();
        } );

    } );


    describe( '#isShortDateTime', () => {

        // valid
        test.each( [
            [ '2020-01-01 00:00' ],
            [ '2020-12-31 23:59' ],
            [ '2020/12/31 23:59' ],
        ] )( '%s is valid', ( time: string ) => {
            expect( isShortDateTime( time ) ).toBeTruthy();
        } );

        // not valid
        test.each( [
            [ '2020-12-31 23:59:59' ],
            [ '2020-12-31 23:59:59.999' ],
            [ '2020-12-31' ],
            [ '23:59' ],
        ] )( '%s is NOT valid', ( time: string ) => {
            expect( isShortDateTime( time ) ).toBeFalsy();
        } );

    } );

} );