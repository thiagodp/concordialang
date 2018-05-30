/**
 * Configuration maker
 */
export class ConfigMaker {

    makeConfig(
        helperConfig: object,
        filter: string = '**/*.js'
    ): object {

        let options: any = {
            tests: filter,
            helpers: helperConfig
        };

        return options;
    }


    makeWebDriverIOHelperConfig(
        browser: any = 'chrome',
        url: string = 'http://localhost'
    ): object {
        let obj = {
            "WebDriverIO": {
                browser: browser,
                url: url
            }
        };
        return obj;
    }


    makeAppiumHelperConfig(
        plataform: any = 'Android',
        app: string = 'http://localhost',
        device: string = 'emulator'
    ): object {
        let obj = {
            "Appium": {
                plataform: plataform,
                app: app,
                device: device
            }
        };
        return obj;
    }


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

}