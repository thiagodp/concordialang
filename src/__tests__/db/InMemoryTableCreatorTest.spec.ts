import { Table } from '../../modules/ast/Table';
import { Parser } from '../../modules/parser/Parser';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { Lexer } from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import { InMemoryTableCreator } from '../../modules/db/InMemoryTableCreator';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'InMemoryTableCreatorTest', () => {

    let creator = new InMemoryTableCreator(); // under test

    let parser = new Parser();
    
    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        { 'en': new EnglishKeywordDictionary() }
    );

    let lexer: Lexer = new Lexer( 'en', loader );


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

        const inMemoryTable = await creator.createFromNode( table );        

        const data = await inMemoryTable.query( 'SELECT * FROM foo WHERE b <= 3.01', {} );

        expect( data[ 0 ].a ).toBe( 1 );
        expect( data[ 0 ].b ).toBe( 2.01 );
        expect( data[ 0 ].c ).toBe( 'three' );
        expect( data[ 0 ].d ).toBe( '2017-01-04' );
        expect( data[ 0 ].e ).toBe( '05:06:07' );
        expect( data[ 0 ].f ).toBe( '2017-01-06 08:09:10' );
        expect( data[ 0 ].g ).toBe( true );
    } );

} );