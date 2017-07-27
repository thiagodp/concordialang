# Requirements Processing

Example:
```
+---+         +---+    +---+    +---+
| A |-------->| B |    | C |--->| D |
+---+         +---+    +---+    +---+
  |                      ^
  |                      |
  +----------------------+
```

Processing:

1. Lexer + Parser
    - *Input*: text document
    - *Output*: AST
2. Semantic Analysis
    - *Input*: AST
    - *Output*: Augmented AST
3. Compilation
    - *Input*: Augmented AST
    - *Output*: ?