import { NameBasedExtractor } from '../../modules/req/extractor/NameBasedExtractor';
import { Keywords } from '../../modules/req/extractor/Keywords';
import { QuoteBasedExtractor } from "../../modules/req/extractor/QuoteBasedExtractor";

describe( 'QuoteBasedExtractor Test', () => {

    let keyword = 'import';
    let wordInsensitive = 'ImPorT';
    let word = 'import';
    let words = [ word ];    
    
    let extractor = new QuoteBasedExtractor( words, keyword );


    it( 'detects the content in a line', () => {
        let line = word + ' "Hello world"';
        expect( extractor.extract( line ) ).not.toBeNull();
    } );

    it( 'detects the content ignoring its case', () => {
        let line = wordInsensitive + ' "Hello world"';
        expect( extractor.extract( line ) ).not.toBeNull();
    } );    

    it( 'detects the content in a line with spaces and tabs', () => {
        let line = "  \t  \t " + word + ' "Hello world"';
        expect( extractor.extract( line ) ).not.toBeNull()
    } );    

    it( 'does not detect an inexistent keyword in a line', () => {
        let line = 'Someelse "Hello world"';
        expect( extractor.extract( line ) ).toBeNull()
    } );
    
    it( 'does not detect the content when its word is not the first one', () => {
        let line = 'Not the ' + word + ' "Hello world"';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect the content when its word is not surrounded by quotes', () => {
        let line = word + ' Hello world';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'does not detect the content not followed by its separator', () => {
        let line = word + ' ' + word + ' "Hello world"';
        expect( extractor.extract( line ) ).toBeNull();
    } );

    it( 'detects the content in the correct position', () => {
        let line = word + ' "Hello world"';
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: keyword,
                content: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects the content in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \t" + word + " \t " + '"Hello world"';
        let node = extractor.extract( line, 1 );
        expect( node ).toEqual(
            {
                keyword: keyword,
                content: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );    

} );