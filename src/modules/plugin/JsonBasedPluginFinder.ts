import { PluginFinder } from './PluginFinder';
import { PluginData } from './PluginData';
import { JsonSchemaValidator } from '../schema/JsonSchemaValidator';
import { FileUtil } from '../util/FileUtil';
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
            const files: string[] =
                ( new FileUtil( this._fs ) ).extractFilesFromDirectory( dir, [ 'json' ], false );
            if ( files.length > 0 ) {
                return resolve( files );
            } else {
                return reject( new Error( 'No plug-in configuration files found at "' + dir + '".' ) );
            }
        } );
    };

    public async loadConfigFile( file: string ): Promise< PluginData > {
        const read = util.promisify( this._fs.readFile );
        const content = await read( file );
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