# Concordia Documentation

*Expected behavior and known limitations*

- [Data generation](#datageneration)
- [Test case generation](#TestCaseGeneration)
- [Known limitations](./limitations.md)


## Data generation

### Queries

1. Always return rows from the *first* column.

- E.g., `"SELECT name, email FROM user"` will always return data from the `"name"` column.

### Regular Expressions

1. They will *not* check UI Elements' data type.

- E.g., the following regular expression will generate data such as `US$ 159.03`, although the declared data type (`double`) would not accept `US$` as a valid value.
```concordia
UI Element: salary
  - data type is double
  - min value is 1000.00
  - format is "US\$[0-9]{1,7}\.[0-9]{2}"
```

### Computation

(future)

1. Declaration specify programming language. Default is `javascript`. E.g.:
```
```javascript
```

2. May access specification elements through global variables:
- `$uielement`
- `$constant`
- `$database`

```javascript
$uielement[ 'username' ].value = $uielement[ 'name' ].value.split( ' ' )[ 0 ];
```


## Test Case Generation

...