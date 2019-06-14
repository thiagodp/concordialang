# Roadmap <!-- omit in toc -->

> This document describes some desired features.

DISCLAIMER:

1. No release planning yet.
2. Many features are **not** yet registered as Issues on purpose, since they require more planning or detailing.


Contents:

- [Compiler](#compiler)
  - [CLI Options](#cli-options)
    - [Filter Features to execute by file name without having to include dependencies](#filter-features-to-execute-by-file-name-without-having-to-include-dependencies)
    - [Filter the Feature to execute by its name](#filter-the-feature-to-execute-by-its-name)
    - [Filter the Scenario to execute by its name](#filter-the-scenario-to-execute-by-its-name)
    - [Filter Test Cases by importance number for test script generation](#filter-test-cases-by-importance-number-for-test-script-generation)
    - [Filter Test Cases by importance number for test script execution](#filter-test-cases-by-importance-number-for-test-script-execution)
  - [Language Support](#language-support)
    - [Support Variant Background](#support-variant-background)
  - [Approach](#approach)
    - [Generate test cases that explore SQL Injection](#generate-test-cases-that-explore-sql-injection)
    - [Add a test case that uses naughty strings as test data](#add-a-test-case-that-uses-naughty-strings-as-test-data)
  - [UI and Report](#ui-and-report)
    - [Show precessing icons while waiting](#show-precessing-icons-while-waiting)
    - [Show percentage being processed](#show-percentage-being-processed)
    - [Generate an HTML report](#generate-an-html-report)
  - [Tool integration](#tool-integration)
    - [Integration with text editors](#integration-with-text-editors)
    - [Integration with reporting tools](#integration-with-reporting-tools)
  - [Performance](#performance)
    - [Do not regenerate tests when a feature file and its dependencies have not changed their hash](#do-not-regenerate-tests-when-a-feature-file-and-its-dependencies-have-not-changed-their-hash)
- [Language](#language)
  - [Create a tag to disable invalid data generation for a certain UI Element property](#create-a-tag-to-disable-invalid-data-generation-for-a-certain-ui-element-property)
  - [Add language support to represent the current date and time](#add-language-support-to-represent-the-current-date-and-time)
  - [Add locale support to date and time types](#add-locale-support-to-date-and-time-types)
  - [Add support to visual comparison](#add-support-to-visual-comparison)
  - [Accept UI Element properties inside strings of UI Element properties](#accept-ui-element-properties-inside-strings-of-ui-element-properties)
  - [Accept UI Element properties inside strings from Variant steps](#accept-ui-element-properties-inside-strings-from-variant-steps)
  - [Accept UI Element properties in Variant steps](#accept-ui-element-properties-in-variant-steps)
  - [Support dynamic States, produced from UI Element values](#support-dynamic-states-produced-from-ui-element-values)
  - [Consider global UI Elements](#consider-global-ui-elements)
  - [Allow inheritance of UI Elements](#allow-inheritance-of-ui-elements)
  - [Allow table matching](#allow-table-matching)
  - [Multi-line queries](#multi-line-queries)
  - [Multiple declared Tables per query](#multiple-declared-tables-per-query)
  - [Multiple declared Databases per query](#multiple-declared-databases-per-query)
- [Internal](#internal)
  - [Security](#security)
    - [Sanitize all input file names](#sanitize-all-input-file-names)
  - [Use a linter](#use-a-linter)


## Compiler


### CLI Options

#### Filter Features to execute by file name without having to include dependencies

To-Detail

#### Filter the Feature to execute by its name

To-Detail

#### Filter the Scenario to execute by its name

To-Detail

#### Filter Test Cases by importance number for test script generation

To-Detail

#### Filter Test Cases by importance number for test script execution

To-Detail


### Language Support

#### Support Variant Background

Implement `Variant Background`, which is part of the Concordia Language but was not implemented yet by the Concordia Compiler.


### Approach

#### Generate test cases that explore SQL Injection

Use declared Databases and Queries to formulate Test Cases that generate strings with SQL Injection commands.

#### Add a test case that uses naughty strings as test data

Use a [list of naughty strings](https://github.com/minimaxir/big-list-of-naughty-strings) as test data.


### UI and Report

#### Show precessing icons while waiting

> Useful to give feedback

#### Show percentage being processed

> According to the number of feature files

#### Generate an HTML report

> *E.g.*, `--report html`

### Tool integration

#### Integration with text editors

Create new projects for auto-completion plug-ins for text editors such as VS Code, Sublime Text, Atom, etc.

*Add here some inspiring projects.*:
- VS Code: [gherkin-autocomplete](https://github.com/silverbulleters/gherkin-autocomplete)


#### Integration with reporting tools

Create integration with reporting tools, such as:
- [Allure](https://github.com/allure-framework/allure2/)
- [Macaca Reporter](https://github.com/macacajs/macaca-reporter)
- (add others here)

### Performance

#### Do not regenerate tests when a feature file and its dependencies have not changed their hash

Maybe it could be used a config file with the hashes, similar (but simpler) to what `package-lock.json` does, to control features' hashes.

Example:
```json
{
  "hashes": {
    "feature1.feature": "ox10JBprHtu5c8822XooloNKUfk=",
    "subdir/feature2.feature": "DMcj5b67Albe4KhpzyvphC5nVDHn1oCO",
  }
}
```



## Language

### Create a tag to disable invalid data generation for a certain UI Element property

This is needed when the User Interface uses a mask and blocks any invalid input value.
In such case, an invalid value is never accepted and the behavior described in a `Otherwise` sentence never happens.

Example:
```concordia
UI Element: Age
  - format is "[0-9]{1,3}"
    Otherwise I see "Please inform a number"
```

In this case, whether the UI blocks invalid input values, all the test cases that produces them could fail.

Therefore, a tag that indicates that could be used:

Example (`@valid-values-only`):
```concordia
UI Element: Age
  @valid-values-only
  - format is "[0-9]{1,3}"
    Otherwise I see "Please inform a number"
```

This will avoid generating invalid data test cases for the target property.

### Add language support to represent the current date and time

See Issue #40

### Add locale support to date and time types

See Issue #30

### Add support to visual comparison

See Issue #27

### Accept UI Element properties inside strings of UI Element properties

Example:
```concordia
UI Element: Name
- min length is 2
  Otherwise I must see "${name} must have at least ${minlength} characters."
```

The string `"${name} must have at least ${minlength} characters."` will have:
- `${name}` replaced with `Name`
- `${minlength}` replace with `2`

Properties that could be allowed, in the format `${something}`:
- `name`;
- `id`, which default to the lower-cased `name` if undefined;
- `type`, which defaults to `string` if undefined;
- `datatype`, which defaults to `textbox` if undefined;
- `minlength`, which defaults to `0` if undefined;
- `maxlength`, which defaults to max string supported if undefined;
- `minvalue`, which defaults to minimal value supported if undefined;
- `maxvalue`, which defaults to maximum value supported if undefined;
- `value`, which will receive the value generated by the test case;


### Accept UI Element properties inside strings from Variant steps

Example:

```gherkin
Then I see "The password \"${Password|value}\" is weak."
```

which is equivalent to
```gherkin
Then I see "The password \"${Password}\" is weak."
```

### Accept UI Element properties in Variant steps

Example:

```gherkin
Then I see that {Age} is ${Age|minvalue}.
```

In the above step, `${Age|minvalue}` will be replaced by its minimum value, *e.g.*, `21`.


### Support dynamic States, produced from UI Element values

Example:
```gherkin
  Given that I fill {User}
    and I fill {Pass}
    and I click  on {OK}
  Then I see "Welcome"
    and I have ~{Type} is logged in~

UI Element: User
  - value comes from "SELECT user FROM [Users]"

UI Element: Pass
  - value comes from "SELECT pass FROM [Users] WHERE user = {User}"

UI Element: Type
  - value comes from "SELECT type FROM [Users] WHERE user = {User}"


Table: Users
  | user  | pass    | type   |
  | bob   | 123456  | admin  |
  | joe   | 654321  | guest  |
  | alice | 123456  | admin  |

```

### Consider global UI Elements

Make the tool processing UI Elements tagged with `@global`.


### Allow inheritance of UI Elements

Use `@extends( <name> )` to extend another UI Element.

Example:
```concordia
UI Element: Name
- min length is 2
- max length is 100

@extends( Name )
UI Element: Emergency Contact Name

# Emergency Contact Name inherits the properties from Name
```

### Allow table matching

Allow a given UI Element or UI Literal to match a certain Table.

Example 1:
```concordia
Then I see the table {MyTable} as [Some Table]
```
Example 2:
```concordia
Then I see the table <myTable> as [Some Table]
```

In which `Some Table` is declared like this:
```concordia
Table: Some Table
| Name  | Age |
| Bob   | 21  |
| Suzan | 25  |
```

It should make target table's rows to match the declared ones.

### Multi-line queries

Currently:
```
- value comes from "SELECT name FROM [MyDB].profession"
```
Proposal (to accept as valid):
```
- value comes from "SELECT name
                   FROM [MyDB].profession"`
```
Alternative proposal:
```
- value comes from
"""
SELECT name
FROM [MyDB].profession
"""
```

### Multiple declared Tables per query

To-Detail

### Multiple declared Databases per query

To-Detail


## Internal

### Security

#### Sanitize all input file names

Sanitize files such as:
- CLI input files
- Concordia Import files
- Concordia Database paths

Perhaps to use [this sanitizer](https://github.com/parshap/node-sanitize-filename)


### Use a linter

Configure the project to use [tslint](https://github.com/palantir/tslint) or another linter with more configuration options.

