# Concordia

> Generate functional tests automatically from your Agile specification.

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang)
[![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)
[![GitHub last commit](https://img.shields.io/github/last-commit/thiagodp/concordialang.svg)](https://github.com/thiagodp/concordialang/releases)
[![npm](https://img.shields.io/npm/l/concordialang.svg)](https://github.com/thiagodp/concordialang/blob/master/LICENSE.txt)
[![slack](https://img.shields.io/badge/slack-chat-blue.svg)](https://bit.ly/2u2vKJX)

Translations: [Português](readme-pt.md) 🌎

![Example](media/example-en.gif)

*Concordia Compiler* is a tool that allows you to generate functional tests from a requirements specification written in *Concordia Language*.  You can use them for:

1. Writing [business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html) specifications.

2. Generating and executing [functional test cases](https://en.wikipedia.org/wiki/Functional_testing) automatically. *No just test script skeletons!* It generates complete test cases and test scripts - with *test data* and *oracles*. You don't even need to know how to write code!

3. Generating test scripts for different testing frameworks, such as [CodeceptJS](https://codecept.io/), through [plug-ins](plugins/README.md).

4. Writing additional test cases when needed, using *Concordia Language* - currently available in **English** (`en`) and **Portuguese** (`pt`). These test cases are converted to test scripts using plugins.

5. Analyzing test results to help evaluating failures.

*Concordia Language* is an [Agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification metalanguage inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).


## Contents

- [Latest news](https://github.com/thiagodp/concordialang/releases)
- [Documentation](docs/README.md)
- [Why Concordia ?](#why-concordia)
- [Install](#install)
- [Execution](#execution)
- [Very basic example](#very-basic-example)
- [CLI](#cli)
- [Recommended usage cycle](#recommended-usage-cycle)
- [How it works](#how-it-works)
- [Contributing to Concordia](#contributing-to-concordia)
- [See also](#see-also)


## ❓ Why Concordia ?

- Simple [syntax](docs/language/en.md)

- No need to write code

- Separate high-level, **business language** declarations from medium-low-level, **computing language** declarations

- Have complete and relevant tests in few seconds

- High coverage of business rules at a small declaration effort

- Let you describe complex, dynamic business rules, including those related to data from databases

- Have test cases declared in a high-level language

- Create additional test cases without coding

- Generated test cases and test scripts receive comments with related specification, so you can track them

- Available in more than one spoken language

- No special text editor required - use your favorite UTF-8 editor

- Use your favorite [version control system](https://en.wikipedia.org/wiki/Version_control) to manage changes

- Batteries included (install and use)

- Works on Windows, Linux, and Mac


## 💿 Installation

Concordia Compiler requires [NodeJS](https://nodejs.org/) version `8` or above.

> Whether you wish to install the plugin CodeceptJS for testing web applications (CodeceptJS + WebDriverIO), it is also needed to install the [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

After NodeJS is installed, run the following command:
```bash
npm install -g concordialang
```

You can test the installation as follows:
```bash
concordia --version
```
Whether a version number is displayed, the installation was successful.

### 🔌 Installing a plugin

List the available plugins:
```bash
concordia --plugin-list
```

Then install the desired one. For instance:
```bash
concordia --plugin-install codeceptjs
```

Concordia and its plug-ins install all the needed dependencies by default, in order to make the setup process simpler.


## 🚀 Execution

### 🖥 Starting a testing server

Sometimes when we run tests against a user interface, it is needed to control the execution through a testing server. For instance, `CodeceptJS` may have to use a `Selenium` server to control the execution of tests for web applications. Without such server, it is not able to work.

Run the following command to start a testing server:

```bash
concordia --plugin-serve <plugin-name>
```

After the server is started, you probably have to run Concordia Compiler in another terminal (console).

### 🗲 Running

```bash
concordia path/to/your/features --plugin <plugin-name>
```

For example, the following command will search for feature files recursively from the current directory.
```bash
concordia --plugin codeceptjs
```

### 🖥 Stopping a testing server

It is likely that your testing server remain open after executing all the tests.

Type <kbd>Ctrl</kbd> + <kbd>C</kbd> to close it.


## 📑 Very basic example

> *Example without test data generation, test scenario combination, or most language capabilities.*

**Input**

*search.feature* :

```gherkin
Feature: Google Search

Scenario: Search returns expected result

  Variant: Search content on pressing Enter
    Given that I am on "https://google.com"
    When I type "concordialang.org" in <q>
      And I press "Enter"
    Then I see "npm"
```
**Run**

*Start the test server (once)*
```bash
$ concordia --plugin-serve codeceptjs
```
*Generate and run*
```bash
$ concordia --plugin codeceptjs
```

**Output**

*search.testcase* :
```gherkin
# Generated with ❤ by Concordia
#
# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

import "search.feature"

@generated
@scenario(1)
@variant(1)
Test case: Search content on pressing Enter - 1
  Given that I am on "https://google.com"
  When I type "concordialang.org" in <q>
    And I press "Enter"
  Then I see "npm"
```

*search.js* :
```javascript
// Generated with ❤ by Concordia
// source: search.testcase
//
// THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

Feature("Google Search");

Scenario("Search returns expected result | Search content on pressing Enter - 1", (I) => {
    I.amOnPage("https://google.com"); // (10,5)
    I.fillField("q", "concordialang.org"); // (11,5)
    I.pressKey("Enter"); // (12,7)
    I.see("npm"); // (13,5)
});
```

and it will also **run the tests**.

See more in [Documentation](docs/README.md). 👀


## 💻 CLI

```
concordia --help

  Concordia Language Compiler

  Usage: concordia [<dir>] [options]

  where <dir> is the directory that contains your specification files.

  Options:

  Input directories and files

  -d,  --directory <value>               Directory to search.
  -nr, --no-recursive                    Disable recursive search.
  -e,  --encoding <value>                File encoding. Default is "utf8".
  -x,  --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed).
  -i,  --ignore <"file1,file2,...">      Files to ignore, when <dir> is informed.
  -f,  --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l,  --language <code>                 Default language. Default is "en" (english).
  -ll, --language-list                   List available languages.

  Plug-in

  -p,  --plugin <name>                   Plug-in to use.
  -pa, --plugin-about <name>             About a plug-in.
  -pi, --plugin-install <name>           Install a plug-in.
  -pu, --plugin-uninstall <name>         Uninstall a plug-in.
  -ps, --plugin-serve <name>             Starts a test server with a plugin.
  -pl, --plugin-list                     List available plug-ins.

  Processing and output

  --init                                 Init a guided, basic configuration.

  --save-config                          Save/overwrite a configuration file
                                         with the other command line options.

  -b,  --verbose                         Verbose output.

  -np, --no-spec                         Do not process specification files.
  -nt, --no-test-case                    Do not generate test cases.
  -ns, --no-script                       Do not generate test scripts.
  -nx, --no-run                          Do not run test scripts.
  -nu, --no-result                       Do not process execution results.

  -jp, --just-spec                       Just process specification files.
  -jt, --just-test-case                  Just generate test cases.
  -js, --just-script                     Just generate test scripts.
  -jx, --just-run                        Just execute test scripts.

  -dt, --dir-test-case                   Output directory for test cases.
  -ds, --dir-script                      Output directory for test scripts.
  -du, --dir-result                      Output directory for result files.

  -ef, --ext-feature                     File extension for Feature files.
                                         Default is .feature.
  -et, --ext-test-case                   File extension for Test Case files.
                                         Default is .testcase.
  -lb, --line-breaker                    Character used for breaking lines.

  Content generation

  --case-ui (camel|pascal|snake|kebab|none)
                                         String case to use for UI Element names
                                         when they are not defined (default is camel).
  --case-method (camel|pascal|snake|kebab|none)
                                         String case to use for test script methods
                                         (default is snake).
  --tc-suppress-header                   Suppress header in generated Test Case files.
  --tc-indenter <value>                  String used as indenter in generated Test Case
                                         files (default is double spaces).

  Randomic value generation

  --seed <value>                         Use the given random seed. Default is current
                                         date and time.
  --random-min-string-size <number>      Minimum random string size. Default is 0.
  --random-max-string-size <number>      Minimum random string size. Default is 500.
  --random-tries <number>                Random tries to generate invalid values.
                                         Default is 5.

  Combination strategies

  --comb-variant (random|first|fmi|all)  Strategy to select variants to combine,
                                         by their states.
        random  = random variant that has the state (default)
        first   = first variant that has the state
        fmi     = first most important variant that has the state
        all     = all variants that have the state

  --comb-state (sre|sow|onewise|all)     Strategy to combine states of a
                                         same variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  --comb-invalid (node|0|1|smart|random|all)
                                         How many input data will be invalid
                                         in each test case.
        0,none  = no invalid data
        1       = one invalid data per test case
        smart   = use algorithm to decide (default)
        random  = random invalid data per test case
        all     = all invalid

  --comb-data (sre|sow|onewise|all)     Strategy to combine data test cases
                                        of a variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  Information

  -v,  --version                         Show current version.
  -a,  --about                           Show information about this application.
  -h,  --help                            Show this help.

  Examples

   $ concordia --plugin some-plugin
   $ concordia path/to/dir --no-test-case --no-script -p some-plugin
   $ concordia --files "file1.feature,path/to/file2.feature" -p some-plugin -l pt
```


## ♺ Recommended usage cycle

1. Write or update your requirements specification with the *Concordia Language* and validate it with users or stakeholders;

2. Use *Concordia Compiler* to generate tests from the specification and to run them;

3. If the tests **failed**, there are some possibilities:

    1. You still haven't implemented the corresponding behavior in your application. In this case, just implement it and run the tests again.

    2. Your application is behaving differently from the specification. In this case, it may have bugs or you or your team haven't implemented the behavior exactly like described in the specification.   - Whether the application has a bug, we are happy to have discovered it! Just fix it and run the tests again to make sure that the bug is gone.
      - Otherwise, you can decide between **changing your application** to behave exactly like the specification describes, or **changing the specification** to match your application behavior. In the latter case, back to step `1`.

4. If the tests **passed**, *great job!* Now you can write new requirements or add more test cases, so just back to step `1`.


## 🧠 How it works

![Process](media/process.png)

1. It reads your `.feature` and `.testcase` files, and uses a [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) and a [parser](https://en.wikipedia.org/wiki/Parsing#Computer_languages) to identify and check documents' structure.

2. It uses [Natural Language Processing](https://en.wikipedia.org/wiki/Natural-language_processing) (NLP) to identify sentences' [intent](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/). This increases the chances of recognizing sentences written in different styles.

3. It performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)) to check recognized declarations.

4. It uses the specification to infer the most suitable *test cases*, *test data*, and *test oracles*, and then generates `.testcase` files in Concordia Language.

5. It transforms all the test cases into test scripts (that is, source code) using a plug-in.

6. It executes the test scripts with the plug-in. These test scripts will check your application's behavior through its user interface.

7. It reads and presents execution results. These results relate failing tests to the specification, in order to help you understanding the possible reasons of a failure.


👉 See the [set of generated test cases](docs/test-cases.md).


## 🍻 Contributing

*There are lot of ways to contribute. Many of them are a piece of cake!* 😉

- Give it a star (⭐) - people that follows you will know about it
- Give feedback using our [chat](https://concordialang.slack.com)
- Improve the documentation, translate it or [report](https://github.com/thiagodp/concordialang/issues/new) typos
- [Create a new plug-in](plugins/README.md) for your favorite programming language and testing framework
- [Report a bug](https://github.com/thiagodp/concordialang/issues/new)
- Suggest [improvement or new features](https://github.com/thiagodp/concordialang/issues/new)
- [Develop it](docs/development.md) with us


### Badge

Show that your project is using Concordia → [![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)

```
[![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)
```

## 👁 See also

- [katalon-concordia](https://github.com/thiagodp/katalon-concordia) - converts test scripts recorded with [Katalon Recorder](https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid) into sentences in Concordia Language.


## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)
