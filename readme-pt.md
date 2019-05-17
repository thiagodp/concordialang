# Concordia

> Gere testes funcionais automaticamente a partir de sua especificação Ágil

[![Build Status](https://travis-ci.org/thiagodp/concordialang.svg?branch=master)](https://travis-ci.org/thiagodp/concordialang)
[![npm version](https://badge.fury.io/js/concordialang.svg)](https://badge.fury.io/js/concordialang)
[![GitHub last commit](https://img.shields.io/github/last-commit/thiagodp/concordialang.svg)](https://github.com/thiagodp/concordialang/releases)
[![npm](https://img.shields.io/npm/l/concordialang.svg)](https://github.com/thiagodp/concordialang/blob/master/LICENSE.txt)
[![slack](https://img.shields.io/badge/slack-chat-blue.svg)](https://bit.ly/2u2vKJX)


✨ **Eleve a qualidade da sua aplicação** ✨

1. Escreva especificações de requisitos com a Linguagem Concordia.

2. Use o Compilador Concordia para configurar o ambiente de teste para você.

3. Use o Compilador Concordia para gerar e executar scripts de teste funcional a partir de especificações em Concordia. *Não é necessário escrever código.*


## Conteúdo

- [ÚLTIMAS NOVIDADES](https://github.com/thiagodp/concordialang/releases) 🔥
- [Documentação](docs/README.md) 📖
- [Sobre](#sobre)
- [Começando](#comecando)
- [Veja Também](#veja-tambem)
- [Projetos Relacionados](#projetos-relacionados)


## 💡 Sobre

**Concordia** é uma linguagem para especificação [Ágil](https://en.wikipedia.org/wiki/Agile_software_development) de requisitos, inspirada em [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) e [legível para pessoas de negócio](https://martinfowler.com/bliki/BusinessReadableDSL.html). Atualmente ela suporta [Inglês](./docs/en/language.md) e [Português](./docs/pt/language.md). Novas línguas podem ser adicionadas facilmente.

O **Concordia Compiler** gera e executa casos de teste e scripts de teste [funcional](https://en.wikipedia.org/wiki/Functional_testing) a partir de documentos escritos em *Linguagem Concordia*. Ele usa [Processamento de Linguagem Natural](https://en.wikipedia.org/wiki/Natural_language_processing) e muitas outras técnicas para isso.

Ambos os **casos de teste** e **scripts de teste** recebem *dados de teste* e *oráculos de teste*. Você não precisa produzí-los manualmente. Eles são inferidos da sua especificação escrita em Linguagem Concordia.

O Compilador Concordia usa [plug-ins](docs/pt/plugins.md) para produzir scripts de teste e configurar o ambiente de teste.

Cada **plug-in** pode gerar scripts de teste para uma linguagem de programação ou framework de teste diferente, para aplicações **web**, **móveis**, **desktop**.

### Por que usar ?

1. [Sintaxe](docs/pt/language.md) simples e flexível.

2. **Separa** declarações de alto nível e voltadas para o negócio das declarações de nível médio ou baixo, voltadas para tecnologia - facilitando a comunicação entre a equipe, clientes e outros interessados. **Use um mesmo documento para discutir funcionalidades** com clientes, analistas, desenvolvedores e testadores, tornando a adoção de [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development)/[ATDD](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development)/[SbE](https://en.wikipedia.org/wiki/Specification_by_example) mais fácil.

3. Torna suas **especificações mais úteis**. Obtenha testes funcionais automatizados facilmente a partir delas e guie seu desenvolvimento coberto por testes.

4. Adicione testes automatizados em **aplicações novas ou legadas** sem ter que escrever código.

5. Gere **casos de teste e scripts de teste relevantes** em poucos milisegundos. Obtenha testes que adotam técnicas como [particionamento em classes de equivalência](https://en.wikipedia.org/wiki/Equivalence_partitioning), [análise de valor limite](https://en.wikipedia.org/wiki/Boundary-value_analysis), [teste combinatório](https://en.wikipedia.org/wiki/All-pairs_testing) (*n-wise*), e [teste aleatório](https://en.wikipedia.org/wiki/Random_testing) sem ter que pensar (e investir seu tempo) em todos esses casos.

6. **Reduza a necessidade de escrever cenários negativos** (aqueles cenários que tratam erros ou entradas inválidas) fazendo a descrição de regras de sistema em elementos de interface de usuário. Concordia permite que você descreva regras dinâmicas e complexas.

7. Crie regras com dados de **arquivos ou bancos de dados** e Concordia os usará em seus casos de teste.

8. **Rastreie a especificação** a partir dos casos de teste e scripts de teste gerados. Eles recebem comentários de linha especiais que fazem referência à especificação e as técnicas de teste adotadas.

9. **Adicione casos de teste sem precisar codificar**. Escreva-os com Concordia e deixe o compilador convertê-los para código.

10. Use uma especificação em **texto simples** que é amigável para uso com sistemas de controle de versão e pode evoluir junto com o código da sua aplicação.


## 💿 Instalação

O Compilador Concordia funciona em **Windows**, **Linux**, e **MacOS**, e requer [NodeJS](https://nodejs.org/) versão `8` ou superior. Se você deseja testar aplicações *baseadas em web*, também será preciso instalar o [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

Após instalar as dependências, abra o console/terminal e execute o seguinte comando:
```bash
npm install -g concordialang
```

> 👉 O Compilador Concordia também pode ser instalado localmente (sem `-g`) e executado usando o [NPX](https://www.npmjs.com/package/npx). NPX já é incluso no NodeJS na versão `8.2.0` ou superior.

Você pode checar se a instalação teve êxito executando o comando abaixo, que informa o número da versão atual:
```bash
concordia --version
```

> 👉 Note que `concordia` é o comando que você usará a partir de agora, que é diferente de `concordialang`, que você usou na instalação.


## 🚀 Começando

Vamos criar um exemplo básico, similar a um "olá mundo". Para poder executar os testes dele, você precisará de conexão com a Internet e ter o navegador [Google Chrome](https://www.google.com/chrome/) instalado.

**Passo 1: *Crie um diretório***

Crie um diretório chamado `busca` e então acesse ele pelo terminal:

```bash
mkdir busca
cd busca
```

> 👉 Se você estiver no Windows, você também pode criar uma pasta vazia pelo Windows Explorer, entrar nela, depois digitar `cmd` na barra de endereço.

**Passo 2: *Configure***

Execute o seguinte comando para guiar o processo de configuração:

```bash
concordia --init
```

Serão feitas algumas perguntas sobre suas preferências e elas serão armazenadas em um arquivo chamado `.concordiarc`. **DEIXE TODOS OS VALORES PADRÃO** teclando <kbd>Enter</kbd> em todas as perguntas.

Os plug-ins serão instalados durante o processo. Se preferir instalá-los *manualmente*, por favor consulte a [página sobre plugins](./docs/pt/plugins.md).

**Passo 3: *Inicie o servidor de testes***

Ferramentas de teste automatizado geralmente usam um servidor de testes para controlar um *navegador*, um *emulador de dispositivos* ou um *dispositivo real*. Assim, primeiramente iniciamos um servidor de testes para então executarmos os testes.

Uma vez que um **servidor de testes geralmente bloqueia** o terminal/console atual, **abra um novo terminal/console**.

> 👉 Se você estiver usando Windows, você pode iniciar um novo terminal a partir do diretório atual executando:
> ```bash
> start cmd .
> ```

O Compilador Concordia facilita iniciar um servidor de testes fornecendo o parâmetro `--plugin-serve`. No novo terminal, execute:

```bash
concordia --plugin-serve
```

É comum que o servidor de testes permaneça aberto. Para pará-lo mais tarde (não faça isso agora, claro), basta digitar <kbd>Ctrl</kbd> + <kbd>C</kbd>.

**Passo 4: *Crie a funcionalidade***

Crie uma pasta `features`, que é onde colocaremos arquivos com funcionalidades:

```bash
mkdir features
```

Então, use seu editor de textos favorito para criar o arquivo `busca.feature`, dentro do diretório `features`, com o seguinte conteúdo:

```gherkin
#language: pt
Funcionalidade: Busca no Google

Cenário: Busca retorna resultado esperado

  Variante: Busca ao teclar Enter
    Dado que estou em "https://google.com.br"
    Quando eu informo "concordialang.org" em <q>
      e eu pressiono "Enter"
    Então eu vejo "npm"
```

**Passo 5: *Execute***

No diretório `busca`, execute somente:
```bash
concordia
```

*Parabéns!*

O Compilador Concordia irá gerar alguns arquivos, configurar o ambiente, então **gerar e executar os scripts de teste**. Seu navegador deverá abrir automaticamente durante o processo e o terminal mostrará o resultado da execução do teste.

**Alguns arquivos gerados:**

`features/busca.testcase`, que conterá o caso de teste produzido:

```gherkin
# Generated with ❤ by Concordia
#
# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

#language:pt

importe "busca.feature"

@generated
@scenario(1)
@variant(1)
Caso de teste: Busca ao teclar Enter - 1
  Dado que estou em "https://google.com.br"
  Quando eu informo "concordialang.org" em <q>
    e eu pressiono "Enter"
  Então eu vejo "npm"
```

`test/busca.js`, que conterá o script de teste produzido a partir de  `features/busca.testcase`:

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

Para gerar e executar os teses novamente, basta executar o último comando.

> 👉 Lembre-se que isso é só um "olá mundo". Concordia tem muito, muito mais a lhe oferecer!


## 👁 Veja Também

- [Documentação](docs/pt/readme.md)
- [Plug-ins](docs/pt/plugins.md)


## 💪 Projetos Relacionados

- [katalon-concordia](https://github.com/thiagodp/katalon-concordia):  plug-in para Chrome e Firefox que converte gravações feitas com [Katalon Recorder](https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid) em Linguagem Concordia Language. **Muito útil** para:
  - Descobrir a identificação de elementos da interface de usuário em aplicações web (*e.g.*, propriedade `id` ou o [XPath](https://en.wikipedia.org/wiki/XPath) dos elementos)
  - Criar um caso de teste que reproduz exatamente o que você gravou.

- [Appium Desktop](https://github.com/appium/appium-desktop/): Inspetor de interface gráficas para desktop (Windows, Linux, e MacOS) e Servidor Appium


## 🍻 Contribuindo

- Curtiu? Dê uma estrela ⭐
- Traduza a documentação. Crie um Fork e submeta um Merge Request com quaisquer arquivos traduzidos. Mesmo uma tradução parcial já ajuda!
- [Bata um papo conosco](https://concordialang.slack.com) no Slack ou [abra uma Issue](https://github.com/thiagodp/concordialang/issues/new) com uma pergunta ou sugestão.
- [Reporte](https://github.com/thiagodp/concordialang/issues/new) bugs ou quaisquer erros tipográficos.
- [Crie um novo plug-in](docs/pt/plugin-creation.md) para sua linguagem de programação ou framework de testes favorito, ou [desenvolva Concordia](docs/pt/development.md) com a gente.

#### Badge

Mostre para o mundo que seu projeto usa Concordia → [![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)

```
[![Concordia e2e](https://img.shields.io/badge/e2e-concordia-brightgreen.svg)](http://concordialang.org)
```


## Licença

![AGPL](https://www.gnu.org/graphics/agplv3-88x31.png) © [Thiago Delgado Pinto](https://github.com/thiagodp)

[Licença Pública GNU Affero versão 3](LICENSE.txt)