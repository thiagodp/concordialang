# Concordia

> Gere testes funcionais automaticamente a partir de sua especificação Ágil

## Sobre

Concordia é uma metalinguagem para especificação [Ágil](https://pt.wikipedia.org/wiki/Desenvolvimento_%C3%A1gil_de_software) de requisitos inspirada em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Ela permite:
1. Escrever especificações [legíveis para pessoas de negócio](https://martinfowler.com/bliki/BusinessReadableDSL.html).

2. Gerar e executar [casos de teste functional](https://en.wikipedia.org/wiki/Functional_testing) automaticamente. *Não só esqueletos de scripts de teste!* Ela gera casos de teste e scripts de teste completos, com *dados de teste*. Você nem precisa saber escrever código!

3. Gerar scripts de teste para diferentes frameworks de teste, como [CodeceptJS](https://codecept.io/), através de [plug-ins]().

4. Escrever casos de teste adicionais quando necessário, usando *linguagem natural restrita* - atualmente disponível em  **Inglês** (`en`) e **Português** (`pt`). Esses casos de teste são convertidos em scripts de teste usando plug-ins.

5. Usar seu editor UTF-8 favorito (*e.g.*, [VS Code](https://code.visualstudio.com/), [Sublime Text](http://www.sublimetext.com/), [Atom](https://atom.io/), vim, emacs) para escrever arquivos de especificação (`.feature`) e casos de teste (`.testcase`) e usar seu [sistema de controle de versão](https://pt.wikipedia.org/wiki/Sistema_de_controle_de_vers%C3%B5es) preferido (*e.g.*, [Git](), [Subversion](https://subversion.apache.org/), [Mercurial](https://www.mercurial-scm.org/)) para gerenciar suas mudanças.

6. Ser usada em conjunto com ferramentas baseadas em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), como [Cucumber](https://cucumber.io/), para criar [testes não funcionais](https://en.wikipedia.org/wiki/Non-functional_testing) ou outros tipos de teste, além de poder aproveitar eventuais arquivos `.feature` existentes.

## Install

```bash
npm install -g concordialang
```

## Run

```bash
concordia caminho/ate/suas/features --plugin <plugin>
```

> *Dica*: Instale o [plug-in para CodeceptJS](#) para gerar scripts de teste em JavaScript visando testar aplicações web ou mobile.


## Um exemplo curto:

### 1. Escreva a funcionalidade usando a linguagem Concordia
