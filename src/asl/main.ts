'use strict';

import meow = require( 'meow' ); // parse cmd line args
import ora = require( 'ora' ); // spinner
import { InputProcessor } from './modules/cli/InputProcessor';

const cli = meow(`
	Usage
	  $ asl [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] --plugin=<name>

	    where <dir> is the directory of your documentation files.

	Options
      --plugin=<name>, -p=<name>    Plug-in used to generate or execute test scripts.
      --files=<"file1,file2,...">   Documentation files to consider. Use it instead of <dir>.

      --no-test,       -t           Do not generate abstract test cases.
      --no-script,     -s           Do not generate test scripts.
      --no-run,        -r           Do not run test scripts.
      --no-results,    -e           Do not update the test content with the execution results.

      --plugin-list,   -l           Show available plug-ins.
      --version,       -v           Show current version.
      --about,         -a           Show information about this application.
      --help,          -h           Show this help.      

	Examples
	  $ asl . plugin=some-plugin
	  $ asl --files="file1.feature,path/to/file2.feature" -p=some-plugin
	  $ asl path/to/dir -t -s -p=some-plugin      
`, {
	alias: {
        p: 'plugin',
        f: 'files',
        t: 'no-test',
        s: 'no-script',
		r: 'no-run',
        e: 'no-results',
        l: 'plugin-list',
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
    write( 'TODO: show plugin list' );
};

let processInput = function( input: Array< string >, flags: any ): void {
    let processor = new InputProcessor( write, ora );
    processor.process( input, flags );
};

//console.log( cli );
//console.log( process.cwd() );
// Note that meow (cli) already deals with the flags "help" and "version"
if ( ! cli.flags.files && 0 === cli.input.length ) {
    showHelp();
} else if ( cli.flags.about ) {
    showAbout();
} else if ( cli.flags.pluginList ) {
    showPluginList();
} else if ( cli.input.length > 0 || cli.flags.files ) {
    processInput( cli.input, cli.flags );
}