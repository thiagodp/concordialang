import { DoubleGenerator } from "../../../modules/data-gen/raw/DoubleGenerator";
import { RandomDouble } from "../../../modules/data-gen/random/RandomDouble";
import { Random } from "../../../modules/data-gen/random/Random";

describe( 'DoubleGeneratorTest', () => {

    let ranD = new RandomDouble( new Random() );

    it( 'just below min', () => {

        const gen2: DoubleGenerator = new DoubleGenerator( ranD, 0.00, 1.00 );
        expect( gen2.justBelowMin() ).toBeCloseTo( -0.01, 10 );

        const gen1: DoubleGenerator = new DoubleGenerator( ranD, 0, 1, 0.01 );
        expect( gen1.justBelowMin() ).toBeCloseTo( -0.01, 10 );

    } );    

    it( 'median value', () => {

        const gen1: DoubleGenerator = new DoubleGenerator( ranD, 0, 10 );
        expect( gen1.median() ).toBeCloseTo( 5, 10 );

        const gen2: DoubleGenerator = new DoubleGenerator( ranD, 1, 1 );
        expect( gen2.median() ).toBeCloseTo( 1, 10 );

    } );

    

} );