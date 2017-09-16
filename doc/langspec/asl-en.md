# ASL in English

```
+-----+               +-----+               +-----+
|     | <-- import -- |     | <-- import -- |     |
|     |               |     |               |     |
+-----+               +-----+               +-----+
.feature              .expect               .testcase
```

## Index:

- [Language](#language)
- [Import](#import)
- [Tag](#tag)
- [Feature](#feature)
- [State](#state)
- [Scenario](#scenario)
- [User Interface](#userinterface)
- [Constant](#constant)
- [Regular Expression](#regularexpression)
- [Data Source](#datasource)
- [Interaction Template](#interactiontemplate)
- [Constraint](#constraint)
- [Interaction](#interaction)
- [Test Case](#testcase)
- [Command](#command)
- [Task](#task)


## Language

Example 1:
```
#language: pt
```

Example 2:
```
#language: es-ar
```


## Import

Example 1:
```
import "file1.feature"
```


## Tag

Example 1 (*one per line*):
```
@important
```

Example 2 (*more than one per line*):
```
@important @slow @gui @generated
```

Reserved tags:
- `@scenario( <name> )`: references a [scenario](#scenario)
- `@template( <name> )`: references an [interaction template](#interactiontemplate)
- `@interaction( <name> )`: references an [interaction](#interaction)
- `@Constraint( <widget>, <property>, <Constraint-type> )`: references a [Constraint](#Constraint). Example: `@Constraint( Usuario, length, lt )`, where `lt` means "less than".
- `@importance( <number> )`: indicates the importance. The importance is as higher as its number.
- `@generated`: indicates that a declaration was computer-generated.


## Feature

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

*Not used to generate tests. No states are checked.*

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


## UserInterface

*Identification of user interface elements.*

Example 1:
```
User interface:
  - "Login Page" is a url "/login"
  - "Username" is a textbox with id "username"
  - "Password" is a textbox with id "password"
  - "Enter" is a button with id "enter"
```


## Constant

Example 1:
```
Constants:
  - "msg_min_length" is "{name} must have at least {min_length} characters."
  - "msg_password_too_weak" is "The informed password is too weak."
```

## RegularExpression
```
Regexes:
  - "name" is "/[A-Za-z][A-Za-z '-.]{1,59}/"

```

## DataSource

Example 1:
```
Data table: my table
  | Username | Password |
  | Bob      | bobp4ss  |
  | Joey     | joeypwd  |
```

Example 1:
```
Data table: my table
  | Profession | Salary | Error Message |
  | Zelador    | 7000  |  |  
  | Zelador    | 8000  | Por favor... |

  | Field    | Property | Rule | Otherwise |
  | username | length   | < 1  | I must see "bla" and "whatever" |


```

Example 2:
```
Database: my database
  - "type" is "mysql"
  - "host" is "http://127.0.0.1/acme"
  - "username" is "admin"
  - "password" is "p4sss"

Database table: users
  - "database" is "my database"
  - "command" is "SELECT * FROM user"
```

Example 3:
```
File: my file
  - "type" is "json"
  - "path" is "./path/to/file.json"
```


## InteractionTemplate

*Expected basic interaction with the [user interface](#userinterface).*

*Used along with [Constraints](#Constraint) to generate [interactions](#interaction). [States](#state) are NOT checked.*

Example 1:
```
@scenario( successful login )
Interaction template: successful login
  Given that I am on the Login Page
  When I fill Username
    And I fill Password
    And I click on Enter
  Then I have the state "logged in"
    And I see the text "Welcome"
    And I am not on the Login Page
```

## Constraint

*Constraints about user interface elements.*

*Used along with [interaction templates](#interactiontemplate) to generate [interactions](#interaction)*.

Example 1 (*data table*):
```
Constraints:
  - "Username" value is in "my table" at column "Username"
  - "Password" value is in "my table" at column "Password" and line as "Username"
```

Example 2 (*database table*):
```
Constraints:
  - "Username" value is in "users" of "my database" at column "Username"
  - "Password" value is in "users" of "my database" at column "Password" and line as "Username"
```

Example 3 (*file*):
```
Constraints:
  - "Username":
    - value is in "my file" at column "username"
    - 
  - "Password" value is in "my file" at column "password" and line as "username"
```

Example 4 (*value constraints*):
```

Contraint for "Username":
  - "length" is greater than 1
  Otherwise I must see the text ${msg_min_length}
  - "value" is in "user_table" at column "username"
  Otherwise I must see the text ${msg_invalid_username}
  - "min_length" is in "query_profession" at column "min" with parameter from "profession"


Constraints:
  - "Username" has length greater than 1
    Otherwise I must see the text ${msg_min_length}

  - "Username" has length must be less than 31
    Otherwise I must see the text ${msg_max_length}

  - "Password" has length greater than 5
    Otherwise I must see the text ${msg_password_too_weak}
      And I must see "Password" with color "red"
```

```
???

Contraint for "username":
  - Length: greater than 1
  - Otherwise:
      I must see the text "some message"
      And I must see "username"  with color "red"


      [_____________] [   ]

Contraint for "username":
  length is greater than 0
  Otherwise I must see color "red"

Contraint: username
  - { [value] | length | color } comes from "{ column }" of "{ table | file }"

  - comes from "name" of "users"


Constraints of "username":
  - value: [comes] from "name" of "users"
  - otherwise: I must see "some message"
  - value: matches "regexname"
  - otherwise: I must see "other message"
  - length: greater than or equal to 3 and less than or equal to 30
  - otherwise: I must see "Please inform between 3 and 30 characters."
      And "username" should have color "red"

???

```

## Interaction

*Expected interaction with the user interface.*

*Commonly generated from [interaction templates](#interactiontemplate) and [Constraints](#Constraints).*

*Used to generate [test cases](#testcase). [States](#state) are checked.*

Example 1:
```
@generated @template( successful login )
Interaction: successful login
  Given that I am on the Login Page
  When I fill Username with a valid value
    And I fill Password with a valid value
    And I click on Enter
  Then I have the state "logged in"
    And I see the text "Welcome"
    And I am not on the Login Page
```

Example 2:
```
@generated @template( successful login )
@constraint( Username, length, lt )
Interaction: Username with a value lower than the minimum
  Given that I am on the Login Page
  When I fill Username with a value lower than the minimum
    And I fill Password with a valid value
    And I click on Enter
  Then I must see the text ${msg_min_length}
```


## TestCase

Test cases are generated from:
1. [User Interface](#userinterface) : is such a dictionary for transforming [Interactions](#interactions)' element names into ids, xpaths, etc.
2. [Interactions](#interaction) : provide the actions to perform.
3. [Constraint](#Constraint) : provide some of the rules that will be explored by the test cases.
4. *Approach's algorithm.*


Example 1:
```
@generated
@feature( login )
@scenario( sucessful login )
@interaction( successful login )
Test case: successful login
  I see in the url "/login"
  I fill "#username" with "Bob"
  I fill "#password" with "bobp4ss"
  I click "Enter"
  I see "Welcome"
  I don't see in current url "/login"
```

Example 2:
 ```
 @generated
 @feature( login )
 @scenario( sucessful login )
 @interaction( Username with a value lower than the minimum )
Test case: Username with a value lower than the minimum
  I see in the url "/login"
  I fill "#username" with "" @rule( length, lower than 1 )
  I fill "#password" with "bobp4ss"
  I click "Enter"
  I see "Username must have at least 2 characters."
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


## Command

*Commands to execute over data sources or the operating system.*

Example 1:
```
Command: my dir
  - console: dir /w
```

Example 2:
```
Command: my query
  - sql: SELECT * FROM user LIMIT 10 ORDER BY username
```

Example 3:
```
Command: clean users
  - sql: DELETE FROM users
```


## Task

*Allows to execute commands during tests.*

Example 1:
```
Task: my task before
  - moment: before system
  - console: cls    
  - command: clean users
  - sql: INSERT INTO user ( username, password ) VALUES ( 'Bob', 'Dylan' )
```

Moments:
  - { before | after } system
  - { before | after } feature
  - { before | after | around } interaction
