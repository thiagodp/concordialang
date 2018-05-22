# Concordia

> Gere testes funcionais automaticamente a partir de sua especificação Ágil

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang) [![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)

*Concordia* é uma ferramenta que permite gerar [testes funcionais](https://en.wikipedia.org/wiki/Functional_testing) a partir de uma especificação de requisitos escrita em *Linguagem Concordia*. Você pode usá-las para:

1. Escrever especificações [legíveis para pessoas de negócio](https://martinfowler.com/bliki/BusinessReadableDSL.html).

2. Gerar e executar [casos de teste functional](https://en.wikipedia.org/wiki/Functional_testing) automaticamente. Não *esqueletos de scripts de teste.*, mas [casos de teste](https://pt.wikipedia.org/wiki/Caso_de_teste) e scripts de teste (código-fonte) *completos*. Não é preciso escrever código!

3. Gerar scripts de teste para diferentes frameworks de teste, como [CodeceptJS](https://codecept.io/), através de [plug-ins](plugins/README.md).

4. Escrever casos de teste adicionais quando necessário, usando *Linguagem Concordia* - atualmente disponível em  *Inglês* (`en`) e *Português* (`pt`). Esses casos de teste são convertidos em scripts de teste usando plug-ins.

5. Analizar os resultados dos testes e ajudar a avaliar eventuais falhas.


A *Linguagem Concordia* é uma meta linguagem de especificação [Ágil](https://en.wikipedia.org/wiki/Agile_software_development) de requisitos, inspirada em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).


## Por que Concordia?

- [Sintaxe](docs/language/pt.md) simples

- Não é preciso escrever código

- Separa declarações alto nível, em **linguagem de negócio**, de declarações de nível médio-baixo, em **linguagem de computação**

- Tenha testes relevantes e completos em poucos segundos

- Alta covertura de regras de negócio a um pequeno esforço de declaração

- Permite descrever regras de negócio complexas e dinâmicas, incluindo aquelas relacionadas a dados que advém de bancos de dados

- Tenha casos de teste declarados em uma linguagem de alto nível

- Crie casos de testes adicionais sem ter que lidar com código-fonte

- Casos de teste e script de teste gerados recebem comentários sobre a especificação relacionada, para que você possa rastreá-la

- Disponível em mais de um idioma

- Não requer editor de texto especial - use seu editor UTF-8 favorito

- Use seu [sistema de controle de versão](https://pt.wikipedia.org/wiki/Sistema_de_controle_de_vers%C3%B5es) favorito para gerenciar mudanças

- Vem com tudo incluído - instale e use


## Instalação

Concordia requer [NodeJS](https://nodejs.org/) versão `8` ou superior. Com o NodeJS instalado, execute o seguinte comando:
```bash
npm install -g concordialang
```

Você pode testar a instalação dessa forma:
```bash
concordia --version
```
Se a versão do concordia for exibida, a instalação teve sucesso.

### Instalando um plugin do Concordia

Primeiramente, *liste os plugins disponíveis*:
```bash
concordia --plugin-list
```

Então instale o plugin desejado. Por exemplo:
```bash
concordia --plugin-install codeceptjs
```

Concordia e seus plug-ins procuram instalar todas as dependências necessárias por padrão, para que seja mais simples iniciar o processo de teste.

## Execução

### Iniciando um servidor de testes

Quando executamos testes para a interface de usuário, pode haver necessidade de um servidor de testes que controle a execução. Por exemplo, `CodeceptJS` pode usar um servidor `Selenium` para controlar um  navegador durante a execução de testes para aplicações web. **Sem um servidor, é possível que os testes não possam ser executados**.

Para iniciar o servidor relacionado ao plugin, basta executar:

```bash
concordia --plugin-serve <nome-do-plugin>
```
Com o servidor iniciado, você pode executar testes com Concordia em outro terminal (console).

### Executando Concordia

```bash
concordia caminho/ate/suas/features --plugin <nome-do-plugin>
```

Se você já estiver no diretório onde estão suas features, basta informar o plugin. Exemplo:
```bash
concordia --plugin codeceptjs
```

### Parando um servidor de testes

É provável que o servidor de testes continue aberto após você executar todos os testes.

Tecle `Ctrl + C` para finalizá-lo.


## Um exemplo curto

Veja um [exemplo de uso de Concordia](docs/example-pt.md). 👀


## Sintaxe da linguagem

- [English](docs/language/en.md)
- [Português](docs/language/pt.md)


## CLI

```
concordia --help

  Concordia Language Compiler

  Usage: concordia [<dir>] [options]

  where <dir> is the directory that contains your specification files.

  Options:

  Input directories and files

  -d,  --directory <value>               Directory to search.
  -nr, --no-recursive                    Disable recursive search.
  -e,  --encoding <value>                File encoding. Default is "utf8".
  -x,  --extensions <".ext1,.ext2,...">  File extensions to consider (when <dir> is informed).
  -i,  --ignore <"file1,file2,...">      Files to ignore, when <dir> is informed.
  -f,  --files <"file1,file2,...">       Files to consider, instead of <dir>.

  -l,  --language <code>                 Default language. Default is "en" (english).
  -ll, --language-list                   List available languages.

  Plug-in

  -p,  --plugin <name>                   Plug-in to use.
  -pa, --plugin-about <name>             About a plug-in.
  -pi, --plugin-install <name>           Install a plug-in.
  -pu, --plugin-uninstall <name>         Uninstall a plug-in.
  -ps, --plugin-serve <name>             Starts a test server with a plugin.
  -pl, --plugin-list                     List available plug-ins.

  Processing and output

  --save-config                          Save/overwrite a configuration file
                                         with the other command line options.

  -b,  --verbose                         Verbose output.

  -np, --no-spec                         Do not process specification files.
  -nt, --no-test-case                    Do not generate test cases.
  -ns, --no-script                       Do not generate test scripts.
  -nx, --no-run                          Do not run test scripts.
  -nu, --no-result                       Do not process execution results.

  -jp, --just-spec                       Just process specification files.
  -jt, --just-test-case                  Just generate test cases.
  -js, --just-script                     Just generate test scripts.
  -jx, --just-run                        Just execute test scripts.

  -dt, --dir-test-case                   Output directory for test cases.
  -ds, --dir-script                      Output directory for test scripts.
  -du, --dir-result                      Output directory for result files.

  -ef, --ext-feature                     File extension for Feature files.
                                         Default is .feature.
  -et, --ext-test-case                   File extension for Test Case files.
                                         Default is .testcase.
  -lb, --line-breaker                    Character used for breaking lines.

  Content generation

  --case-ui (camel|pascal|snake|kebab|none)
                                         String case to use for UI Element names
                                         when they are not defined (default is camel).
  --case-method (camel|pascal|snake|kebab|none)
                                         String case to use for test script methods
                                         (default is snake).
  --tc-suppress-header                   Suppress header in generated Test Case files.
  --tc-indenter <value>                  String used as indenter in generated Test Case
                                         files (default is double spaces).

  Randomic value generation

  --seed <value>                         Use the given random seed. Default is current
                                         date and time.
  --random-min-string-size <number>      Minimum random string size. Default is 0.
  --random-max-string-size <number>      Minimum random string size. Default is 500.
  --random-tries <number>                Random tries to generate invalid values.
                                         Default is 5.

  Combination strategies

  --comb-variant (random|first|fmi|all)  Strategy to select variants to combine,
                                         by their states.
        random  = random variant that has the state (default)
        first   = first variant that has the state
        fmi     = first most important variant that has the state
        all     = all variants that have the state

  --comb-state (sre|sow|onewise|all)     Strategy to combine states of a
                                         same variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  --comb-invalid (node|0|1|smart|random|all)
                                         How many input data will be invalid
                                         in each test case.
        0,none  = no invalid data
        1       = one invalid data per test case
        smart   = use algorithm to decide (default)
        random  = random invalid data per test case
        all     = all invalid

  --comb-data (sre|sow|onewise|all)     Strategy to combine data test cases
                                        of a variant.
        sre     = single random of each (default)
        sow     = shuffled one-wise
        ow      = one-wise
        all     = all

  Information

  -v,  --version                         Show current version.
  -a,  --about                           Show information about this application.
  -h,  --help                            Show this help.

  Examples

   $ concordia --plugin some-plugin
   $ concordia path/to/dir --no-test-case --no-script -p some-plugin
   $ concordia --files "file1.feature,path/to/file2.feature" -p some-plugin -l pt
```


## Ciclo de uso recomendado

1. Escreva ou atualize sua especificação de requisitos com a *Linguagem Concordia* e valide-a com usuários ou interessados;

2. Use **Concordia** para gerar testes a partir da especificação e os execute;

3. Se os testes **falharam**, há algumas possibilidades, como:

  1. Você não implementou o comportamento correspondente na sua aplicação. Nesse caso, basta implementar e executar os testes novamente.

  2. Sua aplicação está se comportando diferente do especificado. Nesse caso, ela pode ter bugs ou pode ser você ou sua equipe não implementou o compartamento exatamente comoo descrito na especificação.
    - Se ela tem um bug, ficamos felizes em tê-lo descoberto! Corrija-o e execute os testes novamente, para ter certeza que ele se foi.
    - Caso contrário, você pode decidir em **alterar a sua aplicação** para se comportar exatamente como havia sido especificado, ou **alterar a especificação** para casar com o comportamento da sua aplicação. No último caso, volte ao passo `1`.

4. Se os testes **passaram**, *bom trabalho!* Agora você pode escrever novos requisitos or adicionar mais casos testes. Nesse caso, basta voltar ao passo `1`.


## Como ela funciona

![Process](media/process.png)

1. Concordia lê arquivos `.feature` e `.testcase` como um compilador e usa um [lexer](https://pt.wikipedia.org/wiki/An%C3%A1lise_l%C3%A9xica) e um [parser](https://pt.wikipedia.org/wiki/An%C3%A1lise_sint%C3%A1tica_(computa%C3%A7%C3%A3o)) para identificar e verificar a estrutura dos documentos.

2. Concordia usa [processamento de linguagem natural](https://pt.wikipedia.org/wiki/Processamento_de_linguagem_natural) para identificar a [intenção](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/) das sentenças. Isso aumenta as changes de reconhecer sentenças em diferentes estilos de escrita.

3. Concordia realiza uma [análise semântica](https://pt.wikipedia.org/wiki/An%C3%A1lise_sem%C3%A2ntica) para checar as declarações reconhecidas.

4. Concordia usa a especificação para inferir os casos de teste, dados de teste e oráculos de teste e gera arquivos `.testcase` em Linguagem Concordia, um tipo de *linguagem natural restrita*.

5. Concordia transforma todos os casos de teste em scripts de teste (isso é, código-fonte) usando um plug-in.

6. Concordia executa os scripts de teste através do mesmo plug-in. Esses scripts irão verificar o comportamento da aplicação através de sua interface de usuário.

7. Concordia lê e apresenta os resultados da execução. Esses resultados relacionam testes que falharam com a especificação, de forma a ajudar a você a decidir as possíveis razões.


## Casos de teste gerados

Concordia pode gerar casos de teste a partir de [requisitos funcionais](https://pt.wikipedia.org/wiki/Requisito_funcional) escritos em Linguagem Concordia. Apesar de não ser capaz de gerar casos de testes para [requisitos não funcionais](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional) automaticamente, você pode criá-los manualmente usando as ferramentas de *Behavior-Driven Development* (BDD) baseadas em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), como a [Cucumber](https://docs.cucumber.io/).

### Estados cobertos

> *descrição em breve*

### Cenários cobertos

> *descrição em breve*

### Cobertura de regras

Cada dado de entrada pode receber valores de acordco com sua regras de negócio. Essas regras de negócio são classificadas nos seguintes grupos: `VALUE`, `LENGTH`, `FORMAT`, `SET`, `REQUIRED`, e `COMPUTED`.
Todas exceto `COMPUTED` estão disponíveis atualmente.

Para cada grupo, uma bateria de testes pode ser executada, dependendo das regras declaradas:

```
+----------+--------------------------------+
| group    | testcase                       |
|----------|--------------------------------|
| VALUE    | LOWEST_VALUE                   |
|          | RANDOM_BELOW_MIN_VALUE         |
|          | JUST_BELOW_MIN_VALUE           |
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
|          | RANDOM_ABOVE_MAX_LENGTH	    |
|          | GREATEST_LENGTH	            |
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
+----------+--------------------------------+
```

### Exemplo 1

Vamos descrever uma regra para o elemento de interface `Salario`:

```gherkin
Elemento de IU: Salario
  - tipo de dado é double
```

Como poucas restrições foram feitas, `Salario` será testado com os casos de teste do grupo `REQUIRED`:
1. `FILLED`: um número flutuante *pseudo-aleatório* será gerado
2. `NOT_FILLED`: um valor vazio será usado

Agora, vamos adicionar uma restrição de **valor mínimo**.

```gherkin
Elemento de IU: Salario
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
Elemento de IU: Salario
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

Vamos definir um elemento de interface de usuário chamado`Profissao` e uma tabela chamada `Profissoes` da qual seus valores virão:

```gherkin
UI Element: Profissao
  - tipo é select
  - valor vem de "SELECT nome FROM [Profissoes]"
  - obrigatório é true

Table: Profissoes
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

Os primeiros dois testes são do grupo `REQUIRED`. Dado que declaramos `Profissao` como tendo valor obrigatório, o teste `FILLED` é considerado **válido**, mas `NOT_FILLED` não. É importante lembrar de declarar entradas obrigatórias quando for o caso.

Os últimos quatro testes estão no grupo `SET`. Somente o último, `NOT_IN_SET`, produzirá um valor considerado **inválido**.

### Examplo 3

Nesse exemplo, vamos ajustar os dois exemplos anteriores para tornar as regras de `Salario` dinâmicas e mudarem de acordo com o valor de `Profissao`.

Primeiro, vamos adicionar duas colunas à tabela `Profissoes`:

```gherkin
Table: Profissoes
  | nome       | salario_min | salario_max |
  | Advogado   | 3000        | 30000       |
  | Contador   | 3000        | 10000       |
  | Dentista   | 3000        | 40000       |
  | Professor  | 2500        | 25000       |
  | Mecânico   | 1500        |  8000       |
```

Então, mudaremos as regras para obter valores da tabela:

```gherkin
UI Element: Salary
Elemento de IU: Salario
  - tipo de dado é double
  - valor mínimo vem da consulta "SELECT salario_min FROM [Profissoes] WHERE nome = {Profissao}"
    Caso contrário, eu devo ver "O salário informado é menor que o valor mínimo permitido."
    Otherwise I must see "The given Salary is less than the minimum value"
  - valor máximo vem da consulta "SELECT salario_max FROM [Profissoes] WHERE nome = {Profissao}"
    Caso contrário, eu devo ver "O salário informado é maior que o valor máximo permitido."
```

A referência para o elemento de IU `{Profissao}` dentro da consulta faz as regras de `Salario` dependerem de `Profissao`. Cada vez que uma `Profissao` é selecionada, o **valor mínimo** e **valor máximo** de `Salario` mudam de acordo com as colunas `salario_min` e `salario_max` da tabela `Profissoes`.

## Ajude-nos

- [Como contribuir](contributing.md)
- [Crie um plug-in](plugins/README.md)
- [Melhore a documentação](https://github.com/thiagodp/concordialang#fork-destination-box)
- [Relate um bug](https://github.com/thiagodp/concordialang/issues/new)
- [Sugira uma nova funcionalidade ou alteração](https://github.com/thiagodp/concordialang/issues/new)
- [Desenvolva conosco](docs/development.md)
- [Doe](docs/donate.md)

## License

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)
