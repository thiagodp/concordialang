import { FileHandler } from '../file/FileHandler';

export class FSFileHandler implements FileHandler {

    constructor(
        private readonly _fs: any,
        private readonly _promisify: any,
        private readonly _encoding: string = 'utf8'
    ) {
    }

    /** @inheritDoc */
    async read( filePath: string ): Promise< string > {

        const readFile = this._promisify( this._fs.readFile );

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
        const pAccess = this._promisify( this._fs.access );
        try {
            await pAccess( filePath, this._fs.constants.R_OK );
            return true;
        } catch {
            return false;
        }
    }

    /** @inheritDoc */
    existsSync( filePath: string ): boolean {
        try {
            this._fs.accessSync( filePath, this._fs.constants.R_OK );
            return true;
        } catch {
            return false;
        }
    }

    /** @inheritDoc */
    async write( filePath: string, content: string ): Promise< void > {
        const writeFile = this._promisify( this._fs.writeFile );
        return await writeFile( filePath, content );
    }

    /** @inheritDoc */
    async erase( filePath: string, checkIfExists: boolean ): Promise< boolean > {
        if ( checkIfExists ) {
            const ok = await this.exists( filePath );
            if ( ! ok ) {
                return false;
            }
        }
        const unlinkFile = this._promisify( this._fs.unlink );
        await unlinkFile( filePath );
        return true;
    }

}