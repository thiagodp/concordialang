import { ValueTypeDetector } from "../../modules/util/ValueTypeDetector";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ValueTypeDetectorTest', () => {

    let d: ValueTypeDetector = new ValueTypeDetector(); // under test


    it( 'detects boolean values', () => {
        expect( d.isBoolean( true ) ).toBeTruthy();
        expect( d.isBoolean( false ) ).toBeTruthy();
        expect( d.isBoolean( 'true' ) ).toBeTruthy();
        expect( d.isBoolean( 'false' ) ).toBeTruthy();        
        expect( d.isBoolean( 1 ) ).toBeFalsy();
        expect( d.isBoolean( 0 ) ).toBeFalsy();
        expect( d.isBoolean( '1' ) ).toBeFalsy();
        expect( d.isBoolean( '0' ) ).toBeFalsy();        
    } );


    it( 'detects integer values', () => {
        expect( d.isInteger( 1 ) ).toBeTruthy();
        expect( d.isInteger( 0 ) ).toBeTruthy();
        expect( d.isInteger( -1 ) ).toBeTruthy();
        expect( d.isInteger( '1' ) ).toBeTruthy();
        expect( d.isInteger( '0' ) ).toBeTruthy();
        expect( d.isInteger( '-1' ) ).toBeTruthy();
        expect( d.isInteger( 1.0 ) ).toBeTruthy(); // any .0 value is converted to integer
        expect( d.isInteger( 1.01 ) ).toBeFalsy();
        expect( d.isInteger( 0.0 ) ).toBeTruthy(); // any .0 value is converted to integer
        expect( d.isInteger( 0.01 ) ).toBeFalsy();
        expect( d.isInteger( -1.0 ) ).toBeTruthy(); // any .0 value is converted to integer
        expect( d.isInteger( -1.01 ) ).toBeFalsy();
        expect( d.isInteger( 'a' ) ).toBeFalsy();
    } );
    

    it( 'detects double values', () => {
        expect( d.isDouble( 1 ) ).toBeTruthy();
        expect( d.isDouble( 0 ) ).toBeTruthy();
        expect( d.isDouble( -1 ) ).toBeTruthy();
        expect( d.isDouble( '1' ) ).toBeTruthy();
        expect( d.isDouble( '0' ) ).toBeTruthy();
        expect( d.isDouble( '-1' ) ).toBeTruthy();
        expect( d.isDouble( 1.0 ) ).toBeTruthy();
        expect( d.isDouble( 1.01 ) ).toBeTruthy();
        expect( d.isDouble( 0.0 ) ).toBeTruthy();
        expect( d.isDouble( 0.01 ) ).toBeTruthy();
        expect( d.isDouble( -1.0 ) ).toBeTruthy();
        expect( d.isDouble( -1.01 ) ).toBeTruthy();
        expect( d.isInteger( 'a' ) ).toBeFalsy();
    } );


    it( 'detects date values', () => {
        // yyyy-mm-dd or yyyy/mm/dd or yyyy.mm.dd are OK
        expect( d.isDate( '2017-12-31' ) ).toBeTruthy();
        expect( d.isDate( '2017/12/31' ) ).toBeTruthy();
        expect( d.isDate( '2017.12.31' ) ).toBeTruthy();

        expect( d.isDate( '2017:12:31' ) ).toBeFalsy(); // invalid separator
        expect( d.isDate( '2017-12-31 12:01' ) ).toBeFalsy(); // date and time

        expect( d.isDate( '12/31/2017' ) ).toBeFalsy(); // invalid format
        expect( d.isDate( '31/12/2017' ) ).toBeFalsy(); // invalid format

        // invalid dates
        expect( d.isDate( '2017-02-30' ) ).toBeFalsy();
        expect( d.isDate( '2017-13-01' ) ).toBeFalsy();
    } ); 
    
    
    it( 'detects time values', () => {
        // hh:mm or hh:mm:ss or hh:mm:ss.SSS are OK
        expect( d.isTime( '23:59' ) ).toBeTruthy();
        expect( d.isTime( '23:59:59' ) ).toBeTruthy();
        expect( d.isTime( '00:00' ) ).toBeTruthy();
        expect( d.isTime( '00:00:00' ) ).toBeTruthy();
        expect( d.isTime( '00:00:00.000' ) ).toBeTruthy();

        expect( d.isTime( '23?59' ) ).toBeFalsy(); // invalid separator    
        expect( d.isTime( '2017-12-31 12:01' ) ).toBeFalsy(); // date and time

        // invalid times
        //expect( d.isTime( '24:00' ) ).toBeFalsy(); // <<< should be passing -> moment.js bug!
        expect( d.isTime( '00:60' ) ).toBeFalsy();
        expect( d.isTime( '00:00:60' ) ).toBeFalsy();
    } );


    it( 'detects datetime values', () => {
        // accepts combinations of date and time formats plus the ISO format
        expect( d.isDateTime( '2017-12-31 23:59' ) ).toBeTruthy();
        expect( d.isDateTime( '2017-12-31 23:59:59' ) ).toBeTruthy();
        expect( d.isDateTime( '2017-12-31 23:59:59.999' ) ).toBeTruthy();

        // invalid separators
        expect( d.isDateTime( '2017?12?31 23:59' ) ).toBeFalsy();
        expect( d.isDateTime( '2017-12-31 23?59' ) ).toBeFalsy();

        // invalid values
        expect( d.isDateTime( '2017-12-32 23:59:59.999' ) ).toBeFalsy(); // invalid date
        expect( d.isDateTime( '2017-12-31 24:59:59.999' ) ).toBeFalsy(); // invalid time
    } );
    
} );