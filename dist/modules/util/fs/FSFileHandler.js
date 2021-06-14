export class FSFileHandler {
    constructor(_fs, _promisify, _encoding = 'utf8') {
        this._fs = _fs;
        this._promisify = _promisify;
        this._encoding = _encoding;
    }
    /** @inheritDoc */
    async read(filePath) {
        const readFile = this._promisify(this._fs.readFile);
        const options = {
            encoding: this._encoding,
            flag: 'r'
        };
        return await readFile(filePath, options);
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
    readSync(filePath) {
        const options = {
            encoding: this._encoding,
            flag: 'r'
        };
        return this._fs.readFileSync(filePath, options);
    }
    /** @inheritDoc */
    async exists(filePath) {
        const pAccess = this._promisify(this._fs.access);
        try {
            await pAccess(filePath, this._fs.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /** @inheritDoc */
    existsSync(filePath) {
        try {
            this._fs.accessSync(filePath, this._fs.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /** @inheritDoc */
    async write(filePath, content) {
        const writeFile = this._promisify(this._fs.writeFile);
        return await writeFile(filePath, content);
    }
    /** @inheritDoc */
    async erase(filePath, checkIfExists) {
        if (checkIfExists) {
            const ok = await this.exists(filePath);
            if (!ok) {
                return false;
            }
        }
        const unlinkFile = this._promisify(this._fs.unlink);
        await unlinkFile(filePath);
        return true;
    }
}
