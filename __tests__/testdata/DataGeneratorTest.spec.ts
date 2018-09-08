import { DataGenerator, DataGenConfig } from "../../modules/testdata/DataGenerator";
import { DataTestCase, DataTestCaseGroupDef, DataTestCaseGroup } from "../../modules/testdata/DataTestCase";
import { ValueType } from "../../modules/util/ValueTypeDetector";
import { LocalDate, LocalTime, LocalDateTime } from "js-joda";
import { DateLimits } from "../../modules/testdata/limits/DateLimits";
import { TimeLimits } from "../../modules/testdata/limits/TimeLimits";
import { DateTimeLimits } from "../../modules/testdata/limits/DateTimeLimits";
import { DataGeneratorBuilder } from "../../modules/testdata/DataGeneratorBuilder";

describe( 'DataGeneratorTest', () => {

    let gen: DataGenerator; // under test

    beforeEach( () => {
        gen = new DataGenerator( new DataGeneratorBuilder( 'concordia' ));
    } );

    afterEach( () => {
        gen = null;
    } );

    //
    // helper functions
    //

    function checkTestCasesOfTheGroupValue(
        vt: ValueType,
        min: any,
        max: any,
        median: any,
        zero: any,
        comparator: ( a: any, b: any ) => number
    ) {

        return () => {

            async function checkLessThanMin( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.minValue = min;
                const val = await gen.generate( tc, cfg );
                // expect( val ).toBeLessThan( cfg.min );
                expect( comparator( val, cfg.min ) ).toEqual( -1 ); // -1 means that the first is lower
            }

            async function checkGreaterThanMax( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.maxValue = max;
                const val = await gen.generate( tc, cfg );
                // expect( val ).toBeGreaterThan( cfg.max );
                expect( comparator( val, cfg.max ) ).toEqual( 1 ); // 1 means that the first is greater
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
                cfg.minValue = min;
                const val = await gen.generate( DataTestCase.VALUE_MIN, cfg );
                // expect( val ).toEqual( cfg.min );
                expect( comparator( val, cfg.min ) ).toEqual( 0 );
            } );

            it( 'VALUE_JUST_ABOVE_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minValue = min;
                const val = await gen.generate( DataTestCase.VALUE_JUST_ABOVE_MIN, cfg );
                // expect( val ).toBeGreaterThan( cfg.min );
                expect( comparator( val, cfg.min ) ).toEqual( 1 );
            } );

            it( 'VALUE_ZERO', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minValue = max;
                const val = await gen.generate( DataTestCase.VALUE_ZERO, cfg );
                // expect( val ).toEqual( zero );
                expect( comparator( val, zero ) ).toEqual( 0 );
            } );

            it( 'VALUE_MEDIAN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minValue = min;
                cfg.maxValue = max;
                const val = await gen.generate( DataTestCase.VALUE_MEDIAN, cfg );
                // expect( val ).toEqual( median );
                expect( comparator( val, median ) ).toEqual( 0 );
            } );

            it( 'VALUE_RANDOM_BETWEEN_MIN_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minValue = min;
                cfg.maxValue = max;
                const val = await gen.generate( DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX, cfg );
                // expect( val ).toBeGreaterThanOrEqual( cfg.min );
                // expect( val ).toBeLessThanOrEqual( cfg.max );
                expect( comparator( val, cfg.min ) ).toBeGreaterThanOrEqual( 0 );
                expect( comparator( val, cfg.max ) ).toBeLessThanOrEqual( 0 );
            } );

            it( 'VALUE_JUST_BELOW_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.maxValue = max;
                const val = await gen.generate( DataTestCase.VALUE_JUST_BELOW_MAX, cfg );
                // expect( val ).toBeLessThan( cfg.max );
                expect( comparator( val, cfg.max ) ).toEqual( -1 );
            } );

            it( 'VALUE_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.maxValue = max;
                const val = await gen.generate( DataTestCase.VALUE_MAX, cfg );
                // expect( val ).toEqual( cfg.max );
                expect( comparator( val, cfg.max ) ).toEqual( 0 );
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
                cfg.minLength = min;
                const val = await gen.generate( tc, cfg );
                expect( val.length ).toBeLessThan( cfg.min );
            }

            async function checkGreaterThanMax( tc: DataTestCase ) {
                let cfg = new DataGenConfig( vt );
                cfg.maxLength = max;
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
                cfg.minLength = min;
                const val = await gen.generate( DataTestCase.LENGTH_MIN, cfg );
                expect( val.length ).toEqual( cfg.min );
            } );

            it( 'LENGTH_JUST_ABOVE_MIN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minLength = min;
                const val = await gen.generate( DataTestCase.LENGTH_JUST_ABOVE_MIN, cfg );
                expect( val.length ).toBeGreaterThan( cfg.min );
            } );

            it( 'LENGTH_MEDIAN', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minLength = min;
                cfg.maxLength = max;
                const val = await gen.generate( DataTestCase.LENGTH_MEDIAN, cfg );
                expect( val.length ).toEqual( median );
            } );

            it( 'LENGTH_RANDOM_BETWEEN_MIN_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.minLength = min;
                cfg.maxLength = max;
                const val = await gen.generate( DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX, cfg );
                expect( val.length ).toBeGreaterThanOrEqual( cfg.min );
                expect( val.length ).toBeLessThanOrEqual( cfg.max );
            } );

            it( 'LENGTH_JUST_BELOW_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.maxLength = max;
                const val = await gen.generate( DataTestCase.LENGTH_JUST_BELOW_MAX, cfg );
                expect( val.length ).toBeLessThan( cfg.max );
            } );

            it( 'LENGTH_MAX', async () => {
                let cfg = new DataGenConfig( vt );
                cfg.maxLength = max;
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
                cfg.minLength = min;
                cfg.maxLength = max;
                const val = await gen.generate( tc, cfg );
                expect( val ).toBeNull();
            }

            function makeIt( tc: DataTestCase ) {
                it( tc.toString(), async() => {
                    await checkIsNull( tc );
                } );
            }

            const testCases = ( new DataTestCaseGroupDef() ).ofGroup( DataTestCaseGroup.LENGTH );
            for ( let tc of testCases ) {
                makeIt( tc );
            }

        };
    }

    function numberComparator( a: number, b: number ): number {
        return a > b ? 1 : ( ( a < b ) ? -1 : 0 );
    }

    function dateComparator( a: LocalDate, b: LocalDate ): number {
        const v = a.compareTo( b );
        return v < 0 ? -1 : ( v > 0 ? 1 : 0 ); // normalize to -1, 0, +1
    }

    function timeComparator( a: LocalTime, b: LocalTime ): number {
        const v = a.compareTo( b );
        return v < 0 ? -1 : ( v > 0 ? 1 : 0 ); // normalize to -1, 0, +1
    }

    function dateTimeComparator( a: LocalDateTime, b: LocalDateTime ): number {
        const v = a.compareTo( b );
        return v < 0 ? -1 : ( v > 0 ? 1 : 0 ); // normalize to -1, 0, +1
    }

    //
    // tests
    //


    describe( 'value', () => {

        describe( 'integer', checkTestCasesOfTheGroupValue( ValueType.INTEGER, 10, 20, 15, 0, numberComparator ) );

        describe( 'double', checkTestCasesOfTheGroupValue( ValueType.DOUBLE, 10, 20, 15, 0, numberComparator ) );

        describe( 'date', checkTestCasesOfTheGroupValue( ValueType.DATE,
            LocalDate.of( 2018, 1, 1 ),
            LocalDate.of( 2018, 1, 30 ),
            LocalDate.of( 2018, 1, 15 ),
            DateLimits.MIN,
            dateComparator
        ) );

        describe( 'time', checkTestCasesOfTheGroupValue( ValueType.TIME,
            LocalTime.of( 12,  0,  0 ),
            LocalTime.of( 13,  0,  0 ),
            LocalTime.of( 12, 30,  0 ),
            TimeLimits.MIN,
            timeComparator
        ) );

        describe( 'datetime', checkTestCasesOfTheGroupValue( ValueType.DATETIME,
            LocalDateTime.of( 2018, 1,  1, 12,  0,  0 ),
            LocalDateTime.of( 2018, 1, 30, 13,  0,  0 ),
            LocalDateTime.of( 2018, 1, 15, 12, 30,  0 ),
            DateTimeLimits.MIN,
            dateTimeComparator
        ) );

    } );


    describe( 'length', () => {

        describe( 'string', checkTestCasesOfTheGroupLength( ValueType.STRING, 10, 20, 15 ) );

        // describe( 'integer', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.INTEGER, 10, 20 ) );
        // describe( 'double', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.DOUBLE, 10, 20 ) );

        // describe( 'date', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.DATE,
        //     LocalDate.of( 2018, 1, 1 ),
        //     LocalDate.of( 2018, 12, 31 )
        // ) );

        // describe( 'time', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.TIME,
        //     LocalTime.of( 6, 0, 0 ),
        //     LocalTime.of( 12, 0, 0 )
        // ) );

        // describe( 'datetime', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.DATETIME,
        //     LocalDateTime.of( LocalDate.of( 2018, 1, 1 ), LocalTime.of( 6, 0, 0 ) ),
        //     LocalDateTime.of( LocalDate.of( 2018, 12, 31 ), LocalTime.of( 12, 0, 0 ) )
        // ) );
    } );


    describe( 'format', () => {

        describe( 'string', () => {

            it( 'FORMAT_VALID', async () => {
                let cfg = new DataGenConfig( ValueType.STRING );
                cfg.format = '[a-z]{2,10}';
                const val = await gen.generate( DataTestCase.FORMAT_VALID, cfg );
                expect( val ).toMatch( new RegExp( cfg.format ) );
            } );

            it( 'FORMAT_INVALID', async () => {
                let cfg = new DataGenConfig( ValueType.STRING );
                cfg.format = '^[a-z]{2,10}$';
                const val = await gen.generate( DataTestCase.FORMAT_INVALID, cfg );
                expect( val ).not.toMatch( new RegExp( cfg.format ) );
            } );

        } );

    } );


} );