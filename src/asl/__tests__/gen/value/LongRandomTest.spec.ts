import { LongRandom } from '../../../modules/gen/value/LongRandom';

describe( 'LongRandom Test', () => {

    let longRandom: LongRandom = new LongRandom();

    it( 'generates a random value between min and max', () => {
        const min = -2, max = 2;
        let val: number = longRandom.between( min, max );
        expect( val ).toBeGreaterThanOrEqual( min );
        expect( val ).toBeLessThanOrEqual( max );
    } );

} );