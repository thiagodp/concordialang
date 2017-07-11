import { LongRandom } from '../../../modules/gen/random/LongRandom';

describe( 'LongRandom Test', () => {

    let longRandom: LongRandom = new LongRandom();

    it( 'generates a random value between min and max, inclusive', () => {
        const min = -2, max = 2;
        let val: number = longRandom.between( min, max );
        expect( val ).toBeGreaterThanOrEqual( min );
        expect( val ).toBeLessThanOrEqual( max );
    } );

    it( 'generates a value greater than a min value', () => {
        const min = -2;
        let val: number = longRandom.after( min );
        expect( val ).toBeGreaterThan( min );
    } );

    it( 'generates a value less than a max value', () => {
        const max = 2;
        let val: number = longRandom.before( max );
        expect( val ).toBeLessThan( max );
    } );    

} );