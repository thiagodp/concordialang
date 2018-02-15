# Concordia Documentation



### Data generation

#### Queries

1. Always return rows from the *first* column.

- E.g., `"SELECT name, email FROM user"` will always return data from the `"name"` column.

#### Regular Expressions

1. They will *not* check UI Elements' data type.

- E.g., the following regular expression will generate data such as `US$ 159.03`, although the declared data type (`double`) would not accept `US$` as a valid value.
```concordia
UI Element: salary
  - data type is double
  - min value is 1000.00
  - format is "US\$[0-9]{1,7}\.[0-9]{2}"
```

#### Computation

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



### Known Limitations

#### Queries

1. Must be declared in a single line.

```concordia
UI Element: profession
  - value comes from "SELECT name FROM [MyDB].profession"

UI Element: salary
  - min value comes from "SELECT salary FROM [MyDB].profession WHERE name = {profession}"
```