import * as colors from 'chalk';


export class CliHelp {

    content(): string {

        const exeName: string = colors.magenta( 'concordia' );

/*
  ${colors.gray('Specification filtering')}

  --importance <number>                  Sets the default importance value.
  --sel-min-feature <number>             Minimum feature importance.  ${NIY}
  --sel-max-feature <number>             Maximum feature importance.  ${NIY}
  --sel-min-scenario <number>            Minimum scenario importance. ${NIY}
  --sel-max-scenario <number>            Maximum scenario importance. ${NIY}
  --sel-filter <filter>                  Filter by tag. ${NIY}

  ${colors.gray('Test script filtering (depends on the used plugin)')}

  --run-min-feature <number>             Minimum feature importance. ${NIY}
  --run-max-feature <number>             Maximum feature importance. ${NIY}
  --run-min-scenario <number>            Minimum scenario importance. ${NIY}
  --run-max-scenario <number>            Maximum scenario importance. ${NIY}
  --run-filter <filter>                  Filter by tag. ${NIY}
`;
*/

return `
${colors.yellowBright('Usage:')} ${exeName} [<dir>] [options]

where <dir> is the directory that contains your specification files.

${colors.yellowBright('Options:')}

${colors.gray('Input directories and files')}

-d, --directory <value>                 Directory to search. Same as <dir>.
--no-recursive							Disable recursive search.

-f, --file <"file1,file2,...">          Files to consider. Whether <dir> is
                                        informed, files are searched in it.

-i, --ignore <"file1,file2,...">        Files to ignore, when <dir> is informed.

${colors.gray('Output directories')}

-o, --dir-script                        Output directory for test scripts.
-O, --dir-result						Output directory for reports and
										screenshots.

${colors.gray('Language and Locale')}

-l, --language <code>                   Set the default language.
                                        The default is "en" (english).
--language-list                         List available languages.

--locale-list							List available locales.

${colors.gray('Plug-in')}

-p, --plugin [<name>]                   Plug-in to use.
-S, --plugin-serve [<name>]				Start a test server for a given plugin.
--plugin-list                           List installed plug-ins.
--plugin-install <name>                 Install a plug-in.
--plugin-uninstall <name>               Uninstall a plug-in.
--plugin-about [<name>]                 Show information about an installed
										plug-in.

-F, --script-file <"file1,file2,...">	Test script files to execute.
-G, --script-grep <"expression">		Expression to filter the test scripts to
                                        run. Some plug-ins may not support it.

-T, --target <"target1,target2,...">	Target browsers or platforms.
-H, --headless                          Enable headless execution (browsers).
                                        Some plug-ins may not support it.
-I, --instances							Number of parallel instances to execute.

${colors.gray('Database support')}

--db-list                               List installed databases drivers.
--db-install <"db1,db2,...">            Install one or more database drivers.
--db-uninstall <"db1,db2,...">          Uninstall one or more database drivers.

${colors.gray('Configuration')}

--init                                  Init a guided, basic configuration.

-c, --config                            Configuration file to load.
                                        The default is ".concordiarc".

--save-config                           Save/overwrite a configuration file
                                        with other command line options.

${colors.gray('Processing and output')}

--verbose                               Show verbose output.

--no-spec                               Do not process specification files.
--no-test-case                          Do not generate test cases.
--no-script                             Do not generate test scripts.
--no-run                                Do not run test scripts.
--no-result                             Do not process execution results.

-x                                      Apply --no-run and --no-result.

--just-spec                             Just process specification files.
--just-test-case                        Just generate test cases.
--just-script                           Just generate test scripts.
--just-run                              Just execute test scripts.

${colors.gray('Random generation')}

--seed <value>                          Random seed to use.
                                        The default is the current date and time.
--random-min-string-size <number>       Minimum random string size.
                                        The default is 0.
--random-max-string-size <number>       Minimum random string size.
                                        The default is 500.
--random-tries <number>                 Random tries to generate invalid values.
                                        The default is 5.

${colors.gray('Combination strategies')}

--comb-variant (random|first|fmi|all)
    Strategy to select variants to combine by their states:
      random  = random variant that has the state (default)
      first   = first variant that has the state
      fmi     = first most important variant that has the state
      all     = all variants that have the state

--comb-state (sre|sow|onewise|all)
    Strategy to combine states of a same variant:
      sre     = single random of each (default)
      sow     = shuffled one-wise
      ow      = one-wise
      all     = all

--comb-invalid (0|1|smart|random|all)
    How many input data will be invalid in each test case:
      0       = no invalid data
      1       = one invalid data per test case
      smart   = use algorithm to decide (default)
      random  = random invalid data per test case
      all     = all invalid

--comb-data (sre|sow|onewise|all)
    Strategy to combine data test cases of a variant:
      sre     = single random of each (default)
      sow     = shuffled one-wise
      ow      = one-wise
      all     = all

${colors.gray('Content generation format')}

--case-ui (camel|pascal|snake|kebab|none)
    String case to generate a UI Element locator when it is not defined.
    The default is "camel".

--case-method (camel|pascal|snake|kebab|none)
    String case to use for test script methods. The default is "snake".

--tc-suppress-header                    Suppress header in generated
                                        Test Case files.
--tc-indenter <value>                   String used as indenter in generated
                                        Test Case files. The default is double
                                        spaces.

${colors.gray('Input formats and extensions')}

-e, --encoding <value>                  File encoding. The default is "utf8".
--line-breaker                          Character used for breaking lines.
--ext-feature                           File extension for Feature files.
                                        The default is ".feature".
--ext-test-case                         File extension for Test Case files.
                                        The default is ".testcase".

${colors.gray('Information')}

-v, --version                           Show current version.
--about                             	Show information about this application.
--help                              	Show this help.
--newer									Check for newer versions.

${colors.yellowBright('Examples')}

 $ ${exeName} features --language pt --plugin some-plugin --dir-script test --dir-result output
 $ ${exeName} --file "file1.feature,path/to/file2.feature" -l pt -p some-plugin
 $ ${exeName} --no-run --no-result
`;

    } // method content()

    meowOptions(): object {
        return {

            booleanDefault: undefined,

            flags: {

				// DIRECTORIES

				directory: { type: 'string', alias: 'd' },
                noRecursive: { type: 'boolean' },
                dirScript: { type: 'string', alias: 'o' },
                dirResult: { type: 'string', alias: 'O' },

                // FILES

                files: { type: 'string', alias: 'f' },
                ignore: { type: 'string', alias: 'i' },

                scriptFile: { type: 'string', alias: 'F' },
                scriptGrep: { type: 'string', alias: 'G' },

                // CONFIG

                init: { type: 'boolean' },
                config: { type: 'string', alias: 'c' },
                saveConfig: { type: 'boolean' },

                // LANGUAGE

                language: { type: 'string', alias: 'l' },
                languageList: { type: 'boolean' },

                // FILE-RELATED OPTIONS

                encoding: { type: 'string', alias: 'e' },
                lineBreaker: { type: 'string' },
                extFeature: { type: 'string' },
                extTestCases: { type: 'string' },

                // PLUG-IN

                plugin: { type: 'string', alias: 'p' },
                pluginAbout: { type: 'string' },
                pluginInstall: { type: 'string' },
                pluginUninstall: { type: 'string' },
                pluginServe: { type: 'string', alias: 'S' },
                pluginList: { type: 'boolean' },

                target: { type: 'string', alias: 'T' },
                headless: { type: 'boolean', alias: 'H' },
				instances: { type: 'integer', alias: 'I' },

				// DATABASE

				dbInstall: { type: 'string' },
                dbUninstall: { type: 'string' },
                dbList: { type: 'boolean' },

                // PROCESSING AND OUTPUT

                verbose: { type: 'boolean' },
                failFast: { type: 'boolean' },

                noSpec: { type: 'boolean' },
                noTestCase: { type: 'boolean' },
                noScript: { type: 'boolean' },
                noRun: { type: 'boolean' },
                noResult: { type: 'boolean' },

                justSpec: { type: 'boolean' },
                justTestCase: { type: 'boolean' },
                justScript: { type: 'boolean' },
                justRun: { type: 'boolean' },

                // CONTENT GENERATION

                caseUi: { type: 'string' },
                caseMethod: { type: 'string' },
                tcSuppressHeader: { type: 'boolean' },
                tcIndenter: { type: 'string' },

                // RANDOMIC GENERATION

                seed: { type: 'string' },
                randomMinStringSize: { type: 'integer' },
                randomMaxStringSize: { type: 'integer' },
                randomTries: { type: 'integer' },

                // COMBINATION STRATEGIES

                combVariant: { type: 'string' },
                combState: { type: 'string' },
                combInvalid: { type: 'string' },
                combData: { type: 'string' },

                // // SPECIFICATION FILTERING

                // importance: { type: 'integer' },
                // selMinFeature: { type: 'integer' },
                // selMaxFeature: { type: 'integer' },
                // selMinScenario: { type: 'integer' },
                // selMaxScenario: { type: 'integer' },
                // selFilter: { type: 'string' },

                // // TEST SCRIPT FILTERING

                // runMinFeature: { type: 'integer' },
                // runMaxFeature: { type: 'integer' },
                // runMinScenario: { type: 'integer' },
                // runMaxScenario: { type: 'integer' },
                // runFilter: { type: 'string' },

                // INFO

                help: { type: 'boolean' },
                about: { type: 'boolean' },
                version: { type: 'boolean', alias: 'v' },
                newer: { type: 'boolean' },
            }
        };
    }

}
