# Plug-ins para CodeceptJS

Plug-ins disponíveis para CodeceptJS:
- `codeceptjs` para testar aplicações para a web
- `codeceptjs-appium` para testar aplicações para dispositivos móveis e desktop

Os plug-ins acima gerarão um arquivo de configuração `codecept.json` quando este não for encontrado. Caso desejar, você mesmo pode configurar o CodeceptJS pelo seguinte comando:

```bash
codeceptjs init
```


## `codeceptjs`

Gera o seguinte `codecept.json`:

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

Gera o seguinte `codecept.json`:

```json
```