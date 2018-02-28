import { FileInstrumentator, Instrumentator, DefaultInstrumentator } from "../../modules/plugin/Instrumentator";

describe( 'InstrumentatorTest', () => {

    describe( 'DefaultInstrumentator', () => {

        let i: Instrumentator = new DefaultInstrumentator();

        describe( 'retrieve spec file', () => {

            it( 'does not - from a wrong comment', () => {
                expect( i.retrieveSpecFile( 'test(); // foo' ) ).toBeNull();
                expect( i.retrieveSpecFile( 'test(); // spec foo' ) ).toBeNull();
            } );

            it( 'does - in a case insensitive way', () => {
                expect( i.retrieveSpecFile( '// spec: foo.feature' ) ).toEqual( 'foo.feature' );
                expect( i.retrieveSpecFile( '// SPEC: foo.feature' ) ).toEqual( 'foo.feature' );
            } );

            it( 'does - with spaces after the file name', () => {
                expect( i.retrieveSpecFile( '// spec: foo.feature   ' ) ).toEqual( 'foo.feature' );
            } );
            
            it( 'does - with spaces before the keyword', () => {
                expect( i.retrieveSpecFile( '//      spec: foo.feature' ) ).toEqual( 'foo.feature' );
            } );

            it( 'does - with spaces betweem the keyword and the file name', () => {
                expect( i.retrieveSpecFile( '// spec   :     foo.feature' ) ).toEqual( 'foo.feature' );
            } );            
            
        } );

        describe( 'retrieve spec line number', () => {

            it( 'does not - from a wrong comment', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // foo' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // line 1' ) ).toBeNull();
                expect( i.retrieveSpecLineNumber( 'test(); // line: foo' ) ).toBeNull();
            } );

            it( 'does - in a case insensitive way', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // line: 1' ) ).toBe( 1 );
                expect( i.retrieveSpecLineNumber( 'test(); // LINE: 1' ) ).toBe( 1 );
            } );

            it( 'does - with spaces after the line number', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // line: 1    ' ) ).toBe( 1 );
            } );
            
            it( 'does - with spaces before the keyword', () => {
                expect( i.retrieveSpecLineNumber( 'test(); //        line: 1' ) ).toBe( 1 );
            } );

            it( 'does - with no spaces before the keyword', () => {
                expect( i.retrieveSpecLineNumber( 'test(); //line: 1' ) ).toBe( 1 );
            } );            

            it( 'does - with spaces betweem the keyword and the line number', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // line    :      1' ) ).toBe( 1 );
            } );
            
            it( 'does - for a big number', () => {
                expect( i.retrieveSpecLineNumber( 'test(); // line: 999999999999' ) ).toBe( 999999999999 );
            } );            

        } );

    } );

} );