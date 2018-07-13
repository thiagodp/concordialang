"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/**
 * Configuration maker
 */
class ConfigMaker {
    /**
     * Make a basic CodeceptJS configuration.
     *
     * @param filter Filter for test files.
     * @param output Output folder. Default is "./output".
     * @param outputFile Output report file. Default is 'output.json'.
     */
    makeBasicConfig(filter = 'test/**/*.js', output = './output', outputFile = 'output.json') {
        return {
            "tests": filter,
            "output": output,
            "helpers": {},
            "bootstrap": false,
            "mocha": {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: "-",
                        options: {
                            steps: true
                        }
                    },
                    "json": {
                        stdout: path_1.join(output, outputFile)
                    }
                    // "mochawesome": {
                    //     stdout: "-",
                    //     options: {
                    //         reportDir: output,
                    //         reportFilename: "report",
                    //         uniqueScreenshotNames: true,
                    //         timestamp: true
                    //     }
                    // },
                }
            }
        };
    }
    /**
     * Sets a WebDriverIO helper.
     *
     * @param config Target configuration.
     * @param browser Target browser or browsers. Default is "chrome".
     * @param url Application url. Default is "http://localhost".
     */
    setWebDriverIOHelper(config, browser = 'chrome', url = 'http://localhost') {
        let helpers = this.ensureHelpersProperty(config);
        helpers["WebDriverIO"] = {
            browser: browser,
            url: url,
            windowSize: "maximize",
            smartWait: 5000,
            timeouts: {
                "script": 60000,
                "page load": 10000
            }
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
    setAppiumHelper(config, plataform = 'Android', app = 'http://localhost', device = 'emulator') {
        let helpers = this.ensureHelpersProperty(config);
        helpers["Appium"] = {
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
    setDbHelper(config, requireFile = './node_modules/codeceptjs-dbhelper') {
        let helpers = this.ensureHelpersProperty(config);
        const property = this.getDbHelperProperty();
        helpers[property] = {
            require: requireFile
        };
    }
    /** Returns the property for DbHelper */
    getDbHelperProperty() {
        return 'DbHelper';
    }
    /**
     * Returns true whether the given configuration has DbHelper.
     *
     * @param config Target configuration
     */
    hasDbHelper(config) {
        let helpers = this.ensureHelpersProperty(config);
        const property = this.getDbHelperProperty();
        return !helpers[property] ? false : true;
    }
    /**
     * Sets a CmdHelper
     *
     * @param config Target configuration.
     * @param requireFile Required file or library. Defaults to "./node_modules/codeceptjs-cmdhelper".
     */
    setCmdHelper(config, requireFile = './node_modules/codeceptjs-cmdhelper') {
        let helpers = this.ensureHelpersProperty(config);
        const property = this.getCmdHelperProperty();
        helpers[property] = {
            require: requireFile
        };
    }
    /** Returns the property for CmdHelper */
    getCmdHelperProperty() {
        return 'CmdHelper';
    }
    /**
     * Returns true whether the given configuration has CmdHelper.
     *
     * @param config Target configuration
     */
    hasCmdHelper(config) {
        let helpers = this.ensureHelpersProperty(config);
        const property = this.getCmdHelperProperty();
        return !helpers[property] ? false : true;
    }
    /**
     * Ensure that the given configurations have a helpers property.
     *
     * @param config Target configuration.
     *
     * @returns A reference to the helpers property.
     */
    ensureHelpersProperty(config) {
        if (!config.helpers) {
            config.helpers = {};
        }
        return config.helpers;
    }
    /**
     * Returns true whether the given configuration has a helpers property.
     *
     * @param config Target configuration
     */
    hasHelpersProperty(config) {
        return !config.helpers ? false : true;
    }
}
exports.ConfigMaker = ConfigMaker;
