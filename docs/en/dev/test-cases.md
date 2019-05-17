# Test Cases

## Data Test Case compatibility:

- `incompatible` whether a compatible UI Element Property is not defined;
- `invalid` whether a compatible UI Element Property is defined and there is space for the requested invalid value;
- `valid` whether a compatible UI Element Property is defined and there is space for the requested valid value;

## Compatible data test cases, according to property entities:

1) value, constant: value, length
2) list, query: set
3) ui element reference: ?

### Applicable data test groups:

- value is [not] equal to (value, constant) -> set with one element
- value is [not] in (list, query) -> set
- value is equal to (uielement) -> same as (uielement)

- [min, max] length is (value, constant) -> length
- [min, max] length in (query) -> length
- [min, max] length is equal to (uielement) -> length

- [min, max] value is (value, constant) -> value
- [min, max] value in (query) -> value
- [min, max] value is equal to (uielement) -> value

- format is (value, constant) -> format
- format is queried from (query) -> format
- format is the same as (uielement) -> format

- required [is (false,true)] -> required

**Note**: Required is also applicable to all the other properties.

## Repeated test cases:

- Since Test Cases are both read and generated, **repeated test cases are prune**.
- Comparison to prune Test Cases must consider properties that identify them uniquely and ignore properties that vary according to the random seed (*e.g.,* values attributed to UI Elements).




## Generated Data Test Cases

- Since we are simulating min value and max value when they come from a QUERY or a UI_ELEMENT, in order to not generate their values, the data test VALUE_ZERO will be considered:
  - INVALID when min is defined and greater than 0 OR when max is defined and less than 0
  - INCOMPATIBLE in any other case when min or max needs to be faked
