# Configuration

Concordia Compiler considers the configuration file `.concordiarc`, which uses the **JSON format**.

Instead of passing some parameters in the command line, you can configure them in `.concordiarc` like this:
```json
{
	"language": "pt",
	"directory": "docs/features",
	"plugin": "codeceptjs",
	"dirScript": "test/e2e",
	"dirResult": "test/e2e/output"
}
```
This example makes `"pt"` the default language, search for feature files in the directory `"docs/features"`, uses the plug-in `"codeceptjs"`, generates test script files in the directory `"test/e2e"` and output files in the directory `"test/e2e/output"`.

## Options

| Category   | Option                      | Data Type       | Default value         | Description |
| ---------- | --------------------------- | --------------- | --------------------- | ----------- |
| Files      |                             |                 |                       | |
|            | `directory`                 | string          | none                  | Directory to search for specification and test case files |
|            | `recursive`                 | boolean         | `true`                | Recursive directory search |
|            | `encoding`                  | string          | `"utf-8"`             | Default file encoding
|            | `extensions`                | array of string | `[ ".feature" ]`      | File extensions to search |
|            | `ignore`                    | array of string | `[]`                  | Files to ignore |
|            | `files`                     | array of string | `[]`                  | Files to consider, instead of considering `directory` |
| Language   |                             |                 |                       | |
|            | `language`                  | string          | `"en"`                | Default specification language |
| Plug-in    |                             |                 |                       | |
|            | `plugin`                    | string          | none                  | Plug-in to use |
| Processing |                             |                 |                       | |
|            | `verbose`                   | boolean         | `false`               | Verbose output |
|            | `compileSpecification`      | boolean         | `true`                | Whether it is desired to compile the specification |
|            | `generateTestCase`          | boolean         | `true`                | Whether it is desired to generate test case files |
|            | `generateScript`            | boolean         | `true`                | Whether it is desired to generate test script files |
|            | `executeScript`             | boolean         | `true`                | Whether it is desired to execute test script files |
|            | `analyzeResult`             | boolean         | `true`                | Whether it is desired to analyze test script results |
|            | `dirTestCase`               | string          | same as features'     | Output directory for test case files |
|            | `dirScript`                 | string          | `"./test"`            | Output directory for test script files |
|            | `dirResult`                 | string          | `"./output"`          | Output directory of test script results |
|            | `lineBreaker`               | string          | OS' default           | Character(s) used to break lines in text files |
| Generation |                             |                 |                       | |
|            | `caseUi`                    | string          | `"camel"`             | String case used to identify UI Elements when their ids are not defined. Possible values are `"camel"`, `"pascal"`, `"snake"`, `"kebab"`, or `"none"`. |
|            | `caseMethod`                | string          | `"snake"`             | String case used for test scripts' methods. Possible values are `"camel"`, `"pascal"`, `"snake"`, `"kebab"`, or `"none"`. |
|            | `tcSuppressHeader`          | boolean         | `false`               | Whether it is desired to suppress header comments in test case files |
|            | `tcIndenter`                | string          | `"  "`                | Character(s) used as indenter for test case files |
|            | `seed`                      | string          | current date and time | Randomic seed used by all the algorithms |
|            | `randomMinStringSize`       | integer         | `0`                   | Minimum size for random strings |
|            | `randomMaxStringSize`       | integer         | `500`                 | Maximum size for random strings |
|            | `randomTriesToInvalidValue` | integer         | `5`                   | Tries to generate random values that are not in a set of values |
| Strategies |                             |                 |                       | |
|            | `combVariant`               | string          | `"random"`            | Algorithm to select and to combine the Variants with the state needed by a certain Variant. Options are: `"random"` to pick a random Variant, `"first"` to pick the first one, `"fmi"` to pick the first most important, or `"all"` to combine them all. |
|            | `combState`                 | string          | `"sre"`               | Algorithm to select and to combine the Test Scenarios of every State of the selected Variants. Options are: `"sre"` to select a random Test Scenario of every State, `"sow"` to use the shuffled one-wise algorithm, `"ow"` to use the one-wise algorithm, or `"all"` to combine them all. |
|            | `combInvalid`               | string|integer  | `"smart"`             | Number of UI Elements that will receive invalid data test cases at a time, *e.g.* `1`. String options are `"none"` for no invalid values, `"smart"` to let the compiler decide, `"random"` to select a random number of UI Elements, `"all"` to select all the invalid values. |
|            | `combData`                  | string          | `"sow"`               | Algorithm to combine data test cases. Options are: `"sre"` to select a random data test case to combine, `"sow"` to use the shuffled one-wise algorithm, `"ow"` to use the one-wise algorithm, or `"all"` to combine them all. |
