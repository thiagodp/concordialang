"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Configuration maker
 */
class ConfigMaker {
    makeConfig(helperConfig, filter = '**/*.js') {
        let options = {
            tests: filter,
            helpers: helperConfig
        };
        return options;
    }
    makeWebDriverIOHelperConfig(browser = 'chrome', url = 'http://localhost') {
        let obj = {
            "WebDriverIO": {
                browser: browser,
                url: url
            }
        };
        return obj;
    }
    makeAppiumHelperConfig(plataform = 'Android', app = 'http://localhost', device = 'emulator') {
        let obj = {
            "Appium": {
                plataform: plataform,
                app: app,
                device: device
            }
        };
        return obj;
    }
    makeMochaConfig(outputFile) {
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
exports.ConfigMaker = ConfigMaker;
