#language: pt

importe "foo.feature"

Feature: bar

Cenário: bar

  Variante: bar
    Dado que eu tenho ~foo state~
    Quando eu preencho <k> com 10
    Então eu vejo "hello"