import chalk from 'chalk';


export class CliHelp {

    content(): string {

        const exeName: string = chalk.magenta( 'concordia' );
        const NIY: string = chalk.red( 'NIY' );

        return `
  ${chalk.yellowBright('Usage:')} ${exeName} [<dir>] [options]

  where ${chalk.yellow('<dir>')} is the directory that contains your specification files.

  ${chalk.yellowBright('Options:')}

  ${chalk.gray('Input directories and files')}

  -d,  --directory <value>               Directory to search.
  -nr, --no-recursive                    Disable recursive search.
  -e,  --encoding <value>                File encoding. Default is "utf8".
  -x,  --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed).
  -i,  --ignore <"file1,file2,...">      Files to ignore, when <dir> is informed.
  -f,  --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l,  --language <code>                 Default language. Default is "en" (english).
  -ll, --language-list                   List available languages.

  ${chalk.gray('Plug-in')}

  -p,  --plugin <name>                   Plug-in to use.
  -pl, --plugin-list                     List available plug-ins.
  -pa, --plugin-about <name>             About a plug-in.
  -pi, --plugin-install <name>           Install a plug-in.
  -pu, --plugin-uninstall <name>         Uninstall a plug-in.

  ${chalk.gray('Processing and output')}

  -b,  --verbose                         Verbose output.

  -ns, --no-spec                         Do not process specification files.
  -nt, --no-test-cases                   Do not generate test cases.
  -nc, --no-scripts                      Do not generate test scripts.
  -nx, --no-run                          Do not run test scripts.
  -nu, --no-results                      Do not process execution results.

  -js, --just-spec                       Just process specification files.
  -jt, --just-test-cases                 Just generate test cases.
  -jc, --just-scripts                    Just generate test scripts.
  -jx, --just-run                        Just execute test scripts.

  -dt, --dir-test-cases                  Output directory for test cases.
  -ds, --dir-scripts                     Output directory for test scripts.
  -du, --dir-results                     Output directory for result files.

  -ef, --ext-feature                     File extension for Feature files.
                                         Default is .feature.
  -et, --ext-test-cases                  File extension for Test Case files.
                                         Default is .testcase.
  -lb, --line-breaker                    Character used for breaking lines.

  ${chalk.gray('Content generation')}

  --case-ui (camel|pascal|snake|kebab|none)
                                         String case to use for UI Element names
                                         when they are not defined (default is camel).
  --case-method (camel|pascal|snake|kebab|none)
                                         String case to use for test script methods
                                         (default is snake).
  --tc-suppress-header                   Suppress header in generated Test Case files.
  --tc-indenter <value>                  String used as indenter in generated Test Case
                                         files (default is double spaces).

  ${chalk.gray('Randomic value generation')}

  --seed <value>                         Use the given random seed. Default is current
                                         date and time.
  --random-string-min-size <number>      Minimum random string size. Default is 0.
  --random-string-max-size <number>      Minimum random string size. Default is 500.
  --random-tries <number>                Random tries to generate invalid values.
                                         Default is 5.

  ${chalk.gray('Specification filtering')}

  --importance <number>                  Sets the default importance value.
  --sel-min-feature <number>             Minimum feature importance. ${NIY}
  --sel-max-feature <number>             Maximum feature importance. ${NIY}
  --sel-min-scenario <number>            Minimum scenario importance. ${NIY}
  --sel-max-scenario <number>            Maximum scenario importance. ${NIY}
  --sel-filter <filter>                  Filter by tag. ${NIY}

  ${chalk.gray('Combination strategies')}

  --comb-variant (random|first|fmi|all)  Strategy to select variants to combine,
                                         by their states.
        random  = random variant that has the state (default)
        first   = first variant that has the state
        fmi     = first most important variant that has the state
        all     = all variants that have the state

  --comb-state (sre|sow|onewise|all)     Strategy to combine states of a
                                         same variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  --comb-invalid (node|0|1|smart|random|all)
                                         How many input data will be invalid
                                         in each test case.
        0,none  = no invalid data
        1       = one invalid data per test case
        smart   = use algorithm to decide (default)
        random  = random invalid data per test case
        all     = all invalid

  --comb-data (sre|sow|onewise|all)     Strategy to combine data test cases
                                        of a variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  ${chalk.gray('Test script execution filtering (depends on the used plugin)')}

  --run-min-feature <number>             Minimum feature importance. ${NIY}
  --run-max-feature <number>             Maximum feature importance. ${NIY}
  --run-min-scenario <number>            Minimum scenario importance. ${NIY}
  --run-max-scenario <number>            Maximum scenario importance. ${NIY}
  --run-filter <filter>                  Filter by tag. ${NIY}

  ${chalk.gray('Information')}

  -v,  --version                         Show current version.
  -a,  --about                           Show information about this application.
  -h,  --help                            Show this help.
  -n,  --newer                           Check for newer versions. ${NIY}

  ${chalk.yellowBright('Examples')}

   $ ${exeName} . --plugin some-plugin
   $ ${exeName} path/to/dir --no-test --no-script -p some-plugin
   $ ${exeName} --files "file1.feature,path/to/file2.feature" -p some-plugin -l pt
`;
    }


    meowOptions(): object {
        return {
            alias: {

                // FILES
                d: 'directory',
                nr: 'no-recursive',
                e: 'encoding',
                x: 'extensions',
                i: 'ignore',
                f: 'files',

                // LANGUAGE
                l: 'language',
                ll: 'language-list',

                // PLUGIN
                p: 'plugin',
                pl: 'plugin-list',
                pa: 'plugin-about',
                pi: 'plugin-install',
                pu: 'plugin-uninstall',

                // PROCESSING
                b: 'verbose',
                ff: 'fail-fast',

                ns: 'no-spec',
                nt: 'no-test-cases',
                nc: 'no-scripts',
                nx: 'no-run',
                nu: 'no-results',

                js: 'just-spec',
                jt: 'just-test-cases',
                jc: 'just-scripts',
                jx: 'just-run',

                dt: 'dir-test-cases',
                ds: 'dir-scripts',
                du: 'dir-results',

                lb: 'line-breaker',

                // CONTENT GENERATION
                // (no shortcuts)

                // RANDOMIC GENERATION
                s: 'seed',
                rv: 'random-valid',
                ri: 'random-invalid',

                // SPECIFICATION SELECTION
                snf: 'sel-min-feature',
                sxf: 'sel-max-feature',
                sns: 'sel-min-scenario',
                sxs: 'sel-max-scenario',
                sf: 'sel-filter',

                // COMBINATION STRATEGIES
                sv: 'sel-variant',
                ss: 'sel-state',

                // TEST SCRIPT FILTERING
                rnf: 'run-min-feature',
                rxf: 'run-max-feature',
                rns: 'run-min-scenario',
                rxs: 'run-max-scenario',
                rf: 'run-filter',

                // INFO
                h: 'help',
                a: 'about',
                v: 'version',
                n: 'newer',

                // CONFIG
                in: 'init'
            }
        };
    }

}