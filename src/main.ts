'use strict';

import meow = require( 'meow' ); // parse cmd line args
import ora = require( 'ora' ); // spinner
import chalk = require( 'chalk' ); // colors & style
import { InputProcessor } from './modules/cli/InputProcessor';

const exeName: string = 'concordia';

const cli = meow( `
 Usage:
   $ ${exeName} [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] --plugin=<name>

   where <dir> is the directory with your documentation files.

 Options:
  -p, --plugin=<name>                   Sets the plug-in to generate or to execute test scripts. NIY

  -l, --lang=<lang-code>                Sets the default language (from "en"glish). NIY
  -c, --charset=<value>                 Sets the charset (enconding) used to read files. Default is "utf8".
  -e, --extensions=<".ext1,.ext2,...">  File extensions to consider for the given <dir>. NIY
  -i, --ignore=<"file1,file2,...">      Files to ignore from the given <dir>.
  -f, --files=<"file1,file2,...">       Files to consider instead of <dir>.

  -t, --no-test                         Do not generate test cases. NIY
  -s, --no-script                       Do not generate test scripts. NIY
  -r, --no-run                          Do not run test scripts. NIY
  -u, --no-result                       Do not read execution results. NIY

  --min-fi-gen=<number>                 Min. feature importance to generate test cases. NIY
  --max-fi-gen=<number>                 Max. feature importance to generate test cases. NIY
  --min-si-gen=<number>                 Min. scenario importance to generate test cases. NIY
  --max-si-gen=<number>                 Max. scenario importance to generate test cases. NIY

  --min-fi-run=<number>                 Min. feature importance to run test scripts. NIY
  --max-fi-run=<number>                 Max. feature importance to run test scripts. NIY  
  --min-si-run=<number>                 Min. scenario importance to run test scripts. NIY
  --max-si-run=<number>                 Max. scenario importance to run test scripts. NIY

  -g, --plugin-list                     Show available plug-ins. NIY
  -v, --version                         Show current version.
  -a, --about                           Show information about this application.
  -h, --help                            Show this help.
	  
  Examples:
   $ ${exeName} . plugin=some-plugin
   $ ${exeName} --files="file1.feature,path/to/file2.feature" -p=some-plugin -l=pt-br
   $ ${exeName} path/to/dir -t -s -p=some-plugin      
`, {
	alias: {
		p: 'plugin',
		l: 'lang',	
		c: 'charset',
		f: 'files',
		i: 'ignore',
		e: 'extensions',
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
    write( 'TODO: show plugin list' );
};

let processInput = function( input: Array< string >, flags: any ): void {
    let processor = new InputProcessor( write, ora, chalk );
    processor.process( input, flags );
};

//console.log( cli );
//console.log( process.cwd() );
// Note that meow (cli) already deals with the flags "help" and "version"
if ( ! cli.flags.files && 0 === cli.input.length && ! cli.flags.about ) {
    showHelp();
} else if ( cli.flags.about ) {
    showAbout();
} else if ( cli.flags.pluginList ) {
    showPluginList();
} else if ( cli.input.length > 0 || cli.flags.files ) {
    processInput( cli.input, cli.flags );
}