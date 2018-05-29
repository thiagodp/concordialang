import { TestScriptExecutionOptions } from '../../modules/testscript/TestScriptExecution';
import * as path  from "path";
import * as fse from 'node-fs-extra';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { writeFile, access, constants } from 'fs';

/**
 * Executes test scripts generated by Concordia using CodeceptJS.
 */
export class TestScriptExecutor {

    /**
     * Executes the script according to the options given.
     *
     * @param options Execution options
     */
    public async execute( options: TestScriptExecutionOptions ): Promise< string > {

        if ( !! options.sourceCodeDir ) {
            fse.mkdirs( options.sourceCodeDir );
        }

        const outputFile = path.join( options.executionResultDir || '.', 'output.json' );

        const CONFIG_FILE = 'codecept.json';
        const configFilePath = path.join( process.cwd(), CONFIG_FILE );

        let configFileExists: boolean = await this.fileExists( configFilePath );
        // if ( ! configFileExists ) {
        //     // await this.runCommand( 'codeceptjs init' );
        //     try {
        //         const cmd = 'codeceptjs init';
        //         console.log( '  PLUGIN: No CodeceptJS configuration found. Let\'s make one!' );
        //         console.log( '  PLUGIN:', cmd );
        //         childProcess.execSync( cmd, { stdio: [ 0, 1, 2 ] } );
        //     } catch ( e ) {
        //         console.error( '  PLUGIN:', e.message );
        //     }
        // }
        // configFileExists = await this.fileExists( configFilePath );

        // It's only possible to run CodeceptJS if there is a config file
        if ( ! configFileExists ) {

            const defaultConfig = this.makeConfig(
                this.makeWebDriverHelperConfig()
            );

            const writeF = promisify( writeFile );
            await writeF( configFilePath, JSON.stringify( defaultConfig ) );

            console.log( '  PLUGIN: Generated configuration file', configFilePath );
            console.log( '          If this file does not work for you, delete it and then run:' );
            console.log( '          codeceptjs init\n' );
        } else {
            console.log( '  PLUGIN: Read', configFilePath );
        }

        const overrideOptions = this.makeMochaConfig( outputFile );
        const overrideOptionsStr = this.escapeJson( JSON.stringify( overrideOptions ) );

        const cmd = `codeceptjs run --reporter mocha-multi --config ${configFilePath} --override "${overrideOptionsStr}" --colors`;
        const code = await this.runCommand( cmd );

        return outputFile;
    }


    private async fileExists( path: string ): Promise< boolean > {
        try {
            const accessFile = promisify( access );
            await accessFile( path, constants.F_OK );
            return true;
        } catch ( e ) {
            return false;
        }
    }


    private makeWebDriverHelperConfig(
        driver: string = 'WebDriverIO',
        browser: any = 'chrome',
        url: string = 'http://localhost'
    ): object {
        let obj = {};
        obj[ driver ] = {
            browser: browser,
            url: url
        };
        return obj;
    }

    private makeMochaConfig( outputFile: string ): any {
        return {
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: "-",
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: outputFile
                    }
                }
            }
        };
    }

    private makeConfig(
        helperConfig: object,
        filter: string = '**/*.js'
    ): object {

        let options: any = {
            tests: filter,
            helpers: helperConfig
        };

        return options;
    }

    // /**
    //  * Generates a command that calls CodeceptJS and can be executed in a terminal.
    //  *
    //  * @param options Execution options
    //  * @param outputFile Output file where test results will be written
    //  * @throws Error
    //  */
    // public generateTestCommand( options: TestScriptExecutionOptions, outputFile: string ): string {
    //     if ( ! options.sourceCodeDir ) {
    //         throw new Error( 'Source code directory is missing!' );
    //     }
    //     if ( ! options.executionResultDir ) {
    //         throw new Error( 'Execution result directory is missing!' );
    //     }
    //     const commandOptions: object = new CodeceptJSOptionsBuilder()
    //         .withOutputFile( outputFile )
    //         .value(); //TODO: Accept CodeceptJS options.
    //     const optionsStr: string = this.escapeJson( JSON.stringify( commandOptions ) );
    //     return `codeceptjs run --reporter mocha-multi --override "${optionsStr}" -c ${ options.sourceCodeDir } --colors`;
    // }

    private escapeJson( json: string ): string {
        return JSON.stringify( { _: json} ).slice( 6, -2 );
    }

    private async runCommand(
        command: string
    ): Promise< number > {

        let options = {
            // stdio: 'inherit', // <<< not working on windows!
            shell: true
        };

        // Splits the command into pieces to pass to the process;
        //  mapping function simply removes quotes from each piece
        let cmds = command.match( /[^"\s]+|"(?:\\"|[^"])+"/g )
            .map( expr => {
                return expr.charAt( 0 ) === '"' && expr.charAt( expr.length - 1 ) === '"' ? expr.slice( 1, -1 ) : expr;
            } );
        const runCMD = cmds[ 0 ];
        cmds.shift();

        return new Promise< number >( ( resolve, reject ) => {

            const child = childProcess.spawn( runCMD, cmds, options );

            child.stdout.on( 'data', ( chunk ) => {
                console.log( chunk.toString() );
            } );

            child.stderr.on( 'data', ( chunk ) => {
                console.warn( chunk.toString() );
            } );

            child.on( 'exit', ( code ) => {
                resolve( code );
            } );

        } );
    }

}
