import { DocumentParser } from '../../modules/req/parser/DocumentParser';
import { KeywordDictionary } from '../../modules/req/parser/KeywordDictionary';

describe( 'DocumentParser Test', () => {

    let dict: KeywordDictionary = {
        feature: [ 'feature' ],
        scenario: [ 'scenario' ],
        import: [ 'import' ]
    };
    
    let parser = new DocumentParser( dict );
    

    beforeEach( () => {
        parser.onStart();
    } );

    it( 'detects a feature', () => {
        let i = 0;
        parser.onLineRead( 'Feature: Hello', ++i );
        let doc = parser.result();
        expect( parser.errors() ).toHaveLength( 0 );

        expect( doc.features ).toHaveLength( 1 );
        expect( doc.features[ 0 ] ).not.toBeNull();
        expect( doc.features[ 0 ].name ).toBe( 'Hello' );
    } );


    it( 'detects a feature and its scenario', () => {
        let i = 0;
        parser.onLineRead( 'Feature: Hello', ++i );
        parser.onLineRead( 'Scenario: World', ++i );
        let doc = parser.result();
        expect( parser.errors() ).toHaveLength( 0 );

        let f = doc.features[ 0 ];
        expect( f.scenarios ).toHaveLength( 1 );
        expect( f.scenarios[ 0 ] ).not.toBeNull();
        expect( f.scenarios[ 0 ].name ).toBe( 'World' );
    } );    


    it( 'detects a import', () => {
        let i = 0;
        parser.onLineRead( 'Import "SomeFile"', ++i );
        let doc = parser.result();
        expect( parser.errors() ).toHaveLength( 0 );

        expect( doc.imports ).toHaveLength( 1 );
        expect( doc.imports[ 0 ] ).not.toBeNull();
        expect( doc.imports[ 0 ].content ).toEqual( 'SomeFile' );
    } );

} );