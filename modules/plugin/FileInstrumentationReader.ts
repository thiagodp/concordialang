import { InstrumentationReader, DefaultInstrumentationReader } from "./InstrumentationReader";
import { Location  } from "../ast/Location";
import { RuntimeException } from '../req/RuntimeException';
import { Warning } from '../req/Warning';
import * as readline from 'readline';
import * as fs from 'fs';
import { promisify } from 'util';


 /**
  * Default script file instrumentation.
  *
  * @author Thiago Delgado Pinto
  */
 export class FileInstrumentationReader {

    constructor(
        private _reader: InstrumentationReader = new DefaultInstrumentationReader(),
        private _fs: any = fs,
        private _encoding: string = 'utf-8'
    ) {
    }

    /**
     * Retrieves specification location from a script file location.
     *
     * @param scriptFilePath Script file path.
     * @param scriptLineNumber Script line number.
     */
    public async retrieveSpecLocation( scriptLoc: Location ): Promise< Location > {

        const readFileAsync = promisify( this._fs.readFile );

        let lines = ( await readFileAsync( scriptLoc.filePath, this._encoding ) )
            .toString().split( "\n" );

        let count = 0;
        let specFilePath: string = null;
        let specLineNumber: number = 0;
        for ( let content of lines ) {
            ++count;

            if ( null === specFilePath ) {
                specFilePath = this._reader.retrieveSpecFile( content );
            }

            // Retrive the specification column from the code instrumentation,
            // i.e., an annotation with the specification column
            if ( count === scriptLoc.line ) {
                specLineNumber = this._reader.retrieveSpecLineNumber( content );
                break; // nothing to do anymore
            }
        }
        lines = null; // free content

        // Specification info not found, reject it
        if ( null === specFilePath || 0 === specLineNumber ) {
            const msg = 'Specification information could not be retrieved from "' + scriptLoc.filePath + '".';
            // throw new Warning( msg, scriptLoc );
            specFilePath = msg;
            specLineNumber = 1;
        }

        const specLoc: Location = {
            filePath: specFilePath,
            line: specLineNumber,
            column: 1
        };

        return specLoc;
    }

}