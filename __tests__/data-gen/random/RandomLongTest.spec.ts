import { RandomLong } from '../../../modules/data-gen/random/RandomLong';
import { Random } from '../../../modules/data-gen/random/Random';

describe( 'RandomLongTest', () => {

    let random: RandomLong = new RandomLong( new Random() );

    it( 'generates a random value between min and max, inclusive', () => {
        const min = -2, max = 2;
        let val: number = random.between( min, max );
        expect( val ).toBeGreaterThanOrEqual( min );
        expect( val ).toBeLessThanOrEqual( max );
    } );

    it( 'generates a value greater than a min value', () => {
        const min = -2;
        let val: number = random.after( min );
        expect( val ).toBeGreaterThan( min );
    } );

    it( 'generates a value less than a max value', () => {
        const max = 2;
        let val: number = random.before( max );
        expect( val ).toBeLessThan( max );
    } );    

} );