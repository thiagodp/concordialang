import { readFileAsync } from "./read-file";
import { FileReader } from "./FileReader";

export class FSFileReader implements FileReader {

    constructor(
        private _fs: any,
        private _encoding: string = 'utf8'
    ) {
    }

    async read( filePath: string ): Promise< string > {
        const options = {
            fs: this._fs,
            encoding: this._encoding
        };
        return await readFileAsync( filePath, options );
    }
}