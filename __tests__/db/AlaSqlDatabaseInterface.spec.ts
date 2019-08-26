import { resolve } from 'path';

import { Document, Table, Database, DatabaseProperties, DatabaseProperty } from '../../modules/ast';
import { AlaSqlDatabaseInterface } from '../../modules/db';
import { Parser } from '../../modules/parser/Parser';
import { Lexer } from '../../modules/lexer/Lexer';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { Options } from '../../modules/app/Options';
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'AlaSqlDatabaseInterface', () => {

    let dbi: AlaSqlDatabaseInterface; // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options, 'en' );

    beforeAll( () => {
        dbi = new AlaSqlDatabaseInterface();

        const db: Database = {
            name: 'test_database',
            nodeType: NodeTypes.DATABASE,
            location: { line: 1, column: 1 },
            items: [
                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: {},
                    property: DatabaseProperties.TYPE,
                    value: 'alasql',
                    content: 'type is alasql'
                } as DatabaseProperty
            ]
        };

        dbi.connect( db );
    } );

    afterAll( () => {
        dbi = null;
    } );

    it( 'creates a database table from a table node', async () => {

        [
            'Table: foo',
            '|a|b   |c    |d         |e       |f                  |g    |',
            '|1|2.01|three|2017-01-04|05:06:07|2017-01-06 08:09:10|true |',
            '|2|3.01|four |2017-01-05|06:07:08|2017-01-07 09:10:11|false|',
            '|3|4.01|five |2017-01-05|06:07:08|2017-01-07 09:10:11|false|'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        let doc: Document = {};
        parser.analyze( lexer.nodes(), doc );
        const table: Table = doc.tables[ 0 ];

        await dbi.createTable( table );
        const data = await dbi.query( 'SELECT * FROM foo WHERE b <= 3.01', {} as any );

        expect( data[ 0 ].a ).toBe( 1 );
        expect( data[ 0 ].b ).toBe( 2.01 );
        expect( data[ 0 ].c ).toBe( 'three' );
        expect( data[ 0 ].d ).toBe( '2017-01-04' );
        expect( data[ 0 ].e ).toBe( '05:06:07' );
        expect( data[ 0 ].f ).toBe( '2017-01-06 08:09:10' );
        expect( data[ 0 ].g ).toBe( true );
    } );

} );