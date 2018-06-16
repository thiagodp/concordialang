# Generated test cases

Concordia can generate test cases from [functional requirements](https://en.wikipedia.org/wiki/Functional_requirement) written in Concordia Language. Although it is not able to generate test cases for [non-functional requirements](https://en.wikipedia.org/wiki/Non-functional_requirement) automatically, you can create them manually with traditional *Behavior-Driven Development* (BDD) tools based on [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), such as [Cucumber](https://docs.cucumber.io/).

## Covered states

> *description soon*

## Covered scenarios

> *description soon*

## Covered rules

Every input data may receive values according to its business rules.
These business rules are classified in the following groups:
`VALUE`, `LENGTH`, `FORMAT`, `SET`, `REQUIRED`, and `COMPUTED`.
All but `COMPUTED` are currently available.

Every group has related test cases, applied according to the declared business rules:

| Group    | Test Case                      |
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
|          | RANDOM_ABOVE_MAX_LENGTH        |
|          | GREATEST_LENGTH                |
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
|          |                                |


## Example 1

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

## Example 2

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

## Example 3

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
