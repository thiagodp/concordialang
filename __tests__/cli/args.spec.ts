import { parseArgs } from "../../modules/cli/args";

describe( 'args', () => {

	it( 'detects -d', () => {
		const r = parseArgs( [ '-d', 'foo' ] );
		expect( r.flags.directory ).toEqual( 'foo' );
	} );

	it( 'detects --directory', () => {
		const r = parseArgs( [ '--directory', 'foo' ] );
		expect( r.flags.directory ).toEqual( 'foo' );
	} );

	it( 'detects --dir-script', () => {
		const r = parseArgs( [ '--dir-script', 'foo' ] );
		expect( r.flags.dirScript ).toEqual( 'foo' );
	} );

	it( 'detects -o', () => {
		const r = parseArgs( [ '-o', 'foo' ] );
		expect( r.flags.dirScript ).toEqual( 'foo' );
	} );

	it( 'detects --dir-result', () => {
		const r = parseArgs( [ '--dir-result', 'foo' ] );
		expect( r.flags.dirResult ).toEqual( 'foo' );
	} );

	it( 'detects -O', () => {
		const r = parseArgs( [ '-O', 'foo' ] );
		expect( r.flags.dirResult ).toEqual( 'foo' );
	} );

	it( 'detects --file', () => {
		const r = parseArgs( [ '--file', 'foo' ] );
		expect( r.flags.file ).toEqual( 'foo' );
	} );

	it( 'detects --files', () => {
		const r = parseArgs( [ '--files', 'foo' ] );
		expect( r.flags.file ).toEqual( 'foo' );
	} );

	it( 'detects -f', () => {
		const r = parseArgs( [ '-f', 'foo' ] );
		expect( r.flags.file ).toEqual( 'foo' );
	} );

	it( 'detects --ignore', () => {
		const r = parseArgs( [ '--ignore', 'foo' ] );
		expect( r.flags.ignore ).toEqual( 'foo' );
	} );

	it( 'detects -i', () => {
		const r = parseArgs( [ '-i', 'foo' ] );
		expect( r.flags.ignore ).toEqual( 'foo' );
	} );

	it( 'detects --script-file', () => {
		const r = parseArgs( [ '--script-file', 'foo' ] );
		expect( r.flags.scriptFile ).toEqual( 'foo' );
	} );

	it( 'detects --script-files', () => {
		const r = parseArgs( [ '--script-files', 'foo' ] );
		expect( r.flags.scriptFile ).toEqual( 'foo' );
	} );

	it( 'detects -F', () => {
		const r = parseArgs( [ '-F', 'foo' ] );
		expect( r.flags.scriptFile ).toEqual( 'foo' );
	} );

	it( 'detects --script-grep', () => {
		const r = parseArgs( [ '--script-grep', 'foo' ] );
		expect( r.flags.scriptGrep ).toEqual( 'foo' );
	} );

	it( 'detects -G', () => {
		const r = parseArgs( [ '-G', 'foo' ] );
		expect( r.flags.scriptGrep ).toEqual( 'foo' );
	} );

	it( 'detects --config', () => {
		const r = parseArgs( [ '--config', 'foo' ] );
		expect( r.flags.config ).toEqual( 'foo' );
	} );

	it( 'detects -c', () => {
		const r = parseArgs( [ '-c', 'foo' ] );
		expect( r.flags.config ).toEqual( 'foo' );
	} );

	it( 'detects --save-config', () => {
		const r = parseArgs( [ '--save-config' ] );
		expect( r.flags.saveConfig ).toEqual( true );
	} );

	it( 'detects --language', () => {
		const r = parseArgs( [ '--language', 'pt' ] );
		expect( r.flags.language ).toEqual( 'pt' );
	} );

	it( 'detects -l', () => {
		const r = parseArgs( [ '-l', 'pt' ] );
		expect( r.flags.language ).toEqual( 'pt' );
	} );

	it( 'detects --language-list', () => {
		const r = parseArgs( [ '--language-list' ] );
		expect( r.flags.languageList ).toEqual( true );
	} );

	it( 'detects --locale-list', () => {
		const r = parseArgs( [ '--locale-list' ] );
		expect( r.flags.localeList ).toEqual( true );
	} );

	it( 'detects -e', () => {
		const r = parseArgs( [ '-e', 'pt-BR' ] );
		expect( r.flags.encoding ).toEqual( 'pt-BR' );
	} );

	it( 'detects --line-breaker', () => {
		const r = parseArgs( [ '--line-breaker', '\\n' ] );
		expect( r.flags.lineBreaker ).toEqual( '\\n' );
	} );

	it( 'detects --extension-feature', () => {
		const r = parseArgs( [ '--extension-feature', '.feature' ] );
		expect( r.flags.extensionFeature ).toEqual( '.feature' );
	} );

	it( 'detects --ext-feature', () => {
		const r = parseArgs( [ '--ext-feature', '.feature' ] );
		expect( r.flags.extensionFeature ).toEqual( '.feature' );
	} );

	it( 'detects --extension-test-case', () => {
		const r = parseArgs( [ '--extension-test-case', '.testcase' ] );
		expect( r.flags.extensionTestCase ).toEqual( '.testcase' );
	} );

	it( 'detects --ext-test-case', () => {
		const r = parseArgs( [ '--ext-test-case', '.testcase' ] );
		expect( r.flags.extensionTestCase ).toEqual( '.testcase' );
	} );

	it( 'detects --plugin', () => {
		const r = parseArgs( [ '--plugin', 'foo' ] );
		expect( r.flags.plugin ).toEqual( 'foo' );
	} );

	it( 'detects -p', () => {
		const r = parseArgs( [ '-p', 'foo' ] );
		expect( r.flags.plugin ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-about', () => {
		const r = parseArgs( [ '--plugin-about', 'foo' ] );
		expect( r.flags.pluginAbout ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-info', () => {
		const r = parseArgs( [ '--plugin-info', 'foo' ] );
		expect( r.flags.pluginAbout ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-install', () => {
		const r = parseArgs( [ '--plugin-install', 'foo' ] );
		expect( r.flags.pluginInstall ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-uninstall', () => {
		const r = parseArgs( [ '--plugin-uninstall', 'foo' ] );
		expect( r.flags.pluginUninstall ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-serve', () => {
		const r = parseArgs( [ '--plugin-serve', 'foo' ] );
		expect( r.flags.pluginServe ).toEqual( 'foo' );
	} );

	it( 'detects -S', () => {
		const r = parseArgs( [ '-S', 'foo' ] );
		expect( r.flags.pluginServe ).toEqual( 'foo' );
	} );

	it( 'detects --plugin-list', () => {
		const r = parseArgs( [ '--plugin-list' ] );
		expect( r.flags.pluginList ).toEqual( true );
	} );

	it( 'detects --target', () => {
		const r = parseArgs( [ '--target', 'firefox' ] );
		expect( r.flags.target ).toEqual( 'firefox' );
	} );

	it( 'detects --targets', () => {
		const r = parseArgs( [ '--targets', 'firefox,chrome' ] );
		expect( r.flags.target ).toEqual( 'firefox,chrome' );
	} );

	it( 'detects -T', () => {
		const r = parseArgs( [ '-T', 'firefox' ] );
		expect( r.flags.target ).toEqual( 'firefox' );
	} );

	it( 'detects --headless', () => {
		const r = parseArgs( [ '--headless' ] );
		expect( r.flags.headless ).toEqual( true );
	} );

	it( 'detects -H', () => {
		const r = parseArgs( [ '-H' ] );
		expect( r.flags.headless ).toEqual( true );
	} );

	it( 'detects --instances', () => {
		const r = parseArgs( [ '--instances', '3' ] );
		expect( r.flags.instances ).toEqual( 3 );
	} );

	it( 'detects -I', () => {
		const r = parseArgs( [ '-I', '3' ] );
		expect( r.flags.instances ).toEqual( 3 );
	} );

	it( 'detects --db-install', () => {
		const r = parseArgs( [ '--db-install', 'mysql' ] );
		expect( r.flags.dbInstall ).toEqual( 'mysql' );
	} );

	it( 'detects --db-uninstall', () => {
		const r = parseArgs( [ '--db-uninstall', 'mysql' ] );
		expect( r.flags.dbUninstall ).toEqual( 'mysql' );
	} );

	it( 'detects --db-list', () => {
		const r = parseArgs( [ '--db-list' ] );
		expect( r.flags.dbList ).toEqual( true );
	} );

	it( 'detects --fail-fast', () => {
		const r = parseArgs( [ '--fail-fast' ] );
		expect( r.flags.stopOnTheFirstError ).toEqual( true );
	} );

	it( 'detects --no-test-case', () => {
		const r = parseArgs( [ '--no-test-case' ] );
		expect( r.flags.testCase ).toEqual( false );
	} );


	it( 'detects --just-spec', () => {
		const r = parseArgs( [ '--just-spec' ] );
		expect( r.flags.justSpec ).toEqual( true );
	} );

	it( 'detects --just-test-case', () => {
		const r = parseArgs( [ '--just-test-case' ] );
		expect( r.flags.justTestCase ).toEqual( true );
	} );

	it( 'detects --just-script', () => {
		const r = parseArgs( [ '--just-script' ] );
		expect( r.flags.justScript ).toEqual( true );
	} );

	it( 'detects --just-run', () => {
		const r = parseArgs( [ '--just-run' ] );
		expect( r.flags.justRun ).toEqual( true );
	} );

	it( 'detects --just-result', () => {
		const r = parseArgs( [ '--just-result' ] );
		expect( r.flags.justResult ).toEqual( true );
	} );

	it( 'detects --case-ui', () => {
		const r = parseArgs( [ '--case-ui', 'kebab' ] );
		expect( r.flags.caseUi ).toEqual( 'kebab' );
	} );

	it( 'detects --tc-suppress-header', () => {
		const r = parseArgs( [ '--tc-suppress-header' ] );
		expect( r.flags.tcSuppressHeader ).toEqual( true );
	} );

	it( 'detects --tc-indenter', () => {
		const r = parseArgs( [ '--tc-indenter', '\\t' ] );
		expect( r.flags.tcIndenter ).toEqual( '\\t' );
	} );

	it( 'detects --random-min-string-size', () => {
		const r = parseArgs( [ '--random-min-string-size', '0' ] );
		expect( r.flags.randomMinStringSize ).toEqual( 0 );
	} );

	it( 'detects --random-max-string-size', () => {
		const r = parseArgs( [ '--random-max-string-size', '100' ] );
		expect( r.flags.randomMaxStringSize ).toEqual( 100 );
	} );

	it( 'detects --random-tries', () => {
		const r = parseArgs( [ '--random-tries', '3' ] );
		expect( r.flags.randomTriesToInvalidValue ).toEqual( 3 );
	} );

	it( 'detects --comb-variant', () => {
		const r = parseArgs( [ '--comb-variant', 'random' ] );
		expect( r.flags.combVariant ).toEqual( 'random' );
	} );

	it( 'detects --comb-state', () => {
		const r = parseArgs( [ '--comb-state', 'random' ] );
		expect( r.flags.combState ).toEqual( 'random' );
	} );

	it( 'detects --comb-invalid', () => {
		const r = parseArgs( [ '--comb-invalid', 'random' ] );
		expect( r.flags.combInvalid ).toEqual( 'random' );
	} );

	it( 'detects --comb-data', () => {
		const r = parseArgs( [ '--comb-data', 'random' ] );
		expect( r.flags.combData ).toEqual( 'random' );
	} );

	it( 'detects --version', () => {
		const r = parseArgs( [ '--version' ] );
		expect( r.flags.version ).toEqual( true );
	} );

	it( 'detects -v', () => {
		const r = parseArgs( [ '-v' ] );
		expect( r.flags.version ).toEqual( true );
	} );


	it( 'detects --recursive', () => {
		const r = parseArgs( [ '--recursive' ] );
		expect( r.flags.recursive ).toEqual( true );
	} );

	it( 'detects --seed', () => {
		const r = parseArgs( [ '--seed', 'abc' ] );
		expect( r.flags.seed ).toEqual( 'abc' );
	} );

	it( 'detects --no-spec', () => {
		const r = parseArgs( [ '--no-spec' ] );
		expect( r.flags.spec ).toEqual( false );
	} );

	it( 'detects --no-script', () => {
		const r = parseArgs( [ '--no-script' ] );
		expect( r.flags.script ).toEqual( false );
	} );

	it( 'detects --no-run', () => {
		const r = parseArgs( [ '--no-run' ] );
		expect( r.flags.run ).toEqual( false );
	} );

	it( 'detects --no-result', () => {
		const r = parseArgs( [ '--no-result' ] );
		expect( r.flags.result ).toEqual( false );
	} );


	it( 'detects --debug', () => {
		const r = parseArgs( [ '--debug' ] );
		expect( r.flags.debug ).toEqual( true );
	} );

	it( 'detects --recursive', () => {
		const r = parseArgs( [ '--recursive' ] );
		expect( r.flags.recursive ).toEqual( true );
	} );

	it( 'detects --init', () => {
		const r = parseArgs( [ '--init' ] );
		expect( r.flags.init ).toEqual( true );
	} );

	it( 'detects --save-config', () => {
		const r = parseArgs( [ '--save-config' ] );
		expect( r.flags.saveConfig ).toEqual( true );
	} );

	it( 'detects --language-list', () => {
		const r = parseArgs( [ '--language-list' ] );
		expect( r.flags.languageList ).toEqual( true );
	} );

	it( 'detects --locale-list', () => {
		const r = parseArgs( [ '--locale-list' ] );
		expect( r.flags.localeList ).toEqual( true );
	} );

	it( 'detects --headless', () => {
		const r = parseArgs( [ '--headless' ] );
		expect( r.flags.headless ).toEqual( true );
	} );

	it( 'detects --db-list', () => {
		const r = parseArgs( [ '--db-list' ] );
		expect( r.flags.dbList ).toEqual( true );
	} );

	it( 'detects --verbose', () => {
		const r = parseArgs( [ '--verbose' ] );
		expect( r.flags.verbose ).toEqual( true );
	} );

	it( 'detects -x', () => {
		const r = parseArgs( [ '-x' ] );
		expect( r.flags.x ).toEqual( true );
	} );

	it( 'detects --help', () => {
		const r = parseArgs( [ '--help' ] );
		expect( r.flags.help ).toEqual( true );
	} );

	it( 'detects --about', () => {
		const r = parseArgs( [ '--about' ] );
		expect( r.flags.about ).toEqual( true );
	} );

	it( 'detects --version', () => {
		const r = parseArgs( [ '--version' ] );
		expect( r.flags.version ).toEqual( true );
	} );

	it( 'detects --newer', () => {
		const r = parseArgs( [ '--newer' ] );
		expect( r.flags.newer ).toEqual( true );
	} );

} );
