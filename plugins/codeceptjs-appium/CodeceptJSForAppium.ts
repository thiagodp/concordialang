import { CodeceptJS } from "../codeceptjs/CodeceptJS";
import * as path from 'path';

/**
 * Plug-in for CodeceptJS with Appium.
 */
export class CodeceptJSForAppium extends CodeceptJS {

    /**
     * Constructor
     *
     * @param fsToUse Filesystem object to use. Default is nodejs fs.
     * @param encoding Encoding to use. Default is 'utf8'.
     */
    constructor(
        fsToUse?: any,
        encoding: string = 'utf8'
    ) {
        super(
            path.join( __dirname, '../', 'codeceptjs-appium.json' ),
            fsToUse,
            encoding
        );
    }

}