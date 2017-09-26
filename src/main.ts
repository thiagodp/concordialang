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
  -p, --plugin=<name>                   Plug-in used to generate or execute test scripts.
  -l, --lang=<lang-code>                Language used in the documentation files. Default is "en" (english).
  -c, --charset=<value>                 Charset (enconding) used to read the files. Default is "utf8".

  -i, --ignore=<"file1,file2,...">      Documentation files of the given <dir> to ignore.
  -f, --files=<"file1,file2,...">       Documentation files to consider instead of <dir>.
  -e, --extensions=<".ext1,.ext2,...">  File extensions to consider.

  -t, --no-test                         Do not generate abstract test cases.
  -s, --no-script                       Do not generate test scripts.
  -r, --no-run                          Do not run test scripts.
  -u, --no-result                       Do not update the test content with the execution results.

  --min-fi-gen=<number>                 Min. feature importance to generate test cases.
  --max-fi-gen=<number>                 Max. feature importance to generate test cases.	  
  --min-si-gen=<number>                 Min. scenario importance to generate test cases.
  --max-si-gen=<number>                 Max. scenario importance to generate test cases.

  --min-fi-run=<number>                 Min. feature importance to run test scripts.
  --max-fi-run=<number>                 Max. feature importance to run test scripts.	  
  --min-si-run=<number>                 Min. scenario importance to run test scripts.
  --max-si-run=<number>                 Max. scenario importance to run test scripts.  

  -g, --plugin-list                     Show available plug-ins.
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