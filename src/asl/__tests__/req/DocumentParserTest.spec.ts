import { DocumentParser } from '../../modules/req/parser/DocumentParser';
import { KeywordDictionary } from '../../modules/req/parser/KeywordDictionary';

describe( 'DocumentParser Test', () => {

    let dict: KeywordDictionary = {
        feature: [ 'feature' ],
        scenario: [ 'scenario' ],
        import: [ 'import' ]
    };
    
    let parser = new DocumentParser( dict );

    it( 'detects a feature and its scenario', () => {
        let i = 0;
        parser.onLineRead( 'Feature: Hello', ++i );
        parser.onLineRead( 'Scenario: World', ++i );
        let doc = parser.result();
        expect( parser.errors() ).toHaveLength( 0 );

        expect( doc.feature ).not.toBeNull();
        expect( doc.feature.name ).toBe( 'Hello' );

        expect( doc.feature.scenarios ).toHaveLength( 1 );
        expect( doc.feature.scenarios[ 0 ] ).not.toBeNull();
        expect( doc.feature.scenarios[ 0 ].name ).toBe( 'World' );
    } );

    it( 'detects a import', () => {
        let i = 0;
        parser.onLineRead( 'Import "Hello"', ++i );
        let doc = parser.result();
        expect( parser.errors() ).toHaveLength( 0 );

        expect( doc.imports ).toEqual( [ 'Hello' ] );
    } );

} );