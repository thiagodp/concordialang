# Concordia

> Generate functional tests automatically from your Agile specification.

Translations: [Português](readme-pt.md)

*Concordia* is a tool that allows you to generate functional tests from a requirements specification writen in *Concordia Language*.  You can use them for:

1. Writing [business-readable](https://martinfowler.com/bliki/BusinessReadableDSL.html) specifications.

2. Generating and executing [functional test cases](https://en.wikipedia.org/wiki/Functional_testing) automatically. *No just test script skeletons!* It generates complete test cases and test scripts with *test data*. You don't even need to know how to write code!

3. Generating test scripts for different testing frameworks, such as [CodeceptJS](https://codecept.io/), through [plug-ins]().

4. Write aditional test cases when needed, using *Concordia Language* - currently available in **English** (`en`) and **Portuguese** (`pt`). These test cases are converted to test scripts using plugins.

5. Analyze test results to help evaluating failures.

*Concordia Language* is an [Agile](https://en.wikipedia.org/wiki/Agile_software_development) requirements specification metalanguage inspired in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).


## Why Concordia ?

- Simple syntax

- No need to write code

- Separate high-level, **business language** declarations from medium-low-level, **computing language** declarations

- Have complete and relavant tests in few seconds

- High coverage of business rules at a small declaration effort

- Let you describe complex, dynamic business rules, including those related to data from databases

- Have test cases declared in a high-level language

- Create additional test cases without coding

- Generated test cases and test scripts receive comments with related specification, so you can track them

- Available in more than one spoken language

- No special text editor required - use your favorite UTF-8 editor

- Use your favorite [version control system](https://en.wikipedia.org/wiki/Version_control) to manage changes

- Batteries included (install and use)


## Install

Concordia requires [NodeJS](https://nodejs.org/) version `8` or above. After NodeJS is installed, run the following command:
```bash
npm install -g concordialang
```

You can test the installation as follows:
```bash
concordia --version
```
Whether a version number is displayed, the installation was successful.

### Installing a plugin

List the available plugins:
```bash
concordia --plugin-list
```

Then install the desired one. For instance:
```bash
concordia --plugin-install codeceptjs
```

Concordia and its plug-ins install all the needed dependencies by default, in order to make the setup process simpler.

## Execution


### Starting a testing server

Sometimes when we run tests against a user interface, it is needed to control the execution through a testing server. For instance, `CodeceptJS` may have to use a `Selenium` server to control the execution of tests for web applications. Without such server, it is not able to work.

Run the following command to start a testing server:

```bash
concordia --plugin-serve <plugin-name>
```

After the server is started, you probably have to run Concordia in another terminal (console).

### Running Concordia

```bash
concordia path/to/your/features --plugin <plugin-name>
```

Or just go the directory of your features and inform the desired plugin. Example:
```bash
concordia --plugin codeceptjs
```

### Stopping a testing server

It is likely that your testing server remain open after executing all the tests.

Type `Ctrl + C` to close it.


## A short example

See [this short example](docs/example.md) to get an overview of the usage.


## Syntax

- [English](docs/language/en.md)
- [Português](docs/language/pt.md)


## Recommended usage cycle

1. Write or update your requirements specification with the *Concordia Language* and validate it with users or stakeholders;

2. Use *Concordia* to generate tests from the specification and to run them;

3. If the tests have **failed**, there are some possibilities:

    1. You still haven't implemented the corresponding behavior in your application. In this case, just implement it and run the tests again.

    2. Your application is behaving differently from the specification. In this case, it may have bugs or you or your team haven't implemented the behavior exactly like described in the specification.   - Whether the application has a bug, we are happy to have discovered it! Just fix it and run the tests again to make sure that the bug is gone.
      - Otherwise, you can decide between **changing your application** to behave exactly like the specification describes, or **changing the specification** to match your application behavior. In the latter case, back to step `1`.

4. If the tests have **passed**, *great job!* Now you can write new requirements or add more test cases, so just back to step `1`.



## How it works

![Process](media/process.png)

1. Concordia reads your `.feature` and `.testcase` files like a compiler, and uses a [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) and a [parser](https://en.wikipedia.org/wiki/Parsing#Computer_languages) to identify and check documents' strucuture.

2. Concordia uses basic [Natural Language Processing](https://en.wikipedia.org/wiki/Natural-language_processing) (NLP) to identify sentences' [intent](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/). This increases the chances of recognizing sentences written in different styles.

3. Concordia performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)) to check recognized declarations.

4. Concordia uses the specification to infer the most suitable *test cases*, *test data*, and *test oracles*, and then generates `.testcase` files in Concordia Language, a kind of *restricted natural language*.

5. Concordia transforms all the test cases into test scripts (that is, source code) using a plug-in.

6. Concordia executes the test scripts through the same plug-in. These test scripts will check your application's behavior through its user interface.

7. Concordia reads and presents execution results. These results relate failing tests to the specification, in order to help you understanding the possible reasons of a failure.


## Generated test cases

Concordia can generate test cases from [funcional requirements](https://en.wikipedia.org/wiki/Functional_requirement) written in Concordia Language. Although it is not able to generate test cases for [non-functional requirements](https://en.wikipedia.org/wiki/Non-functional_requirement) automatically, you can create them manually with traditional *Behavior-Driven Development* (BDD) tools based on [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), such as [Cucumber](https://docs.cucumber.io/).

### Covered states

> *description soon*

### Covered scenarios

> *description soon*

### Covered rules

Every input data may receive values according to its business rules.
These business rules are classified in the following groups:
`VALUE`, `LENGTH`, `FORMAT`, `SET`, `REQUIRED`, and `COMPUTED`.
All but `COMPUTED` are currently available.

Every group has related test cases, applied according to the declared business rules:

```
+----------+--------------------------------+
| group    | testcase                       |
|----------|--------------------------------|
| VALUE    | LOWEST_VALUE                   |
|          | RANDOM_BELOW_MIN_VALUE         |
|          | JUST_BELOW_MIN_VALUE           |
|          | MIN_VALUE	                    |
|          | JUST_ABOVE_MIN_VALUE           |
|          | ZERO_VALUE	                    |
|          | MEDIAN_VALUE                   |
|          | RANDOM_BETWEEN_MIN_MAX_VALUES  |
|          | JUST_BELOW_MAX_VALUE           |
|          | MAX_VALUE	                    |
|          | JUST_ABOVE_MAX_VALUE           |
|          | RANDOM_ABOVE_MAX_VALUE         |
|          | GREATEST_VALUE                 |
| LENGTH   | LOWEST_LENGTH                  |
|          | RANDOM_BELOW_MIN_LENGTH        |
|          | JUST_BELOW_MIN_LENGTH          |
|          | MIN_LENGTH                     |
|          | JUST_ABOVE_MIN_LENGTH          |
|          | MEDIAN_LENGTH                  |
|          | RANDOM_BETWEEN_MIN_MAX_LENGTHS |
|          | JUST_BELOW_MAX_LENGTH          |
|          | MAX_LENGTH	                    |
|          | JUST_ABOVE_MAX_LENGTH          |
|          | RANDOM_ABOVE_MAX_LENGTH	    |
|          | GREATEST_LENGTH	            |
| FORMAT   | VALID_FORMAT                   |
|          | INVALID_FORMAT                 |
| SET      | FIRST_ELEMENT                  |
|          | RANDOM_ELEMENT                 |
|          | LAST_ELEMENT                   |
|          | NOT_IN_SET                     |
| REQUIRED | FILLED                         |
|          | NOT_FILLED                     |
| COMPUTED | RIGHT_COMPUTATION	            |
|          | WRONG_COMPUTATION	            |
+----------+--------------------------------+
```

### Example 1

Let's describe a rule for a user interface element `Salary` :

```gherkin
UI Element: Salary
  - data type is double
```

Since few restrictions were made, `Salary` will be tested with the test cases of the group `REQUIRED`:
1. `FILLED`: a *pseudo-random* double value will be generated
2. `NOT_FILLED`: an empty value will be used

Now let's add a **minimum value** restriction.

```gherkin
UI Element: Salary
  - data type is double
  - minimum value is 1000.00
    Otherwise I must see "Salary must be greater than or equal to 1000"
```

Some tests of the group `VALUE` are now applicable:

1. `LOWEST_VALUE`: the lowest possible double is used
2. `RANDOM_BELOW_MIN_VALUE`: a random double before the minimum value is generated
3. `JUST_BELOW_MIN_VALUE`: a double just below the minimum value is used (*e.g.*, `999.99`)
4. `MIN_VALUE`: the minimum value is used
5. `JUST_ABOVE_MIN_VALUE`: a double just above the minimum value is used (*e.g.*, `1000.01`)
6. `ZERO_VALUE`: zero (`0`) is used

Since `1000.00` is the minimum value, the data produced by the tests `1`, `2`, `3`, and `6` of the group `VALUE` are considered **invalid**, while `4` and `5` are not. For these tests considered **invalid**, the behavior defined in `Otherwise`, that is
```gherkin
    Otherwise I must see "Salary must be greater than or equal to 1000"
```
is expected to happen. In other words, this behavior serves as [test oracle](https://en.wikipedia.org/wiki/Test_oracle) and must occur only when the produced value is invalid.

Unlike this example, when the expected system behavior for invalid values is not specified and a test data is considered **invalid**, Concordia expects that test should **fail**. In this case, it generates the Test Case with the tag `@fail`.

Now let's add **maximum value** restriction:

```gherkin
UI Element: Salary
  - data type is double
  - minimum value is 1000.00
    Otherwise I must see "Salary must be greater than or equal to 1000"
  - maximum value is 30000.00
    Otherwise I must see "Salary must be less than or equal to 30000"
```

All the tests of the group `VALUE` are now applicable. That is, the following tests will be included:

1. `MEDIAN_VALUE`: the median between the minimum and the maximum values
2. `RANDOM_BETWEEN_MIN_MAX_VALUES`: a pseudo-random double value between the minimum and the maximum values
3. `JUST_BELOW_MAX_VALUE`: the value just below the maximum value
4. `MAX_VALUE`: the maximum value
5. `JUST_ABOVE_MAX_VALUE`: the value just above the maximum value
6. `RANDOM_ABOVE_MAX_VALUE`: a pseudo-random double above the maximum value
7. `GREATEST_VALUE`: the greatest possible double

The tests from `5` to `7` will produce values considered **invalid**.


### Example 2

Let's define a user interface element named `Profession` and a table named `Professions` from which the values come from:

```gherkin
UI Element: Profession
  - type is select
  - value comes from "SELECT name from [Professions]"
  - required is true

Table: Professions
  | name       |
  | Lawyer     |
  | Accountant |
  | Dentist    |
  | Professor  |
  | Mechanic   |
```

Applicable test are:
  - `FILLED`
  - `NOT_FILLED`
  - `FIRST_ELEMENT`
  - `RANDOM_ELEMENT`
  - `LAST_ELEMENT`
  - `NOT_IN_SET`

The first two tests are in the group `REQUIRED`. Since we declared `Profession` as having required value, the test `FILLED` is considered **valid** but `NOT_FILLED` isn't. It's important to remember declaring required inputs accordingly.

The last four tests are in the group `SET`. Only the last one, `NOT_IN_SET`, will produce a value considered **invalid**.

### Example 3

In this example, let's adjust the past two examples to make `Salary` rules *dynamic*, and change according to the `Profession`.

Firstly, we'll add two columns the the `Professions` table:

```gherkin
Table: professions
  | name       | min_salary | max_salary |
  | Lawyer     | 100000     |  900000    |
  | Accountant |  90000     |  800000    |
  | Dentist    | 150000     |  900000    |
  | Professor  |  80000     |  500000    |
  | Mechanic   |  50000     |  120000    |
```

Then, we'll change the rules to retrieve the values from the table:

```gherkin
UI Element: Salary
  - data type is double
  - minimum value comes from the query "SELECT min_salary FROM [Professions] WHERE name = {Profession}"
    Otherwise I must see "The given Salary is less than the minimum value"
  - maximum value comes from the query "SELECT max_salary FROM [Professions] WHERE name = {Profession}"
    Otherwise I must see "The given Salary is greater than the maximum value"
```

The reference to the UI Element `{Profession}` inside the query, makes the rules of `Salary` depend on `Profession`. Every time a `Profession` is selected, the **minimum value** and the **maximum value** of `Salary` changes according to the columns `min_salary` and `max_salary` of the table `Professions`.

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