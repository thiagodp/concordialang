# Concordia

> Generate functional tests automatically from your Agile specification.

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang)
[![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)
[![GitHub last commit](https://img.shields.io/github/last-commit/thiagodp/concordialang.svg)](https://github.com/thiagodp/concordialang/releases)
[![npm](https://img.shields.io/npm/l/concordialang.svg)](https://github.com/thiagodp/concordialang/blob/master/LICENSE.txt)
[![slack](https://img.shields.io/badge/slack-chat-blue.svg)](https://bit.ly/2u2vKJX)

Translations: [Português](readme-pt.md) 🌎

![Example](media/example-en.gif)


**Raise your applications' quality. Start now.**

1. Write your specifications in Concordia Language. It's easier than you think. Seriously.

2. Use Concordia Compiler to do all the environment/testing setup for you.

3. Use Concordia Compiler to generate functional test scripts from your specifications and to execute them. *No coding required.*


## Contents

- [Latest news](https://github.com/thiagodp/concordialang/releases) 🔥
- [Documentation](docs/README.md) 📖
- [About](#about)
- [Getting Started](#getting-started)
- [See Also](#see-also)
- [Related Projects](#related-projects)


## 💡 About

**Concordia** is a [business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html), [agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification metalanguage inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Currently it supports [English](/docs/language/en.md) and [Portuguese](/docs/language/pt.md). New languages can be added easily.

**Concordia Compiler** generates and executes [functional](https://en.wikipedia.org/wiki/Functional_testing) test cases and test scripts from documents written in *Concordia Language*.

Both **test cases** and **test scripts** also receive *test data* and *test oracles*. Yes, you read that right - you don't have to produce them manually. They are inferred from your specification written with Concordia Language - using [NLP](https://en.wikipedia.org/wiki/Natural_language_processing) and many other techniques.

Concordia Compiler uses [plug-ins](docs/plugins.md) to produce test scripts and to set up the test environment.

Every **plug-in** can generate test scripts for a different programming language and testing framework, for **web**, **mobile**, or **desktop** applications.


### Why using it ?

1. Simple, flexible [syntax](docs/language/en.md).

2. **Separate** high-level, **business language** declarations **from** medium-low-level, **computing language** declarations, **improving the communication** between your team, customers, and other stakeholders. **Use a same document to discuss features** with stakeholders, analysts, testers, and developers, and make the adoption of [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development)/[ATDD](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development)/[SbE](https://en.wikipedia.org/wiki/Specification_by_example) easier.

3. Make **your specifications more useful**. Get automated functional tests from them easily and **drive your development covered by tests**.

4. Add test automation to **new or legacy applications** without having to code.

5. Generate **relevant test cases and test scripts** in a few milliseconds. Get tests that adopt techniques such as [equivalence partitioning](https://en.wikipedia.org/wiki/Equivalence_partitioning), [boundary value analysis](https://en.wikipedia.org/wiki/Boundary-value_analysis), [combinatorial testing](https://en.wikipedia.org/wiki/All-pairs_testing) (*n-wise*), and [random testing](https://en.wikipedia.org/wiki/Random_testing) without having to think about (and invest your time in) them all.

6. **Reduce the need of writing failing scenarios** by describing system rules of user interface elements. Concordia lets you to describe complex, dynamic system rules.

7. Let you use **test data from files or databases**.

8.  **Track your specification** from the produced test cases and test scripts. They receive special line comments that refer to the specification and inform adopted techniques.

9.  Define **additional test cases without coding**. Write them with Concordia and let the compiler convert them into code.

10.  **Plain text** specification. Use your favorite text editor and version control system to manage changes, and keep the specification with your application.


## 💿 Installation

Concordia Compiler works on **Windows**, **Linux**, and **MacOS**, and requires [NodeJS](https://nodejs.org/) version `8` or above. If you want to test  *web-based* applications, you also need to install [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

After installing the dependencies, open the console/terminal and execute the following command:
```bash
npm install -g concordialang
```

You can check if the installation was successful by running:
```bash
concordia --version
```

## 🚀 Getting Started

Let's create a basic, "hello world"-like example. To execute its tests, you will need an Internet connection and the [Google Chrome](https://www.google.com/chrome/) web browser installed.

**Step 1: *Create a directory***

Create a directory named `search` and then enter it:

```bash
mkdir search
cd search
```

**Step 2: *Configure***

Execute the following command to guide the setup process:

```bash
concordia --init
```

You'll be asked about your preferences and they will be stored in a configuration file named `.concordiarc`. **LET ALL THE DEFAULT VALUES**, by typing <kbd>Enter</kbd> for all the questions.

Plug-ins will also be installed during the process. If you want to install them *manually*, please take a look at the [plugins page](./docs/en/plugins.md).


**Step 3: *Start the test server***

Test automation tools often use a test server to control a *browser*, a *device emulator* or a *real device*. So, first you start a test server, then you start running all your tests.


Concordia Compiler facilitates that by giving you a parameter `--plugin-serve`, which will open the needed test server.

Since **a test server usually blocks** the current terminal/console, **open a new terminal/console** then execute:

```bash
concordia --plugin-serve
```

> *Quick tip*: On Windows, you can start a new terminal from you current directory by running:
> ```bash
> start cmd .
> ```


It is likely that your testing server remain open after executing all the tests. To stop it later (not now, please), just type <kbd>Ctrl</kbd> + <kbd>C</kbd>.


**Step 4: *Create a directory `features`***

That's the directory where we will put any `.feature` files.

In the directory `search`, execute:

```bash
mkdir features
```

**Step 5: *Create a feature***

Use your favorite (UTF-8) text editor to create a file named `search.feature` **inside the `features` directory**:

```gherkin
Feature: Google Search

Scenario: Search returns expected result

  Variant: Search content on pressing Enter
    Given that I am on "https://google.com"
    When I type "concordialang.org" in <q>
      And I press "Enter"
    Then I see "npm"
```

**Step 6: *Make the magic happen!***

In the `search` folder, just execute:
```bash
concordia
```

It will generate some files, setup the environment, and then **execute your tests**. Your browser should open automatically during this process. Finally, the console should show the execution results.

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

`test/search.js`, that will contain the produced test script:

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

*That's it.*  To generate and run the test again, just repeat the last command.

> Remember, this is just a "hello word". Concordia has much, much more to offer!


## 👁 See Also

- [Documentation](docs/en/readme.md)
- [Plug-ins](docs/en/plugins.md)


## 💪 Related Projects

- [katalon-concordia](https://github.com/thiagodp/katalon-concordia):  plug-in for Chrome and Firefox that converts recordings from [Katalon Recorder](https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid) to Concordia Language. **Very useful for**:
  - Discovering the elements' identification in web applications (*e.g.*, their `id` properties or their [XPath](https://en.wikipedia.org/wiki/XPath))
  - Creating a test case without having to type anything.

- [Appium Desktop](https://github.com/appium/appium-desktop/): Inspector of desktop GUIs (Windows, Linux, and MacOS) and Appium Server

## 🍻 Contributing

- Did you liked it? Give it a star ⭐
- [Chat with us](https://concordialang.slack.com) on Slack or [open an Issue](https://github.com/thiagodp/concordialang/issues/new) with a question
- [Suggest](https://github.com/thiagodp/concordialang/issues/new) improvements
- [Report](https://github.com/thiagodp/concordialang/issues/new) bugs or  typos
- [Create a new plug-in](docs/en/plugins/plugin-creation.md) for your favorite programming language or testing framework or [develop Concordia](docs/development.md) with us

#### Badge

Show to the world that your project is using Concordia → [![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)

```
[![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)
```

## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)
