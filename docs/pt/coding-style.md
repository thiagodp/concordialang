# Coding style

> Esse arquivo precisa de tradução para o Português.

Last update: June 8th, 2018

## Names

1. Use PascalCase for type names.
2. Do *not* use "I" as a prefix for interface names.
3. Use both uppercase and dashed case for enum values (*e.g.*, `SOME_ENUM_VALUE`).
4. Use camelCase for function names.
5. Use camelCase for property names and local variables.
6. Use "_" as a prefix for private properties.
7. Use whole words in names when possible.


## Comments

1. Use JSDoc style comments for functions, interfaces, enums, and classes.


## Strings

1. Use single quotes (') for strings, unless escaping.
2. Use template strings to avoid multiple string concatenations.

## Diagnostic messages

1. Use a period at the end of a sentence.

1. When stating a rule, the subject should be in the singular (e.g. "An external module cannot..." instead of "External modules cannot...").

1. Use present tense.


## Ternary operator

1. For short conditions, use the same line.

1. For long conditions, break into multiple lines and use `?` and `:` in front of the line. For example:

    ```js
    const value = ( foo > bar && x <= SOME_CONSTANT )
        ? zoo.performSomethingUseful( foo, x )
        : DEFAULT_VALUE;
    ```


## Classes

1. Declare attributes directly on the constructor where possible.
1. Declare attributes in the beginning of the class.
1. Declare constant/read-only attributes before mutable attributes.
1. Avoid function properties as class methods where possible.
1. Constructor must be the first method, then public methods, then protected methods, then private ones.

## Style

1. Indent with tab.

1. Use semicolons (`;`).

1. Always surround loop and conditional bodies with curly braces.

1. `else` goes on the same line from the closing curly brace.

1. Use arrow functions over anonymous function expressions.

1. Parenthesized constructs should have surrounding whitespace.

    A single space follows commas, colons, and semicolons in those constructs. For example:

    `for ( var i = 0, n = str.length; ( i < 10 ); i++ ) { }`

    `if ( x < 10 ) { }`

    `function f( x: number, y: string ): void { }`

1. Array values should have surrounding whitespace. For example:

    `let values: any[] = [ 10, "Foo", false ];`

1. Generic type arguments should have surrounding whitespace. For example:

    `< T >( x: T, y: T ) => x === y`

    `class Foo< T > {}`

1. Only surround arrow function parameters when necessary.

    For example, `( x ) => x + x` should be avoided, but the following are correct:

    `x => x + x`

    `( x, y ) => x + y`

    `< T >( x: T, y: T ) => x === y`

1. Always prefer **for of** construction to the `forEach` method.

    That is, prefer `for ( let someVar of someArray )` to `someArray.forEach( ... )`

1. Prefer `const` instead of `let` when values will not change.

1. Use spaces between lines to increase readability and logical separation.

1. Use spaces between lines consistently over the file.
