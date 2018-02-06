export class Defaults {

    readonly LANGUAGE: string = 'en';
    readonly ENCODING: string = 'utf8';
    readonly EXTENSIONS: string[] = [ '.feature', '.example' ];

    readonly DIRECTORY: string = '.';
    readonly LANGUAGE_DIR: string = 'data/keywords/';

    readonly PLUGIN_DIR: string = 'dist/plugins/';

    /**
     * Returns available encodings.
     * 
     * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
     */
    availableEncodings(): string[] {
        return [
            'utf8', 'utf-8',
            'ascii',
            'latin1',
            'ucs2', 'ucs-2',
            'utf16le', 'utf-16le'
        ];
    }

}