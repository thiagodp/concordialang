# Concordia

> Gere testes funcionais automaticamente a partir de sua especificação Ágil

## Sobre

Concordia é uma metalinguagem para especificação [Ágil](https://pt.wikipedia.org/wiki/Desenvolvimento_%C3%A1gil_de_software) de requisitos inspirada em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Ela permite:
1. Escrever especificações [legíveis para pessoas de negócio](https://martinfowler.com/bliki/BusinessReadableDSL.html).

2. Gerar e executar [casos de teste functional](https://en.wikipedia.org/wiki/Functional_testing) automaticamente. Não *esqueletos de scripts de teste.*, mas [casos de teste](https://pt.wikipedia.org/wiki/Caso_de_teste) e scripts de teste (código-fonte) *completos*. Não é preciso escrever código!

3. Gerar scripts de teste para diferentes frameworks de teste, como [CodeceptJS](https://codecept.io/), através de [plug-ins]().

4. Escrever casos de teste adicionais quando necessário, usando *linguagem natural restrita* - atualmente disponível em  *Inglês* (`en`) e *Português* (`pt`). Esses casos de teste são convertidos em scripts de teste usando plug-ins.

5. Usar seu editor UTF-8 favorito (*e.g.*, [VS Code](https://code.visualstudio.com/), [Sublime Text](http://www.sublimetext.com/), [Atom](https://atom.io/), vim, emacs) para escrever arquivos de especificação (`.feature`) e casos de teste (`.testcase`) e usar seu [sistema de controle de versão](https://pt.wikipedia.org/wiki/Sistema_de_controle_de_vers%C3%B5es) preferido (*e.g.*, [Git](), [Subversion](https://subversion.apache.org/), [Mercurial](https://www.mercurial-scm.org/)) para gerenciar suas mudanças.

6. Ser usada em conjunto com ferramentas baseadas em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin), como [Cucumber](https://cucumber.io/), para criar [testes não funcionais](https://en.wikipedia.org/wiki/Non-functional_testing) ou outros tipos de teste, além de poder aproveitar eventuais arquivos `.feature` existentes.

## Instalação

Concordia requer [NodeJS](https://nodejs.org/) versão 8 ou superior. Com o NodeJS instalado, execute o seguinte comando:
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

Então instale o plugin desejado:

```bash
concordia --plugin-install <nome-do-plugin>
```

Por exemplo:
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

Se você já estiver no diretório onde estão suas features, basta informar o plugin.

Exemplo:

```bash
concordia --plugin codeceptjs
```

### Parando um servidor de testes

É provável que o servidor de testes continue aberto após você executar todos os testes.

Tecle `Ctrl + C` para finalizá-lo.


## Um exemplo curto

Veja um [exemplo de uso de Concordia](docs/example-pt.md)
