# ASL in English

```
+-----+               +-----+
|     | <-- import -- |     |
|     |               |     |
+-----+               +-----+
.feature              .variant
```

```
Lexer
  >> Parser
    >> NLP
      >> Semantic Analyzer
        >> Logic Analyzer
          >> Test Case Generator
            >> Test Script Generator
              >> Test Script Executor
                >> Test Result Analyzer
```

## Index:

General:
- [Formats and References](#formats)

Language constructions:
- [Language](#language)
- [Import](#import)
- [Tag](#tag)
- [Feature](#feature)
- [State](#state)
- [Scenario](#scenario)
- [Constants](#constants)
- [User Interface Element](#userinterfaceelement)
- [Regular Expressions](#regularexpressions)
- [Table](#table)
- [Database](#database)
- [Template](#template)
- [Variant](#variant)
- [Test Events](#testevents)



## Formats and References

### Literals
- Value: `"value"`
- Number: `5`
- List: `[ "val1", "val2", ... ]` or `[ 12, 53, ... ]` or `[ "hello", 90, ... ]`
- UI Element: `<id>` or `<#id>` or `<@name>` or `<//xpath>` or `<~mobile_name>`
- Query: `"SELECT * FROM tbl WHERE fld = 'hello'"` or `"select ..."`

Notes:
- To force a **query** to be a **value**, it should be used an exclamation mark (`!`) right before it. E.g., `!"SELECT * FROM foo"`

### References
- UI Element: `{UI Element}` or `{Feature:UI Element}`
- Constant: `[constant]` ? Alternatives: `${constant}` ?
- State: `~state~`
- Feature: executes the feature `{{Feature}}` ? Alternatives: `'Feature'`, `"Feature"` ?
- Scenario: `{{Scenario}}` ? Same alternatives to Feature.
  - from the same feature: `executes the scenario {{Scenario}}`
  - of a different feature: `executes the scenario {{Scenario}} of the feature {{Feature}}`
  - by number: `#1`, e.g., `executes the scenario #1 of the feature {{Feature}}`
- Variant: `{{Variant}}` ? Same alternatives to Feature.
  - from the same feature: `executes the variant {{Variant}}`
  - of a different feature: `executes the variant {{Variant}} of the feature {{Feature}}`
  - by number: `#1`, e.g., `executes the variant #1 of the feature {{Feature}}`

### References inside queries
- Constant:
  - `[something]` **can** be used whether the project adopts [AlaSQL](https://github.com/agershun/alasql), with the restriction that [it uses](https://github.com/agershun/alasql#read-and-write-excel-and-raw-data-files) only numbers inside brackets, to refer columns of CSV files. E.g., `"SELECT [3] as city, [4] as population from csv( 'path/to/file.csv')"`. So a [Constant](#constants) name could not be a number.
  - `[something]` **can** be used whether the project adopts [Database-JS](https://github.com/mlaanderson/database-js), with the restriction that it uses dollar signs (`$`) to reference rows and columns in Excel files. E.g., `"SELECT * FROM [Sheet1$A1:C52]"`. So [Constants](#constants) names could *not* have dollar signs.
  - References that do not match the format of a [Constant](#constants) name must be ignored, i.e., not replaced by a value.



## Language

*Defines the language used in the current specification file.*

Notes:
- Local declaration.
- Just one declaration per file.

Example 1:
```
#language: pt
```

Example 2:
```
#language: es-ar
```


## Import

*Imports the definitions of another file.*

Notes:
- Local declaration.
- Allowed more than one declaration per file.

Example 1:
```
import "file1.feature"
```


## Tag

*Adds information to a language construction.*

Notes:
- Local declaration.
- Allowed more than one declaration per language construction.

Example 1 (*one per line*):
```
@critical
```

Example 2 (*more than one per line*):
```
@critical @slow @gui @generated
```

Reserved tags:
- `@scenario( <name> )`: references a [scenario](#scenario).
- `@template( <name> )`: references a [template](#template).
- `@invalid( <ui_element>, <constraint> )`: indicates that a test case has an invalid value for a certain user interface element. The `constraint` is the exploited rule, such as "minimum length", "maximum value", etc.
- `@importance( <number> )`: indicates the importance. The importance is as higher as its number.
- `@critical`: indicates a very high importance.
- `@generated`: indicates that a declaration was computer-generated.
- `@global`: defines an element as global. Can be applied to [User Interface Element](#UserInterfaceElement).
- `@ignore`: indicates that a declaration should be ignored to generate tests.


Reserved for future use:
- `@issue( <number> )` references an Issue.
- `@category( <name> )` specifies a category. It can be used for filtering.


## Feature

*Feature of the system.*

Notes:
- Global declaration.
- Just one declaration per file.

Example 1:
```
Feature: A feature name
  As an administrator
  I would like to login
  So that I can access the system
```

Example 2:
```
Feature: A feature name
  In order to access the system
  As an administrator
  I would like to login
```


## State

*State of the system.*

Notes:
- Global declaration.
- Allowed more than one declaration per file.

Example 1:
```
State: logged in

...

// Its use as a precondition (requires iff have the state)
Given that I [ { don't | do not } ] have the state "logged in"

...

// Its use as a postcondition (generates iff have the state)
Then I [ { don't | do not } ] have the state "logged in"
```

### UPDATE:

Is state declaration really necessary?

Example of a postcondition:

  Then ~I am logged in~

Example of a precondition:

  Given that ~I am logged in~

Notes:
- Anything between ~ and ~ can denote a State.
- States could be LEARNED to be recognized through NLP,
  e.g., ~I'm logged in~ and ~I am logged in~ could denote the same state.

Problem:
- How to denote a that a state should not be present?

Solution 1: Detect negation and negate it
- e.g., ~I'm logged in~      -=>  ~I'm not logged in~
- e.g., ~I'm not logged in~  -=>  ~I'm logged in~
- detect contraction forms ( didn't, didnt, did not, hasn't, hasnt, has not, ...)


## Scenario

*Scenario of the system. Not used to generate test cases.*

Notes:
- Local declaration.
- Allowed more than one declaration per Feature.

Example 1:
```
Scenario: successful login
  Given that I start the system
    And I am not logged in
  When I inform my credentials
  Then I am able to enter the system
```

Example 2:
```
Scenario: unsuccessful login
  Given that I start the system
    And I am not logged in
  When I inform invalid credentials
  Then I am not able to enter the system
```


## Constants

*Declaration of a constant value.*

Notes:
- Global declaration.
- Just one declaration per file. One declaration can have more than one constant.

Example 1:
```
Constants:
  - "msg_min_length" is "{name} must have at least {min_length} characters."
  - "msg_password_too_weak" is "The informed password is too weak."
```
### Referencing a Constant

A constant can be referenced inside queries or variants by using brackets.

Example:
  `When I fill {Username} with [default password]`

In this example, `[default password]` is a reference to a constant `default password`.


## UserInterfaceElement

*Element of the User Interface.*

Notes:
- Local or global declaration.
- Allowed more than one declaration per Feature.
- Global declarations allowed through the tag `@global`.
- Allow inheritance through the property `extends` (e.g. `- extends <Other Element>`).

Notes about a UI Element:
- default `type` is `textbox`
- default `data type` is `string`
- default `id` is the lowercased element name, without spaces (e.g. "Some Name" becomes "somename")

Notes about data types:
- Allowed are: `string`, `integer`, `double`, `date`, `time`, `datetime`. <<< include age? Ideas [here](http://respect.github.io/Validation/docs/validators.html)
- `double` default precision is 2
- `double`'s precision can be changed, using `with precision` (e.g. `data type is double wih precision 3`)

Notes about the `id` property:
- `"value"` denotes an `id`
- `"#value"` denotes an `id`
- `"//value"` denotes a `xpath`
- `"@value"` denotes a `name`
- `"~value"` denotes a `mobile name`
- `".value"` denotes a `css`
- Single identifier is denoted by `id is "<value>"`
- Example of a single identifier: `id is "birthDate"`
- Multiple identifiers are denoted by `id in [ "<value1>", "<value2>", ... ]`
- Example of a multiple identifier:   `id in [ "birthDate", "~birthDate" ]`

Notes about queries (inside a constraint of a UI Element):

1. Should be put inside quotes (").

2. May use grave accents to refer names with spaces (normally, as in ANSI-SQL). E.g. \`my table\`

3. May use apostrophes to denote values.
   Example:
   ```sql
   SELECT * FROM user WHERE username = 'bob'
   ```

4. May reference a [Table](#table), a [Database](#database), or a [Constant](#constant)
   using the format `[some name]`, where the content does not contain a dollar sign, `$`.
   A dollar sign may be use to reference valid Excel table names, instead of referencing 
   names declared in Concordia.

   Example 1: references a declared table and a declared constant.
   ```sql
   SELECT nome FROM [My Table] WHERE name = [Some Const Name]
   ```

   Example 2: references a declared database and a declared constant.
   ```sql
   SELECT nome FROM [My DB].`table` WHERE name = [Some Const Name]
   ```
   
   Example 2: NOT A REFERENCE name (e.g. excel table)
   ```sql
   SELECT nome FROM [Some Excel Table$] WHERE name = [Some Const Name]
   ```

5. May reference UI Elements using the format `{feature name:ui element name}`, in which 
   `feature name:` is optional. The lack of the feature name should make the tool assuming 
   that the UI element belongs to the feature.
   Example:
   ```sql
   SELECT password FROM user WHERE username = {Login:Username}
   ```

6. May reference UI element using the format `{ui element name}`, considering that
   the reference UI element belongs to the current feature (the feature of the current file).
   Example:
   ```sql
   SELECT password FROM user WHERE username = {Username}
   ```


**Example 1**:
```
UI Element: Login Page
  - type is url
  - value is "/login"
	
UI Element: Username
  - type is textbox
  - id is "username"
  - data type is string
  - minimal length is 2,
    otherwise I must see the message ${msg_min_len}
  - maximum length is 30
  - value is queried by "SELECT username FROM {{my db}}.users",
    otherwise I must see {{invalid_username_password}}
	
UI Element: Password
  - type is textbox
  - id is "password"  
  - minimal length is 6,
    otherwise I must see the message "Password is too short."
	    and I must see the color be changed to "red"
	    and I must see the color of Username be changed to "red"
  - value is queried by "SELECT password FROM `real db name`.users WHERE username = ${Username} AND profile = 'administrator' ",
    otherwise I must see {{invalid_username_password}}
	
UI Element: Enter
  - type is button
  - id is "enter"
```

**Examples 2**:
```
UI Element: Profession
  - type is select
  - value is queried by "SELECT name FROM profession"

UI Element: Salary
  - data type is double with precision 2
  - minimum value is queried by "SELECT min_salary FROM profession WHERE name = ${Profession}"

UI Element: Envy Salary
  - data type is double with precision 2
  - value is computed by '${Salary} * 2'
```

Examples 3:
```
UI Element: CEP
  - format is "/^[0-9]{2}\.[0-9]{3}\-\.[0-9]{3}$/"

UI Element: CPF
  - format from regex <CPF Regex>

UI Element: CPF 2
  - format is the same as in <CPF>
```


## RegularExpressions

*Declares regular expressions that can be used by constraints of UI elements.*

Notes:
- Global declaration.
- Just one declaration per file. One declaration can have more than one regular expression.

Example 1:
```
Regular Expressions:
  - "Name Regex" is "/[A-Za-z][A-Za-z '-.]{1,59}/"
  - "CPF Regex" is "/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$/"
  - "CNPJ Regex" is ...
```

QUESTION: Aren't constants solving this problem?
E.g.:
  UI Element: Foo
    - format is [CPF Regex]

-> Validation whether the Constant is a valid RegEx could be made during the UI Element's format validation.

## Table

*Declares a data table that can be used by constraints of UI elements.*

Notes:
- Global declaration.
- Allowed more than one declaration per file.
- It is NOT allowed to declare database tables or named queries. Just use "queried by" in constraints of user interface elements.
- Tables are loaded into in-memory tables, queried with ANSI-SQL.

Example 1:
```
Table: users
  | username | password |
  | Bob      | bobp4ss  |
  | Joey     | joeypwd  |
```

Examples of queries:
```sql
SELECT username FROM users WHERE password = "bobp4ss"

SELECT `some field` FROM `some table` WHERE id = 1
```


## Database

*Declares a reference to a database, with its connection parameters.*

Notes:
- Global declaration.
- Allowed more than one declaration per file.
- Databases can be referenced inside contraints' queries. Example:
```sql
SELECT price FROM `my database`.product WHERE name = 'beer'
```

**Example 1**: MySQL database
```
Database: my database
  - type is "mysql"
  - host is "http://127.0.0.1/acme"
  - username is "admin"
  - password is "p4sss"
```

**Files** can also be represented as databases.

**Example 2**: JSON file as a database:
```
Database my json db
  - type is "json"
  - path is "C:\path\to\db.json"
```

**Example 3**: XSL file as a database:
```
Database my excel db
  - type is "excel"
  - path is "C:\path\to\db.xls"
```


## Template

*Declares a template for scenario's variants*

Notes:
- Local declaration.
- Belongs to a Scenario.
- Should be declared after a Scenario.

Example 1: Template of a scenario's variant.
```
Template: Usual login
  Given that I am on the Login Page
  When I fill Username
    And I fill Password
    And I click on Enter
  Then I have the state "logged in"
    And I see the text ${welcomeText}
    And I see a button "Logout"
```



## Variant

*Declares a scenario's variant*

Notes:
- Local declaration.
- Belongs to a Scenario.
- Can be declared in a different file (e.g. ".var")

Can be generated automatically using:
1. [template](#template);
2. [user interface](#userinterface);
3. [constraints](#constraint);
4. [states](#state).

A generated variant will:
- Receive all the annotations from the source variant;
- Receive the tag `@generated`;
- Have tags `@invalid` added, if the goal is exploit some constraint;
- Have its name defined according to the testing goal;
- Replace the variant's postconditions, i.e., `Then` clauses, with postconditions of the exploited constraint;
- Replace all the involved constants by their corresponding values;
- Replace all the involved references to user interface elements by their identifiers;
- Keep informed user interface elements' literals;
- Keep informed states; <<< Really?
- Keep informed values;

Additional notes:
- When a reference to a user interface element is informed **without a value**, values will be produced for the generated test cases, **according to the test goal**;


Example 1: Variant produced from the previous template. Valid input.
```
@generated
@scenario( Successful Login ) # needed only if declared in a external file
@template( Usual login )
Variant 1: Valid input 1
  Given that I am on the page "/login"
  When I fill "#username" with "Bob"
    And I fill "#password" with "bobp4ss"
    And I click on "Enter"
  Then I have the state "logged in"    
    And I see the text "Welcome"
    And I see a button "Logout"
```

Example 2: Another variant produced from previous template. Invalid input.
```
@generated
@scenario( Successful Login ) # needed only if declared in a external file
@template( Usual login )
@invalid( Username, minimum length )
Variant 2: Invalid input - Username length is too short
  Given that I am on the page "/login"
  When I fill "#username" with ""
    And I fill "#password" with "bobp4ss"
    And I click on "Enter"
  Then I see "Username must have at least 2 characters."
```


Actions:

- I [ dont ] see "text"
- I [ dont ] see element with { text | id | name | xpath | css } "value"
    - default is `name`
- I [ dont ] see in current url "/path"
- I see in field with { text | id | name | xpath | css } "value"
- I [ dont ] see that "name" is checked 
- I wait [ 1 second ] [ for { element | enabled | invisible | visible | staleness } "name" ]
- I wait [ 1 second ] for text "text"
- I fill field "name" with "value"
- I append field "name" with "value"
- I select option "name" with "value"
- I check option "name"
- I clear field "name"
- I press key "key" [, "key2", "key3", ...]
- I move cursor to "name" [ position "x,y" ]

Browser-only actions:
- I am on page "url"
- I clear cookie [ "name" ]
- I set cookie "name" with "value"
- I [ dont ] see cookie "name"
- I see in title "value"
- I resize window to "800x600" `<< width x height `
- I attach file "path" to "name"

Mobile-only actions:
- I tap "text"
- I { show | hide } device keyboard
- I swipe { up | down | left | right } "name"
- I switch to web
- I switch to native

Element filters, when used without the `with` keyword :
  - `#element` = id
  - `element` = name
  - `.element` = css
  - `//element` = xpath
  - `~element` = mobile name `<< MOBILE ONLY`



## TestEvents

*Declares events before, after, or around test cases or features. Console commands or SQL scripts can be executed when these events occur.*

Notes:
- Local declaration (belongs to a Feature).
- Just one declaration per Feature.

Could be:
- { Before | After | Around } Each Scenario
- { Before | After | Around } Feature
- { Before | After | Around } All

Example 1:
```
Before Each Scenario:
  I run in console 'cls'
  And I run the command 'DELETE FROM users'
  And I run the command 'INSERT INTO users ( username, password ) VALUES ( "Clark", "Kent" ), ( "Bruce", "Wayne" )'
``` 
