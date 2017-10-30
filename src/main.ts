'use strict';
import meow = require('meow'); // parse cmd line args
import ora = require('ora'); // spinner
import chalk = require('chalk'); // colors & style
import * as path from 'path';
import * as util from 'util';
import { sprintf } from 'sprintf-js';

import { InputProcessor } from './modules/cli/InputProcessor';
import { JsonBasedTestScriptPluginFinder } from './modules/ts/JsonBasedTestScriptPluginFinder';
import { TestScriptPluginData } from './modules/ts/TestScriptPluginData';

const exeName: string = 'concordia';

const cli = meow( `
 Usage:

  ${exeName} [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] [options]

    where <dir> is the directory with your specification files.

 Options:

  -p, --plugin <name>                   Sets the plug-in to generate or to execute test scripts. NIY

  -x, --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed). NIY
  -i, --ignore <"file1,file2,...">      Files to ignore (when <dir> is informed).

  -f, --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l, --language <code>                 Sets the default language (from "en"glish).
  -e, --encoding <value>                Sets the enconding to read files. Default is "utf8".

  -t, --no-test                         Do not generate test cases. NIY
  -s, --no-script                       Do not generate test scripts. NIY
  -r, --no-run                          Do not run test scripts. NIY
  -u, --no-result                       Do not read execution results. NIY

  --test-connection <name|*>            Tests a database connection with the given name. NIY

  --min-fi-gen <number>                 Min. feature importance to generate test cases. NIY
  --max-fi-gen <number>                 Max. feature importance to generate test cases. NIY
  --min-si-gen <number>                 Min. scenario importance to generate test cases. NIY
  --max-si-gen <number>                 Max. scenario importance to generate test cases. NIY

  --min-fi-run <number>                 Min. feature importance to run test scripts. NIY
  --max-fi-run <number>                 Max. feature importance to run test scripts. NIY  
  --min-si-run <number>                 Min. scenario importance to run test scripts. NIY
  --max-si-run <number>                 Max. scenario importance to run test scripts. NIY

  --max-random-tests <0-999>            Max. number of test cases to use random values. NIY

  -g, --plugin-list                     Show available plug-ins. NIY
  -v, --version                         Show current version.
  -a, --about                           Show information about this application.
  -h, --help                            Show this help.
	  
  Examples:

   $ ${exeName} . --plugin some-plugin
   $ ${exeName} --files "file1.feature,path/to/file2.feature" -p some-plugin -l pt
   $ ${exeName} path/to/dir --no-test --no-script -p some-plugin
`, {
	alias: {
		p: 'plugin',
		l: 'language',	
		e: 'encoding',
		f: 'files',
		i: 'ignore',
		x: 'extensions',
        t: 'no-test',
        s: 'no-script',
		r: 'no-run',
        u: 'no-result',
        g: 'plugin-list',
        v: 'version',        
        a: 'about',
        h: 'help'
	}
});

let write = console.log;

let showHelp = function(): void {
    write( cli.help );
};

let showAbout = function(): void {
    write( cli.pkg.description + ' v' + cli.pkg.version );
    write( 'Copyright (c) 2017 ' + cli.pkg.author.name );
    write( cli.pkg.homepage );
};

let showPluginList = function(): void {

    let sortPlugins = ( plugins: TestScriptPluginData[] ): TestScriptPluginData[] => {
        return plugins.sort( ( a: TestScriptPluginData, b: TestScriptPluginData ): number => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        } );
    };

    let drawPlugins = ( plugins: TestScriptPluginData[] ) => {
        const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        write( chalk.yellow( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        plugins = sortPlugins( plugins );
        for ( let p of plugins ) {
            write( sprintf( format, p.name, p.version, p.description ) );
        }
    };

    const dir = path.join( process.cwd(), '/plugins' );
    const finder = new JsonBasedTestScriptPluginFinder( dir );
    finder.find()
        .then( ( plugins: TestScriptPluginData[] ) => {
            drawPlugins( plugins );
        } )
        .catch( ( err ) => write( err.message ) );
};

let processInput = function( input: Array< string >, flags: any ): void {
    let processor = new InputProcessor( write, ora, chalk );
    processor.process( input, flags );
};

//console.log( cli );
//console.log( process.cwd() );
// Note that meow (cli) already deals with the flags "help" and "version"
if ( ! cli.flags.files && 0 === cli.input.length && ! cli.flags.about && ! cli.flags.pluginList ) {
    showHelp();
} else if ( cli.flags.about ) {
    showAbout();
} else if ( cli.flags.pluginList ) {
    showPluginList();
} else if ( cli.input.length > 0 || cli.flags.files ) {
    processInput( cli.input, cli.flags );
}