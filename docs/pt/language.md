# Visão Geral da Linguagem Concordia <!-- omit in toc -->

## Índice  <!-- omit in toc -->

- [Construções da linguagem](#Constru%C3%A7%C3%B5es-da-linguagem)
  - [Comentários](#Coment%C3%A1rios)
  - [Language](#Language)
  - [Importe](#Importe)
  - [Tag](#Tag)
  - [Funcionalidade](#Funcionalidade)
  - [Estado](#Estado)
  - [Cenário](#Cen%C3%A1rio)
  - [Constantes](#Constantes)
  - [Elemento de Interface de Usuário](#Elemento-de-Interface-de-Usu%C3%A1rio)
    - [Propriedade `id`](#Propriedade-id)
    - [Propriedade `tipo`](#Propriedade-tipo)
    - [Propriedade `editável`](#Propriedade-edit%C3%A1vel)
    - [Propriedade `tipo de dado`:](#Propriedade-tipo-de-dado)
    - [Propriedade `valor`](#Propriedade-valor)
    - [Propriedade `valor mínimo`](#Propriedade-valor-m%C3%ADnimo)
    - [Propriedade `valor máximo`](#Propriedade-valor-m%C3%A1ximo)
    - [Propriedade `comprimento mínimo`](#Propriedade-comprimento-m%C3%ADnimo)
    - [Propriedade `comprimento máximo`](#Propriedade-comprimento-m%C3%A1ximo)
    - [Propriedade `formato`](#Propriedade-formato)
    - [Propriedade `obrigatório`](#Propriedade-obrigat%C3%B3rio)
    - [Exemplos de Elementos de IU](#Exemplos-de-Elementos-de-IU)
  - [Tabela](#Tabela)
  - [Banco de Dados](#Banco-de-Dados)
    - [Propriedades](#Propriedades)
    - [Exemplos](#Exemplos)
  - [Variante](#Variante)
  - [Caso de Teste](#Caso-de-Teste)
  - [Eventos de Teste](#Eventos-de-Teste)
- [Literais](#Literais)
  - [Literal de Interface de Usuário](#Literal-de-Interface-de-Usu%C3%A1rio)
  - [Valor](#Valor)
  - [Número](#N%C3%BAmero)
  - [Lista de valores](#Lista-de-valores)
  - [Consulta](#Consulta)
- [Referências para declarações](#Refer%C3%AAncias-para-declara%C3%A7%C3%B5es)
  - [Elementos de Interface de Usuário](#Elementos-de-Interface-de-Usu%C3%A1rio)
    - [Em consultas](#Em-consultas)
  - [Constantes](#Constantes-1)
  - [Tabelas](#Tabelas)
  - [Bancos de Dados](#Bancos-de-Dados)
- [Estados](#Estados)


## Construções da linguagem

### Comentários

```gherkin
# Esse é um comentário

Funcionalidade: Foo # Esse também é um comentário
```

### Language

*Define a linguagem a ser usada no arquivo de especificação atual.*

Observações:
- Declaração local.
- Só uma declaração por arquivo.
- É um especial de comentário.

Exemplo 1:
```gherkin
#language: pt
```

Exemplo 2:
```gherkin
#language: es-ar
```


### Importe

*Importa definições de outro arquivo de funcionalidade.*

Observações:
- Declaração local.
- Permitida mais de uma declaração por arquivo.

Exemplos:
```gherkin
importe "file1.feature"
importe "caminho/to/file2.feature"
```


### Tag

*Adiciona informação a uma construção da linguagem.*

Observações:
- Declaração local.
- Permitida mais de uma declaração por construção da linguagem.

Exemplo 1 - *uma tag por linha*:
```gherkin
@ignore
```

Exemplo 2 - *mais de uma tag por linha*:
```gherkin
@slow @gui @generated
```

Exemplo 3 - *tag com valor numérico*:
```gherkin
@importance( 5 )
```

Exemplo 4 - *tag com texto*:
```
@extends( Nome Completo )
```

Tags reservadas:
- `@scenario( <número> )`: referencia um [Cenário](#cenário).
- `@variant( <número> )`: referencia uma [Variante](#variante).
- `@importance( <número> )`: indica a importância de uma declaração. Quando mais alto o valor, mais alta a importância.
- `@generated`: indica que um Caso de Teste foi gerado.
- `@fail`: indica que um Caso de Teste deve falhar.
- `@global`: define um Elemento de Interface de Usuário como global. *Ainda não disponível na ferramenta.*
- `@ignore`: se aplicada em uma Variante, ela será ignorada para gerar Casos de Teste; se aplicada em um Caso de Teste, ele não produzirá scripts de teste.
- `@generate-only-valid-values`: evita que uma propriedade de um Elemento de IU seja usada para gerar valores considerados inválidos. Útil para uso em campos com máscara de edição, em que o próprio sistema impede que dados inválidos sejam digitados. Por exemplo:
    ```concordia
    Elemento de UI: Ano
      - tipo de dado é inteiro
      @generate-only-valid-values
      - formato é "/^[0-9]{1-3}$/"
      Caso contrário, eu devo ver "Ano deve ser um número."
     ```
    O exemplo acima irá evitar gerar valores de entrada incorretos (*e.g.,*, "A") para testar o formato do Ano.

Reservado para uso futuro:
- `@extends( <nome> )` permite herança de Elementos de Interface de Usuário.
- `@category( <nome> )` especifica uma categoria. Útil para organizar e filtrar a documentação.
- `@issue( <número> )` referencia uma Issue.


### Funcionalidade

*Funcionalidade do sistema.*

Observações:
- Declaração global.
- Somente uma declaração por arquivo.

Exemplo 1:
```gherkin
Funcionalidade: Login de Administrador
```

Exemplo 2:
```gherkin
Funcionalidade: Login de Administrador
  Como um administrador
  Eu gostaria de me autenticar
  Para poder acessar o sistema
```

Exemplo 3:
```gherkin
Funcionalidade: Login de Administrador
  Para poder acessar o sistema
  Como um administrador
  Eu gostaria de me autenticar
```


### Estado

*Estado do sistema.*

Observações:
- Declaração local.
- Somente declarada em passos de `Variante`.
- Se declarada em um passo `Dado`, significa que o estado é uma **pré-condição**.
- Se declarada em um passo `Quando`, significa que o estado é uma **chamada de estado**.
- Se declarada em um passo `Então`, significa que o estado é uma **pós-condição**.

**Pré-condição**:
```gherkin
Dado que eu tenho ~usuário logado~
```

**Chamada de estado** - um produtor do estado será chamado:
```gherkin
Quando eu tenho o estado ~método de pagamento selecionado~
```

**Pós-condição**:
```gherkin
Então eu tenho o estado ~pago~
```


### Cenário

*Usado para descrever um cenário de uso da funcionalidade, do ponto de vista de negócio. Suas sentenças não são usadas para gerar casos de teste.*

Observações:
- Declaração local.
- Permitida mais de uma declaração por Funcionalidade.

Exemplo 1:
```gherkin
Cenário: Login com sucesso
  Dado que inicio o sistema
    e que não estou logado
  Quando informo minhas credenciais
    e confirmo minha entrada
  Então sou capaz de entrar no sistema
```

Exemplo 2:
```gherkin
Cenário: Login sem sucesso
  Dado que inicio o sistema
    e que não estou logado
  Quando informo credenciais inválidas
    e confirmo minha entrada
  Então não sou capaz de entrar no sistema
```


### Constantes

*Bloco de declaração de valores constantes.*

Observações:
- Declaração global.
- Somente uma declaração por arquivo.
- Cada declaração pode definir uma ou mais constantes.
- Espaço de nomes é compartilhado com Tabelas e Banco de Dados.

Exemplo:
```gherkin
Constantes:
  - "PI" é 3.14159
  - "AppName" é "Minha Aplicação"
```


### Elemento de Interface de Usuário

*Elemento de Interface de Usuário.*

Observações:
- Permitida mais de uma declaração por Funcionalidade.
- Declaração local ou global, apesar de a **declaração global ainda não ser suportada** pela ferramenta.
- Declaração global permitida através da tag `@global` - **ainda não suportada**.
- Herança permitida através da tag `@extends`, *e.g.*, `@extends(Outro Elemento de IU)` - **ainda não suportada**.
- Pode ter propriedades.
- Propriedades são precedidas por um traço (`-`).

Propriedades permitidas:
- `id`
- `tipo`, por *default* é `textbox`
- `editável`, por *default* é `true` quando o `tipo` for editável, ou seja, aceitar entrada de dados.
- `tipo de dado`, por *default* é `string`
- `valor`
- `comprimento mínimo`
- `comprimento máximo`
- `valor mínimo`
- `valor máximo`
- `formato`
- `obrigatório`, por *default* é `false`

#### Propriedade `id`
  - Exemplo: `- id é "nome"`
  - O valor *default* é o nome do elemento em *camel case* (primeira letra minúscula) e sem espaços, *e.g.*, `"Algum Nome"` se torna `"algumNome"`
  - Valor deve ser declarado entre aspas (`"`)
  - Suporta a seguinte notação:
    - `"#valor"` denota um `id`
    - `"//valor"` denota um `xpath`
    - `"@valor"` denota um `nome`
    - `"valor"` denota um `css`
    - `"~valor"` denota um `nome mobile`
  - Múltiplos identificadores são denotados por `id em [ "<valor1>", "<valor2>", ... ]` **Ainda não suportada pela ferramenta**
    - Exemplo: `id em [ "nascimento", "~nascimento" ]`

#### Propriedade `tipo`
  - Exemplo: `- tipo é botão`
  - O valor *default* é `caixa de texto`
  - Valores não usam aspas (`"`)
  - Valores permitidos são:
    - `aba` ou `tab`
    - `área de texto` ou `textarea` ou `text area`
    - `arquivo` ou `file input`
    - `botão` ou `button`
	- `caixa de marcação` ou `checkbox` ou `check`
	- `caixa de seleção` ou `select` ou `combo` ou `combobox`
	- `caixa de texto` ou `textbox` ou `input`
	- `cookie`
	- `deslizador` ou `slider`
	- `div`
	- `imagem` ou `image`
	- `item de lista` ou `list item` ou `li`
	- `janela` ou `window`
	- `ligação` ou `link`
	- `lista não ordenada` ou `lista desordenada` ou `unordered list` ou `ul`
    - `lista ordenada` ou `ordered list` ou `ol`
	- `página` ou `page`
	- `parágrafo` ou `paragraph`
	- `radio` ou `radio button`
	- `rótulo` ou `label`
    - `span`
    - `tabela` ou `table`
	- `tela` ou `screen`
    - `texto` ou `text`
    - `título` ou `title`
    - `url` ou `address` ou `ip` ou `site`

#### Propriedade `editável`
  - Exemplo: `- editável é true`
  - Valores permitidos são `true` e `false`
  - Valores não usam aspas (`"`)
  - O valor *default* é `false`, mas assume `true` automaticamente quando *pelo menos* umas das seguintes condições ocorrer:
    - Um `tipo` considerado *editável* for usado, isso é:
      - `checkbox`
      - `fileInput`
      - `select`
      - `table`
      - `textbox`
      - `textarea`
    - Uma das seguintes propriedades for definida:
      - `comprimento mínimo`
      - `comprimento máximo`
      - `valor mínimo`
      - `valor máximo`
      - `valor`

#### Propriedade `tipo de dado`:
  - Exemplo: `- tipo de dado é double`
  - Valores não usam aspas (`"`)
  - Tipos permitidos são:
    - `string`
    - `integer`
    - `double`
    - `date`
    - `time`
    - `datetime`
  - Precisão de valores `double` são inferidas a partir da declaração, *e.g.*, `12.50` faz Concordia saber que a precisão é `2`

#### Propriedade `valor`
  - Valores aceitos:
    - [Valor](#valor)
    - [Número](#número)
    - [Constante](#constantes)
    - [Lista](#lista-de-valores)
    - [Consulta](#consulta)
    - Referência para outro Elemento de IU
  - Exemplos:
    - `- valor é "olá"`
    - `- valor é 5`
    - `- valor é [PI]`
    - `- valor está em [ "Masculino", "Feminino", "Outro" ]`
    - `- valor vem da consulta "SELECT ..."`
    - `- valor é igual a {Outro Elemento de IU}`
  - Aceita casos de negação. Exemplos:
    - `- valor não está em [ 10, 20, 30 ]`
    - `- valor não está em "SELECT ..."`
    - `- valor não é igual a {Outro Elemento de IU}`

#### Propriedade `valor mínimo`
  - Valores aceitos:
    - [Número](#número)
    - [Constante](#constantes)
    - [Lista de números](#lista-de-valores)
    - [Consulta](#consulta)
    - Referência para outro Elemento de IU
  - Exemplos:
    - `- valor mínimo é 5`
    - `- valor mínimo é [PI]`
    - `- valor mínimo está em [ 5, 10, 20 ]`
    - `- valor mínimo vem da consulta "SELECT ..."`
    - `- valor mínimo é igual a {Outro Elemento de IU}`

#### Propriedade `valor máximo`
  - Mesma sintaxe que `comprimento mínimo`
  - Exemplos:
    - `- valor máximo é 5`
    - `- valor máximo é [PI]`
    - `- valor máximo está em [ 5, 10, 20 ]`
    - `- valor máximo vem da consulta "SELECT ..."`
    - `- valor máximo é igual a {Outro Elemento de IU}`


#### Propriedade `comprimento mínimo`
  - Mesma sintaxe que `valor mínimo`
  - Exemplos:
    - `- comprimento mínimo é 5`
    - `- comprimento mínimo é [MIN]`
    - `- comprimento mínimo está em [ 5, 10, 20 ]`
    - `- comprimento mínimo vem da consulta "SELECT ..."`
    - `- comprimento mínimo  é igual a {Outro Elemento de IU}`

#### Propriedade `comprimento máximo`
  - Mesma sintaxe que `comprimento mínimo`
  - Exemplos:
    - `- comprimento máximo é 50`
    - `- comprimento máximo é [MAX]`
    - `- comprimento máximo está em [ 5, 10, 20 ]`
    - `- comprimento máximo vem da consulta "SELECT ..."`
    - `- comprimento máximo é igual a {Outro Elemento de IU}`


#### Propriedade `formato`
  - Valores aceitos:
    - [Valor](#valor)
    - [Constant](#constantes)
  - Deve ser uma [Expressão Regular](https://pt.wikipedia.org/wiki/Express%C3%A3o_regular) válida
  - Exemplos:
    - `- formato é "/[A-Za-z ._-]{2,50}/"`
    - `- formato é "/^[0-9]{2}\.[0-9]{3}\-[0-9]{3}$/"`
    - `- formato é [Alguma Constante com Expressão Regular]`

#### Propriedade `obrigatório`
  - Valores aceitos são `verdadeiro` ou `falso` (e também `true` ou `false`)
  - Quando não declarada, a propriedade assume o valor `falso` (ou seja, não obrigatório)
  - O valor `verdadeiro` é opcional. Por exemplo, a seguinte declaração é aceita como `verdadeiro`:
    - `- obrigatório`
  - Exemplos:
    - `- obrigatório`
    - `- obrigatório é verdadeiro`
    - `- obrigatório é falso`


#### Exemplos de Elementos de IU

Exemplo 1:
```gherkin
Elemento de IU: Usuário
  - id é "#usuario"
  - comprimento mínimo é 2
    Caso contrário eu devo ver [msg_comprimento_min]
  - comprimento máximo é 30
  - valor está na consulta "SELECT usuario FROM [MeuBD].`usuarios`"
    Caso contrário eu devo ver [msg_comprimento_max]

Elemento de IU: Entrar
  - tipo é button
```

Exemplo 2:
```gherkin
Elemento de IU: Profissão
  - tipo é select
  - valor está na consulta "SELECT nome FROM [Profissões]"

Elemento de IU: Salário
  - tipo de dado é double
  - valor mínimo está na consulta "SELECT salario_min FROM [Profissões] WHERE nome = {Profissão}"
```

Exemplo 3:
```gherkin
Elemento de IU: CEP
  - formato é "/^[0-9]{2}\.[0-9]{3}\-\.[0-9]{3}$/"
```


### Tabela

*Declara uma tabela de dados para ser usada por Elementos de IU.*

Observações:
- Declaração global.
- Espaço de nomes é compartilhado com Constantes e Banco de Dados.
- Permitida mais de uma declaração por arquivo.
- Tabelas são carregadas para memória e podem ser consultadas via SQL.

Exemplo 1:
```
Tabela: Usuarios
  | usuario | senha   |
  | Bob     | bobp4ss |
  | Joey    | joeypwd |
```


### Banco de Dados

*Declara uma referência para um Banco de Dados, com seus parâmetros de conexão.*

Observações:
- Declaração global.
- Espaço de nomes é compartilhado com Constantes e Tabelas.
- Permitida mais de uma declaração por arquivo.
- Valores declarados nas propriedades devem conter aspas (`"`).

#### Propriedades

| Propriedade  | Descrição | Obrigatória |
| ------------ | --------- | ----------- |
| `tipo`       | Tipo do banco de dados. Veja os valores suportados abaixo. | Sim |
| `hospedeiro` | Uma URL que indica o local onde o banco de dados está hospedado. | Varia |
| `porta`      | Porta de comunicação de rede utilizada para conectar ao banco de dados. Caso não definida, se tentará usar a porta padrão do banco de dados, de acordo com a propriedade `tipo`.| Não |
| `nome`       | Nome do banco de dados. Geralmente necessário quando o existe um servidor de banco de dados, cujo local é indicado na propriedade `hospedeiro`, e o banco de dados é acessível pelo nome. | Varia |
| `caminho`    | Caminho do banco de dados. Usado quando seu acesso ocorre pelo sistema de arquivos, como nos tipos `csv`, `ini`, `json`, `sqlite` e `xlsx`. | Varia |
| `usuario`    | Usuário para conexão com o banco de dados. Caso não for definido, se tentará usar o usuário padrão do banco de dados, de acordo com a propriedade `tipo`. | Não |
| `senha`      | Senha para conexão com o banco de dados. Caso não for definida, se tentará usar a senha padrão do banco de dados, de acordo com a propriedade `tipo`. | Não |
| `opções`     | Opções de conexão específicas do banco de dados. | Não |

Também são suportadas as propriedades equivalentes [em inglês](../en/language.md#database).


Valores atualmente suportados para `tipo` são:

| Valor        | Banco de Dados  | Comando de Instalação* | Observação |
| ------------ | --------------- | ---------------------- | ---------- |
| `"adodb"`    | [MS Access](https://pt.wikipedia.org/wiki/Microsoft_Access) e [MS SQL Server](https://en.wikipedia.org/wiki/Microsoft_SQL_Server) através de [ActiveX Data Objects](https://en.wikipedia.org/wiki/ActiveX_Data_Objects) | `npm install database-js-adodb` | *Somente para MS Windows* |
| `"csv"`      | [Arquivos CSV](https://en.wikipedia.org/wiki/Comma-separated_values) | `npm install database-js-csv` | |
| `"firebase"` | [Firebase](https://firebase.google.com) | `npm install database-js-firebase` | |
| `"ini"`      | [Arquivos INI](https://en.wikipedia.org/wiki/INI_file) |`npm install database-js-ini` | |
| `"json"`     | [Arquivos JSON](https://en.wikipedia.org/wiki/JSON) | `npm install database-js-json` | Já instalado por padrão |
| `"mysql"`    | [MySQL](https://www.mysql.com/) | `npm install database-js-mysql` | |
| `"mssql"`    | [MS SQL Server](https://www.microsoft.com/en-us/sql-server) | `npm install database-js-mssql` | |
| `"postgres"` | [PostgreSQL](https://www.postgresql.org/) | `npm install database-js-postgres` | |
| `"sqlite"`   | [SQLite](https://www.sqlite.org/) | `npm install database-js-sqlite` | |
| `"xlsx"`     | [Planilhas Excel](https://en.wikipedia.org/wiki/Microsoft_Excel) | `npm install database-js-xlsx`  | |

**Observações** (*)
- Para conectar e manipular bancos de dados durante os testes, é preciso instalar os pacotes NPM correspondentes.
- Acesse o diretório raiz de sua aplicação e digite o *Comando de Instalação* correspondente (ver acima).


#### Exemplos

Exemplo 1:
```
Banco de Dados: Meu BD
  - tipo é "mysql"
  - hospedeiro é "http://127.0.0.1"
  - nome é "mydb"
  - usuario é "admin"
  - senha é "p4sss"
```

Exemplo 2:
```
Banco de Dados: Outro BD
  - tipo é "json"
  - caminho é "C:\caminho\para\db.json"
```


### Variante

*Permite expressar uma expectativa de interação com o sistema para realizar um Cenário. Serve como modelo (template) para gerar Casos de Teste.*

Observações:
- Declaração local.
- Pertence a um Cenário.
- Deve ser declarado após um Cenário.

Exemplo:
```gherkin
Variante: Login com sucesso
  Dado que estou na página [Página de Login]
  Quando eu informo o {Usuario}
    e  eu informo a {Senha}
    e eu clico em {Entrar}
  Então eu tenho o estado ~usuário logado~
    e eu vejo o texto [texto de boas vindas]
    e eu vejo a url da [Página Principal]
```

Veja também: [Exemplos de Ações](actions.md)


### Caso de Teste

*Caso de Teste, produzido para uma Variante*

Observações:
- Declaração local.
- Pertence a uma `Variante`.
- Pode ser declarada em um arquivo `.testcase` (*recomendado*).
- Deve ter anotação `@scenario( <índice> )` que referencie seu Cenário pelo índice, começando em 1.
- Deve ter anotação `@variant( <índice> )` que referencie sua Variante pelo índice, começando em 1.
- **Não permite referências como `Elemento de IU`, `Constantes`, e `Estados`**

Gerado automaticamente a partir de:
1. [Variante](#variante)
2. [Elemento de IU](#elemento-de-interface-de-usuário)
3. [Constantes](#constante)
4. [Estados](#estado)

Um Caso de Teste gerado irá:
- Receber o nome da `Variante`, mais um número;
- Receber a tag `@generated`;
- Receber a tag `@scenario` para se referir ao seu `Cenário`;
- Receber a tag `@variant` para se referir à sua `Variante`;
- Substituir **pré-condições** ([estados](#estado)), em passos do tipo `Dado`, pelos passos da  `Variante` capaz de produzir esse estado;
- Substituir **chamadas de estado** ([estados](#estado)), em passos do tipo `Quando`, pelos passos da `Variante` capaz de produzir esse estado;
- Substituir **pós-condições** ([estados](#estado)), em passos do tipo `Então`, por passos definidos em sentenças `Caso contrário` de [Elementos de IU](#elemento-de-interface-de-usuário), caso seja gerado um valor de teste considerado inválido, segundo as regras desse mesmo [Elemento de IU](#elemento-de-interface-de-usuário). Se o valor for considerado inválido e não houver definição de passos do tipo `Caso contrário`, o `Caso de Teste` receberá a tag `@fail` para indicar que ele não deve se comportar como descrito nos passos `Então` atuais. Por exemplo:
  - Suponha que há um `Elemento de IU` que define uma regra `valor mínimo é 10` e `Caso contrário eu devo ver "Valor mínimo é 10"`. Se o gerador de dados de teste fornecer o valor `9` (ou qualquer outro abaixo de `10`), que seria considerado inválido, os passos `Então` do `Caso de Teste` seriam substituídos pelos passos de `Caso contrário`, ficando `Então eu devo ver "Valor mínimo é 10"`.
  - Se não houver definição `Caso contrário` no `Elemento de IU`, não é esperado que o `Caso de Teste` se comporte da mesma forma, já que o valor é considerado inválido. Logo, os passos `Então` serão mantidos, mas a anotação `@fail` será adicionada ao `Caso de Teste`, para indicar que é esperado que ele se comporte diferente e, portanto, falhe.

- Substituir todas as `Constantes` por seus valores;
- Substituir todas as referências para [Elementos de IU](#elemento-de-interface-de-usuário) por seus [Literais de IU](#literais-de-iu), isso é, seus `id`s;
- Manter quaisquer [Literais de IU](#literais-de-iu) declarados;
- Gerar valores aleatórios para [Literais de IU](#literais-de-iu) sem valor;
- Manter valores ou números declarados;
- Gerar valores para [Elementos de IU](#elemento-de-interface-de-usuário) de acordo com suas propriedades e os valores aplicáveis conforme os [casos de teste](test-cases.md).

Exemplo:
```gherkin
@generated
@scenario( 1 )
@variant( 1 )
Test Case: Login com sucesso - 1
  Dado que estou na página "/login"
  Quando eu preencho <#usuario> com "Bob"
    e eu preencho <#senha> com "bobp4ss"
    e eu clico em "Entrar"
  Então eu vejo "Bem-vindo(a)"
    e eu vejo o botão <#logout>
```

Veja [Exemplos de Ações](actions.md).


### Eventos de Teste

*Declara eventos antes ou após Casos de Teste ou Funcionalidades. Comandos do console, scripts SQL ou operações com arquivos podem ser executadas quando esses eventos ocorrerem. Geralmente eles visarão preparar ou ajustar o ambiente, de acordo com os testes.*

Observações:
- Declaração local.
- Somente uma declaração por Funcionalidade.

Eles são:
- `Antes de cada Cenário`: ocorre antes de cada cenário
- `Depois de cada Cenário`: ocorre depois de cada cenário
- `Antes da Funcionalidade`: ocorre antes de uma funcionalidade
- `Depois da Funcionalidade`: ocorre depois de uma funcionalidade
- `Antes de Todas`: ocorre antes de todas as funcionalidades
- `Depois de Todas`: ocorre depois de todas as funcionalidades

Esses eventos suportam três tipos de comandos:

1. **Scripts SQL**: executa um script em um Banco de Dados declarado. Veja as ações [connect](actions.md#connect), [disconnect](actions.md#disconnect) e [run](actions.md#run).

2. **Comando de console**: executa um comando no console e aguarda seu término.

3. **Comando de arquivo**: executa uma operação em um arquivo. (AINDA NÃO SUPORTADO)

Eventos de Teste para Funcionalidade e Cenário também suportam interações com a interface de usuário, como aquelas comumente usadas em Variantes.

Comandos de Console e SQL devem ser declarados entre apóstrofos (`'`), também conhecidos como *aspas simples*.

Exemplo 1:
```gherkin
Antes da Funcionalidade:
  Quando eu conecto ao banco de dados [Meu BD]
```

Exemplo 2:
```gherkin
Depois da Funcionalidade:
  Quando eu executo o comando 'rmdir some-folder'
    e executo o script 'DELETE FROM [Meu BD].usuarios'
    e eu desconecto do banco de dados [Meu BD]
```

Exemplo 3:
```gherkin
Antes de cada Cenário:
  Quando eu executo o script 'DELETE FROM [Meu BD].`usuarios`'
    e executo o script 'INSERT INTO [Meu BD].`usuarios` ( `login`, `senha` ) VALUES ( "Clark", "Kent" ), ( "Bruce", "Wayne" )'
```

Exemplo 4:
```gherkin
Depois de cada Cenário:
  Quando eu crio o arquivo 'path/to/foo.json' com `{ "name": "John", "surname": "Doe" }`
    e eu vejo que o arquivo 'path/to/bar.xml' contém `<person><name>John</name><surname>John</surname></person>`
```

Alguns plugins podem não suportar certos eventos:

```
+--------------------------+-----------------------------------------+
| PLUGIN                   |        Antes de / Depois de             |
|                          | Todos  | Funcionalidade | Cada Cenário  |
+--------------------------+--------+----------------+---------------+
| CodeceptJS + WebDriverIO | não    |  sim           |  sim          |
| CodeceptJS + Appium      | não    |  sim           |  sim          |
+--------------------------+--------+----------------+---------------+
```

## Literais

### Literal de Interface de Usuário

> Sempre entre `<` e `>`

Um Literal de IU é uma identificação de um Elemento de IU. Essa identificação será usada pelo script de teste para localizar o elemento na aplicação durante a execução os testes. Por exemplo, em uma aplicação web, um campo de entrada de dados pode ser identificado pelo teste de diferentes maneiras. Em uma declaração HTML como `<input id="foo" >`, pode-se usar `#foo` como Literal de IU:

```gherkin
Quando eu preencho <#foo> com "Bob"
```

Formatos aceitos:
- `<#valor>` denota um `id`
- `<@valor>` denota uma busca pela propriedade `name`
- `<valor>` denota uma busca por `css`
- `<//valor>` denota um `xpath`
- `<~valor>` denota um `nome mobile`

Assegure que localizadores CSS estejam escapados apropriadamente. Por exemplo:

```gherkin
Então eu vejo <ul \> li \> div \> a>
```
localiza `ul > li > div > a`.

### Valor

> Sempre entre aspas (`"`).

No exemplo a seguir, `Bob` é um valor:
```gherkin
Quando eu preencho <#nome> com "Bob"
```

### Número

> Sem aspas

No exemplo a seguir, `500` é um valor:
```gherkin
Quando eu preencho <#quantidade> com 500
```

No exemplo a seguir, `12.50` é um valor:
```gherkin
Quando eu preencho <#preco> com 12.50
```

### Lista de valores

> Sempre entre `[` e `]`

Atualmente aceito somente por [Elementos de IUs](#elemento-de-interface-de-usuário)

Exemplo 1:

```gherkin
Elemento de IU: Sexo
  - valor vem de [ "Masculino", "Feminino", "Outro" ]
```
Exemplo 2:

```gherkin
Elemento de IU: Idade
  - valor vem de [ 12, 16, 18, 21, 65 ]
```

Exemplo 3:

```gherkin
Elemento de IU: Preço
  - valor vem de [ 12.50, 20.00 ]
```

Exemplo 4:

```gherkin
Elemento de IU: Exemplo
  - valor vem de [ 12, 12.50, "Masculino" ]
```

### Consulta

> Sempre entre aspas (`"`) e começando com `SELECT`

Atualmente aceito somente por [Elementos de IU](#elemento-de-interface-de-usuário).

Exemplo:
```gherkin
Elemento de IU: Produto
  - valor vem de "SELECT nome FROM ..."
```

**Observação**: Para forçar uma **consulta** ser um **valor**, deve ser usado um sinal de exclamação (`!`) logo antes. *E.g.*, `!"SELECT * FROM foo"`.

Observações sobre consultas:

1. Deve usar crase para se referir a nomes com espaços, como em ANSI-SQL. *E.g.*, \`minha tabela\`

2. Deve usar apóstrofos para denotar valores não numéricos. Exemplo:
   ```sql
   SELECT * FROM usuarios WHERE login = 'bob'
   ```

3. Pode referenciar uma [Tabela](#tabela), um [Banco de Dados](#banco-de-dados), ou uma [Constante](#constante)
   através do formato `[algum nome]`, onde o conteúdo não contenha um cifrão (`$`).
   Um cifrão pode ser usado para referenciar nomes de tabela Excel, em vez de nomes declarados com Concordia.

   Exemplo 1: referencia uma Tabela e uma Constante
   ```sql
   SELECT coluna1 FROM [Minha Tabela] WHERE coluna2 = [Minha Constante]
   ```

   Exemplo 2: referencia um Banco de Dados e uma Constante
   ```sql
   SELECT coluna1 FROM [Meu BD].`Tabela` WHERE coluna2 = [Minha Constante]
   ```

   Exemplo 3: nome que **não é uma referência**, mas uma tabela Excel
   ```sql
   SELECT coluna1 FROM [Alguma Tabela Excel$] WHERE coluna2 = [Minha Constante]
   ```

4. Pode referenciar um Elemento de IU usando o formato `{Nome da Funcionalidade:Nome do Elemento de IU}`,
em que `Nome da Funcionalidade:` é opcional. Se o nome da funcionalidade não for informado, é assumido
que o Elemento de IU pertence à funcionalidade atual.
   Exemplo:
   ```sql
   SELECT senha FROM [Usuarios] WHERE usuario = {Login:Usuario}
   ```

5. Pode referenciar um Elemento de IU da Funcionalidade atual usando o formato `{Nome do Elemento de IU}`.
   Exemplo:
   ```sql
   SELECT senha FROM [Usuarios] WHERE usuario = {Usuario}
   ```


## Referências para declarações

### Elementos de Interface de Usuário

> Sempre entre `{` e `}`

No exemplo a seguir, `{Nome}` é a uma referência para um Elemento de IU chamado `Nome`:
```gherkin
Quando eu preencho {Nome} com "bob"
```

O nome da funcionalidade é **opcional** quando declarada na mesma funcionalidade e **obrigatória** caso contrário.

Referências a uma Funcionalidade deve ser separada de um Elemento de IU por dois pontos (`:`). Exemplo:
```gherkin
Quando eu preencho {Adicionar Funcionário:Profissao} com "Dentista"
```

#### Em consultas

No exemplo a seguir, `{Profissão}` é uma referência para um Elemento de IU:
```gherkin
Funcionalidade: Adicionar Funcionário

...

Elemento de IU: Profissão
  - valor vem da consulta "SELECT nome FROM [Profissoes]"

Elemento de IU: Salário
  - valor mínimo vem de "SELECT salario_min FROM [Profissoes] WHERE nome = {Profissão}"
```

Se desejado, essa referência poderia ser declarada como `{Adicionar Funcionário:Profissão}`.


### Constantes

> Sempre entre `[` e `]`

No exemplo a seguir, `[PI]` é uma referência para uma Constante:
```gherkin
...
  Quando eu preencho <#primeiroNumero> com [PI]
  ...

Constantes:
  - "PI" é 3.14159
```

**Observação**: `Constantes`, `Tabelas` e `Bancos de Dados` são declarações globais e compartilham o mesmo espaço de nomes. Logo, tenha atenção com colisões de nomes.

### Tabelas

> Sempre entre `[` e `]`

Referências para tabelas são somente permitidas dentro de [Consultas](#consultas).

No exemplo a seguir, `[Profissoes]` é uma referência para uma tabela:
```gherkin
Elemento de IU: Profissão
  - valor vem da consulta "SELECT nome FROM [Profissoes]"

Tabela: Profissoes
  | nome     |
  | Contador |
  | Dentista |
  | Mecânico |
```

**Observação**: `Constantes`, `Tabelas` e `Bancos de Dados` são declarações globais e compartilham o mesmo espaço de nomes. Logo, tenha atenção com colisões de nomes.

### Bancos de Dados

> Sempre entre `[` e `]`

Referências para bancos de dados são somente permitidas dentro de [Consultas](#consultas).

No exemplo a seguir, `[Profissoes]` é uma referência para um banco de dados:
```gherkin
Elemento de IU: Profissão
  - valor vem da consulta "SELECT nome FROM [Profissoes]"

Banco de Dados: Profissoes
  - tipo é "json"
  - caminho é "/caminho/para/profissoes.json"
```

Nesse outro exemplo, `[Meu BD de Teste]` é uma referência para um outro banco de dados.

```gherkin
Elemento de IU: Profissão
  - valor vem da consulta "SELECT nome FROM [Meu BD de Teste].`profissao`"

Banco de Dados: Meu BD de Teste
  - tipo é "mysql"
  - nome é "mydb"
  - usuario é "testador"
  - senha é "123testando"
```

**Observação**: `Constantes`, `Tabelas` e `Bancos de Dados` são declarações globais e compartilham o mesmo espaço de nomes. Logo, tenha atenção com colisões de nomes.

## Estados

> Sempre entre dois sinais de til (`~`)

Exemplo:
```gherkin
  Dado que tenho ~usuário logado~
```
