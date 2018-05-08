# Exemplo

> Apresentamos aqui um exemplo simples e curto, com objetivo de dar uma ideia do funcionamento básico de Concordia.

Indicamos que leia o exemplo do início ao fim, mesmo sem estar familiarizado com sua sintaxe. Mais adiante, forneceremos mais detalhes.

## 1. Escreva uma funcionalidade

Use a linguagem Concordia para escrever uma funcionalidade.

`login.feature` :
```gherkin
#language: pt

Funcionalidade: Login
  Como um usuário
  Eu desejo me autenticar
  Para acessar a aplicação

Cenário: Login com sucesso
  Dado que eu vejo a tela de login
  Quando eu informo minhas credenciais
  Então eu consigo acessar a tela principal da aplicação

  Variante: Login com sucesso para credenciais válidas
    Dado que eu estou na [Tela de Login]
    Quando eu preencho {Usuario}
      E preencho {Senha}
      E clico em {OK}
    Então eu vejo "Bem-vindo"
      E tenho ~usuario logado~

Constantes:
  - "Tela de Login" é "http://localhost/login"

Tabela: Usuarios
  | login  | senha     |
  | bob    | 123456    |
  | alice  | 4l1c3pass |

Elemento de IU: Usuario
  - valor vem da consulta "SELECT login FROM [Usuarios]"
    Caso contrário, eu devo ver "Usuário inválido"
  - obrigatório é true

Elemento de IU: Senha
  - valor vem da consulta "SELECT senha FROM [Usuarios] WHERE login = {Usuario}"
    Caso contrário, eu devo ver "Senha inválida"
  - obrigatório é true

Elemento de IU: OK
  - tipo é botão
```

## 2. Gere e execute testes

Concordia gera [Casos de Teste](https://pt.wikipedia.org/wiki/Caso_de_teste) e Scripts de Teste (código-fonte).

### Casos de teste

- Sempre escritos na linguagem *Concordia*
- São gerados a partir de arquivos `.feature`
- São declarados em arquivos `.testcase`

Casos de Teste gerados por *Concordia* terão sempre o mesmo nome do arquivo `.feature`. Por exemplo, `login.feature` irá produzir `login.testcase`.

Você também pode escrever seus próprios arquivos `.testcase`, se desejado. Isso permite definir casos de teste adicionais aos gerados por Concordia. **Recomendamos fortemente que casos de teste adicionais nunca sejam declarados em arquivos gerados por Concordia, uma vez que eles podem ser sobrescritos.**

### Scripts de teste

- Linguagem e framework de teste dependem do plug-in usado.
- São gerados a partir de Casos de Teste.

Scripts de Teste gerados por *Concordia* geralmente terão o mesmo nome do arquivo `.feature` e serão gerados para um subdiretório `test`, caso não especificado. Por exemplo, `login.feature` pode produzir `test/login.js`, se usado o plug-in CodeceptJS.

Você também pode escrever seus próprios scripts de teste. Isso permite definir testes adicionais aos gerados por Concordia. **Recomendamos fortemente que testes adicionais nunca sejam declarados em arquivos gerados por Concordia, ou por um de seus plug-ins, uma vez que eles podem ser sobrescritos.**

### Gerando sem executar

O comando abaixo irá gerar casos de teste e gerar scripts de teste para o framework CodeceptJS, sem executá-los:

```concordia
concordia --plugin=codeceptjs --seed="olá mundo" --no-run --no-result
```

O parametro `seed` é a [semente aleatória](https://pt.wikipedia.org/wiki/Semente_aleat%C3%B3ria) utilizada. Os valores aleatórios gerados sempre serão os mesmos, se a semente for a mesma. Caso você não informe o parâmetro `seed`, uma semente aleatória será *gerada*, fazendo com que os valores aleatórios usados nos testes sejam diferentes a cada execução, o que pode aumentar as chances de descobrir defeitos.

Para nosso exemplo, fornecemos uma semente aleatória simplesmente para que os arquivos gerados tenham sempre o mesmo conteúdo.

Os parâmetros `no-run` e `no-result` fazem, respectivamente, com que os scripts de teste não sejam executados e que resultados da execução não sejam analisados.

### Gerando e executando

Primeiro, certifique-se de que o servidor de testes está ativo. Se você ainda não o ativou, basta executar o seguinte comando:

```concordia
concordia --plugin-serve=codeceptjs
```

Isso fará com que o servidor fique aguardando iniciarmos os testes. Você só precisa iniciá-lo uma única vez. Quando quiser fechá-lo, mais tarde, basta teclar `Ctrl + C`.

Então, para gerar e executar os testes:

```concordia
concordia --plugin=codeceptjs --seed="olá mundo"
```

### Executando sem gerar

Se você quiser só executar os testes, sem gerá-los novamente, digite:

```concordia
concordia --plugin=codeceptjs --no-test-case --no-script
```

### Resultado da geração

Como explicado, nesse exemplo são gerados dois arquivos.

`login.testcase` :

```gherkin
# Generated with ❤ by Concordia
#
# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

#language:pt

importe "login.feature"

@generated
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 1
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com ""  # inválido: não preenchido
    E eu preencho <senha> com "]o}r/H"  # inválido: elemento não existente
    E clico em <ok>  # {OK}
  Então eu devo ver "Senha inválida"  # de <senha>

@generated
@fail
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 2
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com "bob"  # válido: elemento aleatório
    E eu preencho <senha> com ""  # inválido: não preenchido
    E clico em <ok>  # {OK}
  Então eu vejo "Bem-vindo"

@generated
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 3
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com "alice"  # válido: último elemento
    E eu preencho <senha> com "4l1c3pass"  # válido: preenchido
    E clico em <ok>  # {OK}
  Então eu vejo "Bem-vindo"

@generated
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 4
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com "bob"  # válido: preenchido
    E eu preencho <senha> com 123456  # válido: elemento aleatório
    E clico em <ok>  # {OK}
  Então eu vejo "Bem-vindo"

@generated
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 5
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com "{ Y+OiY=)ps@a8K9lI@:jDTGVP8)$a2)6?+x!ctr?4sYMb}nwI|&y8(M<ic|14%\"rcm&lF,&:C3|jq<6I<CxY Kajc1O%Y,<\"|^Ax"  # inválido: elemento não existente
    E eu preencho <senha> com ""  # válido: primeiro elemento
    E clico em <ok>  # {OK}
  Então eu devo ver "Usuário inválido"  # de <usuario>

@generated
@scenario(1)
@variant(1)
Caso de teste: Login com sucesso para credenciais válidas - 6
  Dado que eu estou na "http://localhost/login"  # [Tela de Login]
  Quando eu preencho <usuario> com "bob"  # válido: primeiro elemento
    E eu preencho <senha> com 123456  # válido: último elemento
    E clico em <ok>  # {OK}
  Então eu vejo "Bem-vindo"
```

`test/login.js` :

```javascript
// Generated with ❤ by Concordia
// source: c:\example\login.testcase
//
// THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

Feature("Login");

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 1", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", ""); // (11,5)  inválido: não preenchido
    I.fillField("senha", "]o}r/H"); // (12,7)  inválido: elemento não existente
    I.click("ok"); // (64,7)  {OK}
    I.see("Senha invalida"); // (14,5)  de <senha>
});

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 2", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", "bob"); // (22,5)  válido: elemento aleatório
    I.fillField("senha", ""); // (23,7)  inválido: não preenchido
    I.click("ok"); // (64,7)  {OK}
    I.see("Bem-vindo"); // (65,5)
});

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 3", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", "alice"); // (32,5)  válido: último elemento
    I.fillField("senha", "4l1c3pass"); // (33,7)  válido: preenchido
    I.click("ok"); // (64,7)  {OK}
    I.see("Bem-vindo"); // (65,5)
});

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 4", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", "bob"); // (42,5)  válido: preenchido
    I.fillField("senha", "123456"); // (43,7)  válido: elemento aleatório
    I.click("ok"); // (64,7)  {OK}
    I.see("Bem-vindo"); // (65,5)
});

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 5", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", "{ Y+OiY=ps@a8K9lI@:jDTGVP8$a26?+x!ctr?4sYMb}nwI|&y8M<ic|14%\"rcm&lF,&:C3|jq<6I<CxY Kajc1O%Y,<\"|^Ax"); // (52,5)  inválido: elemento não existente
    I.fillField("senha", ""); // (53,7)  válido: primeiro elemento
    I.click("ok"); // (64,7)  {OK}
    I.see("Usuario invalido"); // (55,5)  de <usuario>
});

Scenario("Login com sucesso | Login com sucesso para credenciais válidas - 6", (I) => {
    I.amOnPage("http://localhost/login"); // (61,5)  [Tela de Login]
    I.fillField("usuario", "bob"); // (62,5)  válido: primeiro elemento
    I.fillField("senha", "123456"); // (63,7)  válido: último elemento
    I.click("ok"); // (64,7)  {OK}
    I.see("Bem-vindo"); // (65,5)
});
```


## Analise os resultados

Se você executou os scripts testes acima, provavelmente todos falharam. Isso ocorreu porque os testes não encontraram uma aplicação web executando em `http://localhost/login` ou porque que a aplicação encontrada lá não satisfez as expectativas.

Se sua aplicação contém uma funcionalidade como a exemplificada, sugerimos que a adapte e então execute os testes. Ao final, Concordia deve apresentar um relatório que pode indicar eventuais falhas, com as respectivas linhas da especificação e dos scripts de teste. Com base nesse relatório, você pode decidir se o motivo do defeito está relacionado à aplicação - isso é, a aplicação não funcionou conforme especificado - ou à especificação - geralmente se a especificação está desatualizada em relação à implementação.

Agora, manter sua especificação atualizada tem um benefício claro: você pode usá-la para gerar testes e descobrir defeitos existentes em sua aplicação.