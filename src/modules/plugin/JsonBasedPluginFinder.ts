import { PluginFinder } from './PluginFinder';
import { PluginData } from './PluginData';
import { JsonSchemaValidator } from '../schema/JsonSchemaValidator';
import * as filewalker from 'filewalker';
import * as fs from 'fs';
import * as util from 'util';

/**
 * JSON-based test script plug-in finder.
 * 
 * @author Thiago Delgado Pinto
 */
export class JsonBasedPluginFinder implements PluginFinder {

    constructor( private _dir: string, private _fs: any = fs ) {
    }

    public async find(): Promise< PluginData[] > {
        let files: string[] = await this.readConfigFiles( this._dir );
        let plugins: PluginData[] = [];
        for ( let file of files ) {
            let plugin = await this.loadConfigFile( file );
            plugins.push( plugin );
        }
        return plugins;
    };

    public readConfigFiles = ( dir: string ): Promise< string[] > => {

        return new Promise< string[] >( ( resolve, reject ) => {

            const options = {
                maxPending: -1,
                maxAttempts: 0,
                attemptTimeout: 1000,
                matchRegExp: new RegExp( '\\.json$' )
            };

            let files: string[] = [];

            filewalker( dir, options )
                .on( 'file', ( relPath, stats, absPath ) => files.push( absPath ) )
                .on( 'error', ( err ) => reject( err ) )
                .on( 'done', () => resolve( files ) )
                .walk()
                ;
        } );
    };

    public async loadConfigFile( filePath: string ): Promise< PluginData > {
        const read = util.promisify( this._fs.readFile );
        const content = await read( filePath );
        return this.processConfigFileData( content );
    }

    public async processConfigFileData( data: string ): Promise< PluginData > {
        const schema = ''; // TO-DO
        if ( schema.length > 0 ) {
            ( new JsonSchemaValidator() ).validate( data, schema ); // may throw
        }
        return JSON.parse( data ); // may throw
    }

}