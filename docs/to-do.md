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
- [X] Variant
- [X] Variant Sentences
- [X] Test Case
- [X] Test Case Sentences
- [X] UI Element
- [X] UI Element Items
- [X] Table
- [X] Table Rows
- [X] Database
- [X] Database Properties
- [ ] File
- [X] Test-Related Events
- [ ] Test-Related Events Items

## Parser

- [X] Language
- [X] Import
- [X] Tag
- [X] Feature
- [X] Feature Sentences
- [X] Scenario
- [X] Scenario Sentences
- [X] Variant
- [X] Variant Sentences
- [X] Test Case
- [X] Test Case Sentences
- [X] State
- [X] Regular Expressions Block
- [X] Regular Expressions
- [X] Constants Block
- [X] Constants
- [X] UI Element
- [X] UI Element Items
- [X] Table
- [X] Table Rows
- [X] Database
- [X] Database Properties
- [ ] File
- [ ] Test-Related Events
- [ ] Test-Related Events Items

## NLP Processor

- [/] Variant Sentences
- [/] Test Case Sentences
- [/] UI Element Sentences

## Semantic Analyzer

- [ ] Language ?
- [X] Import
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

## Interaction + oracle generation

- [X] Syntax (requirements specification)
- [/] Algorithm
- [ ] Implementation & tests

## Test case generation

- [X] Syntax (requirements specification)
- [X] Syntax for the abstract format (JSON)
- [/] Algorithm
- [ ] Implementation & tests

## Test script generation, execution and reporting

- [X] Architecture
- [X] Input format (test cases)
- [/] Output format (test results)
- [/] Plug-in for web-based applications with [CodeceptJS](http://codecept.io)