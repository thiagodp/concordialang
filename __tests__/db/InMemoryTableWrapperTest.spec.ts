import { InMemoryTableWrapper } from '../../modules/db/InMemoryTableWrapper';
import { Table } from '../../modules/ast/Table';
import { Parser } from '../../modules/parser/Parser';
import { Lexer } from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import { Options } from '../../modules/app/Options';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { resolve } from 'path';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'InMemoryTableWrapperTest', () => {

    let wrapper = new InMemoryTableWrapper(); // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options, 'en' );


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

        await wrapper.connect( table );

        const data = await wrapper.query( 'SELECT * FROM foo WHERE b <= 3.01', {} as any );

        expect( data[ 0 ].a ).toBe( 1 );
        expect( data[ 0 ].b ).toBe( 2.01 );
        expect( data[ 0 ].c ).toBe( 'three' );
        expect( data[ 0 ].d ).toBe( '2017-01-04' );
        expect( data[ 0 ].e ).toBe( '05:06:07' );
        expect( data[ 0 ].f ).toBe( '2017-01-06 08:09:10' );
        expect( data[ 0 ].g ).toBe( true );
    } );

} );