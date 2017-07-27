import { NameBasedExtractor } from '../../modules/req/extractor/NamedNodeParser';
import { Keywords } from '../../modules/req/extractor/Keywords';

describe( 'NamedBasedExtractor Test', () => {

    let keyword = 'feature';
    let wordInsensitive = 'FeAtURe';
    let word = 'feature';
    let words = [ word ];    
    
    let extractor = new NameBasedExtractor( words, keyword );


    it( 'detects the name in a line', () => {
        let line = word + ': Hello world';
        expect( extractor.extract( line ) ).not.toBeNull();
    } );

    it( 'detects the name ignoring its case', () => {
        let line = wordInsensitive + ': Hello world';
        expect( extractor.extract( line ) ).not.toBeNull();
    } );    

    it( 'detects the name in a line with spaces and tabs', () => {
        let line = "  \t  \t " + word + ": Hello world";
        expect( extractor.extract( line ) ).not.toBeNull()
    } );    

    it( 'does not detect an inexistent name in a line', () => {
        let line = 'Someelse: Hello world';
        expect( extractor.extract( line ) ).toBeNull()
    } );
    
    it( 'does not detect the name when its word is not the first one', () => {
        let line = 'Not the ' + word + ': Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect the name when its word is not followed by its separator', () => {
        let line = word + ' Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect the name not followed by its separator', () => {
        let line = word + ' ' + word + ' : Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'detects the name in the correct position', () => {
        let line = word + ': Hello world';
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: keyword,
                name: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects the name in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \t" + word + " \t : \t Hello world     ";
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: keyword,
                name: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );    

} );