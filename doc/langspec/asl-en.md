# ASL in English

- [Feature](#feature)
- [Scenario](#scenario)
- [Interaction](#interaction)
- [User Interface](#userinterface)
- [Data Sources](#datasources)
- [Rules](#rules)
- [Test Case](#testcase)

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

## Scenario

Example 1:
```
Scenario: successful login
  Given that I start the system
    And I am not logged in
  When I inform my credentials
  Then I am able to enter the system
```

## UserInterface

Example 1:
```
User interface:
  - "Login Page" is a url "/login"
  - "Username" is a textbox with id "username"
  - "Password" is a textbox with id "password"
  - "Enter" is a button with id "enter"
```

## Interaction

Example 1:
```
Interaction: successful login
  Given that I am on the Login Page
  When I inform the Username and the Password
    And I click on Enter
  Then I see "Welcome"
    And I am not on the Login Page
```

## DataSources

Example 1:
```
Data table: my table
  | Username | Password |
  | Bob      | bobp4ss  |
  | Joey     | joeypwd  |
```

Example 2:
```
Database: my database
  - type "mysql"
  - host "http://127.0.0.1/acme"
  - username "admin"
  - password "p4sss"

Database table: users
  - database "my database"
  - command "SELECT * FROM user"
```

Example 3:
```
File: my file
  - type "json"
  - path "./path/to/file.json"
```

# Rules

Examples:
```
Rules:
  - "Username" value in "my data source" column "Username"
  - "Password" value in "my data source" column "Password" line as "Username"
```

## TestCase

Test cases are generated from:
1. [User Interface](#userinterface) : is such a dictionary for transforming [Interactions](#interactions)' element names into ids, xpaths, etc.
2. [Interactions](#interactions) : provide the actions to perform.
3. [Rules](#rules) : provide some of the rules that will be explored by the test cases.
4. *Approach's algorithm.*


Example 1:
```
Test case for "successful login": success
  I see in the url "/login"
  I fill "#username" with "Bob"
  I fill "#password" with "bobp4ss"
  I click "Enter"
  I see "Welcome"
  I don't see in current url "/login"
```

Example 2:
 ```
Test case: successful login
     ...
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
