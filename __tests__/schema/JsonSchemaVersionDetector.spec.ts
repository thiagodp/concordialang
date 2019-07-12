import { JsonSchemaVersionDetector } from '../../modules/schema/JsonSchemaVersionDetector';

describe( 'JsonSchemaVersionDetector', () => {

    it( 'does not detect in an invalid content object', () => {
        let detector = new JsonSchemaVersionDetector( 'notfoo' );
        let contentObj = { 'foo': 'bar' };
        expect( detector.detect( contentObj ) ).toBeNull();
    } );

    it( 'does not detect in an invalid content string', () => {
        let detector = new JsonSchemaVersionDetector( 'notfoo' );
        let contentStr = '{ "foo": "bar" }';
        expect( detector.detect( contentStr ) ).toBeNull();
    } );

    it( 'detects in an valid content object', () => {
        let detector = new JsonSchemaVersionDetector( 'foo' );
        let content = { 'foo': 'bar' };
        expect( detector.detect( content ) ).toBe( 'bar' );
    } );

    it( 'detects in an valid content string', () => {
        let detector = new JsonSchemaVersionDetector( 'foo' );
        let contentStr = '{ "foo": "bar" }';
        expect( detector.detect( contentStr ) ).toBe( 'bar' );
    } );

} );