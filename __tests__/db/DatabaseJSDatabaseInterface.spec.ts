import * as path from 'path';
import { Location } from 'concordialang-types';

import { Database, DatabaseProperties, DatabaseProperty } from '../../modules/ast';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { DatabaseJSDatabaseInterface } from '../../modules/db';

describe( 'DatabaseJSDatabaseInterface', () => {

    let dbi: DatabaseJSDatabaseInterface = null; // under test

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
        dbi = new DatabaseJSDatabaseInterface();
    } );

    afterEach( async () => {
        if ( await dbi.isConnected() ) {
            await dbi.disconnect();
        }
    } );


    it( 'is able to connect to an existing database', async () => {
        let db = makeValidDB();
        try {
            let ok = await dbi.connect( db );
            expect( ok ).toBeTruthy();
            let isConnected = await dbi.isConnected();
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
            let isConnected = await dbi.isConnected();
            expect( isConnected ).toBeFalsy();
        } catch ( e ) {
            fail( e );
        }
    } );

    it( 'is able to query', async () => {
        let db = makeValidDB();
        try {
            await dbi.connect( db );
            let results = await dbi.query(
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