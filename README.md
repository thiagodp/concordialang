# Concordia

*Write your features using Concordia and generate functional test cases from them, automatically.*

An [Agile Software](https://en.wikipedia.org/wiki/Agile_software_development) Requirements Specification (Meta)language inspired by [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Concordia is available in [more than one spoken language]().

## In short:

1. Simple, easy-to-read, fast-to-write documentation.
2. Use your favorite text editor (UTF-8) and version control system.
3. Generate UI tests from the specification, automatically.

## Install

```console
npm install -g concordialang
```

We also recommend you to install the [Concordia plug-in for CodeceptJS](#) whether you want to generate JavaScript tests for web applications.


## How it works:

1. **Write or update your requirements** specification with the Concordia Language (and validate it with users and stakeholders);
2. **Use the tool** to generate test cases from the specified functional requirements and to run them;
3. **If the tests failed**: adjust your software to meet the specified requirements (most frequent), or back to the step 1 (adjust your requirements).
4. **If the tests didn't fail**: *Great job!* Now you can write new requirements or add more test cases.

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

- [Writing your first feature](doc/tutorial/first-feature.md)
- [Improving your specification](doc/tutorial/improving-spec.md)
- [Generating UI tests](doc/tutorial/gen-ui-tests.md)

## Language Specification

- [English](doc/langspec/asl-en.md)
- [Português](doc/langspec/asl-pt.md)

## License

Copyright (c) 2017 by Thiago Delgado Pinto

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) This software is [licensed](LICENSE.txt) under the GNU Affero General Public License.