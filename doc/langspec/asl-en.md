# ASL in English

## Feature

Example 1:
```gherkin
Feature: A feature name
  As an administrator
  I would like to login
  So that I can access the system
```

Example 2:
```gherkin
Feature: A feature name
  In order to access the system
  As an administrator
  I would like to login
```

## Scenario

Example 1:
```gherkin
Scenario: An example scenario 1
  Given that I start the system
    And I am not logged in
  When I inform my credentials
  Then I am able to enter the system
```