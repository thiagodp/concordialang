'use strict';

import meow = require('meow'); // parse cmd line args
import ora = require('ora'); // spinner
import chalk = require('chalk'); // colors & style
import * as util from 'util';
import { InputProcessor } from './modules/cli/InputProcessor';
import { PluginInputProcessor } from './modules/ts/PluginInputProcessor';

const exeName: string = 'concordia';

const cli = meow( `
 Usage:

  ${exeName} [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] [options]

    where <dir> is the directory that contains your specification files.

 Options:

  -p,  --plugin <name>                   Sets a plug-in to generate or to execute test scripts. NIY
  -pl, --plugin-list                     Shows available plug-ins. NIY
  -pa, --plugin-about <name>             Shows more information about a plug-in. NIY
  -pi, --plugin-install <name>           Installs a plug-in. NIY
  -pu, --plugin-uninstall <name>         Uninstalls a plug-in. NIY

  -x,  --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed). NIY
  -i,  --ignore <"file1,file2,...">      Files to ignore (when <dir> is informed).

  -f,  --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l,  --language <code>                 Sets the default language (from "en"glish).
  -e,  --encoding <value>                Sets the enconding to read files. Default is "utf8".

  -t,  --no-test                         Do not generate test cases. NIY
  -s,  --no-script                       Do not generate test scripts. NIY
  -r,  --no-run                          Do not run test scripts. NIY
  -u,  --no-result                       Do not read execution results. NIY

  -tc, --test-connection <name|*>        Tests a database connection with the given name. NIY

  -v,  --version                         Show current version.
  -a,  --about                           Show information about this application.
  -h,  --help                            Show this help.  

  Related to the generation of test cases:

  --gen-min-feature <number>             Selects only the features with the given minimum importance. NIY
  --gen-max-feature <number>             Selects only the features with the given maximum importance. NIY
  --gen-min-scenario <number>            Selects only the scenarios with the given minimum importance. NIY
  --gen-max-scenario <number>            Selects only the scenarios with the given maximum importance. NIY
  --gen-max-random-cases <0-999>         Maximum number of test cases that to use random values. NIY

  Related to the execution of test scripts (used plugin may not support them!):

  --run-min-feature <number>             Executes only the features with the given minimum importance. NIY
  --run-max-feature <number>             Executes only the features with the given maximum importance. NIY
  --run-min-scenario <number>            Executes only the scenarios with the given minimum importance. NIY
  --run-max-scenario <number>            Executes only the scenarios with the given maximum importance. NIY
	  
  Examples:

   $ ${exeName} . --plugin some-plugin
   $ ${exeName} path/to/dir --no-test --no-script -p some-plugin   
   $ ${exeName} --files "file1.feature,path/to/file2.feature" -p some-plugin -l pt
`, {
	alias: {
        p: 'plugin',
        pl: 'plugin-list',
        pa: 'plugin-about',
        pi: 'plugin-install',
        pu: 'plugin-uninstall',
		l: 'language',	
		e: 'encoding',
		f: 'files',
		i: 'ignore',
		x: 'extensions',
        t: 'no-test',
        s: 'no-script',
		r: 'no-run',
        u: 'no-result',
        tc: 'test-connection',
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

let processInput = function( input: Array< string >, flags: any ): void {
    let processor = new InputProcessor( write, ora, chalk );
    processor.process( input, flags );
};

//console.log( cli );
//console.log( process.cwd() );
// Note that meow (cli) already deals with the flags "help" and "version"
if ( ! cli.flags.files
    && 0 === cli.input.length
    && ! cli.flags.about
    && ! cli.flags.pluginList
    && ! cli.flags.pluginAbout
    && ! cli.flags.pluginInstall
) {
    showHelp();
} else if ( cli.flags.about ) {
    showAbout();
} else if ( cli.flags.pluginList ) {
    ( new PluginInputProcessor( write ) ).list();
} else if ( cli.flags.pluginAbout && util.isString( cli.flags.pluginAbout ) ) {
    ( new PluginInputProcessor( write ) ).about( cli.flags.pluginAbout );
} else if ( cli.flags.pluginInstall && util.isString( cli.flags.pluginInstall ) ) {
    ( new PluginInputProcessor( write ) ).install( cli.flags.pluginInstall );
} else if ( cli.input.length > 0 || cli.flags.files ) {
    processInput( cli.input, cli.flags );
}