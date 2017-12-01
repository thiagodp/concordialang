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
- [File](#file)
- [Template](#template)
- [Variant](#variant)
- [Test Events](#testevents)


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

Notes about queries (inside a constraint of a UI Element):
1. Should be put inside apostrophes (').
2. May use grave accents to refer names with spaces (normally, as in ANSI-SQL).
3. All field names specified like variables are replaced by their values.
4. Can reference a [Table](#table), a [File](#file) or any construction of a [Database](#database).


Examples 1:
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
  - value is queried by 'SELECT username FROM users',  
    otherwise I must see ${invalid_username_password}
	
UI Element: Password
  - type is textbox
  - id is "password"  
  - minimal length is 6,
    otherwise I must see the message "Password is too short."
	    and I must see the color be changed to "red"
	    and I must see the color of Username be changed to "red"
  - value is queried by 'SELECT password FROM users WHERE username = ${Username}',
    otherwise I must see ${invalid_username_password}
	
UI Element: Enter
  - type is button
  - id is "enter"
```

Examples 2:
```
UI Element: Profession
  - type is select
  - value is queried by 'SELECT name FROM profession'

UI Element: Salary
  - data type is double with precision 2
  - minimum value is queried by 'SELECT min_salary FROM profession WHERE name = ${Profession}'

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
SELECT price FROM `my database`.product WHERE name = "beer"
```

Example 1:
```
Database: my database
  - type is "mysql"
  - host is "http://127.0.0.1/acme"
  - username is "admin"
  - password is "p4sss"
```


## File

*Declares a reference to a file.*

Notes:
- Global declaration.
- Allowed more than one declaration per file.
- A file is loaded into memory to be queried as a relational database table (with ANSI-SQL).

Example 1:
```
File: my json file
  - type is "json"
  - path is "./path/to/file.json"
```

Example 2:
```
File: my csv file
  - type is "csv"
  - path is "./path/to/file.csv"
```

Example of a query:
```sql
SELECT `some column` FROM `my json file` WHERE `other column` > 50
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
