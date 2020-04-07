import { promisify } from "util";
import { FileChecker } from "./FileChecker";
import { FileReader } from "./FileReader";
import { FileWriter } from "./FileWriter";


export class FSFileHandler implements FileReader, FileChecker, FileWriter {

    constructor(
        private _fs: any,
        private _encoding: string = 'utf8'
    ) {
    }

    /** @inheritDoc */
    async read( filePath: string ): Promise< string > {

        const readFile = promisify( this._fs.readFile );

        const options = {
            encoding: this._encoding,
            flag: 'r'
        };

        return await readFile( filePath, options );
        // try {
        //     return await readFile( filePath, options );
        // } catch ( err ) {
        //     if ( 'ENOENT' == err.code && silentIfNotExists ) {
        //         return null;
        //     }
        //     throw err;
        // }
    }

    /** @inheritDoc */
    readSync( filePath: string ): string {
        const options = {
            encoding: this._encoding,
            flag: 'r'
        };
        return this._fs.readFileSync( filePath, options );
    }

    /** @inheritDoc */
    async exists( filePath: string ): Promise< boolean > {
        const pAccess = promisify( this._fs.access );
        try {
            await pAccess( filePath, this._fs.constants.R_OK );
            return true;
        } catch {
            return false;
        }
    }

    /** @inheritDoc */
    existsSync( filePath: string ): boolean {
        return this._fs.existsSync( filePath );
    }

    /** @inheritDoc */
    async write( filePath: string, content: string ): Promise< void > {
        const writeFile = promisify( this._fs.writeFile );
        return await writeFile( filePath, content );
    }

}