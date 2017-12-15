import { QueryParser } from '../../../modules/data-gen/db/QueryParser';
import { QueryReplacer } from '../../../modules/data-gen/db/QueryReplacer';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'QueryReplacerTest', () => {

    let replacer = new QueryReplacer(); // under test   


    it( 'replaces a query', () => {
        
        const query = 'SELECT {{table1}}.fieldX, tbl2.fieldY, {{table2}}.fieldY ' +
            'FROM {{db}}.{{table1}}, {{table2}}, tbl3 ' +
            'WHERE {{table1}}.fieldX = ${fieldA} OR ' +
            '{{table2}}.fieldY = {{const1}}';        
        
        const result = replacer.replace( query,
            {
                'db': 'mydb'
            },
            {
                'table1': 'user',
                'table2': 'customer'
            },
            {
                'fieldA': 'Jack'
            },
            {
                'const1': 'administrator'
            }
            );

        const expected = 'SELECT `user`.fieldX, tbl2.fieldY, `customer`.fieldY ' +
            'FROM `mydb`.`user`, `customer`, tbl3 ' +
            'WHERE `user`.fieldX = \'Jack\' OR ' +
            '`customer`.fieldY = \'administrator\'';

        expect( result ).toBe( expected );
    } );

} );