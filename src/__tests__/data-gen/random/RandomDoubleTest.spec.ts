import { RandomDouble } from '../../../modules/data-gen/random/RandomDouble';
import { Random } from '../../../modules/data-gen/random/Random';

describe( 'RandomDoubleTest', () => {

    let random: RandomDouble = new RandomDouble( new Random() );
    let delta: number = 0.0000000001;

    it( 'generates a random value between min and max, inclusive', () => {
        const x = 100;
        const min = x + delta;
        const max = x + ( delta * 2 );
        let val: number = random.between( min, max );
        expect( val ).toBeGreaterThanOrEqual( min );
        expect( val ).toBeLessThanOrEqual( max );
    } );

    it( 'generates a value greater than a min value', () => {
        const min = -2.0;
        let val: number = random.after( min, delta );
        expect( val ).toBeGreaterThan( min );
    } );

    it( 'generates a value less than a max value', () => {
        const max = 2.0;
        let val: number = random.before( max, delta );
        expect( val ).toBeLessThan( max );
    } );    

} );