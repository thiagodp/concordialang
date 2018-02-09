import { RandomString } from "../../../modules/testdata/random/RandomString";
import { Random } from "../../../modules/testdata/random/Random";

describe( 'RandomStringTest', () => {

    let random = new RandomString( new Random() );

    it( 'can generate an empty string', () => {
        expect( random.exactly( 0 ) ).toBe( '' );
        expect( random.between( 0, 0 ) ).toBe( '' );
    } );

    it( 'can generate certain string sizes, exactly', () => {
        expect( random.exactly( 1 ) ).toHaveLength( 1 );
        expect( random.exactly( 100 ) ).toHaveLength( 100 );
        expect( random.exactly( 1000 ) ).toHaveLength( 1000 );
    } );

    it( 'can generate strings with length between values', () => {
        expect( random.between( 1, 1 ) ).toHaveLength( 1 );
        expect( random.between( 10, 60 ).length ).toBeLessThanOrEqual( 60 );
        expect( random.between( 10, 60 ).length ).toBeGreaterThanOrEqual( 10 );
    } );
    
} );