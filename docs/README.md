# Concordia Documentation

- [Overview of the language](language/en.md)
- [Available Actions](actions.md)
- [Example](example.md)
- [Roadmap](roadmap.md)
- [Known limitations](limitations.md)
- [FAQ](faq.md)

## Technical notes

- [User Interface Elements' Properties](dev/properties.md)
- [Queries](dev/queries.md)
- [States](dev/states.md)
- [Test Cases](dev/test-cases.md)
- [Test Scenarios](dev/test-scenarios.md)

## Development

- [Development guidelines](development.md)


## Notes on Data Generation

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