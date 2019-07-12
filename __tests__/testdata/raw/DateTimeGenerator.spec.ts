import { LocalDateTime } from "js-joda";

import { DateTimeGenerator } from "../../../modules/testdata/raw/DateTimeGenerator";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomDateTime } from "../../../modules/testdata/random/RandomDateTime";

describe( 'DateTimeGenerator', () => {

    const ranL = new RandomLong( new Random( 'concordia' ) );
    const ranD = new RandomDateTime( ranL );
    const aMin: LocalDateTime = LocalDateTime.of( 2018, 1,  1, 12, 0, 0 );
    const aMax: LocalDateTime = LocalDateTime.of( 2018, 1, 30, 13, 0, 0 );
    const aMedian: LocalDateTime = LocalDateTime.of( 2018, 1, 15, 12, 30, 0 );
    const gen: DateTimeGenerator = new DateTimeGenerator( ranD, aMin, aMax ); // under test

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
            expect( gen.median() ).toEqual( aMedian );
        } );

        it( 'of two consecutive seconds', () => {

            expect( new DateTimeGenerator( ranD,
                LocalDateTime.of( 2018, 1, 1, 12, 0, 0 ),
                LocalDateTime.of( 2018, 1, 1, 12, 0, 1 )
            ).median() ).toEqual(
                LocalDateTime.of( 2018, 1,  1, 12, 0, 0 )
            );

        } );

        it( 'of two odd seconds', () => {

            expect( new DateTimeGenerator( ranD,
                LocalDateTime.of( 2018, 1,  1, 12, 0, 1 ),
                LocalDateTime.of( 2018, 1,  1, 12, 0, 3 )
            ).median() ).toEqual(
                LocalDateTime.of( 2018, 1,  1, 12, 0, 2 )
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

} );