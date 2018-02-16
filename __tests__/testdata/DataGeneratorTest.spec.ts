import { DataGenerator, DataGenConfig } from "../../modules/testdata/DataGenerator";
import { Random } from "../../modules/testdata/random/Random";
import { DataTestCase, DataTestCaseGroupDef, DataTestCaseGroup } from "../../modules/testdata/DataTestCase";
import { ValueType } from "../../modules/util/ValueTypeDetector";
import * as enumUtil from 'enum-util';
import { LocalDate, LocalTime, LocalDateTime } from "js-joda";

describe( 'DataGeneratorTest', () => {

    let gen: DataGenerator;

    beforeEach( () => {
        gen = new DataGenerator( new Random( '123' ) );
    } );

    afterEach( () => {
        gen = null;
    } );

    //
    // helper functions
    //

    function checkTestCasesOfTheGroupValue( vt: ValueType, min: any, max: any, median: any, zero: any ) {

        return () => {

            async function checkLessThanMin( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( tc, cfg );
                expect( val ).toBeLessThan( cfg.min );
            }

            async function checkGreaterThanMax( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( tc, cfg );
                expect( val ).toBeGreaterThan( cfg.max );
            }            

            it( 'VALUE_LOWEST', async () => {
                await checkLessThanMin( DataTestCase.VALUE_LOWEST );
            } );

            it( 'VALUE_RANDOM_BELOW_MIN', async () => {
                await checkLessThanMin( DataTestCase.VALUE_RANDOM_BELOW_MIN );
            } );

            it( 'VALUE_JUST_BELOW_MIN', async () => {
                await checkLessThanMin( DataTestCase.VALUE_JUST_BELOW_MIN );
            } );

            it( 'VALUE_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( DataTestCase.VALUE_MIN, cfg );
                expect( val ).toEqual( cfg.min );
            } );
            
            it( 'VALUE_JUST_ABOVE_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( DataTestCase.VALUE_JUST_ABOVE_MIN, cfg );
                expect( val ).toBeGreaterThan( cfg.min );
            } );

            it( 'VALUE_ZERO', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = max;
                const val = await gen.generate( DataTestCase.VALUE_ZERO, cfg );
                expect( val ).toEqual( zero );
            } );

            it( 'VALUE_MEDIAN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                cfg.max = max;
                const val = await gen.generate( DataTestCase.VALUE_MEDIAN, cfg );
                expect( val ).toEqual( median );
            } );

            it( 'VALUE_RANDOM_BETWEEN_MIN_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                cfg.max = max;
                const val = await gen.generate( DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX, cfg );
                expect( val ).toBeGreaterThanOrEqual( cfg.min );
                expect( val ).toBeLessThanOrEqual( cfg.max );
            } );

            it( 'VALUE_JUST_BELOW_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( DataTestCase.VALUE_JUST_BELOW_MAX, cfg );
                expect( val ).toBeLessThan( cfg.max );
            } );
            
            it( 'VALUE_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( DataTestCase.VALUE_MAX, cfg );
                expect( val ).toEqual( cfg.max );
            } );

            it( 'VALUE_JUST_ABOVE_MAX', async () => {
                await checkGreaterThanMax( DataTestCase.VALUE_JUST_ABOVE_MAX );
            } );

            it( 'VALUE_RANDOM_ABOVE_MAX', async () => {
                await checkGreaterThanMax( DataTestCase.VALUE_RANDOM_ABOVE_MAX );
            } );
            
            it( 'VALUE_GREATEST', async () => {
                await checkGreaterThanMax( DataTestCase.VALUE_GREATEST );
            } );            

        };
    }


    function checkTestCasesOfTheGroupLength( vt: ValueType, min: any, max: any, median: any ) {

        return () => {

            async function checkLessThanMin( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( tc, cfg );
                expect( val.length ).toBeLessThan( cfg.min );
            }

            async function checkGreaterThanMax( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( tc, cfg );
                expect( val.length ).toBeGreaterThan( cfg.max );
            }            

            it( 'LENGTH_LOWEST', async () => {
                await checkLessThanMin( DataTestCase.LENGTH_LOWEST );
            } );

            it( 'LENGTH_RANDOM_BELOW_MIN', async () => {
                await checkLessThanMin( DataTestCase.LENGTH_RANDOM_BELOW_MIN );
            } );

            it( 'LENGTH_JUST_BELOW_MIN', async () => {
                await checkLessThanMin( DataTestCase.LENGTH_JUST_BELOW_MIN );
            } );

            it( 'LENGTH_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( DataTestCase.LENGTH_MIN, cfg );
                expect( val.length ).toEqual( cfg.min );
            } );
            
            it( 'LENGTH_JUST_ABOVE_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                const val = await gen.generate( DataTestCase.LENGTH_JUST_ABOVE_MIN, cfg );
                expect( val.length ).toBeGreaterThan( cfg.min );
            } );

            it( 'LENGTH_MEDIAN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                cfg.max = max;
                const val = await gen.generate( DataTestCase.LENGTH_MEDIAN, cfg );
                expect( val.length ).toEqual( median );
            } );

            it( 'LENGTH_RANDOM_BETWEEN_MIN_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                cfg.max = max;
                const val = await gen.generate( DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX, cfg );
                expect( val.length ).toBeGreaterThanOrEqual( cfg.min );
                expect( val.length ).toBeLessThanOrEqual( cfg.max );
            } );

            it( 'LENGTH_JUST_BELOW_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( DataTestCase.LENGTH_JUST_BELOW_MAX, cfg );
                expect( val.length ).toBeLessThan( cfg.max );
            } );
            
            it( 'LENGTH_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.max = max;
                const val = await gen.generate( DataTestCase.LENGTH_MAX, cfg );
                expect( val.length ).toEqual( cfg.max );
            } );

            it( 'LENGTH_JUST_ABOVE_MAX', async () => {
                await checkGreaterThanMax( DataTestCase.LENGTH_JUST_ABOVE_MAX );
            } );

            it( 'LENGTH_RANDOM_ABOVE_MAX', async () => {
                await checkGreaterThanMax( DataTestCase.LENGTH_RANDOM_ABOVE_MAX );
            } );
            
            it( 'LENGTH_GREATEST', async () => {
                await checkGreaterThanMax( DataTestCase.LENGTH_GREATEST );
            } );            

        };
    }


    function checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( vt: ValueType, min: any, max: any ) {

        return () => {

            async function checkIsNull( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.min = min;
                cfg.max = max;
                const val = await gen.generate( tc, cfg );
                expect( val ).toBeNull();
            }

            function makeIt( tc: DataTestCase ) {
                it( tc.toString(), async() => {
                    await checkIsNull( tc );
                } );
            }

            const testCases = ( new DataTestCaseGroupDef() ).ofGroup( DataTestCaseGroup.LENGTH );
            for ( const tc of testCases ) {
                makeIt( tc );
            }

        };
    }


    //
    // tests
    //


    describe( 'value', () => {
        describe( 'integer', checkTestCasesOfTheGroupValue( ValueType.INTEGER, 10, 20, 15, 0 ) );
        describe( 'double', checkTestCasesOfTheGroupValue( ValueType.DOUBLE, 10, 20, 15, 0 ) );
        // TO-DO other types
    } );


    describe( 'length', () => {

        describe( 'string', checkTestCasesOfTheGroupLength( ValueType.STRING, 10, 20, 15 ) );

        describe( 'integer', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.INTEGER, 10, 20 ) );
        describe( 'double', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.DOUBLE, 10, 20 ) );

        describe( 'date', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
            ValueType.DATE,
            LocalDate.of( 2018, 1, 1 ),
            LocalDate.of( 2018, 12, 31 )
        ) );

        describe( 'time', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
            ValueType.TIME,
            LocalTime.of( 6, 0, 0 ),
            LocalTime.of( 12, 0, 0 )
        ) );

        describe( 'datetime', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
            ValueType.DATETIME,
            LocalDateTime.of( LocalDate.of( 2018, 1, 1 ), LocalTime.of( 6, 0, 0 ) ),
            LocalDateTime.of( LocalDate.of( 2018, 12, 31 ), LocalTime.of( 12, 0, 0 ) )
        ) );
    } );


    describe( 'format', () => {

        describe( 'string', () => {

            it( 'FORMAT_VALID', async () => {
                let cfg = new DataGenConfig( ValueType.STRING );
                cfg.regex = '[a-z]{2,10}';
                const val = await gen.generate( DataTestCase.FORMAT_VALID, cfg );
                expect( val ).toMatch( new RegExp( cfg.regex ) );
            } );

            it( 'FORMAT_INVALID', async () => {
                let cfg = new DataGenConfig( ValueType.STRING );
                cfg.regex = '^[a-z]{2,10}$';
                const val = await gen.generate( DataTestCase.FORMAT_INVALID, cfg );
                expect( val ).not.toMatch( new RegExp( cfg.regex ) );
            } );

        } );

    } );


} );