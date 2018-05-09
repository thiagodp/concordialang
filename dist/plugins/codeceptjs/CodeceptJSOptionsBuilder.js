"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generates options used by CodeceptJS to execute test scripts.
 *
 * @author Matheus Eller Fagundes
 */
class CodeceptJSOptionsBuilder {
    constructor() {
        this._driver = 'WebDriverIO';
        this._browser = 'chrome';
        this._url = 'http://localhost:8080';
        this._filter = '*.js';
        this._outputFile = './output/report.json';
    }
    withDriver(driver) {
        this._driver = driver;
        return this;
    }
    withBrowser(browser) {
        this._browser = browser;
        return this;
    }
    withUrl(url) {
        this._url = url;
        return this;
    }
    withFilter(filter) {
        this._filter = filter;
        return this;
    }
    withOutputFile(outputFile) {
        this._outputFile = outputFile;
        return this;
    }
    value() {
        let options = {
            tests: this._filter,
            helpers: {},
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: "-",
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: this._outputFile
                    }
                }
            }
        };
        options.helpers[this._driver] = {
            browser: this._browser,
            url: this._url
        };
        return options;
    }
}
exports.CodeceptJSOptionsBuilder = CodeceptJSOptionsBuilder;
//# sourceMappingURL=CodeceptJSOptionsBuilder.js.map