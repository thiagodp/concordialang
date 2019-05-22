# Concordia

> Generate functional tests automatically from your Agile specification.

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang)
[![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)
[![GitHub last commit](https://img.shields.io/github/last-commit/thiagodp/concordialang.svg)](https://github.com/thiagodp/concordialang/releases)
[![npm](https://img.shields.io/npm/l/concordialang.svg)](https://github.com/thiagodp/concordialang/blob/master/LICENSE.txt)
[![slack](https://img.shields.io/badge/slack-chat-blue.svg)](https://bit.ly/2u2vKJX)

Translations: [Português](readme-pt.md) 🌎

✨ **Raise your applications' quality** ✨

At a glance:

1. Write agile requirements specifications with Concordia Language.

2. Use Concordia Compiler to setup the testing environment for you.

3. Use Concordia Compiler to generate and execute functional test scripts from your Concordia specification. *No coding required.*


## Contents

- [LATEST NEWS](https://github.com/thiagodp/concordialang/releases) 🔥
- [Documentation](docs/README.md) 📖
- [About](#about)
- [Getting Started](#getting-started)
- [See Also](#see-also)
- [Related Projects](#related-projects)


## 💡 About

**Concordia** is a [business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html), [agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification metalanguage inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Currently it supports [English](./docs/en/language.md) and [Portuguese](./docs/pt/language.md). New languages can be added easily.

**Concordia Compiler** generates and executes [functional](https://en.wikipedia.org/wiki/Functional_testing) test cases and test scripts from documents written in *Concordia Language*. It uses [NLP](https://en.wikipedia.org/wiki/Natural_language_processing) and many other techniques in the process.

Both **test cases** and **test scripts** receive *test data* and *test oracles*. You don't have to produce them manually. They are inferred from your specification written with Concordia Language.

Concordia Compiler uses [plug-ins](docs/en/plugins.md) to transform abstract test scripts into source code and to setup the test environment for you. Every **plug-in** can generate test scripts for a different programming language and testing framework, for **web**, **mobile**, or **desktop** applications.


### Why using it ?

1. Simple, flexible [syntax](docs/en/language.md).

2. Separate high-level, business language declarations from medium-low-level, computing language declarations, **improving the communication** between your team, customers, and other stakeholders. Thus, you can **use a same document** to discuss features with stakeholders, analysts, testers, and developers, and facilitate the adoption of [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development)/[ATDD](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development)/[SbE](https://en.wikipedia.org/wiki/Specification_by_example).

3. Make **your specifications more useful**. Get automated functional tests from them easily and **drive your development covered by tests**.

4. **Add test automation to new or legacy applications** without having to code.

5. Generate **relevant test cases and test scripts** in a few milliseconds. Get tests that adopt techniques such as [equivalence partitioning](https://en.wikipedia.org/wiki/Equivalence_partitioning), [boundary value analysis](https://en.wikipedia.org/wiki/Boundary-value_analysis), [combinatorial testing](https://en.wikipedia.org/wiki/All-pairs_testing) (*n-wise*), and [random testing](https://en.wikipedia.org/wiki/Random_testing) without having to think about (and invest your time in) them all.

6. **Reduce the need of writing negative scenarios** (those scenarios that handle incorrect or invalid input) by describing system rules of user interface elements. Concordia lets you to describe complex, dynamic system rules.

7. Create rules with data from **files or databases** and Concordia will use them in the produced test cases.

8.  **Track your specification** from the produced test cases and test scripts. They receive special line comments that refer to the specification and adopted testing techniques.

9.  **Add test cases without coding**. Write them with Concordia and let the compiler convert them into code.

10.  Use a **plain text** specification that is version control-friendly and can evolve with your application.


## 💿 Installation

Concordia Compiler works on **Windows**, **Linux**, and **MacOS**, and requires [NodeJS](https://nodejs.org/) version `8` or above. If you want to test  *web-based* applications, you also need to install [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

After installing the dependencies, open the console/terminal and execute the following command:
```bash
npm install -g concordialang
```

> 👉 Concordia Compiler can also be installed locally and executed with [NPX](https://www.npmjs.com/package/npx). NPX is already included in NodeJS `8.2.0` or above.

You can check if the installation was successful by running:
```bash
concordia --version
```

> 👉 Note that `concordia` is the command to be used from now on, which is different from `concordialang` (used to install).


## 🚀 Getting Started

Let's create a basic, "hello world"-like example. To execute its tests, you will need an Internet connection and the [Google Chrome](https://www.google.com/chrome/) web browser installed.

**Step 1: *Create a directory***

Create a directory named `search` and then access it using the terminal:

```bash
mkdir search
cd search
```

👉 If you are using Windows, you may also to create a empty folder using  Windows Explorer, access it, and then type `cmd` in the address bar.

**Step 2: *Configure***

Execute the following command to guide the setup process:

```bash
concordia --init
```

You'll be asked about your preferences and they will be stored in a configuration file named `.concordiarc`. **LET ALL THE DEFAULT VALUES**, by typing <kbd>Enter</kbd> for all the questions.

Plug-ins will also be installed during the process. If you want to install them *manually*, please take a look at the [plugins page](./docs/en/plugins.md).

**Step 3: *Start the test server***

Test automation tools often use a test server to control a *browser*, a *device emulator* or a *real device*. So, first you start a test server, then you run all your tests.

Since **a test server usually blocks** the current terminal/console, **open a new terminal/console**.

> 👉 If you are using Windows, you can start a new terminal from you current directory by running:
> ```bash
> start cmd .
> ```

Concordia Compiler facilitates to start a test server by giving you a parameter `--plugin-serve`. In the new terminal, run the following command:

```bash
concordia --plugin-serve
```

It is likely that your testing server remain open. To stop it later (not now, please), just type <kbd>Ctrl</kbd> + <kbd>C</kbd>.

**Step 4: *Create a feature***

Create the directory `features`, which is the place for feature files:

```bash
mkdir features
```

Now use your favorite (UTF-8) text editor to create a file named `search.feature`, inside the directory `features`, with the following content:

```gherkin
Feature: Google Search

Scenario: Search returns expected result

  Variant: Search content on pressing Enter
    Given that I am on "https://google.com"
    When I type "concordialang.org" in <q>
      And I press "Enter"
    Then I see "npm"
```

**Step 5: *Execute***

In the `search` directory, just execute:
```bash
concordia
```

*Congratulations!*

Concordia Compiler will generate some files, setup the environment, and then **generate and execute test scripts**. Your browser should open automatically during this process and the console will show the execution results.

**Some generated files:**

`features/search.testcase`, that will contain the produced test case:

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

`test/search.js`, that will contain the test script produced from `features/search.testcase`:

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

To generate and run the test again, just repeat the last command.

> 👉 Remember, this is just a "hello word". Concordia has much, much more to offer!


## 👁 See Also

- [Documentation](docs/en/readme.md)
- [Plug-ins](docs/en/plugins.md)


## 💪 Related Projects

- [katalon-concordia](https://github.com/thiagodp/katalon-concordia):  plug-in for Chrome and Firefox that converts recordings from [Katalon Recorder](https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid) to Concordia Language. It's **very useful** for:
  - Discovering the elements' identification in web applications (*e.g.*, their `id` properties or their [XPath](https://en.wikipedia.org/wiki/XPath))
  - Creating a test case that reproduces exactly what you have recorded.

- [Appium Desktop](https://github.com/appium/appium-desktop/): Inspector of desktop GUIs (Windows, Linux, and MacOS) and Appium Server


## 🍻 Contributing

- Did you liked it? Give it a star ⭐
- Translate the documentation. Create a Fork and submit a Merge Request with any translated documents. Partial translations also help us a lot!
- [Chat with us](https://concordialang.slack.com) on Slack or [open an Issue](https://github.com/thiagodp/concordialang/issues/new) with a question or suggestion.
- [Report](https://github.com/thiagodp/concordialang/issues/new) bugs or  typos.
- [Create a new plug-in](docs/en/plugin-creation.md) for your favorite programming language or testing framework or [develop Concordia](docs/en/development.md) with us.

#### Badge

Show to the world that your project is using Concordia → [![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)

```
[![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)
```


## License

![AGPL](https://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)
