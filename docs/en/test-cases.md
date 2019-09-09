# Generated test cases <!-- omit in toc -->

Translations: [Português](../pt/test-cases.md) 🌎


- [Covered features](#covered-features)
  - [State-based combination](#state-based-combination)
    - [Example 1](#example-1)
    - [Example 2](#example-2)
- [Data Test Cases](#data-test-cases)
  - [Examples](#examples)
    - [Example 1](#example-1-1)
    - [Example 2](#example-2-1)
    - [Example 3](#example-3)

Concordia can generate test cases from [functional requirements](https://en.wikipedia.org/wiki/Functional_requirement) written in Concordia Language. Although it is not able to generate test cases for [non-functional requirements](https://en.wikipedia.org/wiki/Non-functional_requirement) automatically, you can create them manually with traditional *Behavior-Driven Development* (BDD) tools based on [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), such as [Cucumber](https://docs.cucumber.io/).

## Covered features

- **All the features are covered by default.**
- Features can receive an importance value by using the tag `@importance`. Example: `@importance( 8 )`.
- By default, all the features receive an importance with value `5`.
- You can filter the features by importance with the parameters `--sel-min-feature` and `--sel-max-feature`. Example: `concordia --sel-min-feature 7` will consider only the features with importance `7` or above.

### State-based combination

- **The generated Test Cases combine Features automatically, whether you declared corresponding States.**
- States are sentences between tilde (~), *e.g.*, `Then I have ~User is Logged In~`.
- A Feature can produce a state, called *post-condition*, by declaring it in a `Then` step, like in the example above.
- A Feature can depend on a state, called *precondition*, by declaring it in a `Given` step. Example: `Given that ~User is Logged In~`.
- A Feature can also invoke a given a state by declaring it in a `When` step. Example: `When I have ~New Customer Saved~`.
- A Feature should import the Feature file that produces the State that it depends on. Example: `import "Login.feature"`.

#### Example 1

```concordia
Feature: Login
  ...
  Variant: Successful Login
    ...
    Then I have ~User is Logged In~
```

```concordia
import "login.feature"

Feature: Generate Sales Report
  ...
  Variant: Generate Default Report
    Given that ~User is Logged In~
    ...
```

The Test Cases for the Variant "Generate Default Report" will execute a successful path of the Variant "Successful Login" before any other steps.

#### Example 2

```concordia
Feature: New Customer
  ...
  Variant: Customer with Basic Contact Info
    ...
    Then I have ~New Customer Saved~

  Variant: Customer with Full Contact Info
    ...
    Then I have ~New Customer Saved~
```

```concordia
import "new-customer.feature"

Feature: New Sale
  ...
  Variant: Pay in Cash
    ...
    When I have ~New Customer Saved~
    ...
```

Test Cases for the Variant `Pay in Cash` may execute a successful path of both the Variants `Customer with Basic Contact Info` and `Customer with Full Contact Info`, since they produce the needed State, `New Customer Saved`.


## Data Test Cases

Every input data may receive values according to its business rules.
These business rules are classified in the following groups:
`VALUE`, `LENGTH`, `FORMAT`, `SET`, `REQUIRED`, and `COMPUTED`.
All but `COMPUTED` are currently available.

Every group has related data test cases, applied according to the declared business rules:

| Group    | Data Test Case                 | Description |
|----------|--------------------------------| ----------- |
| VALUE    | LOWEST_VALUE                   | The lowest value for the data type, *e.g.*, lowest integer |
|          | RANDOM_BELOW_MIN_VALUE         | A random value below the minimum value |
|          | JUST_BELOW_MIN_VALUE           | The value just below the minimum value, considering the data type and decimal places if applicable |
|          | MIN_VALUE	                    | Exactly the minimum value |
|          | JUST_ABOVE_MIN_VALUE           | The value just above the minimum value, considering the data type and decimal places if applicable |
|          | ZERO_VALUE	                    | Zero (`0`) |
|          | MEDIAN_VALUE                   | The median between the minimum value and the maximum value |
|          | RANDOM_BETWEEN_MIN_MAX_VALUES  | A random value between the minimum value and the maximum value |
|          | JUST_BELOW_MAX_VALUE           | The value just below the maximum value, considering the data type and decimal places if applicable |
|          | MAX_VALUE	                    | Exactly the maximum value |
|          | JUST_ABOVE_MAX_VALUE           | The value just above the maximum value, considering the data type and decimal places if applicable |
|          | RANDOM_ABOVE_MAX_VALUE         | A random value above the maximum value |
|          | GREATEST_VALUE                 | The greatest value for the data type, *e.g.*, greatest integer |
| LENGTH   | LOWEST_LENGTH                  | An empty string |
|          | RANDOM_BELOW_MIN_LENGTH        | A string with random characters and random length, less than the minimum length |
|          | JUST_BELOW_MIN_LENGTH          | A string with random characters and length exactly below the minimum length |
|          | MIN_LENGTH                     | A string with random characters and length exactly equal to the minimum length |
|          | JUST_ABOVE_MIN_LENGTH          | A string with random characters and length exactly above the minimum length |
|          | MEDIAN_LENGTH                  | A string with random characters and length equal to the median between the minimum length and the maximum length |
|          | RANDOM_BETWEEN_MIN_MAX_LENGTHS | A string with random characters and random length, between the minimum length and the maximum length |
|          | JUST_BELOW_MAX_LENGTH          | A string with random characters and length exactly below the maximum length |
|          | MAX_LENGTH	                    | A string with random characters and length exactly equal to the maximum length |
|          | JUST_ABOVE_MAX_LENGTH          | A string with random characters and length exactly above the maximum length |
|          | RANDOM_ABOVE_MAX_LENGTH        | A string with random characters and random length, greater than the maximum length |
|          | GREATEST_LENGTH                | The greatest length supported for a string (*see Notes*) |
| FORMAT   | VALID_FORMAT                   | A value that matches the defined regular expression |
|          | INVALID_FORMAT                 | A value that does not match the defined regular expression |
| SET      | FIRST_ELEMENT                  | The first element in the defined set or query result |
|          | RANDOM_ELEMENT                 | A random element in the defined set or query result |
|          | LAST_ELEMENT                   | The last element in the defined set or query result |
|          | NOT_IN_SET                     | A value that does not belong to the defined set or query result |
| REQUIRED | FILLED                         | A random value |
|          | NOT_FILLED                     | Empty value |
| COMPUTED | RIGHT_COMPUTATION	            | A value generated by the defined algorithm |
|          | WRONG_COMPUTATION	            | A value different from that generated by the defined algorithm |


**NOTES**
- The greatest length for a string defaults to `500` for performance reasons when running the tests, but it can be set by the CLI parameter `--random-max-string-size`. Example: `concordia --random-max-string-size 1000`. You can also set it in the configuration file (`.concordiarc`) by adding the property  `randomMaxStringSize`. Example:
  ```json
  "randomMaxStringSize": 1000
  ```
- The test cases in the group `COMPUTED` are not available. However, using such algorithms to generate values for test cases is risky since the algorithm itself can have failures. Thus, we recommend you to cover test cases with tricky or complex calculations by defining the expected input and output values. You can define Variants or Test Cases for that purpose.

### Examples

#### Example 1

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

#### Example 2

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

#### Example 3

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
