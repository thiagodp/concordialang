# Concordia

> Gere testes funcionais automaticamente a partir de sua especificação Ágil

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang)
[![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)
[![GitHub last commit](https://img.shields.io/github/last-commit/thiagodp/concordialang.svg)](https://github.com/thiagodp/concordialang/releases)
[![npm](https://img.shields.io/npm/l/concordialang.svg)](https://github.com/thiagodp/concordialang/blob/master/LICENSE.txt)
[![slack](https://img.shields.io/badge/slack-chat-blue.svg)](https://bit.ly/2u2vKJX)

O *Compilador Concordia* é uma ferramenta que permite gerar [testes funcionais](https://en.wikipedia.org/wiki/Functional_testing) a partir de uma especificação de requisitos escrita em *Linguagem Concordia*. Você pode usá-las para:

1. Escrever especificações [legíveis para pessoas de negócio](https://martinfowler.com/bliki/BusinessReadableDSL.html).

2. Gerar e executar [casos de teste functional](https://en.wikipedia.org/wiki/Functional_testing) automaticamente. Não *esqueletos de scripts de teste.*, mas [casos de teste](https://pt.wikipedia.org/wiki/Caso_de_teste) e scripts de teste (código-fonte) *completos*. Não é preciso escrever código!

3. Gerar scripts de teste para diferentes frameworks de teste, como [CodeceptJS](https://codecept.io/), através de [plug-ins](docs/pt/plugins.md).

4. Escrever casos de teste adicionais quando necessário, usando *Linguagem Concordia* - atualmente disponível em  *Inglês* (`en`) e *Português* (`pt`). Esses casos de teste são convertidos em scripts de teste usando plug-ins.

5. Analizar os resultados dos testes e ajudar a avaliar eventuais falhas.


A *Linguagem Concordia* é uma meta linguagem de especificação [Ágil](https://en.wikipedia.org/wiki/Agile_software_development) de requisitos, inspirada em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).


## Conteúdo

- [Últimas novidades](https://github.com/thiagodp/concordialang/releases) 🔥
- [Documentação](docs/pt/readme.md) 📖
- [Por que usar Concordia?](#por-que-usar-concordia)
- [Instalação](#instalação)
- [Execução](#execução)
- [Exemplo básico](#exemplo-básico)
- [CLI](#cli)
- [Ciclo de uso recomendado](#ciclo-de-uso-recomendado)
- [Como ela funciona](#como-ela-funciona)
- [Contribuindo com Concordia](#contribuindo-com-concordia)
- [Veja também](#veja-também)

## ❓ Por que usar Concordia?

- [Sintaxe](docs/pt/language.md) simples

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


## 💿 Instalação

O Compilador Concordia requer [NodeJS](https://nodejs.org/) versão `8` ou superior.

> Se você for instalar o plug-in para CodeceptJS para testar aplicações web (CodeceptJS + WebDriverIO), também é preciso instalar o [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

Com o NodeJS instalado, execute o seguinte comando:
```bash
npm install -g concordialang
```

Você pode testar a instalação dessa forma:
```bash
concordia --version
```
Se a versão do concordia for exibida, a instalação teve sucesso.

### 🔌 Instalando um plugin do Concordia

Primeiramente, *liste os plugins disponíveis*:
```bash
concordia --plugin-list
```

Então instale o plugin desejado. Por exemplo:
```bash
concordia --plugin-install codeceptjs
```

Concordia e seus plug-ins procuram instalar todas as dependências necessárias por padrão, para que seja mais simples iniciar o processo de teste.


## 🚀 Execução

### 🖥 Iniciando um servidor de testes

Quando executamos testes para a interface de usuário, pode haver necessidade de um servidor de testes que controle a execução. Por exemplo, `CodeceptJS` pode usar um servidor `Selenium` para controlar um  navegador durante a execução de testes para aplicações web. **Sem um servidor, é possível que os testes não possam ser executados**.

Para iniciar o servidor relacionado ao plugin, basta executar:

```bash
concordia --plugin-serve <nome-do-plugin>
```
Com o servidor iniciado, você pode executar testes com Concordia Compiler em outro terminal (console).

### 🗲 Executando

```bash
concordia caminho/ate/suas/features --plugin <nome-do-plugin>
```

Por exemplo, o comando abaixo procura recursivamente por arquivos de feature a partir do diretório atual.
```bash
concordia --plugin codeceptjs
```

### 🖥 Parando um servidor de testes

É provável que o servidor de testes continue aberto após você executar todos os testes.

Tecle <kbd>Ctrl</kbd> + <kbd>C</kbd> para finalizá-lo.


## 📑 Exemplo básico

> *Exemplo sem geração de dados de teste ou combinação de cenários de teste e sem a maioria dos recursos da linguagem*

**Entrada**

*search-pt.feature* :
```gherkin
#language: pt
Feature: Busca no Google

Cenário: Busca retorna resultado esperado

  Variante: Busca ao teclar Enter
    Dado que estou em "https://google.com.br"
    Quando eu informo "concordialang.org" em <q>
      e eu pressiono "Enter"
    Então eu vejo "npm"
```

**Execução**

Inicia o servidor de testes
```bash
$ concordia --plugin-serve codeceptjs
```
Gera e executa
```bash
$ concordia --plugin codeceptjs
```

**Saída**

*search-pt.testcase* :
```gherkin
# Generated with ❤ by Concordia
#
# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

#language:pt

importe "search-pt.feature"

@generated
@scenario(1)
@variant(1)
Caso de teste: Busca ao teclar Enter - 1
  Dado que estou em "https://google.com.br"
  Quando eu informo "concordialang.org" em <q>
    e eu pressiono "Enter"
  Então eu vejo "npm"
```

*search-pt.js* :
```javascript
// Generated with ❤ by Concordia
// source: search-pt.testcase
//
// THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

Feature("Busca no Google");

Scenario("Busca retorna resultado esperado | Busca ao teclar Enter - 1", (I) => {
    I.amOnPage("https://google.com.br"); // (10,5)
    I.fillField("q", "concordialang.org"); // (11,5)
    I.pressKey("Enter"); // (12,7)
    I.see("npm"); // (13,5)
});
```

e também irá **executar os testes**.


Veja mais na [Documentação](docs/pt/readme.md). 👀


## 💻 CLI

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

  --init                                 Init a guided, basic configuration.

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


## ♺ Ciclo de uso recomendado

1. Escreva ou atualize sua especificação de requisitos com a *Linguagem Concordia* e valide-a com usuários ou interessados;

2. Use o **Compilador Concordia** para gerar testes a partir da especificação e os execute;

3. Se os testes **falharam**, há algumas possibilidades, como:

  1. Você não implementou o comportamento correspondente na sua aplicação. Nesse caso, basta implementar e executar os testes novamente.

  2. Sua aplicação está se comportando diferente do especificado. Nesse caso, ela pode ter bugs ou pode ser você ou sua equipe não implementou o compartamento exatamente comoo descrito na especificação.
    - Se ela tem um bug, ficamos felizes em tê-lo descoberto! Corrija-o e execute os testes novamente, para ter certeza que ele se foi.
    - Caso contrário, você pode decidir em **alterar a sua aplicação** para se comportar exatamente como havia sido especificado, ou **alterar a especificação** para casar com o comportamento da sua aplicação. No último caso, volte ao passo `1`.

4. Se os testes **passaram**, *bom trabalho!* Agora você pode escrever novos requisitos or adicionar mais casos testes. Nesse caso, basta voltar ao passo `1`.


## 🧠 Como ela funciona

![Process](media/process.png)

1. Lê arquivos `.feature` e `.testcase` e usa um [lexer](https://pt.wikipedia.org/wiki/An%C3%A1lise_l%C3%A9xica) e um [parser](https://pt.wikipedia.org/wiki/An%C3%A1lise_sint%C3%A1tica_(computa%C3%A7%C3%A3o)) para identificar e verificar a estrutura dos documentos.

2. Usa [processamento de linguagem natural](https://pt.wikipedia.org/wiki/Processamento_de_linguagem_natural) para identificar a [intenção](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/) das sentenças. Isso aumenta as changes de reconhecer sentenças em diferentes estilos de escrita.

3. Realiza uma [análise semântica](https://pt.wikipedia.org/wiki/An%C3%A1lise_sem%C3%A2ntica) para checar as declarações reconhecidas.

4. Usa a especificação para inferir os casos de teste, dados de teste e oráculos de teste e gera arquivos `.testcase` em Linguagem Concordia.

5. Transforma todos os casos de teste em scripts de teste (isso é, código-fonte) usando um plug-in.

6. Executa os scripts de teste através do mesmo plug-in. Esses scripts irão verificar o comportamento da aplicação através de sua interface de usuário.

7. Lê e apresenta os resultados da execução. Esses resultados relacionam testes que falharam com a especificação, de forma a ajudar a você a decidir as possíveis razões.


👉 Veja os [tipos de casos de teste gerados](docs/pt/test-cases.md).


## 🍻 Contribuindo

*Há muitas formas de contribuir. A maioria é bem fácil.* 😉

- *Dê uma estrela* (⭐) - Quem segue você fica sabendo do projeto
- *Dê feedback* em nosso [chat](https://concordialang.slack.com)
- Estenda a documentação, a traduza para outros idiomas ou [relate erros](https://github.com/thiagodp/concordialang/issues/new) no texto
- [Crie um plug-in](docs/pt/plugins.md) para sua linguagem ou framework de testes preferidos
- [Relate um bug](https://github.com/thiagodp/concordialang/issues/new)
- [Sugira](https://github.com/thiagodp/concordialang/issues/new) uma melhoria ou uma nova funcionalidade
- [Desenvolva](docs/en/development.md) conosco


### Badge

Mostre que seu projeto está usando Concordia → [![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)

```
[![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)
```

## Veja também

- [katalon-concordia](https://github.com/thiagodp/katalon-concordia) - converte scripts de teste gravados com Katalon Recorder para sentenças em linguagem Concordia.


## Licença

![AGPL](http://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[GNU Affero General Public License version 3](LICENSE.txt)
