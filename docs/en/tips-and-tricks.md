# Tips and Tricks

## How to ignore a certain Feature, Scenario, Variant or Test Case for Test Script generation.

Add the tag `@ignore` to a Feature, Scenario, Variant or Test Case, in order to ignore it for test script generation.

## How to show the steps from CodeceptJS in Portuguese:

1. Edit `codecept.json` and add the key `translation` with the value `pt-BR`:

```json
{
   ...
   "translation": "pt-BR"
}
```


## How to generate HTML reports with CodeceptJS:

1. Install **mochawesome** and **mochawesome-report-generator** as *development* dependencies:

    ```bash
    npm install --save-dev mochawesome mochawesome-report-generator
    ```

2. Edit `codecept.json` and add **mochawesome** to `reporterOptions`:

    ```json
    ...
	"mocha": {
		"reporterOptions": {

			...

			"mochawesome": {
				"stdout": "-",
				"options": {
					"reportDir": "./output",
					"reportFilename": "report",
					"overwrite": false,
					"autoOpen": true
				}
			}
		}
	}
    ...
    ```

The reports will be generated to the folder `output`.

*Notes:*
- Option `overwrite` makes it to avoid overwriting the generated file. This usually generates a different file names each time, such as `mochawesome_001.html`, `mochawesome_002.html` and so on.
- Option `autoOpen` makes it to open the generated report with the default browser after the tests are finished.

👉 **See the [Mochawesome Report Generator's documentation](https://github.com/adamgruber/mochawesome-report-generator/) for more details.**


# How to speed up your browser tests

In `codecept.json`, go to the section `WebDriverIO`, and add the key `restart` with the value `false`. This will make the browser not to restart every test. However, keep in mind that some tests may require a fresh start. So, check if this tip makes sense for your application. You can remove the key later if needed.
