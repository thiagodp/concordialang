import { adjustValueToTheRightType, ValueTypeDetector } from "../../modules/util/ValueTypeDetector";
// import { LocalTime, LocalDate, LocalDateTime } from "@js-joda/core";

describe( 'ValueTypeDetector', () => {

    const d: ValueTypeDetector = new ValueTypeDetector(); // under test

    describe( '#isBoolean', () => {

        // valid
        test.each( [
            [ true ],
            [ false ],
            [ 'true' ],
            [ 'false' ],
        ] )( '%s is valid', ( value: any ) => {
            expect( d.isBoolean( value ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ 1 ],
            [ 0 ],
            [ '1' ],
            [ '0' ],
        ] )( '%s is NOT valid', ( value: any ) => {
            expect( d.isBoolean( value ) ).toBeFalsy();
        } );

    } );


    describe( '#isInteger', () => {

        // valid
        test.each( [
            [ 1 ],
            [ 0 ],
            [ -1 ],
            [ '1' ],
            [ '0' ],
            [ '-1' ],
        ] )( '%s is valid', ( value: any ) => {
            expect( d.isInteger( value ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ '1.0' ],
            [ '0.0' ],
            [ '-1.0' ],
            [ '1.01' ],
            [ '0.01' ],
            [ '-1.01' ],
            [ 'a' ],
            [ '4l1c3pass' ],
        ] )( '%s is NOT valid', ( value: any ) => {
            expect( d.isInteger( value ) ).toBeFalsy();
        } );

    } );


    describe( '#isDouble', () => {

        // valid
        test.each( [
            [ 1 ],
            [ 0 ],
            [ -1 ],
            [ 1.0 ],
            [ 1.01 ],
            [ -1.0 ],
            [ -1.01 ],
            [ '1' ],
            [ '0' ],
            [ '-1' ],
            [ '1.0' ],
            [ '1.01' ],
            [ '0.0' ],
            [ '-1.0' ],
            [ '-1.01' ],
        ] )( '%s is valid', ( value: any ) => {
            expect( d.isDouble( value ) ).toBeTruthy();
        } );

        // NOT valid
        test.each( [
            [ '1..10' ],
            [ 'a' ],
            [ '4l1c3pass' ],
        ] )( '%s is NOT valid', ( value: any ) => {
            expect( d.isDouble( value ) ).toBeFalsy();
        } );

    } );


    it( 'detects date values', () => {
        // yyyy-MM-dd and yyyy/MM/dd are OK
        // yyyy.MM.dd is NOT OK anymore
        expect( d.isDate( '2017-12-31' ) ).toBeTruthy();
        expect( d.isDate( '2017/12/31' ) ).toBeTruthy();
        expect( d.isDate( '2017.12.31' ) ).toBeFalsy();

        expect( d.isDate( '2017:12:31' ) ).toBeFalsy(); // invalid separator
        expect( d.isDate( '2017-12-31 12:01' ) ).toBeFalsy(); // date and time

        expect( d.isDate( '12/31/2017' ) ).toBeFalsy(); // invalid format
        expect( d.isDate( '31/12/2017' ) ).toBeFalsy(); // invalid format

        // invalid dates
        expect( d.isDate( '2017-02-30' ) ).toBeFalsy();
        expect( d.isDate( '2017-13-01' ) ).toBeFalsy();
    } );


    it( 'detects long time values', () => {
        // HH:mm:ss or HH:mm:ss.SSS are OK
        expect( d.isLongTime( '23:59:59' ) ).toBeTruthy();
        expect( d.isLongTime( '00:00:00' ) ).toBeTruthy();
        expect( d.isLongTime( '00:00:00.000' ) ).toBeTruthy();
    } );

    it( 'detects time values', () => {
        // HH:mm is OK
        expect( d.isTime( '23:59' ) ).toBeTruthy();
        expect( d.isTime( '00:00' ) ).toBeTruthy();

        expect( d.isTime( '23?59' ) ).toBeFalsy(); // invalid separator
        expect( d.isTime( '2017-12-31 12:01' ) ).toBeFalsy(); // date and time

        // invalid times
        //expect( d.isTime( '24:00' ) ).toBeFalsy(); // <<< should be passing -> moment.js bug!
        expect( d.isTime( '00:60' ) ).toBeFalsy();
        expect( d.isTime( '00:00:60' ) ).toBeFalsy();
    } );


    it( 'detects long datetime values', () => {
        // date + long time
        expect( d.isLongDateTime( '2017-12-31 23:59:59' ) ).toBeTruthy();
        expect( d.isLongDateTime( '2017-12-31 23:59:59.999' ) ).toBeTruthy();

        // invalid values
        expect( d.isLongDateTime( '2017-12-32 23:59:59.999' ) ).toBeFalsy(); // invalid date
        expect( d.isLongDateTime( '2017-12-31 24:59:59.999' ) ).toBeFalsy(); // invalid time
    } );

    it( 'detects datetime values', () => {
        // date + time
        expect( d.isDateTime( '2017-12-31 23:59' ) ).toBeTruthy();

        // invalid separators
        expect( d.isDateTime( '2017?12?31 23:59' ) ).toBeFalsy();
        expect( d.isDateTime( '2017-12-31 23?59' ) ).toBeFalsy();
        // expect( d.isDateTime( '2017.12.31 23:59' ) ).toBeFalsy();
    } );

    describe( 'adjusts values to the right type', () => {

        it( 'number', () => {
            expect( adjustValueToTheRightType( '0' ) ).toBe( 0 );
            expect( adjustValueToTheRightType( '10' ) ).toBe( 10 );
            expect( adjustValueToTheRightType( '-10' ) ).toBe( -10 );
            expect( adjustValueToTheRightType( '2.5' ) ).toBeCloseTo( 2.5, 5 );
            expect( adjustValueToTheRightType( '-2.5' ) ).toBeCloseTo( -2.5, 5 );
        } );

        it( 'boolean', () => {
            expect( adjustValueToTheRightType( 'true' ) ).toBe( true );
            expect( adjustValueToTheRightType( 'false' ) ).toBe( false );
        } );

        // it( 'time', () => {
        //     const value: string = '00:00';
        //     const received = adjustValueToTheRightType( value );
        //     const expected = LocalTime.parse( value );
        //     expect( received ).toEqual( expected );
        // } );

        // it( 'date', () => {
        //     const value = '12/31/2020';
        //     const received = adjustValueToTheRightType( value );
        //     expect( received ).toBe( LocalDate.parse( value ) );
        // } );

        // it( 'datetime', () => {
        //     const value = '12/31/2020 00:00';
        //     const received = adjustValueToTheRightType( value );
        //     expect( received ).toBe( LocalDateTime.parse( value ) );
        // } );

    } );

} );