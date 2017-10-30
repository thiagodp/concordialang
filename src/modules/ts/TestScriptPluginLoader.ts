import { TestScriptPluginData } from './TestScriptPluginData';
import { TestScriptPlugin } from './TestScriptPlugin';
import { JsonSchemaValidator } from '../schema/JsonSchemaValidator';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads plug-ins that generate and execute test scripts.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptPluginLoader {

    constructor( private _dir: string, private _fs: any = fs ) {
    }    

    /**
     * Loads a plugin.
     * 
     * @param data Plugin data.
     * @throws Error
     */
    public load( data: TestScriptPluginData ): TestScriptPlugin {
        const pluginFile = path.join( this._dir, data.file );
        const plugin = require( pluginFile );
        const obj = this.createInstance( plugin, data.class, [] );
        return obj as TestScriptPlugin;
    } 

    private createInstance( context: any, className: string, ...args: any[] ) {
        return new context[ className ]( ... args );
    }    

}