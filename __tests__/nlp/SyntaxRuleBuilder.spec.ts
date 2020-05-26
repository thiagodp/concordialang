import { Entities } from '../../modules/nlp';
import { SyntaxRule } from '../../modules/nlp/syntax/SyntaxRule';
import { SyntaxRuleBuilder } from '../../modules/nlp/syntax/SyntaxRuleBuilder';

describe( 'SyntaxRuleBuilder', () => {

    let builder = new SyntaxRuleBuilder(); // under test

    it( 'produces objects with properties of the list object and the default object', () => {
        const rules: Array< SyntaxRule > = [
            { minTargets: 1 }
        ];
        const defaultRule: SyntaxRule = {
            maxTargets: 2,
            targets: [
                Entities.VALUE
            ]
        };
        const r = builder.build( rules, defaultRule );
        expect( r ).toHaveLength( 1 );
        const first = r[ 0 ];
        expect( first ).toHaveProperty( 'minTargets', 1 );
        expect( first ).toHaveProperty( 'maxTargets', 2 );
        expect( first ).toHaveProperty( 'targets' );
    } );

    it( 'overwrites default properties', () => {
        const rules: Array< SyntaxRule > = [
            { minTargets: 2 }
        ];
        const defaultRule: SyntaxRule = {
            minTargets: 1,
            maxTargets: 3,
            targets: [
                Entities.VALUE
            ]
        };
        const r = builder.build( rules, defaultRule );
        expect( r ).toHaveLength( 1 );
        const first = r[ 0 ];
        expect( first ).toHaveProperty( 'minTargets', 2 );
    } );

} );
