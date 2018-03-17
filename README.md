# Concordia

> Write your specification using Concordia and generate **complete** [functional test cases](https://en.wikipedia.org/wiki/Functional_testing), automatically.

## About

Concordia is an [Agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification (*meta*)language inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) :
1. [Business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html), easy-to-learn, fast-to-write documentation.
2. Generate dozens of complete UI test cases for you, automatically. *Enough of just test skeletons!*
3. Also allows you to write test cases manually using Natural Language.
4. It's plain text based, so use your favorite UTF-8 text editor and version control system (*hello, Git*).
5. Available in [more than one spoken language]().
6. Supports [plug-ins]() for different testing frameworks.
7. Can be used with Gherkin tools, so you don't have to throw away your existing tests.

## Install

```bash
npm install -g concordialang
```

## Run

```bash
concordia /dir/with/your/spec/files --plugin plugin-name
```

> *Tip*: Install the [plug-in for CodeceptJS](#) to generate JavaScript tests for web or mobile web applications.


## How it works:

1. Concordia reads your `.feature` and `.testcase` files like a compiler, and uses a [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) and a [parser](https://en.wikipedia.org/wiki/Parsing#Computer_languages) to identify and check documents' strucuture.
2. Concordia uses basic [Natural Language Processing](https://en.wikipedia.org/wiki/Natural-language_processing) (NLP) to identify sentences' [intent](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/). This increases the chances of recognizing sentences written in different styles.
3. Concordia performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)) to check recognized declarations.
4. Concordia uses the specification to infer the most suitable *test cases*, *test data*, and *test oracles*, and then generates `.testcase` files in Natural Language. Yes, you can also write additional test cases in Natural Language!
5. Concordia transforms all the test cases into test scripts (that is, source code) using a plug-in.
6. Concordia executes the test scripts through the same plug-in. These test scripts will check your application's behavior through its user interface.
7. Concordia reads and presents execution results. They relate failing tests to the specification, in order to help you understanding the possible reasons of a failure.


## How to use it

1. Write or update your requirements specification with the *Concordia Language*;
2. Validate it with users and stakeholders;
3. Use Concordia to generate tests from the specification and to run them;
4. If the tests have **failed**, there are some possibilities:
    1. You still haven't implemented the corresponding behavior in your application. In this case, just implement it and run the tests again.
    2. Your application is behaving differently from the specification. In this case, it may have bugs or you haven't implemented the behavior exactly like described in the specification. Whether it has a bug, just fix it and run the tests again. Otherwise, you can decide between **changing your application** to behave exactly like the specification describes, or **changing the specification** to match your application behavior. In the latter case, we recommend you to back to step `2` and validate the changes with stakeholders. Whatever you choose, run the tests again.
5. If the tests have **passed**, *great job!* Now you can write new requirements or add more test cases, so just back to step `1`.

## A short example:

### 1. Write the feature
```concordia
...
```

### 2. Use the tool

```console
$ concordia --plugin=codeceptjs
```

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

## Tutorial

- [Writing your first feature](docs/tutorial/first-feature.md)
- [Improving your specification](docs/tutorial/improving-spec.md)
- [Generating UI tests](docs/tutorial/gen-ui-tests.md)

## Language Specification

- [English](docs/language/en.md)
- [Português](docs/language/pt.md)

## Join Us

*Wanna help us?*

- [Report]() a bug
- [Suggest]() a feature or change
- [Develop](docs/development.md) Concordia with us
- [Donate](docs/donate.md) to help keeping the project

## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © Thiago Delgado Pinto

[GNU Affero General Public License version 3](LICENSE.txt)