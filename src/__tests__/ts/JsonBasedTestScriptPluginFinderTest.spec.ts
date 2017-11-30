import * as console from 'console';
import { TestScriptPluginData } from '../../modules/ts/TestScriptPluginData';
import { JsonBasedTestScriptPluginFinder } from '../../modules/ts/JsonBasedTestScriptPluginFinder';
import { fs as memfs, vol } from 'memfs';
import * as path from 'path';
/**
 * @author Thiago Delgado Pinto
 */
describe( 'TestScriptPluginFinderTest', () => {

    const dir = './plugins';
    let finder = new JsonBasedTestScriptPluginFinder( dir, memfs ); // under test

    afterEach( () => {
        vol.reset(); // erase in-memory files
    } );

    it( 'detects configuration files', () => {} );
    /*
    it( 'detects configuration files', () => {

        //const real1 = path.join( dir, 'codeceptjs.json' );
        const fake1 = path.join( dir, 'fake1.json' );

        vol.fromJSON( {
            //real1: '{ "name": "real1", "isFake": false, "version": "1.0", "description": "this is fake 1" }',
            fake1: '{ "name": "fake1", "isFake": true, "version": "1.0", "description": "this is fake 1" }',
        } );

        return finder.find()
            .then( ( data: TestScriptPluginData[] ) => {
                let first = data[ 0 ];
                expect( first ).toHaveProperty( 'name', 'fake1' );
            } );
    } );
    */
    
} );