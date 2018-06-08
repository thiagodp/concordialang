# Ações

> Exemplos de sentenças de Variantes com ações

*Um exemplo pode demonstrar diferentes variações da mesma ação.*

## `amOn`

```gherkin
Dado que estou em "http://concordialang.org"
```

## `append`

```gherkin
Quando eu adiciono "Conteúdo" em {Foo}
  e adiciono 100 em {Bar}
  e adiciono "Conteúdo" em <#zoo>
  e adiciono 100 em <#xoo>
```

## `attachFile`

```gherkin
Quando eu anexo o arquivo "/caminho/ate/arquivo" em {Foo}
  e anexo "/caminho/ate/arquivo" em <#bar>
```

## `check`

```gherkin
Quando eu marco {Foo}
  e marco <#bar>
```

## `clear`

```gherkin
Quando eu apago o cookie "foo"
  e quando eu limpo o cookie "bar"
```
```gherkin
Quando eu limpo {Foo}
  e limpo <#bar>
```

## `click`

```gherkin
Quando eu clico em {Foo}
  e clico em <#bar>
```

## `close`

```gherkin
Quando eu fecho a aba atual
```
```gherkin
Quando eu fecho as outras abas
```
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu fecho o app
  e quando eu fecho a aplicação
```

## `connect`

### connect + database
```
Quando eu conecto ao banco de dados [TestDB]
```

## `disconnect`

### disconnect + database
```
Quando eu desconecto do banco de dados [TestDB]
```

## `doubleClick`

```gherkin
Quando eu clico duas vezes em {Foo}
  e dou um duplo clique em <#bar>
```

## `drag`

```gherkin
Quando eu arrasto {Foo} para <#bar>
```

## `fill`

```gherkin
Quando eu preecho {Foo}
  e eu informo {Foo}
  e eu entro com {Foo}
  e eu preencho {Foo} com "foo"
  e eu preencho {Foo} com 100
  e eu preencho <#bar> com "bar"
  e eu precho <#bar> com 3.1415
  e eu digito "bar" em {Foo}
  e eu informo "foo" em <#bar>
```

## `hide`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu oculto o teclado
```

## `install`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu instalo o app "com.example.android.myapp"
  e quando eu instalo a aplicação "com.example.android.myapp"
```

## `maximize`

```gherkin
Quando eu maximizo a janela
```

## `open`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu abro o painel de notificações
```

## `press`

```gherkin
Quando eu pressiono "Enter"
  e pressiono "Ctrl", "Alt", "Del"
```

## `pull`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu extraio "/storage/emulated/0/DCIM/logo.png" para "some/path"
```

## `refresh`

```gherkin
Quando eu atualizo a página
```

## `resize`

```gherkin
Quando eu redimensiono a janela para 600, 400
```

## `rightClick`

```gherkin
Quando eu clico com o botão direito em {Foo}
  e clico com o botão direito em <#bar>
```

## `run`

### run + script

```gherkin
Quando eu executo o script 'INSERT INTO [MyDB].product ( name, price ) VALUES ( "Soda", 1.50 )'
  e eu executo o script 'INSERT INTO [MyDB].Users( UserName, UserSex, UserAge ) VALUES ( "Newton", "Male", 25 )'
  e eu executo o script 'INSERT INTO [MyDB].`my long table name`( 'long column`, `another long column`) VALUES ("Foo", 10)'
```

```gherkin
Quando eu executo o script 'UPDATE [MyDB].Users SET UserAge=26, UserStatus="online" WHERE UserName="Newton"'
  e eu executo o script 'UPDATE [MyDB].`my long table name` SET `long column` = "Bar" WHERE `another long column` = 70'
```

```gherkin
Quando eu executo o script 'DELETE FROM [MyDB].Users WHERE UserName="Newton"'
  e eu executo o script 'DELETE FROM [MyDB].`my long table name` WHERE `another long column` = 70'
```

👉 *Script devem ser declarados entre aspas simples (`'`) e devem ficar em uma única linha*

👉 *Sempre inclua a referência para o banco de dados*

👉 *Comandos SQL podem depender do banco de dados utilizado*

Concordia usa [database-js](https://github.com/mlaanderson/database-js) para acessar bancos de dados e arquivos através de uma interface SQL. A sintaxe SQL suportada pode variar de um banco de dados para outro. Em caso de problemas, consulte a [documentação do driver correspondente](https://github.com/mlaanderson/database-js#drivers).

#### MySQL, PostgreSQL e ADO

Sintaxe normal, como a exemplificada anteriormente. O acesso através de ADO atualmente funciona somente em Windows.

#### JSON e CSV

- INSERT aceita somente objetos ou arrays JSON como valores
  - Exemplo:
    ```gherkin
    Quando eu executo o script 'INSERT INTO [MyDB] VALUES { "name": "Mary", "surname": "Jane", "age": 21 }'
    ```

#### Excel e Firebase

Sintaxe similar à de [JSON e CSV](json-e-csv). Contudo, tem limitações, como apontado em [sua documentação](https://github.com/mlaanderson/database-js-firebase) :

> *Comandos SQL estão limitados a SELECT, UPDATE, INSERT e DELETE. WHERE funciona bem. JOINs não são permitidos. GROUP BY não é suportado. LIMIT e OFFSET são combinados em uma única sintaxe: LIMIT [offset,]number*

#### INI

- INSERT
  - Ainda não suportado por [database-js-ini](https://github.com/mlaanderson/database-js-ini)

- DELETE
  - Ainda não suportado por [database-js-ini](https://github.com/mlaanderson/database-js-ini)

- UPDATE
  - Exemplo:
    ```gherkin
    Quando eu executo o script 'UPDATE [MyDB] SET age = 22 WHERE name = "Mary"'
    ```

#### SQLite

Atualmente [database-js-sqlite](https://github.com/mlaanderson/database-js-sqlite) usa [sql.js](https://github.com/kripken/sql.js) que **não persiste mudanças feitas no banco de dados**.


## `saveScreenshot`

```gherkin
Quando salvo uma foto pra "foo.png"
  e eu bato uma foto da tela para "bar.png"
```

## `see`

```gherkin
Então eu não vejo "Foo Bar"
```

```gherkin
Então eu não vejo que {Foo} está marcado
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o app "com.example.android.myapp" está instalado
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o app "com.example.android.myapp" não está instalado
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a atividade atual é ".HomeScreenActivity"
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o dispositivo está bloqueado
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o dispositivo está desbloqueado
```

```gherkin
Então eu não vejo o cookie "foo"
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a orientação é paisagem
```

A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a orientação é retrato
```

```gherkin
Então eu não vejo a url "/foo"
```

```gherkin
Então eu não vejo {Foo} com "foo"
  e eu não vejo <#bar> com "bar"
```

```gherkin
Então eu não vejo a "foo" no título
```

```gherkin
Então eu não vejo {Foo}
  e eu não vejo <#bar>
```

```gherkin
Então eu vejo "Foo Bar"
```

```gherkin
Então eu vejo que {Foo} está marcado
```

```gherkin
Então eu vejo o cookie "foo"
```

```gherkin
Então eu vejo a url "/foo"
```

```gherkin
Então eu vejo {Foo} com "foo"
  e eu vejo <#bar> com "bar"
```

```gherkin
Então eu vejo a "foo" no título
```

```gherkin
Então eu vejo {Foo}
  e eu vejo <#bar>
```

## `select`

```gherkin
Então eu seleciono "foo" em {Foo}
  e seleciono "bar" em <#bar>
```

## `shake`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu balanço o dispositivo
  e eu tremo o celular
  e eu sacudo o tablet
```

## `swipe`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para 100, 200
```

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para baixo
```
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para a esquerda
```

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para direita
```

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para cima
```

## `switch`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu troco para nativo
```

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu troco para web
```

## `tap`

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu toco em <~ok>
  e eu toco em {Confirmar}
```

## `uncheck`

```gherkin
Então eu desmarco {Foo}
  e eu desmarco <#bar>
```

## `wait`

```gherkin
Então eu espero 2 segundos
  e eu aguardo 3 segundos
```

```gherkin
Então eu espero por {Foo}
  e eu espero <#bar> por 2 segundos
```

```gherkin
Então eu espero {Foo} ficar habilitado
  e eu espero por <#bar> ficar habilitado
```

```gherkin
Então eu espero {Foo} ficar invisível
  e eu espero por <#bar> ficar invisível
```

```gherkin
Então eu espero {Foo} ficar visível
  e eu espero por <#bar> ficar visível
```

```gherkin
Então eu espero pelo texto "Foo"
```

```gherkin
Então eu espero pela url "/foo"
  e espero pela url "/bar" por 3 segundos
```
