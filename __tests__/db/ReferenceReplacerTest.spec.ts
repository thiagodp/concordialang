import { QueryParser } from '../../modules/db/QueryParser';
import { ReferenceReplacer } from '../../modules/db/ReferenceReplacer';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ReferenceReplacerTest', () => {

    let replacer = new ReferenceReplacer(); // under test   


    it( 'replaces a query', () => {
        
        const query = 'SELECT [table1].fieldX, tbl2.fieldY, [table2].fieldY ' +
            'FROM [db].[table1], [table2], tbl3 ' +
            'LEFT JOIN [table3] AS tbl3' +
            '  ON tbl3.someField = {fieldB} ' +
            'WHERE [table1].fieldX = {fieldA} OR ' +
            '[table2].fieldY = [const1]';
        
        const result = replacer.replace( query,
            {
                'db': 'mydb'
            },
            {
                'table1': 'user',
                'table2': 'customer',
                'table3': 'employee'
            },
            {
                'fieldA': 'Jack',
                'fieldB': 'Jane'
            },
            {
                'const1': 'administrator'
            }
            );

        const expected = 'SELECT `user`.fieldX, tbl2.fieldY, `customer`.fieldY ' +
            'FROM `mydb`.`user`, `customer`, tbl3 ' +
            'LEFT JOIN `employee` AS tbl3' +
            '  ON tbl3.someField = \'Jane\' ' +            
            'WHERE `user`.fieldX = \'Jack\' OR ' +
            '`customer`.fieldY = \'administrator\'';

        expect( result ).toBe( expected );
    } );

} );