import { Location  } from "../ast/Location";
import { RuntimeException } from '../req/RuntimeException';
import { Warning } from '../req/Warning';
import * as readline from 'readline';

 /**
  * 
  * @author Thiago Delgado Pinto
  */
export class DefaultInstrumentator {

    constructor( private _fs: any, private _encoding: string = 'utf-8' ) {
    }

    public generateSpecFileInstrumentation( specFile: string ): string {
        return '// spec: ' + specFile;
    }

    public generateSpecLineInstrumentation( lineNumber: number ): string {
        return '// line: ' + lineNumber;
    }    

    /**
     * Retrieves specification location from a script file location.
     * 
     * @param scriptFilePath Script file path.
     * @param scriptLineNumber Script line number.
     */
    public async retrieveSpecLocation( scriptLoc: Location ): Promise< Location > {

        return new Promise< Location >( ( resolve, reject ) => {

            let lineCounter: number = 0;        
            let specFilePath: string = null;
            let specLineNumber: number = 0;
    
            let readStream = this._fs.createReadStream( scriptLoc.filePath );
            readStream.setEncoding( this._encoding );
    
            const rl = readline.createInterface( { input: readStream } as any );

            rl.on( 'error', () => {
                const msg = 'Error reading the file "' + scriptLoc.filePath + '".';
                reject( new RuntimeException( msg, scriptLoc ) );
            } );
    
            rl.on( 'line', ( content ) => {

                ++lineCounter;
    
                // Retrieve the specification file from the first line
                if ( 1 === lineCounter ) {
                    // TO-DO: read the instrumentation about the spec file
                    specFilePath = this.retrieveSpecFile( content );
                }
    
                // Retrive the specification column from the code instrumentation,
                // i.e., an annotation with the specification column
                if ( lineCounter === scriptLoc.line ) {
    
                    // TO-DO: read the instrumentation about the spec line
                    // specLine = ...
    
                    // No more to do with the file, so close it.
                    rl.close();
                }
    
            } );
    
            rl.on( 'close', () => {

                // Specification info not found, reject it
                if ( null === specFilePath || 0 === specLineNumber ) {
                    const msg = 'Specification information could not be retrieved from "' + scriptLoc.filePath + '".';
                    return reject( new Warning( msg, scriptLoc ) );
                }

                const specLoc: Location = {
                    filePath: specFilePath,
                    line: specLineNumber,
                    column: 1
                };

                resolve( specLoc );
            } );            

        } );

    }
    

    public retrieveSpecFile = ( line: string ): string | null => {
        const regex = /spec: ?(.+)/gu;
        const r = regex.exec( line );
        return ( r && r[ 1 ] ) ? r[ 1 ] : null;
    };

    public retrieveSpecLineNumber = ( line: string ): string | null => {
        const regex = /line: ?([0-9]+)/gu;
        const r = regex.exec( line );
        return ( r && r[ 1 ] ) ? r[ 1 ] : null;
    };    
}