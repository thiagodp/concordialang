import { LocalDate } from "@js-joda/core";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomDate } from "../../../modules/testdata/random/RandomDate";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";


describe( 'RandomDate', () => {

    let random: RandomDate = new RandomDate( new RandomLong( new Random() ) );

    it( 'generates a random value between min and max, inclusive', () => {
        const min = LocalDate.of( 2018, 1, 1 ), max = LocalDate.of( 2018, 1, 31 );
        const val: LocalDate = random.between( min, max );
        expect( val.isAfter( min ) || val.isEqual( min ) ).toBeTruthy();
        expect( val.isBefore( max ) || val.isEqual( max ) ).toBeTruthy();
    } );

    it( 'generates a value greater than a min value', () => {
        const min = LocalDate.of( 2018, 1, 1 );
        const val: LocalDate = random.after( min );
        expect( val.isAfter( min ) ).toBeTruthy();
    } );

    it( 'generates a value less than a max value', () => {
        const max = LocalDate.of( 2018, 1, 31 );
        const val: LocalDate = random.before( max );
        expect( val.isBefore( max ) ).toBeTruthy();
    } );

} );