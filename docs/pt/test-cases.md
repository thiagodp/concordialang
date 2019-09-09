# Casos de teste gerados <!-- omit in toc -->

- [Estados cobertos](#estados-cobertos)
- [Cenários cobertos](#cen%c3%a1rios-cobertos)
- [Cobertura de regras](#cobertura-de-regras)
- [Exemplos](#exemplos)
  - [Exemplo 1](#exemplo-1)
  - [Exemplo 2](#exemplo-2)
  - [Exemplo 3](#exemplo-3)

Concordia pode gerar casos de teste a partir de [requisitos funcionais](https://pt.wikipedia.org/wiki/Requisito_funcional) escritos em Linguagem Concordia. Apesar de não ser capaz de gerar automaticamente casos de testes para [requisitos não funcionais](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional), você pode criá-los manualmente usando as ferramentas de *Behavior-Driven Development* (BDD) baseadas em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), como a [Cucumber](https://docs.cucumber.io/).

## Estados cobertos

> *descrição em breve*

## Cenários cobertos

> *descrição em breve*

## Cobertura de regras

Cada dado de entrada pode receber valores de acordco com sua regras de negócio. Essas regras de negócio são classificadas nos seguintes grupos: `VALUE`, `LENGTH`, `FORMAT`, `SET`, `REQUIRED`, e `COMPUTED`.
Todas exceto `COMPUTED` estão disponíveis atualmente.

Para cada grupo, uma bateria de testes pode ser executada, dependendo das regras declaradas:

| Grupo    | Dado para Caso de Teste        | Descrição |
|----------|--------------------------------| --------- |
| VALUE    | LOWEST_VALUE                   | Lowest possible value for the data type, *e.g.*, lowest integer |
|          | RANDOM_BELOW_MIN_VALUE         | Random value below the minimum value |
|          | JUST_BELOW_MIN_VALUE           | The value just below the minimum value, considering the data type and decimal places |
|          | MIN_VALUE	                    |
|          | JUST_ABOVE_MIN_VALUE           |
|          | ZERO_VALUE	                    |
|          | MEDIAN_VALUE                   |
|          | RANDOM_BETWEEN_MIN_MAX_VALUES  |
|          | JUST_BELOW_MAX_VALUE           |
|          | MAX_VALUE	                    |
|          | JUST_ABOVE_MAX_VALUE           |
|          | RANDOM_ABOVE_MAX_VALUE         |
|          | GREATEST_VALUE                 |
| LENGTH   | LOWEST_LENGTH                  |
|          | RANDOM_BELOW_MIN_LENGTH        |
|          | JUST_BELOW_MIN_LENGTH          |
|          | MIN_LENGTH                     |
|          | JUST_ABOVE_MIN_LENGTH          |
|          | MEDIAN_LENGTH                  |
|          | RANDOM_BETWEEN_MIN_MAX_LENGTHS |
|          | JUST_BELOW_MAX_LENGTH          |
|          | MAX_LENGTH	                    |
|          | JUST_ABOVE_MAX_LENGTH          |
|          | RANDOM_ABOVE_MAX_LENGTH        |
|          | GREATEST_LENGTH                |
| FORMAT   | VALID_FORMAT                   |
|          | INVALID_FORMAT                 |
| SET      | FIRST_ELEMENT                  |
|          | RANDOM_ELEMENT                 |
|          | LAST_ELEMENT                   |
|          | NOT_IN_SET                     |
| REQUIRED | FILLED                         |
|          | NOT_FILLED                     |
| COMPUTED | RIGHT_COMPUTATION	            |
|          | WRONG_COMPUTATION	            |
|          |                                |

## Exemplos

### Exemplo 1

Vamos descrever uma regra para o elemento de interface `Salário`:

```gherkin
Elemento de IU: Salário
  - tipo de dado é double
```

Como poucas restrições foram feitas, `Salário` será testado com os casos de teste do grupo `REQUIRED`:
1. `FILLED`: um número flutuante *pseudo-aleatório* será gerado
2. `NOT_FILLED`: um valor vazio será usado

Agora, vamos adicionar uma restrição de **valor mínimo**.

```gherkin
Elemento de IU: Salário
  - tipo de dado é double
  - valor mínimo é 1000.00
    Caso contrário, eu devo ver "Salário deve ser maior ou igual a 1000"
```

Alguns testes do grupo `VALUE` são aplicáveis agora:

1. `LOWEST_VALUE`: o menor flutuante possível é usado
2. `RANDOM_BELOW_MIN_VALUE`: um valor pseudo-aleatório abaixo do valor mínimo é gerado
3. `JUST_BELOW_MIN_VALUE`: um valor logo abaixo do valor mínimo é usado (ex. `999.99`)
4. `MIN_VALUE`: o valor mínimo é usado
5. `JUST_ABOVE_MIN_VALUE`: um valor logo acima do mínimo é usado (ex.: `1000.01`)
6. `ZERO_VALUE`: zero (`0`) é usado

Dado que `1000.00` é o valor mínimo, os dados produzidos pelos testes `1`, `2`, `3` e `6` do grupo `VALUE` são considerados **inválidos**, enquanto `4` e `5` não são. Para esses testes considerados **inválidos**, o comportamento definido em `Caso contrário`, ou seja,
```gherkin
    Caso contrário, eu devo ver "Salário deve ser maior ou igual a 1000"
```
é esperado que aconteça. Em outras palavras, esse comportamento serve como [oráculo de teste](https://en.wikipedia.org/wiki/Test_oracle) e só deve ocorrer quando o valor produzido for inválido.

Diferente deste exemplo, se o comportamento do sistema para valores inválidos não for especificado e o dado de teste for considerado **inválido**, Concordia espera que o teste **falhe**. Nesse caso, ele gera o Caso de Teste com a anotação (tag) `@fail`.


Agora, vamos adicionar uma restrição de **valor máximo**:

```gherkin
Elemento de IU: Salário
  - tipo de dado é double
  - valor mínimo é 1000.00
    Caso contrário, eu devo ver "Salário deve ser maior ou igual a 1000"
  - valor máximo é 30000.00
    Caso contrário, eu devo ver "Salário deve ser menor ou igual a 30000"
```

Todos os testes do grupo `VALUE` são agora aplicáveis. Isso é, os seguintes testes são incluídos:

1. `MEDIAN_VALUE`: a mediana entre o valor mínimo e o valor máximo
2. `RANDOM_BETWEEN_MIN_MAX_VALUES`: um valor pseudo-aleatório entre o valor mínimo e o valor máximo
3. `JUST_BELOW_MAX_VALUE`: valor logo abaixo do valor máximo
4. `MAX_VALUE`: o valor máximo
5. `JUST_ABOVE_MAX_VALUE`: o valor logo acima do valor máximo
6. `RANDOM_ABOVE_MAX_VALUE`: um valor pseudo-aleatório acima do valor máximo
7. `GREATEST_VALUE`: o maior valor flutuante aplicável

Os testes de `5` a `7` vão produzir valores considerados **inválidos**.

### Exemplo 2

Vamos definir um elemento de interface de usuário chamado`Profissão` e uma tabela chamada `Profissões` da qual seus valores virão:

```gherkin
Elemento de IU: Profissão
  - tipo é select
  - valor vem de "SELECT nome FROM [Profissões]"
  - obrigatório é true

Tabela: Profissões
  | nome       |
  | Advogado   |
  | Contador   |
  | Dentista   |
  | Professor  |
  | Mecânico   |
```

Os testes aplicáveis são:
  - `FILLED`
  - `NOT_FILLED`
  - `FIRST_ELEMENT`
  - `RANDOM_ELEMENT`
  - `LAST_ELEMENT`
  - `NOT_IN_SET`

Os primeiros dois testes são do grupo `REQUIRED`. Dado que declaramos `Profissão` como tendo valor obrigatório, o teste `FILLED` é considerado **válido**, mas `NOT_FILLED` não. É importante lembrar de declarar entradas obrigatórias quando for o caso.

Os últimos quatro testes estão no grupo `SET`. Somente o último, `NOT_IN_SET`, produzirá um valor considerado **inválido**.

### Exemplo 3

Nesse exemplo, vamos ajustar os dois exemplos anteriores para tornar as regras de `Salário` dinâmicas e mudarem de acordo com o valor de `Profissão`.

Primeiro, vamos adicionar duas colunas à tabela `Profissões`:

```gherkin
Tabela: Profissões
  | nome       | salario_min | salario_max |
  | Advogado   | 3000        | 30000       |
  | Contador   | 3000        | 10000       |
  | Dentista   | 3000        | 40000       |
  | Professor  | 2500        | 25000       |
  | Mecânico   | 1500        |  8000       |
```

Então, mudaremos as regras para obter valores da tabela:

```gherkin
Elemento de IU: Salário
  - tipo de dado é double
  - valor mínimo vem da consulta "SELECT salario_min FROM [Profissões] WHERE nome = {Profissão}"
    Caso contrário eu devo ver "O salário informado é menor que o valor mínimo permitido."
  - valor máximo vem da consulta "SELECT salario_max FROM [Profissões] WHERE nome = {Profissão}"
    Caso contrário eu devo ver "O salário informado é maior que o valor máximo permitido."
```

A referência para o elemento de IU `{Profissão}` dentro da consulta faz as regras de `Salário` dependerem de `Profissão`. Cada vez que uma `Profissão` é selecionada, o **valor mínimo** e **valor máximo** de `Salário` mudam de acordo com as colunas `salario_min` e `salario_max` da tabela `Profissões`.
