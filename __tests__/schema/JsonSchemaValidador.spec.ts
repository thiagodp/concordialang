import jsonSchemaGenerator = require( 'json-schema-generator' );

import { JsonSchemaValidator } from '../../modules/schema/JsonSchemaValidator';

describe( 'JsonSchemaValidador', () => {

    let v = new JsonSchemaValidator();

    it( 'throws an exception when receives an empty content object', () => {
        let content = {};
        let schema = jsonSchemaGenerator( { "foo": "bar" } );
        expect( () => { v.validate( content, schema ) } ).toThrow();
    } );

    it( 'throws an exception when receives an incompatible content object', () => {
        let content = { 'nonfoo': 'bar' };
        let schema = jsonSchemaGenerator( { "foo": "bar" } );
        expect( () => { v.validate( content, schema ) } ).toThrow();
    } );

    it( 'does not throw an exception when receives an compatible content object', () => {
        let content = { 'foo': 'zaa' };
        let schema = jsonSchemaGenerator( { "foo": "bar" } );
        expect( () => { v.validate( content, schema ) } ).not.toThrow();
    } );


} );
