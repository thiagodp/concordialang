import { RuleBuilder } from '../../modules/nlp/RuleBuilder';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'RuleBuilderTest', () => {

    let builder = new RuleBuilder(); // under test

    it( 'produces objects with properties of the list object and the default object', () => {
        let r = builder.build( [ { foo: 'bar' } ], { one: 1 } );
        expect( r ).toHaveLength( 1 );
        let first = r[ 0 ];
        expect( first ).toHaveProperty( 'foo', 'bar' );
        expect( first ).toHaveProperty( 'one', 1 );
    } );

    it( 'overwrites default properties', () => {
        let r = builder.build( [ { foo: 'bar', one: 2 } ], { one: 1 } );
        expect( r ).toHaveLength( 1 );
        let first = r[ 0 ];
        expect( first ).toHaveProperty( 'one', 2 );
    } );    

} );