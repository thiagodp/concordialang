# Overview of the Concordia Language

## Index

Language constructions
- [Comments](#comments)
- [Language](#language)
- [Import](#import)
- [Tag](#tag)
- [Feature](#feature)
- [State](#state)
- [Scenario](#scenario)
- [Constants](#constants)
- [User Interface Element](#user%20interface%20element)
- [Table](#table)
- [Database](#database)
- [Variant](#variant)
- [Test Case](#test%20case)
- [Test Events](#test%20events)

Literals
- [User Interface Literal](#user%20interface%20literal)
- [Value](#value)
- [Number](#number)
- [List of values](#list%20of%20values)
- [Query](#query)

References to declarations
- [User Interface Elements](#user%20interface%20elements)
- [Constants](#constants)
- [Tables](#tables)
- [Databases](#databases)
- [States](#states)


## Language constructions

### Comments

```gherkin
# This is a comment

Feature: Foo # This is also a comment
```

### Language

*Defines the language used in the current specification file.*

Notes:
- Local declaration.
- Just one declaration per file.
- Defined as a special comment.

Example 1:
```gherkin
#language: pt
```

Example 2:
```gherkin
#language: es-ar
```


### Import

*Imports the definitions of another file.*

Notes:
- Local declaration.
- Allowed more than one declaration per file.

Example 1:
```gherkin
import "file1.feature"
```


### Tag

*Adds information to a language construction.*

Notes:
- Local declaration.
- Allowed more than one declaration per language construction.

Example 1 (*one per line*):
```gherkin
@critical
```

Example 2 (*more than one per line*):
```gherkin
@critical @slow @gui @generated
```

Reserved tags:
- `@scenario( <number> )`: references a [scenario](#scenario).
- `@variant( <number> )`: references a [variant](#variant).
- `@importance( <number> )`: indicates the importance. The importance is as higher as its number.
- `@generated`: indicates that a declaration was computer-generated.
- `@fail`: indicates that a test case should fail.
- `@global`: defines an element as global. Can be applied to [User Interface Element](#UserInterfaceElement).
- `@ignore`: indicates that a declaration should be ignored to generate tests.

Reserved for future use:
- `@issue( <number> )` references an Issue.
- `@category( <name> )` specifies a category. It can be used for filtering.


### Feature

*Feature of the system.*

Notes:
- Global declaration.
- Just one declaration per file.

Example 1:
```gherkin
Feature: Admininistrator Login
```

Example 2:
```gherkin
Feature: Admininistrator Login
  As an administrator
  I would like to login
  So that I can access the system
```

Example 3:
```gherkin
Feature: Admininistrator Login
  In order to access the system
  As an administrator
  I would like to login
```


### State

*State of the system.*

Notes:
- Local declaration.
- Only declared inside `Variant` steps.
- Declaration in a `Given` step means that the state is a **precondition**.
- Declaration in a `When` step means that the state is a **state call**.
- Declaration in a `Then` step means that the state is a **postcondition**.

Precondition:
```gherkin
Given that I have ~user logged in~
```

State Call - that is the producer of state will be called:
```gherkin
When I need the state ~payment method selected~
```
Postcondition:
```gherkin
Then I have ~paid~
```


### Scenario

*Scenario of the system. Not used to generate test cases.*

Notes:
- Local declaration.
- Allowed more than one declaration per Feature.

Example 1:
```gherkin
Scenario: Successful login
  Given that I start the system
    And I am not logged in
  When I inform my credentials
  Then I am able to enter the system
```

Example 2:
```gherkin
Scenario: Unsuccessful login
  Given that I start the system
    And I am not logged in
  When I inform invalid credentials
  Then I am not able to enter the system
```


### Constants

*Declaration of constant values.*

Notes:
- Global declaration.
- Just one declaration per file. One declaration can have more than one constant.
- Namespace is shared with Tables and Databases.

Example:
```gherkin
Constants:
  - "PI" is 3.14159
  - "AppName" is "My App"
```


### User Interface Element

*Element of the User Interface.*

Notes:
- Local or global declaration - although global **is not yet supported** by Concordia.
- Allowed more than one declaration per Feature.
- Global declarations allowed through the tag `@global`  - **not supported yet**.
- Inheritance allowed through the the tag `@extends`, *e.g.*, `@extends(Other Element)` - **not supported yet**.
- May have properties.
- Properties must be preceded by a dash (`-`).

Allowed properties:
- `id`
- `type`, defaults to `textbox`
- `editable`, defaults to `true` when an editable `type` is used.
- `data type`, defaults to `string`
- `value`
- `minimum length`
- `maximum length`
- `minimum value`
- `maximum value`
- `format`
- `required`, defaults to `false`

Property `id`:
  - Example: `- id is "name"`
  - Default value is the element name in camel case and without spaces, *e.g.*, `"Some Name"` becomes `"someName"`
  - Value must be declared between quotes (`"`)
  - Support the following notation:
    - `"value"` denotes an `id`
    - `"#value"` denotes an `id`
    - `"//value"` denotes a `xpath`
    - `"@value"` denotes a `name`
    - `"~value"` denotes a `mobile name`
    - `".value"` denotes a `css`
  - Multiple identifiers are denoted by `id in [ "<value1>", "<value2>", ... ]`
  - Example of a multiple identifier:   `id in [ "birthDate", "~birthDate" ]`

Property `type`:
  - Example: `- type is button`
  - Default value is `textbox`
  - Does not need quotes (`"`)
  - See [data/en.json](data/en.json) for all the types allowed.

Property `editable`:
  - Example: `- editable is true`
  - Allowed values are `true` and `false`
  - Does not need quotes (`"`)
  - Default value is `false`, but assumes `true` automatically when *a least one* of these conditions occur:
    - An editable `type` is used, that is:
      - `checkbox`
      - `fileInput`
      - `select`
      - `table`
      - `textbox`
      - `textarea`
    - One of the following properties is defined:
      - `minimum length`
      - `maximum length`
      - `minimum value`
      - `maximum value`
      - `value`

Property `data type`:
  - Example: `- data type is double`
  - Does not need quotes (`"`)
  - Allowed types are:
    - `string`
    - `integer`
    - `double`
    - `date`
    - `time`
    - `datetime`
  - Precision of `double` values is inferred from declared rules, *e.g.*, `12.50` makes Concordia to know that the precision is `2`

Property `value`:
  - Accepted values:
    - [Value](#value)
    - [Number](#number)
    - [Constant](#constants)
    - [List](#listofvalues)
    - [Query](#query)
    - Reference to another UI Element
  - Examples:
    - `- value is "hello"`
    - `- value is 5`
    - `- value is [PI]`
    - `- value is in [ "Male", "Female", "Other" ]`
    - `- value comes from "SELECT ..."`
    - `- value is equal to {Other UI Element}`
  - Accepts negation. Examples:
    - `- value is not in [ 10, 20, 30 ]`
    - `- value is not in "SELECT ..."`
    - `- value is not equal to {Other UI Element}`

Property `minimum value`:
  - Accepted values:
    - [Number](#number)
    - [Constant](#constants)
    - [List of numbers](#listofvalues)
    - [Query](#query)
    - Reference to another UI Element
  - Examples:
    - `- minimum value is 5`
    - `- minimum value is [PI]`
    - `- minimum value is in [ 5, 10, 20 ]`
    - `- minimum value comes from "SELECT ..."`
    - `- minimum value is equal to {Other UI Element}`

Property `maximum value`:
  - Same syntax as `minimum length`
  - Examples:
    - `- maximum value is 5`
    - `- maximum value is [PI]`
    - `- maximum value is in [ 5, 10, 20 ]`
    - `- maximum value comes from "SELECT ..."`
    - `- maximum value is equal to {Other UI Element}`


Property `minimum length`:
  - Same syntax as `minimum value`
  - Examples:
    - `- minimum length is 5`
    - `- minimum length is [MIN]`
    - `- minimum length is in [ 5, 10, 20 ]`
    - `- minimum length comes from "SELECT ..."`
    - `- minimum length is equal to {Other UI Element}`

Property `maximum length`:
  - Same syntax as `minimum length`
  - Examples:
    - `- maximum length is 50`
    - `- maximum length is [MAX]`
    - `- maximum length is in [ 10, 20, 30 ]`
    - `- maximum length comes from "SELECT ..."`
    - `- maximum length is equal to {Other UI Element}`


Property `format`:
  - Accepted values:
    - [Value](#value)
    - [Constant](#constants)
  - Must be a valid [Regular Expression](https://en.wikipedia.org/wiki/Regular_expression)
  - Examples:
    - `- format is "/[A-Za-z ._-]{2,50}/"`
    - `- format is "/^[0-9]{2}\.[0-9]{3}\-[0-9]{3}$/"`
    - `- format is [Some Constant with RegEx]`

Property `required`:
  - Accepted values are `true` and `false`
  - Default value is `false`
  - Examples:
    - `- required is true`


#### Examples of UI Elements

Example 1:
```gherkin
UI Element: Username
  - id is "#user"
  - minimum length is 2
    Otherwise I must see [min_length_msg]
  - maximum length is 30
  - value is queried by "SELECT username FROM [MyDB].`users`"
    Otherwise I must see [max_length_msg]

UI Element: Enter
  - type is button
```

Example 2:
```gherkin
UI Element: Profession
  - type is select
  - value is queried by "SELECT name FROM [Professions]"

UI Element: Salary
  - data type is double
  - minimum value is queried by "SELECT min_salary FROM [Professions] WHERE name = {Profession}"
```

Example 3:
```gherkin
UI Element: Brazilian Zip Code
  - format is "/^[0-9]{2}\.[0-9]{3}\-\.[0-9]{3}$/"
```


### Table

*Declares a data table that can be used by UI elements.*

Notes:
- Global declaration.
- Namespace is shared with Constants and Databases.
- Allowed more than one declaration per file.
- Tables are loaded as in-memory tables and can be queried with SQL.

Example 1:
```
Table: Users
  | username | password |
  | Bob      | bobp4ss  |
  | Joey     | joeypwd  |
```


### Database

*Declares a reference to a database, with its connection parameters.*

Notes:
- Global declaration.
- Namespace is shared with Constants and Tables.
- Allowed more than one declaration per file.

Allowed properties:
  - `type`
  - `host`
  - `port`
  - `name`
  - `path`
  - `username`
  - `password`
  - `options`

Currently supported values for `type`:
  - `"adodb"`  for connecting to databases such as [MS Access](https://pt.wikipedia.org/wiki/Microsoft_Access) and [SQL Server](https://en.wikipedia.org/wiki/Microsoft_SQL_Server) through [ActiveX Data Objects](https://en.wikipedia.org/wiki/ActiveX_Data_Objects)
  - `"csv"` for connecting to files with [Comma Separated Values](https://en.wikipedia.org/wiki/Comma-separated_values)
  - `"firebase"` for connecting to [Firebase](https://firebase.google.com) databases
  - `"ini"` for connecting to [INI files](https://en.wikipedia.org/wiki/INI_file)
  - `"json"` for connecting to [JSON](https://en.wikipedia.org/wiki/JSON) files
  - `"mysql"` for connecting to [MySQL](https://www.mysql.com/) databases
  - `"postgres"` for connecting to [PostgreSQL](https://www.postgresql.org/) databases
  - `"sqlite"` for connecting to [SQLite](https://www.sqlite.org/) databases
  - `"xlsx"` for connecting to [Excel](https://en.wikipedia.org/wiki/Microsoft_Excel) spreadsheets


Example 1:
```
Database: My DB
  - type is "mysql"
  - host is "http://127.0.0.1"
  - name is "mydb"
  - username is "admin"
  - password is "p4sss"
```

Example 2:
```
Database: Another DB
  - type is "json"
  - path is "C:\path\to\db.json"
```


### Variant

*Declares a variant of a scenario. A variant is a template for test cases.*

Notes:
- Local declaration.
- Belongs to a Scenario.
- Should be declared after a Scenario.

Example:
```gherkin
Variant: Successful login
  Given that I am on the [Login Page]
  When I fill {Username}
    And I fill {Password}
    And I click on {Enter}
  Then I have the state ~user logged in~
    And I see the text [welcome text]
    And I see {Logout}
```


### Test Case

*Test case for a Variant*

Notes:
- Local declaration.
- Belongs to a `Variant`.
- Can be declared in a different file, `.testcase`

Generated automatically from:
1. [Variant](#variant)
2. [UI Element](#uielement)
3. [Constants](#constant)
4. [States](#states)

A generated test case will:
- Receive the same name of the `Variant`, plus a number;
- Receive the tag `@generated`;
- Receive the tag `@scenario` to refer to its `Scenario`;
- Receive the tag `@variant` to refer to its `Variant`;
- Replace a **precondition**, *i.e.,* a `Given` step with a [state](#states), by a `Variant` able to produce this same state;
- Replace a **state call**, *i.e.,* a `When` step with a [state](#states), by a `Variant` able to produce this same state;
- Replace a **postconditions**, *i.e.,* `Then` steps with [states](#states), when the current test case generates an invalid value for a certain UI Element *and* the respective UI Element has defined `Otherwise` steps that describe the expected behavior in case of an invalid value. When there are no `Otherwise` steps defined, the Test Case receives a tag `@fail` to indicate that it should not behave the same way as its Variant;
- Replace all the involved `Constants` by their corresponding values;
- Replace all the involved references to `UI Elements` by their `UI Literals`, that is, their `id`s;
- Keep any declared `UI Literals`;
- Generate random values for `UI Literals` without value;
- Keep any declared values or numbers;
- Generate values for `UI Elements` according to their properties and the applicable test cases (see `README.md`).

Example:
```gherkin
@generated
@scenario( 1 )
@variant( 1 )
Test Case: Successful login - 1
  Given that I am on the page "/login"
  When I fill <#username> with "Bob"
    And I fill <#password> with "bobp4ss"
    And I click on "Enter"
  Then I see "Welcome"
    And I see a button <#logout>
```


### Test Events

*Declares events before, after, or around test cases or features. Console commands or SQL scripts can be executed when these events occur.*

Notes:
- Local declaration.
- Just one declaration per Feature.

**YET NOT SUPPORTED BY CONCORDIA**

Could be:
- { Before | After | Around } Each Scenario
- { Before | After | Around } Feature

These events support two type of commands:
  1. *Console command*: run a command in the console and waits for its termination.
  2. *SQL command*: run a command to a declared database.

Both commands must declared values between apostrophes (`'`).

Example:
```
Before Each Scenario:
  - Run 'cls'
  - Run sql 'DELETE FROM [MyDB].`user`'
  - Run sql 'INSERT INTO [MyDB].`user` ( `username`, `password` ) VALUES ( "Clark", "Kent" ), ( "Bruce", "Wayne" )'
```



## Literals

### User Interface Literal

> Always between `<` and `>`

A UI Literal is an identification (id) of a User Interface element. This identification will be used by the test script to locate the element in the application during the test. For instance, in a web application, an input declared using HTML as `<input id="name" ></input>` has `name` as its identification.

In the following example, `name` is a UI Literal.

```gherkin
When I fill <name> with "Bob"
```

Formats accepted:
- `<value>` denotes an `id`
- `<#value>` denotes an `id`
- `<//value>` denotes a `xpath`
- `<.value>` denotes a `css`
- `<@value>` denotes a `name`
- `<~value>` denotes a `mobile name`


### Value

> Always between quotes (`"`).

In the following example, `Bob` is a value:
```gherkin
When I fill <name> with "Bob"
```

### Number

> No quotes.

In the following example, `500` is a value:
```gherkin
When I fill <quantity> with 500
```

In the following example, `12.50` is a value:
```gherkin
When I fill <price> with 12.50
```


### List of values

> Always between `[` and `]`

Currently accepted only for [UI Elements](#userinterfaceelement)

Example 1:

```gherkin
UI Element: Sex
  - value comes from [ "Male", "Female", "Other" ]
```
Example 2:

```gherkin
UI Element: Ages
  - value comes from [ 12, 16, 18, 21, 65 ]
```

Example 3:

```gherkin
UI Element: Prices
  - value comes from [ 12.50, 20.00 ]
```

Example 4:

```gherkin
UI Element: Values
  - value comes from [ 12, 12.50, "Male" ]
```

### Query

> Always between quotes (`"`) and starting with `SELECT`

Currently accepted only for [UI Elements](#userinterfaceelement)

Example:

```gherkin
UI Element: Product
  - value comes from "SELECT name FROM ..."
```

**Note**: To force a **query** to be a **value**, it must be used an exclamation mark (`!`) right before it. *E.g.*, `!"SELECT * FROM foo"`.

Notes about queries:

1. May use grave accents to refer to names with spaces, as in ANSI-SQL. *E.g.*, \`my table\`

2. Must use apostrophes to denote non-numeric values. Example:
   ```sql
   SELECT * FROM user WHERE username = 'bob'
   ```

3. May reference a [Table](#table), a [Database](#database), or a [Constant](#constant)
   using the format `[some name]`, where the content does not contain a dollar sign, `$`.
   A dollar sign may be use to reference valid Excel table names, instead of referencing
   names declared in Concordia.

   Example 1: references a declared table and a declared constant.
   ```sql
   SELECT column1 FROM [My Table] WHERE name = [My Constant]
   ```

   Example 2: references a declared database and a declared constant.
   ```sql
   SELECT column1 FROM [My DB].`table` WHERE name = [My Constant]
   ```

   Example 3: name that is **not a reference** (*e.g.*, an Excel table)
   ```sql
   SELECT column1 FROM [Some Excel Table$] WHERE name = [My Constant]
   ```

4. May reference UI Elements using the format `{feature name:ui element name}`, in which
   `feature name:` is optional. The lack of the feature name should make the tool assuming
   that the UI element belongs to the feature.
   Example:
   ```sql
   SELECT password FROM [Users] WHERE username = {Login:Username}
   ```

6. May reference UI element using the format `{ui element name}`, considering that
   the reference UI element belongs to the current feature (e.g., the feature of the current file).
   Example:
   ```sql
   SELECT password FROM [Users] WHERE username = {Username}
   ```



## References to declarations

### User Interface Elements

> Always between `{` and `}`

In the following example, `{Name}` is a reference to a UI Element called `Name` :

```gherkin
When I fill {Name} with "bob"
```

The name of the Feature is **optional** when a reference is declared for the same Feature, but **mandatory** otherwise.

Explicit references to a Feature must be separated from the UI Element name by a colon (`:`). For instance `{Add an Employee:Profession}` :

```gherkin
When I fill {Add an Employee:Profession} with "Dentist"
```

#### Inside queries

In the following example, `{Profession}` is a reference to a UI Element:
```gherkin
Feature: Add an Employee

...

UI Element: Profession
  - value comes from "SELECT name FROM [Professions]"

UI Element: Salary
  - minimum value comes from "SELECT min_salary FROM [Professions] WHERE name = {Profession}"
```

If desired, the reference could also be declared as `{Add an Employee:Profession}`.


### Constants

> Always between `[` and `]`

In the following example, `[PI]` is a reference to a Constant:

```gherkin
...
  When I fill <firstNumber> with [PI]
  ...

Constants:
  - "PI" is 3.14159
```

**Note**: `Constants`, `Table`s, and `Database`s are global declarations and share the same namespace, so pay attention to name collisions.

### Tables

> Always between `[` and `]`

References to tables are only allowed inside queries.

In the following example, `[Professions]` is a reference to a Table:
```gherkin
UI Element: Profession
  - value comes from "SELECT name FROM [Professions]"

Table: Professions
  | name       |
  | Accountant |
  | Dentist    |
  | Mechanic   |
```

**Note**: `Constants`, `Table`s, and `Database`s are global declarations and share the same namespace, so pay attention to name collisions.

### Databases

> Always between `[` and `]`

References to databases are only allowed inside queries.

In the following example, `[Professions]` is a reference to a Database:
```gherkin
UI Element: Profession
  - value comes from "SELECT name FROM [Professions]"

Database: Professions
  - type is "json"
  - path is "/path/to/professions.json"
```

In this other example, `[MyTestDB]` is a reference to another Database:

```gherkin
UI Element: Profession
  - value comes from "SELECT name FROM [MyTestDB].`profession`"

Database: MyTestDB
  - type is "mysql"
  - name is "mydb"
  - username is "tester"
  - password is "testing123"
```

**Note**: `Constants`, `Table`s, and `Database`s are global declarations and share the same namespace, so pay attention to name collisions.

## States

> Always between tilde (`~`)

Example:

```gherkin
  Given that I have ~user logged in~
```
