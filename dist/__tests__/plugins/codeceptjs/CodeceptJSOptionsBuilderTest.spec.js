"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeceptJSOptionsBuilder_1 = require("../../../plugins/codeceptjs/CodeceptJSOptionsBuilder");
/**
 * @author Matheus Eller Fagundes
 */
describe('CodeceptJSOptionsBuilderTest', () => {
    it('builds default options', () => {
        const defaultOptions = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './output/report.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder().value();
        expect(options).toEqual(defaultOptions);
    });
    it('builds options with custom driver', () => {
        const expectedOptions = {
            helpers: {
                SomeDriver: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './output/report.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withDriver('SomeDriver')
            .value();
        expect(options).toEqual(expectedOptions);
    });
    it('builds options with custom browser', () => {
        const expectedOptions = {
            helpers: {
                WebDriverIO: {
                    browser: "firefox",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './output/report.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withBrowser('firefox')
            .value();
        expect(options).toEqual(expectedOptions);
    });
    it('builds options with custom url', () => {
        const expectedOptions = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "https://www.mywebsystem.com/"
                }
            },
            tests: "*.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './output/report.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withUrl('https://www.mywebsystem.com/')
            .value();
        expect(options).toEqual(expectedOptions);
    });
    it('builds options with custom filter', () => {
        const expectedOptions = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*_test.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './output/report.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withFilter('*_test.js')
            .value();
        expect(options).toEqual(expectedOptions);
    });
    it('builds options with custom output file', () => {
        const defaultOptions = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './out/result.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withOutputFile('./out/result.json')
            .value();
        expect(options).toEqual(defaultOptions);
    });
    it('builds full customized options', () => {
        const expectedOptions = {
            helpers: {
                SomeDriver: {
                    browser: "firefox",
                    url: "https://www.mywebsystem.com/"
                }
            },
            tests: "*_test.js",
            mocha: {
                reporterOptions: {
                    "codeceptjs-cli-reporter": {
                        stdout: '-',
                        options: {
                            steps: true
                        }
                    },
                    json: {
                        stdout: './out/result.json'
                    }
                }
            }
        };
        const options = new CodeceptJSOptionsBuilder_1.CodeceptJSOptionsBuilder()
            .withDriver('SomeDriver')
            .withBrowser('firefox')
            .withFilter('*_test.js')
            .withUrl('https://www.mywebsystem.com/')
            .withOutputFile('./out/result.json')
            .value();
        expect(options).toEqual(expectedOptions);
    });
});
//# sourceMappingURL=CodeceptJSOptionsBuilderTest.spec.js.map