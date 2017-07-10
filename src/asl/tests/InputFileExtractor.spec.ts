import { InputFileExtractor } from '../InputFileExtractor';

describe( 'InputFileExtractor Test', function() {

    it( 'analyzes current dir', function() {
        let e = new InputFileExtractor( [ 'ts' ] );
        let input = [ 'tests' ];
        let flags = {};
        let files = e.extract( input, flags );
        expect( files.length ).toBeGreaterThan( 0 );
    } );    

} );