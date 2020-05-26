import { LocalTime } from "@js-joda/core";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { RandomTime } from "../../../modules/testdata/random/RandomTime";
import { TimeGenerator } from "../../../modules/testdata/raw/TimeGenerator";


describe( 'TimeGenerator', () => {

    const ranL = new RandomLong( new Random( 'concordia' ) );
    const ranD = new RandomTime( ranL );
    const aMin: LocalTime = LocalTime.of( 12, 0, 0 );
    const aMax: LocalTime = LocalTime.of( 13, 0, 0 );
    const aMedian: LocalTime = LocalTime.of( 12, 30, 0 );
    const gen: TimeGenerator = new TimeGenerator( ranD, aMin, aMax ); // under test

    it( 'random below min', () => {
        expect( gen.randomBelowMin().isBefore( aMin ) ).toBeTruthy();
    } );

    it( 'just below min', () => {
        expect( gen.justBelowMin() ).toEqual( aMin.minusSeconds( 1 ) );
    } );

    it( 'just above min', () => {
        expect( gen.justAboveMin() ).toEqual( aMin.plusSeconds( 1 ) );
    } );


    describe( 'median value', () => {

        it( 'of ' + aMin.toString() + ' and ' + aMax.toString(), () => {
            const median = gen.median();
            //expect( median.equals( aMedian ) ).toBeTruthy();
            expect( median ).toEqual( aMedian );
        } );

        it( 'of two consecutive seconds', () => {

            expect( new TimeGenerator( ranD,
                LocalTime.of( 12, 0, 0 ),
                LocalTime.of( 12, 0, 1 )
            ).median() ).toEqual(
                LocalTime.of( 12, 0, 0 )
            );

        } );

        it( 'of two odd seconds', () => {

            expect( new TimeGenerator( ranD,
                LocalTime.of( 12, 0, 1 ),
                LocalTime.of( 12, 0, 3 )
            ).median() ).toEqual(
                LocalTime.of( 12, 0, 2 )
            );

        } );

    } );

    it( 'random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect( val.isAfter( aMin ) ).toBeTruthy();
        expect( val.isBefore( aMax ) ).toBeTruthy();
    } );

    it( 'just below max', () => {
        expect( gen.justBelowMax() ).toEqual( aMax.minusSeconds( 1 ) );
    } );

    it( 'just above max', () => {
        expect( gen.justAboveMax() ).toEqual( aMax.plusSeconds( 1 ) );
    } );

    it( 'random above max', () => {
        expect( gen.randomAboveMax().isAfter( aMax ) ).toBeTruthy();
    } );

    // They should respect min and maximum values, instead of looping

    it( 'just above max - keeps the last time of the day', () => {

        expect( new TimeGenerator( ranD,
            LocalTime.of( 23, 59, 59 ),
            LocalTime.of( 23, 59, 59 )
        ).justAboveMax() ).toEqual(
            LocalTime.of( 23, 59, 59 )
        );

    } );

    it( 'just below min - keeps the first time of the day', () => {

        expect( new TimeGenerator( ranD,
            LocalTime.of( 0, 0, 0 ),
            LocalTime.of( 0, 0, 0 )
        ).justBelowMin() ).toEqual(
            LocalTime.of( 0, 0, 0 )
        );

    } );

} );