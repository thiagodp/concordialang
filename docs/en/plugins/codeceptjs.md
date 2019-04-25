# Plug-ins for CodeceptJS

Available plug-ins for CodeceptJS:
- `codeceptjs` for testing web applications
- `codeceptjs-appium` for testing mobile or desktop applications

The above plug-ins shall generate a default configuration file `codecept.json` when that file is not found. Instead, you can configure CodeceptJS by yourself with the following command:

```bash
codeceptjs init
```


## `codeceptjs`

Generates the following `codecept.json`:

```json
{
	"tests": "test/**/*.js",
	"output": "output",
	"helpers": {
		"WebDriverIO": {
			"browser": "chrome",
			"url": "http://localhost",
			"windowSize": "maximize",
			"smartWait": 5000,
			"timeouts": {
				"script": 60000,
				"page load": 10000
			}
		},
		"DbHelper": {
			"require": "./node_modules/codeceptjs-dbhelper"
		},
		"CmdHelper": {
			"require": "./node_modules/codeceptjs-cmdhelper"
		}
	},
	"bootstrap": false,
	"mocha": {
		"reporterOptions": {
			"codeceptjs-cli-reporter": {
				"stdout": "-",
				"options": {
					"steps": true
				}
			},
			"json": {
				"stdout": "output/output.json"
			}
		}
	}
}
```

## `codeceptjs-appium`

Generates the following `codecept.json`:

```json
```