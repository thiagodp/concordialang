import { Location } from '../../../modules/ast/Location';
import { NodeTypes } from '../../../modules/req/NodeTypes';
import { Database, DatabaseProperties, DatabaseProperty } from '../../../modules/ast/DataSource';
import { DatabaseWrapper } from '../../../modules/data-gen/db/DatabaseWrapper';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'DatabaseWrapperTest', () => {

    let wrapper: DatabaseWrapper = null;

    let makeDB = ( name ): Database => {
        return {
            nodeType: NodeTypes.DATABASE,
            location: {},
            name: name,
            items: [
                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 1, column: 1 } as Location,
                    property: DatabaseProperties.TYPE,
                    value: 'mysql',
                    content: 'type is mysql'
                } as DatabaseProperty,

                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 2, column: 1 } as Location,
                    property: DatabaseProperties.USERNAME,
                    value: 'root',
                    content: 'username is root'
                } as DatabaseProperty
            ]
        } as Database
    };


    beforeEach( () => {
        wrapper = new DatabaseWrapper();
    } );

    afterEach( async () => {
        if ( await wrapper.isConnected() ) {
            await wrapper.disconnect();
        }
    } );


    it( 'is able to connect to an existing database', async () => {
        let db = makeDB( 'mysql' );
        try {
            let ok = await wrapper.connect( db );
            expect( ok ).toBeTruthy();
            let isConnected = await wrapper.isConnected();
            expect( isConnected ).toBeTruthy();
        } catch ( e ) {
            fail( e );
        }
    } );

    it( 'fails when trying to connect to a non existing database', async () => {        
        let db = makeDB( 'ds98d9' );
        try {
            await wrapper.connect( db );
            fail( 'Should not connect' );
        } catch ( e ) {
            expect( e.message ).toMatch( /unknown database/i );
        }

    } );

    it( 'is able to verify whether is connected', async () => {
        try {
            let isConnected = await wrapper.isConnected();
            expect( isConnected ).toBeFalsy();
        } catch ( e ) {
            fail( e );
        }        
    } );

    it( 'is able to query', async () => {
        let db = makeDB( 'mysql' );
        try {
            await wrapper.connect( db );
            let result = await wrapper.query(
                'SELECT url FROM help_topic WHERE name LIKE ?',
                [ 'CONTAINS' ]
                );
            //console.log( result );
            expect( result ).toBeDefined();
        } catch ( e ) {
            fail( e );
        }        
    } );


} );