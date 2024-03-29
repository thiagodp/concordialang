import { LocalDateTime } from "@js-joda/core";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomShortDateTime } from "../../../modules/testdata/random/RandomShortDateTime";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { ShortDateTimeGenerator } from "../../../modules/testdata/raw/ShortDateTimeGenerator";


describe( 'ShortDateTimeGenerator', () => {

    const ranL = new RandomLong( new Random( 'concordia' ) );
    const ranD = new RandomShortDateTime( ranL );
    const aMin: LocalDateTime = LocalDateTime.of( 2018, 1,  1, 12, 0, 0 );
    const aMax: LocalDateTime = LocalDateTime.of( 2018, 1, 30, 13, 0, 0 );
    const aMedian: LocalDateTime = LocalDateTime.of( 2018, 1, 15, 12, 30, 0 );
    const gen: ShortDateTimeGenerator = new ShortDateTimeGenerator( ranD, aMin, aMax ); // under test

    it( 'random below min', () => {
        expect( gen.randomBelowMin().isBefore( aMin ) ).toBeTruthy();
    } );

    it( 'just below min', () => {
        expect( gen.justBelowMin() ).toEqual( aMin.minusMinutes( 1 ) );
    } );

    it( 'just above min', () => {
        expect( gen.justAboveMin() ).toEqual( aMin.plusMinutes( 1 ) );
    } );


    describe( 'median value', () => {

        it( 'of ' + aMin.toString() + ' and ' + aMax.toString(), () => {
            expect( gen.median() ).toEqual( aMedian );
        } );

        it( 'of two consecutive minutes', () => {

            expect( new ShortDateTimeGenerator( ranD,
                LocalDateTime.of( 2018, 1, 1, 12, 0 ),
                LocalDateTime.of( 2018, 1, 1, 12, 0 )
            ).median() ).toEqual(
                LocalDateTime.of( 2018, 1,  1, 12, 0 )
            );

        } );

        it( 'of two odd minutes', () => {

            expect( new ShortDateTimeGenerator( ranD,
                LocalDateTime.of( 2018, 1,  1, 12, 1 ),
                LocalDateTime.of( 2018, 1,  1, 12, 3 )
            ).median() ).toEqual(
                LocalDateTime.of( 2018, 1,  1, 12, 2 )
            );

        } );

    } );

    it( 'random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect( val.isAfter( aMin ) ).toBeTruthy();
        expect( val.isBefore( aMax ) ).toBeTruthy();
    } );

    it( 'just below max', () => {
        expect( gen.justBelowMax() ).toEqual( aMax.minusMinutes( 1 ) );
    } );

    it( 'just above max', () => {
        expect( gen.justAboveMax() ).toEqual( aMax.plusMinutes( 1 ) );
    } );

    it( 'random above max', () => {
        expect( gen.randomAboveMax().isAfter( aMax ) ).toBeTruthy();
    } );

} );