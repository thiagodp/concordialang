import { resolve } from 'path';
import { CaseType } from './CaseType';

export class Defaults {

    readonly LANGUAGE: string = 'en';
    readonly ENCODING: string = 'utf8';
    readonly EXTENSIONS: string[] = [ '.feature', '.example' ];

    readonly DIR_PLUGIN: string = 'plugins/';
    readonly DIR_LANGUAGE: string = 'data/';

    readonly DIR_SCRIPT: string = 'test/';
    readonly DIR_SCRIPT_RESULT: string = 'test/';

    readonly CASE_UI: string = CaseType.CAMEL.toString(); // e.g., fullName
    readonly CASE_METHOD: string = CaseType.SNAKE.toString(); // e.g., my_test_method

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