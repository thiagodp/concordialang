/**
 * Generates options used by CodeceptJS to execute test scripts.
 * 
 * @author Matheus Eller Fagundes
 */
export class CodeceptJSOptionsBuilder {

    private _driver: string = 'WebDriverIO';
    private _browser: string = 'chrome';
    private _url: string = 'http://localhost:8080';
    private _filter: string  = '*.js';
    private _outputFile: string = './output/report.json';

    public withDriver( driver: string ): CodeceptJSOptionsBuilder {
        this._driver = driver;
        return this;
    }

    public withBrowser( browser: string ): CodeceptJSOptionsBuilder {
        this._browser = browser;
        return this;
    }

    public withUrl( url: string ): CodeceptJSOptionsBuilder {
        this._url = url;
        return this;
    }

    public withFilter( filter: string ): CodeceptJSOptionsBuilder {
        this._filter = filter;
        return this;
    }

    public withOutputFile( outputFile: string ): CodeceptJSOptionsBuilder {
        this._outputFile = outputFile;
        return this;
    }

    public value(): object {
        let options: any = {
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
        options.helpers[ this._driver ] = {
            browser: this._browser,
            url: this._url
        };
        return options;
    }

}
