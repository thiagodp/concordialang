# Ações

> Exemplos de sentenças de Variantes com ações

*Um exemplo pode demonstrar diferentes variações da mesma ação.*

## `amOn`

### amOn + value
```gherkin
Dado que eu estou em "http://concordialang.org"
```

## `append`

### append + number + target
```gherkin
Quando eu adiciono "Foo" em {Foo}
  e eu adiciono "Bar" em <#foo>
```

### append + value + target
```gherkin
Quando eu adiciono 100 em {Bar}
  e eu adiciono 200 em <#foo>
```

## `attachFile`

### attach + file + value + target
```gherkin
Quando eu anexo o arquivo "/path/to/file" em {Foo}
  e eu anexo o arquivo "/path/to/file" em <#bar>
```

## `check`

### check + target
```gherkin
Quando eu marco {Foo}
  e eu marco <#bar>
```

## `clear`

### clear + target
```gherkin
Quando eu limpo {Foo}
  e eu limpo <#bar>
```

### clear + cookie + value
```gherkin
Quando eu limpo o cookie "foo"
  e eu apago o cookie "bar"
```

## `click`

### click + target
```gherkin
Quando eu clico em {Foo}
  e eu clico em <#bar>
```

### click + value
```gherkin
Quando eu clico em "Foo"
```

## `close`

### close + current tab
```gherkin
Quando eu fecho a aba atual
```

### close + other tabs
```gherkin
Quando eu fecho as outras abas
```

### close + app
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu fecho o app
```

## `doubleClick`

### doubleClick + target
```gherkin
Quando eu dou um duplo clique em {Foo}
  e eu clico duplamente em <#bar>
```

### doubleClick + value
```gherkin
Quando eu dou um duplo clique em "Foo"
  e eu clico duplamente em "bar"
```

## `drag`

### drag + target + target
```gherkin
Quando eu arrasto {Foo} para <#bar>
```

## `fill`

### fill + target
```gherkin
Quando eu preencho {Foo}
  e eu informo {Foo}
  e eu entro com {Foo}
  e eu digito {Foo}
```

### fill + target + with + value or number
```gherkin
Quando eu preencho {Foo} com "foo"
  e eu preencho <#bar> com "bar"
  e eu preencho <#bar> com 3.1415
```

### fill + value + inside + target
```gherkin
Quando eu digito "bar" em {Foo}
  e eu digito "foo" em <#bar>
```

## `hide`

### hide + keyboard
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu oculto o teclado
```

## `install`

### install + app + value
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu instalo o app "com.example.android.myapp"
```

## `maximize`

### maximize + window
```gherkin
Quando eu maximize a janela
```

## `move`

### move + cursor + target
```gherkin
Quando eu movo o cursor para {Foo}
  e eu movo o cursor para <#bar>
```

### move + cursor + target + number + number
```gherkin
Quando eu movo o cursor para {Foo} para 100, 200
```

## `open`

### open + notificationsPanel
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu abro o painel de notificações
```

## `press`

### press + value
```gherkin
Quando eu pressiono "Enter"
  e eu pressiono "Ctrl", "Alt", "Del"
```

## `pull`

### pull + value + value
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu extraio "/storage/emulated/0/DCIM/logo.png" para "some/path"
```

## `refresh`

### refresh + currentPage
```gherkin
Quando eu atualizo a página atual
```

### refresh + url
```gherkin
Quando eu atualizo a url
```

## `remove`

### remove + app + value
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu removo o app "com.example.android.myapp"
```

## `resize`

### resize + window + value + value
```gherkin
Quando eu redimensiono uma janela para 600, 400
```

## `rightClick`

### rightClick + target
```gherkin
Quando eu clico com o botão direito em {Foo}
  e eu clico com o botão direito em <#bar>
```

### righClick + value
```gherkin
Quando eu clico com o botão direito em "Foo"
```

## `saveScreenshot`

### saveScreenshot + value
```gherkin
Quando eu salvo uma foto da tela em "foo.png"
  e eu bato uma foto para "bar.png"
```

## `see`

### see + value
```gherkin
Então eu vejo "Foo Bar"
```

### see + not + value
```gherkin
Então eu não vejo "foo"
  e eu não vejo "bar"
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
Então eu vejo "hello" em {foo}
  e eu vejo "world" em <bar>
```

### see + value + not + inside + target
```gherkin
Então eu não vejo "hello" em {foo}
  e eu não vejo "world" em <bar>
```

### see + target + with + value
```gherkin
Então eu vejo "hello" em {foo}
  e eu vejo "world" em <bar>
```

### see + not + target + with + value
```gherkin
Então eu não vejo {Foo} com "hello"
  e eu não vejo <bar> com "world"
```

### see + not + value
```gherkin
Então eu não vejo "Foo Bar"
  e eu não vejo "Foo"
```

### see + target + checked
```gherkin
Então eu vejo que {Foo} está marcado
  e eu vejo que <#bar> está marcado
```

### see + not + target + checked
```gherkin
Então eu não vejo que {Foo} está marcado
  e eu não vejo que <#bar> está marcado
```

### see + cookie + value
```gherkin
Então eu vejo o cookie "foo"
```

### see + not + cookie + value
```gherkin
Então eu não vejo o cookie "foo"
  e eu não vejo o cookie "bar"
```

### see + url + value
```gherkin
Então eu vejo a url "/foo"
```

### see + not + url + value
```gherkin
Então eu não vejo a url "/foo"
  e eu não vejo a url "/bar"
```

### see + value + inside + title
```gherkin
Então eu vejo "foo" no título
```

### see + not + value + inside + title
```gherkin
Então eu não vejo "foo" no título
  e eu não vejo "bar" no título
```

### see + title + with + value
```gherkin
Então eu vejo o título com "foo"
```

### see + not + title + with + value
```gherkin
Então eu não vejo o título com "foo"
  e eu não vejo o título com "bar"
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

### see + target + checked
```gherkin
Então eu vejo que {Foo} está marcado
  e eu vejo que <#bar> está marcado
```

### see + not + target + checked
```gherkin
Então eu não vejo que {Foo} está marcado
  e eu não vejo que <#bar> está marcado
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

### see + url + value
```gherkin
Então eu vejo a url "/foo"
```

### see + target + enabled
```gherkin
Então eu vejo {Foo} ficar habilitado
  e eu vejo <#bar> ficar habilitado
```

## `select`

### select + value + inside + target
```gherkin
Quando eu seleciono "foo" em {Foo}
  e eu seleciono "bar" em <#bar>
```

## `shake`

### shake + device
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu balanço o dispositivo
  e eu sacudo o telefone
  e eu tremo o tablet
```

## `deslizo`

### deslizo + value + number + number
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para 100, 200
```

### deslizo + value + down
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para baixo
```

### deslizo + value + left
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para a esquerda
```

### deslizo + value + right
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para a direita
```

### deslizo + value + up
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para cima
```

## `switch`

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

## `tap`

### tap + target
A próxima sentença é somente para *mobile*:
```gherkin
Quando eu toco <~ok>
  e eu toco {Confirm}
```

## `uncheck`

### uncheck + target
```gherkin
Quando eu desmarco {Foo}
  e eu desmarco <#bar>
```

## `wait`

### wait + segundos
```gherkin
Quando eu aguardo 2 segundos
  e eu espero 2 segundos
```

### wait + target
```gherkin
Quando eu aguardo {Foo}
  e eu aguardo <#bar>
```

### wait + target + segundos
```gherkin
Quando eu aguardo {Foo} por 2 segundos
  e eu aguardo <#bar> por 3 segundos
```

### wait + target + enabled
```gherkin
Quando eu aguardo {Foo} estar habilitado
  e eu aguardo <#bar> estar habilitado
```

### wait + target + invisible
```gherkin
Quando eu aguardo {Foo} estar invisível
  e eu aguardo <#bar> estar invisível
```

### wait + target + visible
```gherkin
Quando eu aguardo {Foo} estar visível
  e eu aguardo <#bar> estar visível
```

### wait + text + value
```gherkin
Quando eu aguardo o texto "Foo"
```

### wait + url + value
```gherkin
Quando eu aguardo a url "/foo"
```

### wait + url + value + segundos
```gherkin
Quando eu aguardo a url "/bar" por 3 segundos
```