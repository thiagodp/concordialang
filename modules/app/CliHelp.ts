import chalk from 'chalk';


export class CliHelp {

    content(): string {

        const exeName: string = chalk.magenta( 'concordia' );
        const NIY: string = chalk.red( 'NIY' );

        return `
  ${chalk.yellowBright('Usage:')} ${exeName} [ <dir> | --files="file1.feature,path/to/file2.feature,..." ] [options]

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
  -ll, --language-list                   List available languages. ${NIY}

  ${chalk.gray('Plug-in')}

  -p,  --plugin <name>                   Plug-in to use. ${NIY}
  -pl, --plugin-list                     List available plug-ins.
  -pa, --plugin-about <name>             About a plug-in.
  -pi, --plugin-install <name>           Install a plug-in.
  -pu, --plugin-uninstall <name>         Uninstall a plug-in.

  ${chalk.gray('Processing and output')}

  -b,  --verbose                         Verbose output.
  -ff, --fail-fast                       Stop on the first error. ${NIY}

  -ns, --no-spec                         Do not process specification files. ${NIY}
  -nt, --no-test-cases                   Do not generate test cases. ${NIY}
  -nc, --no-scripts                      Do not generate test scripts. ${NIY}
  -nx, --no-run                          Do not run test scripts. ${NIY}
  -nu, --no-results                      Do not process execution results. ${NIY}

  -js, --just-spec                       Just process specification files. ${NIY}
  -jt, --just-test-cases                 Just generate test cases. ${NIY}
  -jc, --just-scripts                    Just generate test scripts. ${NIY}
  -jx, --just-run                        Just execute test scripts. ${NIY}

  -dt, --dir-test-cases                  Output directory for test cases. ${NIY}
  -dc, --dir-scripts                     Output directory for test scripts. ${NIY}
  -du, --dir-results                     Output directory for result files. ${NIY}

  ${chalk.gray('Randomic value generation')}

  --seed <string>                        Use the given random seed. ${NIY}
  --random-valid <0-9999>                Number of test cases with valid random values. ${NIY}
  --random-invalid <0-9999>              Number of test cases with invalid random values. ${NIY}

  ${chalk.gray('Specification filtering')}

  --sel-min-feature <number>             Minimum feature importance. ${NIY}
  --sel-max-feature <number>             Maximum feature importance. ${NIY}
  --sel-min-scenario <number>            Minimum scenario importance. ${NIY}
  --sel-max-scenario <number>            Maximum scenario importance. ${NIY}
  --sel-filter <filter>                  Filter by tag. ${NIY}

  ${chalk.gray('Combination strategies')}

  --sel-variant random|first|fmi|all     Variant selection strategy to combine scenarios,
                                         according to their states. ${NIY}
                                         random = a random variant (default)
                                         first = the first variant
                                         fmi = the first most important variant
                                         all = all variants

  --sel-state onewise|all                State selection strategy to combine scenarios. ${NIY}
                                         onewise = one-wise combination (default)
                                         all = all states

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
                dc: 'dir-scripts',
                du: 'dir-results',

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