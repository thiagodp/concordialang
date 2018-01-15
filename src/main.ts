'use strict';

import meow = require('meow'); // parse cmd line args
import ora = require('ora'); // spinner
import chalk = require('chalk'); // colors & style
import * as util from 'util';
import { InputProcessor } from './modules/cli/InputProcessor';
import { PluginInputProcessor } from './modules/testscript/PluginInputProcessor';

const exeName: string = chalk.magenta( 'concordia' );
const NIY: string = chalk.red( 'NIY' );

const cli = meow( `
 ${chalk.yellowBright('Usage:')} ${exeName} [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] [options]

    where ${chalk.yellow('<dir>')} is the directory that contains your specification files.

 ${chalk.yellowBright('Options:')}

  -e,  --encoding <value>                File encoding. Default is "utf8".
  -x,  --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed). ${NIY}
  -i,  --ignore <"file1,file2,...">      Files to ignore, when <dir> is informed.
  -f,  --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l,  --language <code>                 Default language. Default is "en" (english).
  -ll, --language-list                   List available languages. ${NIY}

  -p,  --plugin <name>                   Plug-in to use. ${NIY}
  -pl, --plugin-list                     List available plug-ins.
  -pa, --plugin-about <name>             About a plug-in.
  -pi, --plugin-install <name>           Install a plug-in.
  -pu, --plugin-uninstall <name>         Uninstall a plug-in.  

  -nt, --no-test                         Do not generate test cases. ${NIY}
  -ns, --no-script                       Do not generate test scripts. ${NIY}
  -nr, --no-run                          Do not run test scripts. ${NIY}
  -nu, --no-result                       Do not read execution results. ${NIY}

  -b,  --verbose                         Verbose output. ${NIY}
  -v,  --version                         Show current version.
  -a,  --about                           Show information about this application.
  -h,  --help                            Show this help.
  -n,  --newer                           Check for newer versions. ${NIY}

  ${chalk.gray('Randomic generation options:')}

  --random-seed <number>                 Use the given random seed. ${NIY}
  --random-valid <0-9999>                Number of test cases with valid random values. ${NIY}
  --random-invalid <0-9999>              Number of test cases with invalid random values. ${NIY}  

  ${chalk.gray('Test minimization options:')}

  --sel-min-feature <number>             Minimum feature importance. ${NIY}
  --sel-max-feature <number>             Maximum feature importance. ${NIY}
  --sel-min-scenario <number>            Minimum scenario importance. ${NIY}
  --sel-max-scenario <number>            Maximum scenario importance. ${NIY}
  --sel-filter <filter>                  Filter by tag. ${NIY}

  ${chalk.gray('Execution filtering options (depends on the used plugin):')}

  --run-min-feature <number>             Minimum feature importance. ${NIY}
  --run-max-feature <number>             Maximum feature importance. ${NIY}
  --run-min-scenario <number>            Minimum scenario importance. ${NIY}
  --run-max-scenario <number>            Maximum scenario importance. ${NIY}
  --run-filter <filter>                  Filter by tag. ${NIY}
	  
  ${chalk.yellowBright('Examples:')}  

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
        nt: 'no-test',
        ns: 'no-script',
		nr: 'no-run',
        nu: 'no-result',
        tc: 'test-connection',
        v: 'version',        
        a: 'about',
        h: 'help',
        n: 'newer'
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
    && ( ! cli.flags.pluginAbout || ! util.isString( cli.flags.pluginAbout ) )
    && ( ! cli.flags.pluginInstall || ! util.isString( cli.flags.pluginInstall ) )
    && ( ! cli.flags.pluginUninstall || ! util.isString( cli.flags.pluginUninstall ) )
) {
    showHelp();
} else if ( cli.flags.about ) {
    showAbout();
} else if ( cli.flags.pluginList ) {
    ( new PluginInputProcessor( write ) ).list();
} else if ( cli.flags.pluginAbout ) {
    ( new PluginInputProcessor( write ) ).about( cli.flags.pluginAbout );
} else if ( cli.flags.pluginInstall ) {
    ( new PluginInputProcessor( write ) ).install( cli.flags.pluginInstall );
} else if ( cli.flags.pluginUninstall ) {
    ( new PluginInputProcessor( write ) ).uninstall( cli.flags.pluginUninstall );    
} else if ( cli.input.length > 0 || cli.flags.files ) {
    processInput( cli.input, cli.flags );
}