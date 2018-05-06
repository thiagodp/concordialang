# Concordia

> Generate functional tests automatically from your Agile specification.

## About

Concordia is an [Agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification metalanguage inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). It allows you to:
1. Write [business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html) specifications.

2. Generate and execute [functional test cases](https://en.wikipedia.org/wiki/Functional_testing) automatically. *No just test script skeletons!* It generates complete test cases and test scripts with *test data*. You don't even need to know how to write code!

3. Generate test scripts for different testing frameworks, such as [CodeceptJS](https://codecept.io/), through [plug-ins]().

4. Write aditional test cases when needed, using *restricted natural language* - currently available in **English** (`en`) and **Portuguese** (`pt`). These test cases are converted to test scripts using plugins.

5. Use your favorite UTF-8 text editor (*e.g.*, [VS Code](https://code.visualstudio.com/), [Sublime Text](http://www.sublimetext.com/), [Atom](https://atom.io/), vim, emacs) to write specification files (`.feature`) and test cases (`.testcase`) and your favorite [version control system](https://en.wikipedia.org/wiki/Version_control) software (*e.g.*, [Git](), [Subversion](https://subversion.apache.org/), [Mercurial](https://www.mercurial-scm.org/)) to manage their changes.

6. Use it with [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin)-based tools, like [Cucumber](https://cucumber.io/), for creating different tests such as [non-functional tests](https://en.wikipedia.org/wiki/Non-functional_testing) or taking advantage of existing `.feature` files.

## Install

```bash
npm install -g concordialang
```

## Installing a plugin

First of all, *list the available plugins*:

```bash
concordia --plugin-list
```

Then install the desired one. For instance:

```bash
concordia --plugin-install codeceptjs
```

## Run

```bash
concordia path/to/your/spec/files --plugin <plugin>
```

## A short example:

### 1. Write the feature using Concordia language

Create a file `login.feature`:

```concordia
Feature: Login
  As a user
  I would like to authenticate myself
  In order to access the application

Scenario: Successful login
  Given that I can see the login screen
  When I enter valid credentials
  Then I can access the main application screen

  # A Variant is a low-level description or variation of a Scenario
  Variant: Successful login with valid credentials
    Given that I am in the [Login Screen]
    When I fill {Username}
      And I fill {Password}
      And I click on {OK}
    Then I see "Welcome"

Constants:
  - "Login Screen" is "http://localhost/login"

Table: Users
  | username | password  |
  | bob      | 123456    |
  | alice    | 4l1c3pass |

UI Element: Username
  - value comes from "SELECT username FROM [Users]"

UI Element: Password
  - value comes from "SELECT password FROM [Users] WHERE username = {Username}"

UI Element: OK
  - type is button
```

### 2. Use the tool

Go to the directory where you saved `login.feature` and run:

```console
$ concordia --seed="hello world" --plugin=codeceptjs
```

This will generate two files: `login.testcase` and `scripts\login.js`.

The first file has **test cases**:

```concordia
```

The second file was generated because we used the plugin `codeceptjs`, that
generates JavaScript test scripts for the framework CodeceptJS.

This will generate tests for CodeceptJS, including this one:

```javascript
Feature( 'Login', () => {
    Scenario(
        'Completes the login successfully when entering valid credentials',
        ( I ) => {
        I.amOnPage( '/login' );
        I.fillField( '#username', 'alice' );
        I.fillField( '#password', 'd3ar4lice' );
        I.click( '#enter' );
        I.waitForText( 'Welcome' );
    } );
} );
```

And it will also run the tests:

```console
[SUCCESS]
...
[SUCCESS]
```


## General Use

1. Write or update your requirements specification with the *Concordia Language*;

2. Validate it with users and stakeholders;

3. Use Concordia to generate tests from the specification and to run them;

4. If the tests have **failed**, there are some possibilities:
    1. You still haven't implemented the corresponding behavior in your application. In this case, just implement it and run the tests again.
    2. Your application is behaving differently from the specification. In this case, it may have bugs or you haven't implemented the behavior exactly like described in the specification. Whether it has a bug, just fix it and run the tests again. Otherwise, you can decide between **changing your application** to behave exactly like the specification describes, or **changing the specification** to match your application behavior. In the latter case, we recommend you to back to step `2` and validate the changes with stakeholders. Whatever you choose, run the tests again.

5. If the tests have **passed**, *great job!* Now you can write new requirements or add more test cases, so just back to step `1`.

## Regardings

1. Concordia separates *high-level*, **business language** declarations from *medium-low-level*, **computing language** declarations. This let you separate things better and don't compromise your **communication** with business people.

2. Concordia lets you describe **complex business rules** related to user interface elements, and it will use them to generate test cases for you, automatically. The more you detail their behavior, the more you will get test cases to cover them.

3. Concordia lets you relate user interface element's rules with **databases, tables and files**, so that it can retrieve test data from them. Currently it supports JSON, CSV, INI, Excel, MSAccess, SQLite, MySQL, PostgreSQL and Firebase. See [here]() how to connect with them.


## How it works:

1. Concordia reads your `.feature` and `.testcase` files like a compiler, and uses a [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) and a [parser](https://en.wikipedia.org/wiki/Parsing#Computer_languages) to identify and check documents' strucuture.
2. Concordia uses basic [Natural Language Processing](https://en.wikipedia.org/wiki/Natural-language_processing) (NLP) to identify sentences' [intent](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/). This increases the chances of recognizing sentences written in different styles.
3. Concordia performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)) to check recognized declarations.
4. Concordia uses the specification to infer the most suitable *test cases*, *test data*, and *test oracles*, and then generates `.testcase` files in Natural Language. Yes, you can also write additional test cases in Natural Language!
5. Concordia transforms all the test cases into test scripts (that is, source code) using a plug-in.
6. Concordia executes the test scripts through the same plug-in. These test scripts will check your application's behavior through its user interface.
7. Concordia reads and presents execution results. They relate failing tests to the specification, in order to help you understanding the possible reasons of a failure.


## Generated test cases:

Concordia can generate test cases from [funcional requirements](https://en.wikipedia.org/wiki/Functional_requirement). Although it is not able to generate test cases for [non-functional requirements](https://en.wikipedia.org/wiki/Non-functional_requirement) automatically, you can create them manually with traditional BDD tools.

### Covered rules for test data:

Each input data will receive values according to these rules:

```
+---------------------------+---------------+--------------------+----------------+
| RULE                      |   VALUE TYPE  | VALID              | INVALID        |
|                           | Single | List |                    |                |
+---------------------------+--------+------+--------------------+----------------+
| mandatory input           | yes    | yes  | valid random       | empty value    |
| minimum length boundaries | yes    | N/A  | value, value + 1   | value - 1      |
| maximum length boundaries | yes    | N/A  | value, value - 1   | value + 1      |
| minimum value boundaries  | yes    | N/A  | value, next value  | prior value    |
| maximum value boundaries  | yes    | N/A  | value, prior value | next value     |
| first last                | N/A    | yes  | yes                | N/A            |
| last value                | N/A    | yes  | yes                | N/A            |
| middle length             | yes    | N/A  | yes                | N/A            |
| middle value              | yes    | yes  | yes                | N/A            |
| random value              | yes    | yes  | valid random       | invalid random |
| zero                      | yes    | N/A  | yes                | yes            |
| regex-based value         | yes    | N/A  | yes                | yes            |
+---------------------------+--------+------+--------------------+----------------+
| MAXIMUM POSSIBLE TESTS    | 13     | 5    | 13                 | 8              |
+---------------------------+--------+------+--------------------+----------------+
```

### Covered rules for scenarios:

1. Each scenario will be covered at least once, unless in case of the test case generation to be filtered.
2.

Some details:
1. A scenario shall include all the steps of called scenarios.
2. A called scenario will receive valid values, in order to complete successfully, unless it is designed to not complete successfully.

## Documentation

*Full documentation* [here](doc/README.md)

### Tutorial

- [Writing your first feature](docs/tutorial/first-feature.md)
- [Improving your specification](docs/tutorial/improving-spec.md)
- [Generating UI tests](docs/tutorial/gen-ui-tests.md)

### Language Specification

- [English](docs/language/en.md)
- [Português](docs/language/pt.md)

## Help us

- [How to contribute](contributing.md)
- [Improve the documentation]()
- [Report a bug]()
- [Suggest a feature or change]()
- [Develop it with us](docs/development.md)
- [Donate](docs/donate.md)

## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)