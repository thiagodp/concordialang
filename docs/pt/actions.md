# Ações

*Exemplos de sentenças de Variantes com ações. Um exemplo pode demonstrar variações de uma mesma ação.*

## O que você deseja fazer?

> Aqui estão *algumas* opções, não todas.

- [Abrir painel de notificações de um dispositivo](#open)
- [Aceitar uma mensagem do navegador ou do app](#accept)
- [Adicionar um valor em um elemento](#append)
- [Anexar um arquivo](#attachfile)
- [Apagar um cookie](#clear--cookie)
- [Arrastar e soltar algo para um determinado elemento](#drag)
- [Atualizar a página atual](#refresh)
- [Balançar ou fazer um dispositivo tremer](#shake)
- [Cancelar uma mensagem do navegador ou do app](#cancel)
- [Clicar em algo na tela](#click)
- [Clicar com o botão direito em algo](#rightclick)
- [Conectar a um banco de dados](#connect)
- [Dar um duplo clique em algo](#doubleclick)
- [Desconectar de um banco de dados](#disconnect)
- [Desmarcar um elemento](#uncheck)
- [Deslizar a tela em um dispositivo](#swipe)
- [Deslizar um elemento, na tela em um dispositivo](#swipe)
- [Deslizar um elemento para outro, na tela em um dispositivo](#swipe--from--to)
- [Desinstalar um app pelo seu nome interno](#remove)
- [Esperar por um elemento](#wait--target)
- [Esperar por um elemento estar dentro de outro](#wait--option-value--value--target)
- [Esperar por um texto](#wait--text--value)
- [Esperar por uma URL](#wait--url--value)
- [Esperar um tempo](#wait)
- [Esperar um elemento ficar habilitado](#wait--target--enabled)
- [Esperar um elemento ficar invisível](#wait--target--invisible)
- [Esperar um elemento ficar visível](#wait--target--visible)
- [Executar um comando no console/terminal ou um script de banco de dados (comando SQL)](#run)
- [Extrair um recurso de um dispositivo para um determinado local](#pull)
- [Fechar uma aba ou janela do navegador, ou um app](#close)
- [Indicar uma página ou tela do app em que se espera estar](#amon)
- [Indicar que algo pode ou não ser visto](#see)
- [Instalar um app](#install)
- [Limpar o conteúdo de um campo de entrada](#clear)
- [Marcar uma caixa de marcação (checkbox)](#check)
- [Maximizar uma janela ou o navegador](#maximize)
- [Mover o cursor do mouse para um local ou elemento](#move)
- [Ocultar o teclado do dispositivo](#hide)
- [Preencher um campo](#fill)
- [Pressionar uma tecla ou uma combinação de teclas](#press)
- [Redimensionar uma janela](#resize)
- [Rolar a tela até um certo elemento](#scrollto)
- [Selecionar o valor de um elemento](#select)
- [Tirar uma foto da tela](#savescreenshot)
- [Tocar em um elemento da tela de um dispositivo](#tap)
- [Trocar o modo de um dispositivo de nativo para web ou vice-versa](#switch)
- [Verificar se a orientação do dispositivo é paisagem](#see--orientation--landscape)
- [Verificar se a orientação do dispositivo é retrato](#see--orientation--portrait)
- [Verificar seu um app está instalado](#see--app--value--installed)
- [Verificar seu uma atividade o app está ativa](#see--currentactivity--value)
- [Verificar se elemento está visível](#see--target)
- [Verificar se elemento está habilitado](#see--target--enabled)
- [Verificar se elemento está marcado](#see--target--checked)
- [Verificar se um elemento possui um atributo](#see--target--attribute--value)
- [Verificar se um elemento possui uma classe](#see--target--class--value)
- [Verificar se um elemento possui um estilo](#see--target--style--value)
- [Verificar a url do navegador](#see--url--value)
- [Verificar se o título da janela/aba do navegador tem um certo valor](#see--value--inside--title)
- [Verificar se um dispositivo está com a tela bloqueada](#see--device--locked)
- [Verificar se um valor está visível](#see--text--value-or-number)
- [Verificar se um valor está dentro de um elemento](#see--value--inside--target)
- [Verificar se um valor está em um título](#see--value--inside--title)
- [Verificar se um valor está visível](#see--value)
- [Verificar se um cookie existe](#see--cookie--value)

---

## `accept`

> Aceita uma mensagem do navegador ou do app.

### accept + alert
```gherkin
Quando eu aceito o alerta
```

### accept + confirm
```gherkin
Quando eu aceito a confirmação
```

### accept + popup
```gherkin
Quando eu aceito o popup
```

### accept + prompt
```gherkin
Quando eu aceito o prompt
```


## `amOn`

> Indica uma página ou tela do app em que se espera estar.

```gherkin
Dado que estou em "http://concordialang.org"
```


## `append`

> Adiciona um valor em um elemento.

```gherkin
Quando eu adiciono "Conteúdo" em {Foo}
  e adiciono 100 em {Bar}
  e adiciono "Conteúdo" em <#zoo>
  e adiciono 100 em <#xoo>
```


## `attachFile`

> Anexa um arquivo. Compreende tanto a seleção do arquivo como a confirmação de sua escolha.

Essa ação seleciona o arquivo informado e confirma (*e.g.*, clica em OK).

```gherkin
Quando eu anexo o arquivo "/caminho/ate/arquivo" em {Foo}
  e anexo "/caminho/ate/arquivo" em <#bar>
```


## `cancel`

> Cancela uma mensagem do navegador ou do app.

### cancel + alert
```gherkin
Quando eu cancelo o alerta
```

### cancel + confirm
```gherkin
Quando eu cancelo a confirmação
```

### cancel + popup
```gherkin
Quando eu cancelo o popup
```

### cancel + prompt
```gherkin
Quando eu cancelo o prompt
```


## `check`

> Marca uma caixa de marcação (checkbox).

### check + target

```gherkin
Quando eu marco {Foo}
  e eu marco <#bar>
```

### check + target + target

> Marca uma caixa de marcação (checkbox) que está dentro de outro
```gherkin
Então eu marco {Foo} em <#bar>
```


## `clear`

### clear + target

> Limpa o conteúdo de um campo de entrada.

```gherkin
Quando eu limpo {Foo}
  e limpo <#bar>
```

# clear + cookie

> Apaga um cookie pelo seu nome.

```gherkin
Quando eu apago o cookie "foo"
  e quando eu limpo o cookie "bar"
```


## `click`

> Clica em algo na tela

### click + target

```gherkin
Quando eu clico em {Foo}
  e clico em <#bar>
```

### click + value
```gherkin
Quando eu clico em "Foo"
```


## `close`

> Fecha uma aba ou janela do navegador, ou um app.

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

> Conecta em um banco de dados.

A próxima sentença é somente para [Eventos de Teste](language.md#eventos-de-teste):
```gherkin
Quando eu conecto ao banco de dados [TestDB]
```


## `disconnect`

> Desconecta de um banco de dados.

A próxima sentença é somente para [Eventos de Teste](language.md#eventos-de-teste):
```gherkin
Quando eu desconecto do banco de dados [TestDB]
```


## `doubleClick`

> Dá um duplo clique em algo.

### doubleClick + target

```gherkin
Quando eu clico duas vezes em {Foo}
  e dou um duplo clique em <#bar>
```

### doubleClick + value
```gherkin
Quando eu clico duas vezes em "Foo"
```


## `drag`

> Arrasta e solta algo para um determinado elemento.

```gherkin
Quando eu arrasto {Foo} para <#bar>
```


## `fill`

> Indica o preenchimento de um campo. Se desejado, pode-se informar um valor. Caso contrário, o valor deve ser gerado automaticamente, para o Caso de Teste correspondente.

### fill + target

```gherkin
Quando eu preencho {Foo}
  e eu informo {Foo}
  e eu entro com {Foo}
```

### fill + target + with + value or number

```gherkin
Quando eu preencho {Foo} com "foo"
  e eu preencho {Foo} com 100
  e eu preencho <#bar> com "bar"
  e eu preencho <#bar> com 3.1415
```

### fill + value + inside + target

```gherkin
Quando eu digito "bar" em {Foo}
  e eu informo "foo" em <#bar>
```


## `hide`

> Oculta algo.

### hide + keyboard

> Oculta o teclado do dispositivo.

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu oculto o teclado
```


## `install`

> Instala um app.

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu instalo o app "com.example.android.myapp"
  e quando eu instalo a aplicação "com.example.android.myapp"
```


## `maximize`

> Maximiza uma janela ou o navegador.

### maximize + window

```gherkin
Quando eu maximizo a janela
```


## `move`

> Move o cursor do mouse para um local ou elemento.

### move + cursor + target
```gherkin
Quando eu movo o cursor para {Foo}
  e eu posiciono o cursor em <#bar>
```

### move + cursor + target + number + number
```gherkin
Quando eu movo o cursor para {Foo} em 100, 200
  e eu posiciono o cursor em <#bar> na posição 500, 600
```

## `open`

> Abre o painel de notificações do dispositivo.

### open + notificationsPanel

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu abro o painel de notificações
```


## `press`

> Pressiona uma tecla ou uma combinação de teclas, separadas por vírgula.

```gherkin
Quando eu pressiono "Enter"
  e pressiono "Control", "Alt", "Delete"
```

Algumas teclas especiais (*sensível a maiúsculas e minúsculas!*):

- `Add`
- `Alt`
- `ArrowDown` ou `Down arrow`
- `ArrowLeft` ou `Left arrow`
- `ArrowRight` ou `Right arrow`
- `ArrowUp` ou `Up arrow`
- `Backspace`
- `Command`
- `Control`
- `Del`
- `Divide`
- `End`
- `Enter`
- `Equals`
- `Escape`
- `F1` até `F12`
- `Home`
- `Insert`
- `Meta`
- `Multiply`
- `Numpad 0` até `Numpad 9`
- `Pause`
- `Pagedown` ou `PageDown`
- `Pageup` ou `PageUp`
- `Semicolon`
- `Shift`
- `Space`
- `Subtract`
- `Tab`


## `pull`

> Extrai um recurso de um dispositivo para um determinado local (caminho).

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu extraio "/storage/emulated/0/DCIM/logo.png" para "some/path"
```


## `refresh`

> Atualiza a página atual.

```gherkin
Quando eu atualizo a página
  e eu atualizo a página atual
  e eu recarrego a página
  e eu recarrego a página atual
```


## `remove`

> Remove um app pelo seu nome interno.

### remove + app + value

*Same as uninstall*

The next sentence is for *mobile* only:
```gherkin
When I remove the app "com.example.android.myapp"
```


## `resize`

> Redimensiona uma janela.

```gherkin
Quando eu redimensiono a janela para 600, 400
```


## `rightClick`

> Clica com o botão direito em algo.

### rightClick + target

```gherkin
Quando eu clico com o botão direito em {Foo}
  e clico com o botão direito em <#bar>
```


## `run`

> Executa um comando no console/terminal ou um script de banco de dados (comando SQL).

### run + command

> Executa comandos no console/terminal.

👉 *Comandos devem ser declarados entre aspas simples (`'`) e devem ficar em uma linha*

A próxima sentença é somente para [Eventos de Teste](language.md#eventos-de-teste):
```gherkin
Quando eu executo o comando 'rmdir foo'
  e rodo o comando './script.sh'
```

### run + script

> Executa comandos SQL em um banco de dados.

A próxima sentença é somente para [Eventos de Teste](language.md#eventos-de-teste):
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

Sintaxe similar à de [JSON e CSV](#json-e-csv). Contudo, tem limitações, como apontado em [sua documentação](https://github.com/mlaanderson/database-js-firebase) :

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

> Tira uma foto da tela e salva e um arquivo.

```gherkin
Quando salvo uma foto pra "foo.png"
  e eu bato uma foto da tela para "bar.png"
```


## `scrollTo`

> Rola a tela até um certo elemento.

```gherkin
Quando eu rolo para <#foo>
  e eu rolo para {Bar}
  e eu dou um scroll para <#bar>
```


## `see`

> Indica que algo pode ou não ser visto.

### see + value
```gherkin
Então eu vejo "Foo Bar"
```

### see + not + value
```gherkin
Então eu não vejo "Foo Bar"
```

### see + app + value + installed
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o app "com.example.android.myapp" está instalado
```

### see + app + value + not + installed
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o app "com.example.android.myapp" não está instalado
```

### see + currentActivity + value
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a atividade atual é ".HomeScreenActivity"
```

### see + device + locked
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o dispositivo está bloqueado
```

### see + device + unlocked
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que o dispositivo está desbloqueado
```

### see + value + inside + target
```gherkin
Então eu vejo "hello" dentro de {foo}
  e vejo "world" dentro de <bar>
```

### see + value + not + inside + target
```gherkin
Então eu não vejo "hello" dentro de {foo}
  e não vejo "world" dentro de <bar>
```

### see + target + with + value
```gherkin
Então eu vejo "hello" em {foo}
  e vejo "world" em <bar>
```

### see + not + target + with + value
```gherkin
Então eu não vejo {Foo} com "hello"
  e não vejo <bar> com "world"
```

### see + not + value
```gherkin
Então eu não vejo "Foo Bar"
  e não vejo "Foo"
```

### see + target + checked
```gherkin
Então eu vejo {Foo} marcado
  e vejo <#bar> marcado
```

### see + not + target + checked
```gherkin
Então eu não vejo {Foo} marcado
  e não vejo <#bar> marcado
```

### see + target + attribute + value
```gherkin
Então eu vejo {Foo} com o atributo "maxlength" no valor "200"
  e eu vejo o atributo "type" de <#bar> com valor "text"
```

### see + target + class + value

*Obs.: somente para aplicações baseadas em web*
```gherkin
Então eu vejo {Foo} com a classe "primary-button"
```

### see + target + style + value

*Obs.: somente para aplicações baseadas em web*
```gherkin
Então eu vejo {Foo} com o estilo "color: blue"
```

### see + cookie + value
```gherkin
Então eu vejo o cookie "foo"
```

### see + not + cookie + value
```gherkin
Então eu não vejo o cookie "foo"
```

### see + value + inside + title
```gherkin
Então eu vejo "foo" no título
```

### see + not + value + inside + title
```gherkin
Então eu não vejo "foo" no título
```

### see + title + with + value
```gherkin
Então eu vejo o título com "foo"
```

### see + not + title + with + value
```gherkin
Então eu não vejo o título com "foo"
```

### see + target
```gherkin
Então eu vejo {Foo}
  e eu vejo <#bar>
```

### see + not + target
```gherkin
Então eu não vejo {Foo}
  e eu não vejo <#bar>
```

```gherkin
Então eu não vejo {Foo} com "foo"
  e eu não vejo <#bar> com "bar"
```

### see + orientation + landscape
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a orientação é paisagem
```

### see + orientation + portrait
A próxima sentença é somente para *mobile*:
```gherkin
Então eu vejo que a orientação é retrato
```

### see + target + enabled
```gherkin
Então eu vejo {Foo} habilitado
  e vejo <#bar> habilitado
```

### see + not + target + enabled
```gherkin
Então eu não vejo {Foo} habilitado
  e não vejo <#bar> habilitado
```

### see + text + value or number
```gherkin
Então eu vejo o texto "foo"
  e eu vejo o texto 1000
```

### see + not + text + value or number
```gherkin
Então eu não vejo o texto "foo"
  e eu não vejo o texto 1000
```

### see + url + value
```gherkin
Então eu vejo a url "/foo"
```

### see + not + url + value
```gherkin
Então eu não vejo a url "/foo"
```


## `select`

> Seleciona um valor em um elemento.

```gherkin
Então eu seleciono "foo" em {Foo}
  e seleciono "bar" em <#bar>
```


## `shake`

> Balança (faz tremer) o dispositivo.

A próxima sentença é somente para *mobile*:
```gherkin
Quando eu balanço o dispositivo
  e eu tremo o celular
  e eu sacudo o tablet
```

## `swipe`

> Realiza a ação de deslizar, em um app.

### swipe + value + number + number
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#io.selendroid.myapp:id/LinearLayout1> para 100, 200
```

### swipe + value + down
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#io.selendroid.myapp:id/LinearLayout1> para baixo
```

### swipe + value + left
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#io.selendroid.myapp:id/LinearLayout1> para a esquerda
```

### swipe + value + right
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#io.selendroid.myapp:id/LinearLayout1> para direita
```

### swipe + value + up
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#io.selendroid.myapp:id/LinearLayout1> para cima
```

### swipe + from .. to
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo <#foo> para <#bar>
```

## `switch`

> Troca um app para modo nativo ou modo web, ou troca para uma determinada aba ou iframe.

### switch + iframe

OBSERVAÇÕES:
  1. **Faz todos os comandos seguintes serem aplicados ao _iframe_ selecionado**.
  2. Para trocar de volta para aplicação, veka `switch + currentPage` ou `switch + app`.

```gherkin
Quando eu troco para o iframe  # Troca para o primeiro iframe
```
```gherkin
Quando eu troco para o iframe '#foo' # Troca para o iframe com id 'foo'
```

### switch + currentPage

Troca de um iframe de volta para a página da aplicação.

```gherkin
Quando eu troco para a página
```

### switch + app

Troca de um iframe de volta para a página da aplicação. É o mesmo que `switch + currentPage`.

```gherkin
Quando eu troco para a aplicação
```

### switch + native
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu troco para nativo
```

### switch + web
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu troco para web
```

### switch + tab
```gherkin
Quando eu troco para a aba 3
```

### switch + next + tab
```gherkin
Quando eu troco para a próxima aba
```

### switch + previous + tab
```gherkin
Quando eu troco para a aba anterior
```

## `tap`

> Executa um toque em um elemento.

### tap + target
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu toco em <~ok>
  e eu toco em {Confirmar}
```


## `uncheck`

> Desmarca um caixa de marcação (checkbox).

### uncheck + target
```gherkin
Então eu desmarco {Foo}
  e eu desmarco <#bar>
```

### uncheck + target + target
> Desmarca um elemento que está dentro de outro.
```gherkin
Então eu desmarco {Foo} em <#bar>
```


## `wait`

> Espera algo.

### wait + seconds
> Espera alguns segundos.
```gherkin
Quando eu espero 2 segundos
```

### wait + target
> Espera por um elemento.
```gherkin
Quando eu espero por {Foo}
  e eu espero por <#bar>
```

### wait + seconds + target
> Espera alguns segundos por um elemento.
```gherkin
Quando eu espero 3 segundos por {Foo}
  e eu espero 5 segundos por <#bar>
```

### wait + target + hide
> Espera um elemento ficar oculto.
```gherkin
Quando eu espero {Foo} ficar oculto
  e eu espero <#bar> ficar oculto
```

### wait + seconds + target + hide
> Espera alguns segundos para um elemento ficar oculto.
```gherkin
Quando eu espero 3 segundos por {Foo} ficar oculto
  e eu espero 5 segundos por <#bar> ficar oculto
```

### wait + target + enabled
> Espera um elemento ficar habilitado.
```gherkin
Quando eu espero {Foo} ficar habilitado
  e eu espero <#bar> ficar habilitado
```

### wait + seconds + target + enabled
> Espera alguns segundos para um elemento ficar habilitado.
```gherkin
Quando eu espero 3 segundos por {Foo} ficar habilitado
  e eu espero 5 segundos por <#bar> ficar habilitado
```

### wait + target + invisible
> Espera um elemento ficar invisível.
```gherkin
Quando eu espero {Foo} ficar invisível
  e eu espero <#bar> ficar invisível
```

### wait + seconds + target + invisible
> Espera alguns segundos para um elemento ficar invisível.
```gherkin
Quando eu espero 3 segundos {Foo} ficar invisível
  e eu espero 5 segundos <#bar> ficar invisível
```

### wait + target + visible
> Espera um elemento ficar visível.
```gherkin
Quando eu espero {Foo} ficar visível
  e eu espero <#bar> ficar visível
```

### wait + seconds + target + visible
> Espera alguns segundos para um elemento ficar visível.
```gherkin
Quando eu espero 3 segundos por {Foo} ficar visível
  e eu espero 5 segundos por <#bar> ficar visível
```

### wait + text + value
> Espera por um valor textual.
```gherkin
Quando eu espero pelo texto "Foo"
```

### wait + seconds + text + value
> Espera alguns segundos por um valor textual.
```gherkin
Quando eu espero 3 segundos pelo texto "Foo"
```

### wait + url + value
> Espera por uma url.
```gherkin
Quando eu espero pela url "/foo"
```

### wait + seconds + url + value
> Espera alguns segundos por uma url.
```gherkin
Quando eu espero 3 segundos pela url "/bar"
```

### wait + option value + value + target
> Espera por um valor dentro de um elemento.
```gherkin
Quando eu espero pelo valor "foo" em <#bar>
```

### wait + seconds + option value + value + target
> Espera alguns segundos por um valor dentro de um elemento.
```gherkin
Quando eu espero 5 segundos pelo valor "foo" em <#bar>
```
