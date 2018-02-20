import { RandomDateTime } from "../../../modules/testdata/random/RandomDateTime";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { Random } from "../../../modules/testdata/random/Random";
import { LocalDateTime } from "js-joda";

describe( 'RandomDateTimeTest', () => {

    let random: RandomDateTime = new RandomDateTime( new RandomLong( new Random() ) );

    it( 'generates a random value between min and max, inclusive', () => {
        const min = LocalDateTime.of( 2018, 1,  1, 12, 0, 0 );
        const max = LocalDateTime.of( 2018, 1, 31, 13, 0, 0 );
        const val: LocalDateTime = random.between( min, max );
        expect( val.isAfter( min ) || 0 === val.compareTo( min ) ).toBeTruthy();
        expect( val.isBefore( max ) || 0 === val.compareTo( max ) ).toBeTruthy();
    } );

    it( 'generates a value greater than a min value', () => {
        const min = LocalDateTime.of( 2018, 1,  1, 12, 0, 0 );
        const val: LocalDateTime = random.after( min );
        expect( val.isAfter( min ) ).toBeTruthy();
    } );

    it( 'generates a value less than a max value', () => {
        const max = LocalDateTime.of( 2018, 1, 31, 13, 0, 0 );
        const val: LocalDateTime = random.before( max );
        expect( val.isBefore( max ) ).toBeTruthy();
    } );    

} );