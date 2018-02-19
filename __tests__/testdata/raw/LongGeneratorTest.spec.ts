import { LongGenerator } from "../../../modules/testdata/raw/LongGenerator";
import { RandomLong } from "../../../modules/testdata/random/RandomLong";
import { Random } from "../../../modules/testdata/random/Random";

describe( 'LongGeneratorTest', () => {

    const ranL = new RandomLong( new Random( 'concordia' ) );
    const aMin: number = 0;
    const aMax: number = 10;
    const aMedian: number = 5;
    const gen: LongGenerator = new LongGenerator( ranL, aMin, aMax ); // under test

    it( 'random below min', () => {
        expect( gen.randomBelowMin() ).toBeLessThan( aMin );
    } );    

    it( 'just below min', () => {
        expect( gen.justBelowMin() ).toBe( aMin - 1 );
    } );
    
    it( 'just above min', () => {
        expect( gen.justAboveMin() ).toBe( aMin + 1 );
    } );    

    it( 'median value', () => {
        expect( gen.median() ).toBe( aMedian );
        const gen2: LongGenerator = new LongGenerator( ranL, 1, 1 );
        expect( gen2.median() ).toBe( 1 );
    } );
    
    it( 'random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect( val ).toBeGreaterThan( aMin );
        expect( val ).toBeLessThan( aMax );
    } );

    it( 'just below max', () => {
        expect( gen.justBelowMax() ).toBe( aMax - 1 );
    } );

    it( 'just above max', () => {
        expect( gen.justAboveMax() ).toBe( aMax + 1 );
    } );

    it( 'random above max', () => {
        expect( gen.randomAboveMax() ).toBeGreaterThan( aMax );
    } );
    
} );