Create a file `login.feature`:

```gherkin
Feature: Login
  As a user
  I would like to authenticate myself
  In order to access the application

Scenario: Successful login
  Given that I can see the login screen
  When I enter valid credentials
  Then I can access the main application screen

  # A Variant is a low-level description or variation of a Scenario
  Variant: Successful login with valid credentials
    Given that I am in the [Login Screen]
    When I fill {Username}
      And I fill {Password}
      And I click on {OK}
    Then I see "Welcome"
      And I have ~user is logged in~

Constants:
  - "Login Screen" is "http://localhost/login"

Table: Users
  | username | password  |
  | bob      | 123456    |
  | alice    | 4l1c3pass |

UI Element: Username
  - value comes from "SELECT username FROM [Users]"
    Otherwise I must see "Invalid username"
  - required is true

UI Element: Password
  - value comes from "SELECT password FROM [Users] WHERE username = {Username}"
    Otherwise I must see "Invalid password"
  - required is true

UI Element: OK
  - type is button
```

### 2. Generate and execute tests

Go to the directory where you saved `login.feature` and run:

```console
$ concordia --seed="hello world" --plugin=codeceptjs
```

This will generate two files: `login.testcase` and `test/login.js`.

The first file has **test cases**:

```concordia
```

The second file was generated because we used the plugin `codeceptjs`, that
generates JavaScript test scripts for the framework CodeceptJS.

This will generate tests for CodeceptJS, including this one:

```javascript
```
