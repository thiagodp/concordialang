# Known limitations

## Language declarations still not supported

### UI Elements

- Cannot handle **global** UI Elements, *i.e.*, those tagged with `@global`
  - Thus cannot refers to them in properties or queries or generate test cases from them

- Cannot **extend** other UI Element, *i.e.*, use `@extends( Foo )`

- Cannot use properties inside messages - Issue #18
  - *E.g.*, `Otherwise I should see "${name} must have at least ${minlength} characters."` would receive the corresponding properties of the UI Element

- Queries must be declared in a single line
  - *E.g.*, `- value comes from "SELECT name FROM [MyDB].profession"`

- Operator `computedBy` is not supported yet

- Cannot declare more than one property of each type (REALLY NEEDED/VALID ???), *e.g.*:
  - `- value is equal to {SomeElement}`
  - `- value is not equal to {OtherElement}`

- Negation is only allowed for the property `value`

### Queries

- More than one `Database` entity in the same query is not supported.
- More than one `Table` entity in the same query is not supported.

### Variant sentences

- Support to match tables
  - *E.g.*, `Then I see {My Table} equal to [Some Table]` would allow to assert whether the UI Element `My Table` has the same lines and columns as a declared table `Some Table`.

### Test events

- Test events are not supported yet

## Data Test Cases generated from Data Analysis

- Since we are simulating min value and max value when they come from a QUERY or a UI_ELEMENT, in order to not generate their values, the data test VALUE_ZERO will be considered:
  - INVALID when min is defined and greater than 0 OR when max is defined and less than 0
  - INCOMPATIBLE in any other case when min or max needs to be faked