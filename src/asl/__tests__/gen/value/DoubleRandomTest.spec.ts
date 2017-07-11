import { DoubleRandom } from '../../../modules/gen/random/DoubleRandom';

describe( 'DoubleRandom Test', () => {

    let doubleRandom: DoubleRandom = new DoubleRandom();
    let delta: number = 0.0000000001;

    it( 'generates a random value between min and max, inclusive', () => {
        const x = 100;
        const min = x + delta;
        const max = x + ( delta * 2 );
        let val: number = doubleRandom.between( min, max );
        expect( val ).toBeGreaterThanOrEqual( min );
        expect( val ).toBeLessThanOrEqual( max );
    } );

    it( 'generates a value greater than a min value', () => {
        const min = -2.0;
        let val: number = doubleRandom.after( min, delta );
        expect( val ).toBeGreaterThan( min );
    } );

    it( 'generates a value less than a max value', () => {
        const max = 2.0;
        let val: number = doubleRandom.before( max, delta );
        expect( val ).toBeLessThan( max );
    } );    

} );