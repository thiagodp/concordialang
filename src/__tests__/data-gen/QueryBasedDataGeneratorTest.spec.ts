import { QueryBasedDataGenerator } from "../../modules/data-gen/QueryBasedDataGenerator";
import { RandomLong } from "../../modules/data-gen/random/RandomLong";
import { Random } from "../../modules/data-gen/random/Random";
import { StringGenerator } from "../../modules/data-gen/raw/StringGenerator";
import { RandomString } from "../../modules/data-gen/random/RandomString";
import { QueryCache } from "../../modules/db/QueryCache";
import { Queryable } from "../../modules/db/Queryable";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'QueryBasedDataGeneratorTest', () => {


    class FakeQueryable implements Queryable {

        constructor( private _values: any[] ) {
        }

        /** @inheritDoc */
        public query = async (cmd: string, params?: any): Promise< any[] > => {
            return this._values;
        };

    }

    /// Generates a function for using in a describe() declaration
    let check = ( gen: QueryBasedDataGenerator< any > ) => {

        return () => {

            it( 'first element', async () => {
                const val = await gen.firstElement();
                expect( val ).toBe( 'one' );
            } );

            it( 'second element', async () => {
                const val = await gen.secondElement();
                expect( val ).toBe( 'two' );
            } );

            it( 'random element', async () => {
                const val = await gen.randomElement();
                expect( [ 'one', 'two', 'three', 'four', 'five' ] ).toContain( val );
            } );

            it( 'penultimate element', async () => {
                const val = await gen.penultimateElement();
                expect( val ).toBe( 'four' );
            } );

            it( 'last element', async () => {
                const val = await gen.lastElement();
                expect( val ).toBe( 'five' );
            } );

        };

    };


    const rand = new Random();
    const randL = new RandomLong( rand );
    const strGen = new StringGenerator( new RandomString( rand ) );
    const queryCache = new QueryCache();    

    let rawValueGen: QueryBasedDataGenerator< any > = new QueryBasedDataGenerator(
        randL,
        strGen,
        new FakeQueryable( [
            [ 'one', 1 ],
            [ 'two', 2 ],
            [ 'three', 3 ],
            [ 'four', 4 ],
            [ 'five', 5 ]
        ] ),
        queryCache,
        'SELECT whathever FROM doesnt_matter'
    );        

    let objValueGen: QueryBasedDataGenerator< any > = new QueryBasedDataGenerator(
        randL,
        strGen,
        new FakeQueryable( [
            { 'f1': 'one', 'f2': 1 },
            { 'f1': 'two', 'f2': 2 },
            { 'f1': 'three', 'f2': 3 },
            { 'f1': 'four', 'f2': 4 },
            { 'f1': 'five', 'f2': 5 }
        ] ),
        queryCache,
        'SELECT whathever FROM doesnt_matter'
    );


    describe( 'raw value', check( rawValueGen ) );

    describe( 'object value', check( objValueGen ) );

} );