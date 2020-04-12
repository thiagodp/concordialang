import { LocalDate } from "@js-joda/core";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomDate } from "../../../modules/testdata/random/RandomDate";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { DateGenerator } from "../../../modules/testdata/raw/DateGenerator";


describe( 'DateGenerator', () => {

    const ranL = new RandomLong( new Random( 'concordia' ) );
    const ranD = new RandomDate( ranL );
    const aMin: LocalDate = LocalDate.of( 2018, 1, 1 );
    const aMax: LocalDate = LocalDate.of( 2018, 1, 30 );
    const aMedian: LocalDate = LocalDate.of( 2018, 1, 15 );
    const gen: DateGenerator = new DateGenerator( ranD, aMin, aMax ); // under test

    it( 'random below min', () => {
        expect( gen.randomBelowMin().isBefore( aMin ) ).toBeTruthy();
    } );

    it( 'just below min', () => {
        expect( gen.justBelowMin() ).toEqual( aMin.minusDays( 1 ) );
    } );

    it( 'just above min', () => {
        expect( gen.justAboveMin() ).toEqual( aMin.plusDays( 1 ) );
    } );


    describe( 'median value', () => {

        it( 'of ' + aMin.toString() + ' and ' + aMax.toString(), () => {
            expect( gen.median() ).toEqual( aMedian );
        } );

        it( 'of two consecutive days', () => {

            expect( new DateGenerator( ranD,
                LocalDate.of( 2018, 1, 1 ),
                LocalDate.of( 2018, 1, 2 )
            ).median() ).toEqual( LocalDate.of( 2018, 1, 1 ) );

        } );

        it( 'of two odd days', () => {

            expect( new DateGenerator( ranD,
                LocalDate.of( 2018, 1, 1 ),
                LocalDate.of( 2018, 1, 3 )
            ).median() ).toEqual( LocalDate.of( 2018, 1, 2 ) );

        } );

    } );

    it( 'random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect( val.isAfter( aMin ) ).toBeTruthy();
        expect( val.isBefore( aMax ) ).toBeTruthy();
    } );

    it( 'just below max', () => {
        expect( gen.justBelowMax() ).toEqual( aMax.minusDays( 1 ) );
    } );

    it( 'just above max', () => {
        expect( gen.justAboveMax() ).toEqual( aMax.plusDays( 1 ) );
    } );

    it( 'random above max', () => {
        expect( gen.randomAboveMax().isAfter( aMax ) ).toBeTruthy();
    } );

} );