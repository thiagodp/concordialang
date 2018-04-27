import { InstrumentationReader, DefaultInstrumentationReader } from "../../modules/plugin/InstrumentationReader";

describe( 'InstrumentatorTest', () => {

    describe( 'DefaultInstrumentator', () => {

        let i: InstrumentationReader = new DefaultInstrumentationReader();

        describe( 'retrieve spec file', () => {

            const word = 'source';

            it( 'does not - from a wrong comment', () => {
                expect( i.retrieveSpecFile( 'test(); // foo' ) ).toBeNull();
                expect( i.retrieveSpecFile( `test(); // ${word} foo` ) ).toBeNull();
                expect( i.retrieveSpecFile( `anything // ${word}: path/to/foo.ext` ) ).toBeNull();
            } );

            it( 'does - in a case insensitive way', () => {
                expect( i.retrieveSpecFile( `// ${word}: foo.feature` ) ).toEqual( 'foo.feature' );
                expect( i.retrieveSpecFile( `// ${word}: foo.feature` ) ).toEqual( 'foo.feature' );
            } );

            it( 'does - with spaces after the file name', () => {
                expect( i.retrieveSpecFile( `// ${word}: foo.feature   ` ) ).toEqual( 'foo.feature' );
            } );

            it( 'does - with spaces before the keyword', () => {
                expect( i.retrieveSpecFile( `//      ${word}: foo.feature` ) ).toEqual( 'foo.feature' );
            } );

            it( 'does - with spaces betweem the keyword and the file name', () => {
                expect( i.retrieveSpecFile( `// ${word}   :     foo.feature` ) ).toEqual( 'foo.feature' );
            } );

        } );

        describe( 'retrieve spec line number', () => {

            it( 'does not - from a wrong comment', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // foo' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // 1' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // (1) foo' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // (1,) foo' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // (,2) foo' ) ).toBeNull();
            } );

            it( 'does - with prior comments', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // (3,4) foo // (1,2) FOO' ) ).toBe( 1 );
            } );

            it( 'does - with spaces before', () => {
                expect( i.retrieveSpecLineNumber( 'test(); //       (50,7)' ) ).toBe( 50 );
            } );

            it( 'does - for a big number', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // (999999999999,3)' ) ).toBe( 999999999999 );
            } );

        } );

    } );

} );