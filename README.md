# Concordia

*Write your features using Concordia and generate functional test cases from them, automatically.*

An [Agile Software](https://en.wikipedia.org/wiki/Agile_software_development) Requirements Specification (Meta)language inspired by [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Concordia is available in [more than one spoken language]().

## In short:

1. Simple, easy-to-read, fast-to-write documentation.
2. Use your favorite text editor (UTF-8) and version control system.
3. Generate UI tests from the specification, automatically.

## How it works:

1. **Write or update your requirements** specification with the Concordia Language (and validate it with users and stakeholders);
2. **Use the tool** to generate test cases from the specified functional requirements and to run them;
3. **If the tests failed**: adjust your software to meet the specified requirements (most frequent), or back to the step 1 (adjust your requirements).
4. **If the tests didn't fail**: *Great job!* Now you can write new requirements or add more test cases.

## A short example:

### 1. Write the feature
```concordia
Feature: Login
  Given that I ...

Scenario: Successful Login
  ...

User Interface: Login
  - "Login Screen" is the url "http://page.com/"
  - "Username" is a textbox with id "user",
    value comes from "Users" at column "username"
  - "Password" is a textbox with id "pass",
    value comes from "Users" at column "password" and line as "username"
  - "Enter" is a button with id "enter"

Data table: Users
  | username | password  |
  | alice    | d3ar4lice |
  | bob      | b0bp4$s   |

@scenario( Successful Login )
@template
Interaction: Sucessful Login Interaction
  Given that I can see the Login Screen
  When I fill the Username
    And the Password
    And I click on Enter
  Then I can see the text "Welcome"
```

### 2. Use the tool

```console
$ clc --plugin=codeceptjs
```

This will generate 5 tests for CodeceptJS, including this one:

```javascript
Feature( 'Login', () => {
    Scenario(
        'Successful Login | Sucessful Login Interaction | Valid values',
        ( I ) => {
        I.seeUrl( 'http://page.com/' );
        I.fill( '#username', 'alice' );
        I.fill( '#password', 'd3ar4lice' );
        I.click( '#enter' );
        I.waitAndSee( 'Welcome' );
    } );
} );
```

And it will also run the tests:

```console
[SUCCESS]
...
[SUCCESS]
```


## Generated test cases:

Concordia can generate test cases from [funcional requirements](https://en.wikipedia.org/wiki/Functional_requirement). Although it is not able to generate test cases for [non-functional requirements](https://en.wikipedia.org/wiki/Non-functional_requirement) automatically, you can create them manually with traditional BDD tools.

## Tutorial

- [Writing your first feature](doc/tutorial/first-feature.md)
- [Improving your specification](doc/tutorial/improving-spec.md)
- [Generating UI tests](doc/tutorial/gen-ui-tests.md)

## Language Specification

- [English](doc/langspec/asl-en.md)
- [Português](doc/langspec/asl-pt.md)

## License

`Copyright (c) 2017 by Thiago Delgado Pinto`

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png)   

This software is [licensed](LICENSE.txt) under the GNU Affero General Public License.