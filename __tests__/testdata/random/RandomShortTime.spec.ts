import { LocalTime } from "@js-joda/core";
import { Random } from "../../../modules/testdata/random/Random";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { RandomShortTime } from "../../../modules/testdata/random/RandomShortTime";


describe( 'RandomShortTime', () => {

    let random: RandomShortTime = new RandomShortTime( new RandomLong( new Random() ) );

    it( 'generates a random value between min and max, inclusive', () => {
        const min = LocalTime.of( 12, 0 ), max = LocalTime.of( 13, 0 );
        const val: LocalTime = random.between( min, max );
        expect( val.isAfter( min ) || 0 === val.compareTo( min ) ).toBeTruthy();
        expect( val.isBefore( max ) || 0 === val.compareTo( max ) ).toBeTruthy();
    } );

    it( 'generates a value greater than a min value', () => {
        const min = LocalTime.of( 12, 0 );
        const val: LocalTime = random.after( min );
        expect( val.isAfter( min ) ).toBeTruthy();
    } );

    it( 'generates a value less than a max value', () => {
        const max = LocalTime.of( 13, 0 );
        const val: LocalTime = random.before( max );
        expect( val.isBefore( max ) ).toBeTruthy();
    } );

} );