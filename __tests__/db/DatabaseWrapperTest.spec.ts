import { Location } from '../../modules/ast/Location';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { Database, DatabaseProperties, DatabaseProperty } from '../../modules/ast/Database';
import { DatabaseWrapper } from '../../modules/db/DatabaseWrapper';
import * as path from 'path';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'DatabaseWrapperTest', () => {

    let wrapper: DatabaseWrapper = null;
    const testDatabasePath: string = path.join( process.cwd(), '/__tests__/db/users.json' );

    let makeDB = ( name, path ): Database => {
        return {
            nodeType: NodeTypes.DATABASE,
            location: {},
            name: name,
            items: [
                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 1, column: 1 } as Location,
                    property: DatabaseProperties.TYPE,
                    value: 'json',
                    content: 'type is json'
                } as DatabaseProperty,

                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 2, column: 1 } as Location,
                    property: DatabaseProperties.PATH,
                    value: path,
                    content: 'path is "' + path + '"' 
                } as DatabaseProperty
                /*
                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 3, column: 1 } as Location,
                    property: DatabaseProperties.USERNAME,
                    value: 'root',
                    content: 'username is root'
                } as DatabaseProperty
                */
            ]
        } as Database
    };

    let makeValidDB = () => {
        //console.log( testDatabasePath );
        return makeDB( 'JSON Test DB', testDatabasePath );
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
        let db = makeValidDB();
        try {
            let ok = await wrapper.connect( db );
            expect( ok ).toBeTruthy();
            let isConnected = await wrapper.isConnected();
            expect( isConnected ).toBeTruthy();
        } catch ( e ) {
            fail( e );
        }
    } );

    /* DISABLED BECAUSE sqlite ALLOWS CONNECTING TO NON EXISTENT DATABASES.
    it( 'fails when trying to connect to a non existing database', async () => {        
        let db = makeDB( 'Non Existent DB', './non-existing-db.sqlite' );
        try {
            await wrapper.connect( db );
            fail( 'Should not connect' );
        } catch ( e ) {
            expect( e.message ).toMatch( /unknown database/i );
        }

    } );
    */

    it( 'is able to verify whether is connected', async () => {
        try {
            let isConnected = await wrapper.isConnected();
            expect( isConnected ).toBeFalsy();
        } catch ( e ) {
            fail( e );
        }        
    } );

    it( 'is able to query', async () => {
        let db = makeValidDB();
        try {
            await wrapper.connect( db );
            let results = await wrapper.query(
                'SELECT * WHERE name LIKE ?',
                [ 'Bob' ]
                );
            //console.log( results );
            expect( results ).toBeDefined();
            expect( results ).toHaveLength( 1 );
            const firstObj = results[ 0 ];
            expect( firstObj ).toHaveProperty( "username" );
            expect( firstObj.username ).toBe( 'bob' );
        } catch ( e ) {
            fail( e );
        }        
    } );


} );