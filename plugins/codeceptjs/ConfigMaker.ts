/**
 * Configuration maker
 */
export class ConfigMaker {

    /**
     * Make a basic CodeceptJS configuration.
     *
     * @param filter Filter for test files.
     * @param output Output folder. Default is "./output".
     */
    makeBasicConfig(
        filter: string = 'test/**/*.js',
        output: string = './output'
    ) {
        return {
            "tests": filter,
            "timeout": 10000,
            "output": output,
            "helpers": {},
            "bootstrap": false,
            "mocha": {},
        };
    }

    /**
     * Sets a WebDriverIO helper.
     *
     * @param config Target configuration.
     * @param browser Target browser or browsers. Default is "chrome".
     * @param url Application url. Default is "http://localhost".
     */
    setWebDriverIOHelper(
        config: any,
        browser: any = 'chrome',
        url: string = 'http://localhost'
    ) {
        let helpers = this.ensureHelpersProperty( config );
        helpers[ "WebDriverIO" ] = {
            browser: browser,
            url: url
        };
    }

    /**
     * Sets a Appium helper.
     *
     * @param config Target configuration.
     * @param plataform Plataform. Default is "Android".
     * @param app Application url or path. Default is "http://localhost".
     * @param device Device. Default is "emulator".
     */
    setAppiumHelper(
        config: any,
        plataform: any = 'Android',
        app: string = 'http://localhost',
        device: string = 'emulator'
    ) {
        let helpers = this.ensureHelpersProperty( config );
        helpers[ "Appium" ] = {
            plataform: plataform,
            app: app,
            device: device
        };
    }

    /**
     * Sets a DBHelper
     *
     * @param config Target configuration.
     * @param requireFile Required file or library. Defaults to "./node_modules/codeceptjs-dbhelper".
     */
    setDbHelper(
        config: any,
        requireFile: string = './node_modules/codeceptjs-dbhelper'
    ): void {
        let helpers = this.ensureHelpersProperty( config );
        const property = this.getDbHelperProperty();
        helpers[ property ] = {
            require: requireFile
        };
    }

    /** Returns the property for DbHelper */
    getDbHelperProperty(): string {
        return 'DbHelper';
    }

    /**
     * Returns true whether the given configuration has DbHelper.
     *
     * @param config Target configuration
     */
    hasDbHelper( config: any ): boolean {
        let helpers = this.ensureHelpersProperty( config );
        const property = this.getDbHelperProperty();
        return ! helpers[ property ] ? false : true;
    }

    /**
     * Sets a CmdHelper
     *
     * @param config Target configuration.
     * @param requireFile Required file or library. Defaults to "./node_modules/codeceptjs-cmdhelper".
     */
    setCmdHelper(
        config: any,
        requireFile: string = './node_modules/codeceptjs-cmdhelper'
    ) {
        let helpers = this.ensureHelpersProperty( config );
        const property = this.getCmdHelperProperty();
        helpers[ property ] = {
            require: requireFile
        };
    }

    /** Returns the property for CmdHelper */
    getCmdHelperProperty(): string {
        return 'CmdHelper';
    }

    /**
     * Returns true whether the given configuration has CmdHelper.
     *
     * @param config Target configuration
     */
    hasCmdHelper( config: any ): boolean {
        let helpers = this.ensureHelpersProperty( config );
        const property = this.getCmdHelperProperty();
        return ! helpers[ property ] ? false : true;
    }

    /**
     * Creates a configuration for the Mocha reporter, useful for overriding
     * the current CodeceptJS configuration.
     *
     * @param outputFile File that will contain the test results.
     */
    makeMochaConfig( outputFile: string ): any {
        return {
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: "-",
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: outputFile
                    }
                }
            }
        };
    }

    /**
     * Ensure that the given configurations have a helpers property.
     *
     * @param config Target configuration.
     *
     * @returns A reference to the helpers property.
     */
    ensureHelpersProperty( config: any ): any {
        if ( ! config.helpers ) {
            config.helpers = {};
        }
        return config.helpers;
    }


    /**
     * Returns true whether the given configuration has a helpers property.
     *
     * @param config Target configuration
     */
    hasHelpersProperty( config: any ): boolean {
        return ! config.helpers ? false : true;
    }

}