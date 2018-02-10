import { DataGenerator, DataGenConfig } from "../../modules/testdata/DataGenerator";
import { Random } from "../../modules/testdata/random/Random";
import { DataTestCase } from "../../modules/testdata/DataTestCase";
import { ValueType } from "../../modules/util/ValueTypeDetector";

describe( 'DataGeneratorTest', () => {

    let gen: DataGenerator;

    beforeEach( () => {
        gen = new DataGenerator( new Random( '123' ) );
    } );

    afterEach( () => {
        gen = null;
    } );

    describe( 'value', () => {

        it( 'VALUE_LOWEST', async () => {
            let cfg = new DataGenConfig( ValueType.INTEGER );
            cfg.min = 10;
            const val = await gen.generate( DataTestCase.VALUE_LOWEST, cfg );
            expect( val ).toBeLessThan( cfg.min );
        } );

    } );

} );