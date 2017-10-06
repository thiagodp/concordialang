# To-Do

## Lexer

- [X] Language
- [X] Import
- [X] Tag
- [X] Feature
- [X] Feature Sentences (as text)
- [X] Scenario
- [X] Step Sentences
  - [X] Given
  - [X] When
  - [X] Then
  - [X] And, But
- [X] State  
- [X] Regular Expressions Block
- [X] Regular Expressions
- [X] Constants Block
- [X] Contants
- [X] Test Case
- [/] Test Case Sentences
- [X] UI Element
- [X] UI Element Items
- [X] Table
- [ ] Table Rows
- [ ] Database
- [ ] Database Properties
- [ ] File
- [ ] Test-Related Events

## Parser

- [X] Language
- [X] Import
- [X] Tag
- [X] Feature
- [X] Feature Sentences
- [X] Scenario
- [X] Scenario Sentences
- [X] Test Case
- [X] Test Case Sentences
- [X] State
- [X] Regular Expressions Block
- [X] Regular Expressions
- [X] Constants Block
- [X] Constants
- [X] UI Element
- [X] UI Element Items
- [ ] Table
- [ ] Table Rows
- [ ] Database
- [ ] Database Properties
- [ ] File
- [ ] Test-Related Events

## NLP Processor

- [/] Test Case
- [/] UI Element

## Semantic Analyzer

- [ ] Language ?
- [X] Import
- [ ] Tag
- [ ] Feature
- [ ] Feature Sentences
  - [ ] As a
  - [ ] I would like to
  - [ ] In order to
- [ ] Scenario
- [ ] Scenario Sentences
  - [ ] Given
  - [ ] When
  - [ ] Then
  - [ ] And, But
- [ ] Test Case  
- [ ] Test Case Sentences
  - [ ] Given
  - [ ] When
  - [ ] Then
  - [ ] And, But
- [ ] State
- ...

## Logic Analyzer

- [ ] ...

## Data Generation

- [X] Type Double
- [X] Type Integer
- [ ] Type String
- [ ] Type Date
- [ ] Type Time
- [ ] Type DateTime
- [ ] Valid values (all types)
- [ ] Invalid values (all types)

To consider:
- Use [alasql][https://github.com/agershun/alasql] for in-memory databases and file queries.
- Use [Node-DBI](https://github.com/DrBenton/Node-DBI/) for relational database queries.
- Recognize the database/file used in the script and handle it with the corresponding library.

## Interaction + Oracle Generation

- [X] Syntax (requirements specification)
- [/] Algorithm
- [ ] Implementation & tests

## Test Case Generation

- [X] Syntax (requirements specification)
- [X] Syntax for the abstract format (JSON)
- [/] Algorithm
- [ ] Implementation & tests

## Test Script Generation, Execution and Reporting

- [X] Architecture
- [X] Input format (test cases)
- [/] Output format (test results)
- [/] Plug-in for web-based applications with [CodeceptJS](http://codecept.io)