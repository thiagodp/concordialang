# Overview of the Concordia Language <!-- omit in toc -->

Translations: [Português](../pt/language.md) 🌎

## Index <!-- omit in toc -->

- [Language constructions](#Language-constructions)
  - [Comments](#Comments)
  - [Language](#Language)
  - [Import](#Import)
  - [Tag](#Tag)
  - [Feature](#Feature)
  - [State](#State)
  - [Scenario](#Scenario)
  - [Constants](#Constants)
  - [User Interface Element](#User-Interface-Element)
    - [Property `id`](#Property-id)
    - [Property `type`](#Property-type)
    - [Property `editable`](#Property-editable)
    - [Property `data type`](#Property-data-type)
    - [Property `value`](#Property-value)
    - [Property `minimum value`](#Property-minimum-value)
    - [Property `maximum value`](#Property-maximum-value)
    - [Property `minimum length`](#Property-minimum-length)
    - [Property `maximum length`](#Property-maximum-length)
    - [Property `format`](#Property-format)
    - [Property `required`](#Property-required)
    - [Examples of UI Elements](#Examples-of-UI-Elements)
  - [Table](#Table)
  - [Database](#Database)
    - [Properties](#Properties)
    - [Examples](#Examples)
  - [Variant](#Variant)
  - [Test Case](#Test-Case)
  - [Test Events](#Test-Events)
- [Literals](#Literals)
  - [User Interface Literal](#User-Interface-Literal)
  - [Value](#Value)
  - [Number](#Number)
  - [List of values](#List-of-values)
  - [Query](#Query)
- [References to declarations](#References-to-declarations)
  - [User Interface Elements](#User-Interface-Elements)
    - [Inside queries](#Inside-queries)
  - [Constants](#Constants-1)
  - [Tables](#Tables)
  - [Databases](#Databases)
- [States](#States)


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

Examples:
```gherkin
import "file1.feature"
import "path/to/file2.feature"
```


### Tag

*Adds information to a language construction.*

Notes:
- Local declaration.
- Allowed more than one declaration per language construction.

Example 1 - *single tag per line*:
```
@critical
```

Example 2 - *more than one per line*:
```
@critical @slow @gui @generated
```

Example 3 - *tag with number*:
```
@importance( 5 )
```

Example 4 - *tag with text*:
```
@extends( Full Name )
```

Reserved tags:
- `@scenario( <number> )`: references a [scenario](#scenario).
- `@variant( <number> )`: references a [variant](#variant).
- `@importance( <number> )`: indicates the importance of a declaration. The importance is as high as its number.
- `@generated`: indicates that a Test Case was computer-generated.
- `@fail`: indicates that a Test Case should fail.
- `@global`: defines a [User Interface Element](#user-interface-element) as global. **Yet not available in the tool*
- `@ignore`: whether applied to a Variant, it will not produce Test Cases; whether applied to a Test Case, it will not produce test scripts.
- `@generate-only-valid-values`: avoids that a UI Element's property be used for generating values considered invalid. This is specially useful for using with masked input fields, in which the system does not let a user to type invalid characters on it. For instance:
    ```concordia
    UI Element: Year
      - data type is integer
      @generate-only-valid-values
      - format is "/^[0-9]{1-3}$/"
      Otherwise I must see "Year must be a number."
     ```
    The above example will avoid generating invalid input values (*e.g.,*, "A") for testing the format of the Year.

Reserved for future use:
- `@extends( <name> )` allows inheritance of [User Interface Elements](#user-interface-element).
- `@category( <name> )` specifies a category. Useful for organizing the documentation and for filtering it.
- `@issue( <number> )` references an Issue.


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

**Precondition**:
```gherkin
Given that I have ~user logged in~
```

**State Call** - that is the producer of state will be called:
```gherkin
When I need the state ~payment method selected~
```

**Postcondition**:
```gherkin
Then I have ~paid~
```


### Scenario

*Used to describe a usage scenario for a feature, in business terms. Its sentences are not used to generate test cases.*

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

*Declaration block with constant values.*

Notes:
- Global declaration.
- Just one declaration per file.
- A declaration may have more than one constant.
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
- `editable`, defaults to `true` when an editable `type` is used, that is, when it accepts input data.
- `data type`, defaults to `string`
- `value`
- `minimum length`
- `maximum length`
- `minimum value`
- `maximum value`
- `format`
- `required`, defaults to `false`

#### Property `id`
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
  - Multiple identifiers are denoted by `id in [ "<value1>", "<value2>", ... ]` **Yet not supported by the tool**
    - Example: `id in [ "birthDate", "~birthDate" ]`

#### Property `type`
  - Example: `- type is button`
  - Default value is `textbox`
  - Does not need quotes (`"`)
  - Allowed values are:
    - `button`
    - `checkbox` or `check`
    - `cookie`
    - `div`
    - `file input`
    - `image`
    - `label`
    - `list item` or `li`
    - `link`
    - `ordered list` or `ol`
    - `page`
    - `paragraph`
    - `radio` or `radio button`
    - `screen`
    - `select` or `combo` or `combobox` or `combo box` or `selection box`
    - `slider`
    - `span`
    - `tab`
    - `table`
    - `text`
    - `textbox` or `input`
    - `textarea` or `text area`
    - `title`
    - `window`
    - `unordered list` or `ul`
    - `url` or `address` or `ip` or `site`

#### Property `editable`
  - Example: `- editable is true`
  - Allowed values are `true` and `false`
  - Does not need quotes (`"`)
  - Default value is `false`, but assumes `true` automatically when *a least one* of the following conditions occur:
    - A `type` considered *editable* is used, that is:
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

#### Property `data type`
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

#### Property `value`
  - Accepted values:
    - [Value](#value)
    - [Number](#number)
    - [Constant](#constants)
    - [List](#list-of-values)
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

#### Property `minimum value`
  - Accepted values:
    - [Number](#number)
    - [Constant](#constants)
    - [List of numbers](#list-of-values)
    - [Query](#query)
    - Reference to another UI Element
  - Examples:
    - `- minimum value is 5`
    - `- minimum value is [PI]`
    - `- minimum value is in [ 5, 10, 20 ]`
    - `- minimum value comes from "SELECT ..."`
    - `- minimum value is equal to {Other UI Element}`

#### Property `maximum value`
  - Same syntax as `minimum length`
  - Examples:
    - `- maximum value is 5`
    - `- maximum value is [PI]`
    - `- maximum value is in [ 5, 10, 20 ]`
    - `- maximum value comes from "SELECT ..."`
    - `- maximum value is equal to {Other UI Element}`


#### Property `minimum length`
  - Same syntax as `minimum value`
  - Examples:
    - `- minimum length is 5`
    - `- minimum length is [MIN]`
    - `- minimum length is in [ 5, 10, 20 ]`
    - `- minimum length comes from "SELECT ..."`
    - `- minimum length is equal to {Other UI Element}`

#### Property `maximum length`
  - Same syntax as `minimum length`
  - Examples:
    - `- maximum length is 50`
    - `- maximum length is [MAX]`
    - `- maximum length is in [ 10, 20, 30 ]`
    - `- maximum length comes from "SELECT ..."`
    - `- maximum length is equal to {Other UI Element}`


#### Property `format`
  - Accepted values:
    - [Value](#value)
    - [Constant](#constants)
  - Must be a valid [Regular Expression](https://en.wikipedia.org/wiki/Regular_expression)
  - Examples:
    - `- format is "/[A-Za-z ._-]{2,50}/"`
    - `- format is "/^[0-9]{2}\.[0-9]{3}\-[0-9]{3}$/"`
    - `- format is [Some Constant with RegEx]`

#### Property `required`
  - Accepted values are `true` or `false`
  - When not declared, the property assumes `false` (that is, not required)
  - The value `true` is optional. For example, the following declaration is accepted as `true`:
    - `- required`
  - Examples:
    - `- required`
    - `- required is true`
    - `- required is false`


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
- Property values must be declared between quotes (`"`).

#### Properties

| Property   | Description | Required |
| ---------- | ----------- | -------- |
| `type`     | Database type. See supported values ahead. | Yes |
| `host`     | URL that indicates where the database is hosted. | Vary |
| `port`     | Network communication port used to connect to the database. Whether not defined, the default database port will be used, according to the property `type`.| No |
| `name`     | Database name. Used when there is a database server (whose location is defined by the property `host`) and the database is accessible by its name. | Vary |
| `path`     | Database path. Used when the database is accessed through the file system, such as the types `csv`, `ini`, `json`, `sqlite` and `xlsx`. | Vary |
| `username` | Username used to connect to the database. When not defined, the database's default user will be used, according to the property `type`. | No |
| `password` | Password used to connect to the database. When not defined, the database's default password will be used, according to the property `type`. | No |
| `options`  | Database-specific connection options. | No |

Currently supported values for `type`:

| Value        | Database    | Installation command* | Note |
| ------------ | ----------- | --------------------- | ---- |
| `"adodb"`    | [MS Access](https://pt.wikipedia.org/wiki/Microsoft_Access) and [MS SQL Server](https://en.wikipedia.org/wiki/Microsoft_SQL_Server) through [ActiveX Data Objects](https://en.wikipedia.org/wiki/ActiveX_Data_Objects) | `npm install database-js-adodb`    | *MS Windows Only* |
| `"csv"`      | [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) files | `npm install database-js-csv`      | |
| `"firebase"` | [Firebase](https://firebase.google.com) databases | `npm install database-js-firebase` | |
| `"ini"`      | [INI files](https://en.wikipedia.org/wiki/INI_file) |`npm install database-js-ini`      | |
| `"json"`     | [JSON](https://en.wikipedia.org/wiki/JSON) files | `npm install database-js-json`    | Installed by default |
| `"mysql"`    | [MySQL](https://www.mysql.com/) databases | `npm install database-js-mysql`    | |
| `"mssql"`    | [MS SQL Server](https://www.microsoft.com/en-us/sql-server) | `npm install database-js-mssql`    | |
| `"postgres"` | [PostgreSQL](https://www.postgresql.org/) databases | `npm install database-js-postgres` | |
| `"sqlite"`   | [SQLite](https://www.sqlite.org/) databases | `npm install database-js-sqlite`   | |
| `"xlsx"`     | [Excel](https://en.wikipedia.org/wiki/Microsoft_Excel) spreadsheets | `npm install database-js-xlsx`     | |

**Notes** (*)
 - To connect and handle databases during test executions, you have to install their corresponding NPM packages.
 - Go to your application's root folder and type the corresponding *Installation command* (see above).


#### Examples

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

*Allow to express the interaction between a user and the system in order to perform a Scenario. It serves as a template to generate Test Cases.*

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

See also: [Examples of Actions](actions.md)


### Test Case

*Test case produced for a Variant*

Notes:
- Local declaration.
- Belongs to a `Variant`.
- Can be declared in a different file, `.testcase` - **strongly recommended**
- Must have tag `@scenario( <index> )` that references its Scenario by the index, starting at 1.
- Must have tag `@variant( <index> )` that references its Variant by the index, starting at 1.
- **It does not allow references, such as `UI Elements`, `Constants`, and `States`**

Generated automatically from:
1. [Variant](#variant)
2. [UI Element](#user-interface-element)
3. [Constants](#constant)
4. [States](#state)

A generated test case will:
- Receive the same name of the `Variant`, plus a number;
- Receive the tag `@generated`;
- Receive the tag `@scenario` to refer to its `Scenario`;
- Receive the tag `@variant` to refer to its `Variant`;
- Replace a **precondition**, *i.e.,* a `Given` step with a [state](#state), by a `Variant` able to produce this same state;
- Replace a **state call**, *i.e.,* a `When` step with a [state](#state), by a `Variant` able to produce this same state;
- Replace a **postconditions**, *i.e.,* `Then` steps with [states](#state), when the current test case generates an invalid value for a certain UI Element *and* the respective UI Element has defined `Otherwise` steps that describe the expected behavior in case of an invalid value. When there are no `Otherwise` steps defined, the Test Case receives a tag `@fail` to indicate that it should not behave the same way as its Variant;
- Replace all the involved `Constants` by their corresponding values;
- Replace all the involved references to `UI Elements` by their `UI Literals`, that is, their `id`s;
- Keep any declared `UI Literals`;
- Generate random values for `UI Literals` without value;
- Keep any declared values or numbers;
- Generate values for `UI Elements` according to their properties and the applicable [test cases](test-cases.md).

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

See [examples of actions](actions.md)

### Test Events

*Declares events before, after, or around test cases or features. Console commands or SQL scripts can be executed when these events occur.*

Notes:
- Local declaration.
- Just one declaration per Feature.

They are:
- `Before Each Scenario`: occurs before each scenario.
- `After Each Scenario`: occurs after each scenario.
- `Before Feature`: occurs before a feature.
- `After Feature`: occurs after a feature.
- `Before All`: occurs before all the features.
- `After All`: occurs after all the features.

These events support three type of commands:

1. **SQL script**: runs a SQL script into a declared database. See the actions [connect](actions.md#connect), [disconnect](actions.md#disconnect), and [run](actions.md#run).

2. **Console command**: runs a command in the console and waits for its termination.

3. **File command**: runs a command that checks or handles a file. (NOT SUPPORTED YET)

Test Events for Features and Scenarios also support interactions with the user interface, like those commonly used in Variants.

Both Console and SQL commands must declared values between apostrophes (`'`), as known as *single quotes*.

Example 1:
```gherkin
Before Feature:
  When I connect to the database [MyDB]
```

Example 2:
```gherkin
After Feature:
  When I run the command 'rmdir some-folder'
    and I run the script 'DELETE FROM [MyDB].users'
    and I disconnect from the database [MyDB]
```

Example 3:
```gherkin
Before Each Scenario:
  When I run the script 'DELETE FROM [MyDB].`users`'
    and I run the script 'INSERT INTO [MyDB].`users` ( `login`, `password` ) VALUES ( "Clark", "Kent" ), ( "Bruce", "Wayne" )'
```

Example 4:
```gherkin
After Each Scenario:
  When I create the file 'path/to/foo.json' with `{ "name": "John", "surname": "Doe" }`
    and I see the file 'path/to/bar.xml' with `<person><name>John</name><surname>John</surname></person>`
```

Some plug-ins may not support some Test Events:

```
+--------------------------+--------------------------------+
| PLUGIN                   |     After/Before               |
|                          | All  | Feature | Each Scenario |
+--------------------------+------+---------+---------------+
| CodeceptJS + WebDriverIO | no   |  yes    |  yes          |
| CodeceptJS + Appium      | no   |  yes    |  yes          |
+--------------------------+------+---------+---------------+
```

## Literals

### User Interface Literal

> Always between `<` and `>`

A UI Literal is an identification (id) of a User Interface element. This identification will be used by the test script to locate the element in the application during the test. For instance, in a web application, an input declared using HTML as `<input id="foo" >` has `#foo` as its identification.

In the following example, `#foo` is a UI Literal.

```gherkin
When I fill <#foo> with "Bob"
```

Formats accepted:
- `<#value>` denotes an `id`
- `<@value>` denotes a `name`
- `<value>` denotes a `css`
- `<//value>` denotes a `xpath`
- `<~value>` denotes a `mobile name`

Make sure to escape CSS locators properly. Example:

```gherkin
Then I see <ul \> li \> div \> a>
```
locate `ul > li > div > a`.

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

Currently accepted only for [UI Elements](#user-interface-element)

Example 1:

```gherkin
UI Element: Sex
  - value comes from [ "Male", "Female", "Other" ]
```
Example 2:

```gherkin
UI Element: Age
  - value comes from [ 12, 16, 18, 21, 65 ]
```

Example 3:

```gherkin
UI Element: Price
  - value comes from [ 12.50, 20.00 ]
```

Example 4:

```gherkin
UI Element: Example
  - value comes from [ 12, 12.50, "Male" ]
```

### Query

> Always between quotes (`"`) and starting with `SELECT`

Currently accepted only for [UI Elements](#user-interface-element)

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

5. May reference a UI Element from the current Feature using the format `{UI Element Name}`.
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
