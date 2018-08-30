# EXEMPLOS DE AÇÕES
#
# Execute com:
# docs/features --plugin codeceptjs --no-run --no-result --file="example-pt.feature"

#language: pt
Funcionalidade: Teste de Conversão de Ações

Cenário: Converte corretamente para CodeceptJS com WebDriverIO ou Appium

  Variante: Qualquer

    # amOn
    Dado que estou em "https://concordialang.org"
      e que estou em <foo>

    # accept
    Quando eu aceito o popup
      e eu aceito o alerta
      e eu aceito a confirmação

      #append
      e eu adiciono "1" em <#foo>
      e eu acrescento 1 em <#foo>

      #attachFile
      e eu anexo o arquivo "path/file.foo" em <#foo>
      e eu anexo em <#foo> o arquivo "path/file.foo"

      # cancel
      e eu cancelo o popup
      e eu cancelo o alerta
      e eu cancelo a confirmação

      # check
      e eu marco <#foo>

      # clear
      e eu limpo o campo <#foo>
      e eu limpo <#foo>

      # clear + cookie
      e eu limpo o cookie "Meu Cookie"

      # click
      e eu clico em <#foo>
      e eu clico em "Texto"
      e eu clico em "Text" dentro de <#foo>
      e eu clico em "Text" em <#foo>

      # close + app (somente mobile)
      e eu fecho a aplicação

      # close + currentTab
      e eu fecho a aba atual

      # close + otherTabs
      e eu fecho as outras abas

      # connect + database
      # e eu conecto ao banco de dados [Meu BD]
      # disconnect + database
      # e eu desconecto do banco de dados [Meu BD]

      # doubleClick
      e eu dou um duplo clique em <#foo>
        e eu clico duplamente em "Bar"

      # drag
      e eu arrasto <#foo> para <#bar>

      # fill
      e eu informo "concordialang.org" em <q>
      e eu informo "1x" em <1a>
      e eu informo 1 em <#foo>
      e eu preencho <#foo> com "bar"
      e eu preencho <#foo> com 2

      # hide + keyboard
      e eu oculto o teclado
        e eu escondo o teclado

      # install + app
      e eu instalo a aplicação "path/to/file.apk"
      e eu instalo "path/to/file.apk"

      # maximize window
      e eu maximizo a janela

      # move + cursor
      e eu movo o cursor para <#foo>
      e eu movo o cursor para <#foo> em 5, 8

      # open + notifications
      e eu abro o painel de notificações

      # press + value
      e eu pressiono "Enter"
      # press + values
      e eu pressiono "Ctrl", "Alt", "Del"
      # press + number
      e eu pressiono 5

      # pull + file
      e eu puxo o arquivo "path/foo.bar" para "some/dir"

      # refresh + page | currentPage
      e eu atualizo a página
      e eu atualizo a página atual
      e eu recarrego a página
      e eu recarrego a página atual

      # remove + app + value
      e eu removo a aplicação "foo.bar.app"

      # resize + window + x, y
      e eu redimensiono a janela para 800, 600

      # rightClick
      e eu clico com o botão direito em <#foo>
      e eu clico com o botão direito em "Foo"
      e eu clico com o botão direito em 100

      # rotate
      e eu rotaciono o dispositivo em 100, 50

      # run + command (só deve ser executado em eventos de teste)
      # e eu executo o comando 'echo "hello"'

      # run + script (só deve ser executado em eventos de teste)
      # e eu executo o script 'DELETE FROM [Meu BD].foo'

      # saveScreenshot
      e eu bato uma foto da tela para "foo.png"
      e eu tiro uma foto da tela para "foo.png"
      e eu salvo um screenshot para "foo.png"

      # scrollTo
      e eu rolo para <#foo>
      e eu rolo para "#foo"

      # see + app
      e eu vejo que a aplicação "foo.bar.app" está instalada
      e eu vejo que a aplicação "foo.bar.app" não está desinstalada
      e eu vejo que a aplicação "foo.bar.app" não está instalada
      e eu vejo que a aplicação "foo.bar.app" está desinstalada

      # see + activity
      e eu vejo que a atividade atual é "foo.bar"

      # see + device + blocked
      e eu vejo que o dispositivo está bloqueado
      e eu vejo que o celular está bloqueado
      e eu vejo que o dispositivo não está desbloqueado
      e eu vejo que o dispositivo não está bloqueado
      e eu vejo que o dispositivo está desbloqueado

      # see + orientation + landscape
      e eu vejo que a orientação é paisagem
      e eu vejo que a orientação não é paisagem
      # see + orientation + portrait
      e eu vejo que a orientação é retrato
      e eu vejo que a orientação não é retrato

      # see + option field + target
      e eu vejo o campo <#foo> com "Foo"
      e eu vejo o campo <#foo> com 100
      e eu vejo "Foo" no campo <#foo>
      e eu vejo 100 no campo <#foo>
      # see + option field + target + not
      e eu não vejo o campo <#foo> com "Foo"
      e eu não vejo o campo <#foo> com 100
      e eu não vejo "Foo" no campo <#foo>
      e eu não vejo 100 no campo <#foo>

      # see + option value [+ target]
      e eu vejo o valor "Foo"
      e eu vejo o valor "Foo" em <#bar>
      e eu vejo o valor 100
      e eu vejo o valor 100 em <#bar>
      e eu vejo <#bar> com "Foo"
      e eu vejo <#bar> com 100
      # see + option value + not [+ target]
      e eu não vejo o valor "Foo"
      e eu não vejo que o valor "Foo" está em <#bar>
      e eu não vejo o valor 100
      e eu não vejo que o valor 100 está em <#bar>
      e eu não vejo <#bar> com "Foo"
      e eu não vejo <#bar> com 100

      # see + checkbox
      e eu vejo que o checkbox <#bar> está marcado
      e eu vejo que o checkbox <#bar> não está desmarcado
      e eu vejo que o checkbox <#bar> não está marcado
      e eu vejo que o checkbox <#bar> está desmarcado

      # see + cookie [+ not]
      e eu vejo o cookie "Meu Cookie"
      e eu vejo o cookie 1
      e eu não vejo o cookie "Meu Cookie"
      e eu não vejo o cookie 1

      # see + text [+ not]
      e eu vejo o texto "Hello"
      e eu vejo o texto 1000
      e eu não vejo o texto "Hello"
      e eu não vejo o texto 1000

      # see + title [+ not]
      e eu vejo no título "Meu Título"
      e eu vejo no título 1
      e eu não vejo no título "Meu Título"
      e eu não vejo no título 1

      # see + url [+ not]
      e eu vejo a url "/hello"
      e eu vejo na url "/hello"
      e eu não vejo a url "/hello"
      e eu não vejo na url "/hello"

      # see + value
      e eu vejo "Foo"
      e eu vejo "Foo" em <#bar>
      e eu vejo 100
      e eu vejo 100 em <#bar>
      # see + value + not
      e eu não vejo "Foo"
      e eu não vejo "Foo" em <#bar>
      e eu não vejo 100
      e eu não vejo 100 em <#bar>

      # see + target
      e eu vejo <#foo>
      e eu não vejo <#foo>

      # select + target + value | number
      e eu seleciono "Foo" em <#foo>
      e eu seleciono em <#foo> o valor "Foo"

      # shake
      e eu balanço o dispositivo
      e eu mexo o celular
      e eu sacudo o tablet

      # swipe + down [+ offset]
      e eu deslizo <#foo> para baixo
      e eu deslizo <#foo> em 100 para baixo
      # swipe + left [+ offset]
      e eu deslizo <#foo> para a esquerda
      e eu deslizo <#foo> em 100 para esquerda
      # swipe + right [+ offset]
      e eu deslizo <#foo> para a direita
      e eu deslizo <#foo> em 100 para direita
      # swipe + up [+ offset]
      e eu deslizo <#foo> para cima
      e eu deslizo <#foo> em 100 para cima

      # swipe
      e deslizo <#foo> para <#bar>
      e deslizo <#foo> em 100, 200

      # switch + ( native | web )
      e eu troco para nativo
      e eu troco para web

      # switch + tab + number
      e eu troco para a aba 3
      # switch + next tab
      e eu troco para a próxima aba
      # switch + previous tab
      e eu troco para a aba anterior

      # tap
      e eu toco <#foo>
      e eu toco "Foo"

      # uncheck
      e eu desmarco <#foo>
      e eu desmarco "Foo"
      e eu desmarco "Foo" dentro de <#foo>

      # uninstall + app
      e eu desinstalo a aplicação "foo.bar.app"
      e eu desinstalo "foo.bar.app"

      # wait [+ seconds] + url
      e eu espero pela url "/foo"
      e eu espero 2 segundos pela url "/foo"
      e eu espero pela url "/foo" por 2 segundos
      # wait [+ seconds] + contains + url
      e eu espero pela url conter "/foo"
      e eu espero 2 segundos pela url conter "/foo"

      # wait + element + number + visible elements
      e eu espero <a> ter 3 elementos visíveis

      # wait [+ seconds] + target
      e eu espero por <#foo>
      e eu espero por "#foo"
      e eu espero 2 segundos por <#foo>
      e eu espero 2 segundos por "#foo"

      # wait [+ seconds] + ( target | value | number ) + enabled
      e eu espero <#foo> estar habilitado
      e eu espero "#foo" estar habilitado
      e eu espero "1" estar habilitado
      e eu espero 2 segundos por <#foo> estar habilitado
      e eu espero 2 segundos por "#foo" estar habilitado

      # wait [+ seconds] + ( target | value | number ) + visible
      e eu espero <#foo> estar visível
      e eu espero "#foo" estar visível
      e eu espero "1" estar visível
      e eu espero 2 segundos por <#foo> estar visível
      e eu espero 2 segundos por "#foo" estar visível

      # wait [+ seconds] + ( target | value | number ) + invisible
      e eu espero <#foo> estar invisível
      e eu espero "#foo" estar invisível
      e eu espero "1" estar invisível
      e eu espero 2 segundos por <#foo> estar invisível
      e eu espero 2 segundos por "#foo" estar invisível

      # wait [+ seconds] + ( target | value | number ) + hidden
      e eu espero <#foo> estar oculto
      e eu espero "#foo" estar oculto
      e eu espero "1" estar oculto
      e eu espero 2 segundos por <#foo> estar oculto
      e eu espero 2 segundos por "#foo" estar oculto
      # wait [+ seconds] + ( target | value | number ) + hide
      e eu espero <#foo> ocultar
      e eu espero "#foo" ocultar
      e eu espero "1" ocultar
      e eu espero 2 segundos por <#foo> ocultar
      e eu espero 2 segundos por "#foo" ocultar

      # wait for text [+ seconds] + value | number [+ target]
      e eu espero pelo texto "foo"
      e eu espero pelo texto 100
      e eu espero pelo texto "foo" em <#bar>
      e eu espero pelo texto 100 em <#bar>
      e eu espero 2 segundos pelo texto "foo" em  <#bar>

      # wait for the value [+ seconds] + text [+ element]
      e eu espero pelo valor "foo" em <#bar>
      e eu espero 2 segundos pelo valor "foo" em  <#bar>

      # wait + seconds
      e espero 1 segundo
      e espero 2 segundos
      e espero 1.5 segundos

    Então eu vejo "npm"


Banco de Dados: Meu BD
  - tipo é "json"
  - caminho é "../package.json"

Antes da Funcionalidade:
  # connect + database
  Quando eu conecto ao banco de dados [Meu BD]
  # run + script
    e eu executo o script 'DELETE FROM [Meu BD].foo WHERE 1'
  # run + command
    e eu rodo o comando 'echo "hello"'

