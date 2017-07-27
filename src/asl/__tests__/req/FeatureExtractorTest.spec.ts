import { FeatureExtractor } from '../../modules/req/extractor/FeatureExtractor';
import { Keywords } from '../../modules/req/extractor/Keywords';

describe( 'FeatureExtractor Test', () => {

    let words = [ 'feature' ];
    let extractor = new FeatureExtractor( words );

    it( 'detects a feature in a line', () => {
        let line = 'Feature: Hello world';
        expect( extractor.extract( line ) ).not.toBeNull();
    } );

    it( 'detects a feature in a line with spaces and tabs', () => {
        let line = "  \t  \t Feature: Hello world";
        expect( extractor.extract( line ) ).not.toBeNull()
    } );

    it( 'does not detect an inexistent feature in a line', () => {
        let line = 'Someelse: Hello world';
        expect( extractor.extract( line ) ).toBeNull()
    } );
    
    it( 'does not detect a feature when the word "feature" is not the first one', () => {
        let line = 'Not a feature: Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect a feature when the word "feature" is not followed by the title separator', () => {
        let line = 'Feature Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect a feature not followed by a colon', () => {
        let line = "feature feature : Hello world";
        expect( extractor.extract( line ) ).toBeNull();
    } );    

    it( 'detects a feature in the correct position', () => {
        let line = 'Feature: Hello world';
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: Keywords.FEATURE,
                name: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects a feature in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \tfeature \t : \t Hello world     ";
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: Keywords.FEATURE,
                name: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );

} );