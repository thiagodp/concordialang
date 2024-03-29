import { KeywordDictionary } from '../KeywordDictionary';
import { LanguageDictionary } from '../LanguageDictionary';

const keywords: KeywordDictionary = {

    "import": [ "importe", "importar", "import" ],
    "regexBlock": [ "expressões", "expressões regulares", "regexes" ],
    "constantBlock": [ "constantes", "constants" ],
    "variant": [ "variante", "variação", "variant" ],
    "variantBackground": [ "contexto de variante", "contexto de variação", "cenário de variação", "variant background" ],
    "testCase": [ "caso de teste", "test case" ],
    "uiElement": [ "elemento da iu", "elemento de iu", "elemento de ui", "elemento de interface de usuário", "ui element" ],
    "database": [ "banco de dados", "database" ],

    "beforeAll": [ "antes de todas", "antes de todos", "antes de tudo", "before all" ],
    "afterAll": [ "depois de todas", "depois de todos", "após todos", "após todas", "depois de tudo", "após tudo", "after all" ],
    "beforeFeature": [ "antes da funcionalidade", "antes da característica", "antes da feature", "before feature" ],
    "afterFeature": [ "depois da funcionalidade", "depois da característica", "depois da feature", "após a funcionalidade", "após a característica", "após a feature", "after feature" ],
    "beforeEachScenario": [ "antes de cada cenário", "antes de cenário", "before each scenario" ],
    "afterEachScenario": [ "depois de cada cenário", "depois de cenário", "após cada cenário", "after each scenario" ],

    "i": [ "eu" ],
    "is": [ "é", "is" ],
    "with": [ "com" ],
    "valid": [ "válido" ],
    "invalid": [ "inválido" ],
    "random": [ "aleatório" ],
    "from": [ "de" ],

    "tagGlobal": [ "global" ],
    "tagFeature": [ "feature" ],
    "tagScenario": [ "scenario" ],
    "tagVariant": [ "variant" ],
    "tagImportance": [ "importance" ],
    "tagIgnore": [ "ignore" ],
    "tagGenerated": [ "generated" ],
    "tagFail": [ "fail" ],
    "tagGenerateOnlyValidValues": [ "generate-only-valid-values" ],

    "language": [ "language" ],

    "feature": [ "funcionalidade", "característica", "feature", "história", "história de usuário" ],
    "background": [ "contexto", "cenário de fundo", "fundo", "background" ],
    "scenario": [ "cenário", "scenario" ],

    "stepGiven": [ "dado que", "dado", "given" ],
    "stepWhen": [ "quando", "when" ],
    "stepThen": [ "então", "then" ],
    "stepAnd": [ "e", "mas", "and", "but" ],
    "stepOtherwise": [ "caso contrário", "senão", "quando inválido", "se inválido" ],

    "table": [ "tabela", "table" ]
};

const dictionary: LanguageDictionary = {

    "keywords": keywords,

    "testCaseNames": {

        "VALUE_LOWEST": "menor valor aplicável",
        "VALUE_RANDOM_BELOW_MIN": "valor aleatório abaixo do mínimo",
        "VALUE_JUST_BELOW_MIN": "valor logo abaixo do mínimo",
        "VALUE_MIN": "valor mínimo",
        "VALUE_JUST_ABOVE_MIN": "valor logo acima do mínimo",
        "VALUE_ZERO": "valor zero",
        "VALUE_MEDIAN": "valor médio",
        "VALUE_RANDOM_BETWEEN_MIN_MAX": "valor aleatório entre o mínimo e o máximo",
        "VALUE_JUST_BELOW_MAX": "valor logo abaixo do máximo",
        "VALUE_MAX": "valor máximo",
        "VALUE_JUST_ABOVE_MAX": "valor logo acima do máximo",
        "VALUE_RANDOM_ABOVE_MAX": "valor aleatório acima do máximo",
        "VALUE_GREATEST": "maior valor aplicável",

        "LENGTH_LOWEST": "menor comprimento aplicável",
        "LENGTH_RANDOM_BELOW_MIN": "comprimento aleatório abaixo do mínimo",
        "LENGTH_JUST_BELOW_MIN": "comprimento logo abaixo do mínimo",
        "LENGTH_MIN": "comprimento mínimo",
        "LENGTH_JUST_ABOVE_MIN": "comprimento logo acima do mínimo",
        "LENGTH_MEDIAN": "comprimento médio",
        "LENGTH_RANDOM_BETWEEN_MIN_MAX": "comprimento aleatório entre o mínimo e o máximo",
        "LENGTH_JUST_BELOW_MAX": "comprimento logo abaixo do máximo",
        "LENGTH_MAX": "comprimento máximo",
        "LENGTH_JUST_ABOVE_MAX": "comprimento logo acima do máximo",
        "LENGTH_RANDOM_ABOVE_MAX": "comprimento aleatório acima do máximo",
        "LENGTH_GREATEST": "maior comprimento aplicável",

        "FORMAT_VALID": "formato válido",
        "FORMAT_INVALID": "formato inválido",

        "SET_FIRST_ELEMENT": "primeiro elemento",
        "SET_RANDOM_ELEMENT": "elemento aleatório",
        "SET_LAST_ELEMENT": "último elemento",
        "SET_NOT_IN_SET": "elemento não existente",

        "REQUIRED_FILLED": "preenchido",
        "REQUIRED_NOT_FILLED": "não preenchido",

        "COMPUTATION_RIGHT": "cálculo correto",
        "COMPUTATION_WRONG": "cálculo incorreto"
    },



    "nlp": {
        "testcase": {

            "ui_action_modifier": {
                "not": [ "nao", "does not", "doesn't" ]
            },

            "ui_action": {
                "accept": [ "aceito" ],
                "amOn": [ "estou", "visito" ],
                "append": [ "adiciono", "acrescento", "insiro" ],
                "attachFile": [ "anexo", "adiciono o arquivo", "sobrescrevo o arquivo" ],
                "cancel": [ "cancelo", "rejeito" ],
                "check": [ "marco" ],
                "clear": [ "limpo", "apago" ],
                "click": [ "clico", "ativo", "aciono" ],
                "close": [ "fecho", "saio" ],
                "connect": [ "conecto" ],
                "disconnect": [ "desconecto" ],
                "doubleClick": [ "clico duplamente", "clico duas vezes", "dou um duplo clique" ],
                "drag": [ "arrasto" ],
                "fill": [ "preencho", "informo", "digito", "forneco", "entro" ],
                "hide": [ "escondo", "oculto" ],
                "install": [ "instalo" ],
                "maximize": [ "maximizo" ],
                "move": [ "movo", "posiciono" ],
                "mouseOut": [ "retiro o mouse" ],
                "mouseOver": [ "coloco o mouse", "ponho o mouse", "passo o mouse" ],
                "open": [ "abro", "navego para", "vou para" ],
                "press": [ "pressiono", "seguro", "teclo", "aperto" ],
                "pull": [ "extraio", "puxo", "pull" ],
                "refresh": [ "atualizo", "recarrego" ],
                "remove": [ "removo", "retiro", "apago", "deleto" ],
                "resize": [ "redimensiono", "modifico o tamanho", "mudo o tamanho" ],
                "rotate": [ "rotaciono", "giro" ],
                "rightClick": [ "clico com o botao direito", "aciono o botao direito" ],
                "saveScreenshot": [ "salvo a tela", "salvo uma foto", "foto da tela", "print da tela", "screenshot", "printscreen" ],
                "scrollTo": [ "rolo", "scroll" ],
                "run": [ "executo", "rodo" ],
                "see": [ "vejo", "enxergo", "consigo ver", "devo ver", "ver" ],
                "select": [ "seleciono" ],
                "shake": [ "sacudo", "balanço", "tremo", "mexo", "shake" ],
                "show": [ "mostro", "apresento", "exibo" ],
                "swipe": [ "deslizo" ],
                "switch": [ "troco", "mudo para" ],
                "tap": [ "toco", "dou um toque em" ],
                "uncheck": [ "desmarco" ],
                "uninstall": [ "desinstalo" ],
                "wait": [ "aguardo", "espero" ]
            },

            "ui_element_type": {
                "button": [ "botao", "button" ],
                "checkbox": [ "caixa de marcacao", "checkbox", "check" ],
                "cookie": [ "cookie" ],
                "cursor": [ "cursor", "mouse" ],
                "div": [ "div" ],
                "fileInput": [ "arquivo", "anexo" ],
                "frame": [ "frame", "moldura", "frame interno", "iframe" ],
                "image": [ "imagem", "figura", "foto", "image" ],
                "label": [ "rotulo", "label" ],
                "li": [ "item de lista", "item da lista", "list item", "li" ],
                "link": [ "ligacao", "ancora", "link" ],
                "ol": [ "lista ordenada", "ordered list", "ol" ],
                "paragraph": [ "paragrafo", "paragraph" ],
                "radio": [ "radio", "botao de radio", "radio button" ],
                "screen": [ "tela", "screen" ],
                "select": [ "caixa de selecao", "select", "combo", "combobox" ],
                "slider": [ "deslizador", "slider" ],
                "span": [ "span" ],
                "tab": [ "aba", "tab" ],
                "table": [ "tabela", "table" ],
                "text": [ "texto", "text" ],
                "textbox": [ "caixa de texto", "textbox", "input" ],
                "textarea": [ "area de texto", "textarea" ],
                "title": [ "titulo", "title" ],
                "window": [ "janela", "window" ],
                "ul": [ "lista nao ordenada", "lista desordenada", "unordered list", "ul" ],
                "url": [ "url", "endereco", "dominio", "ip", "local", "sitio" ]
            },

            "ui_property": {
                "backgroundColor": [ "cor de fundo", "background color" ],
                "color": [ "cor", "cor de frente", "color" ],
                "height": [ "altura", "height" ],
                "width": [ "largura", "width" ]
            },

            "ui_action_option": {
                "alert": [ "alerta" ],
                "app": [ "aplicação", "aplicativo", "app" ],
                "attribute": [ "atributo", "propriedade", "attribute" ],
                "checked": [ "marcado", "marcada", "ticado", "ticada", "checked" ],
                "class": [ "classe", "class" ],
                "confirm": [ "confirmação", "confirm" ],
                "command": [ "comando" ],
                "cookie": [ "cookie" ],
                "currentActivity": [ "atividade atual" ],
                "currentPage": [ "página atual", "site atual", "página" ],
                "currentTab": [ "aba atual", "current tab" ],
                "database": [ "banco de dados" ],
                "device": [ "dispositivo", "celular", "telefone", "fone", "tablet" ],
                "disabled": [ "desabilitado", "desabilitada", "disabled" ],
                "down": [ "baixo", "abaixo", "down" ],
                "elements": [ "elementos", "itens" ],
                "enabled": [ "habilitado", "habilitada", "enabled" ],
                "field": [ "campo" ],
                "file": [ "arquivo" ],
                "hidden": [ "estar oculto", "estar escondido", "estar oculta", "estar escondida", "ocultar", "esconder" ],
                "inside": [ "dentro de", "em", "no", "na", "contenha", "conter", "ter", "inside" ],
                "installed": [ "instalado", "instalada" ],
                "invisible": [ "invisivel" ],
                "keyboard": [ "teclado", "keyboard" ],
                "landscape": [ "paisagem", "landscape" ],
                "left": [ "esquerda", "left" ],
                "locked": [ "bloqueado", "travado" ],
                "millisecond": [ "milissegundo" ],
                "mobileName": [ "nome mobile", "mobile name" ],
                "native": [ "nativo" ],
                "newTab": [ "nova aba", "new tab" ],
                "next": [ "próxima", "próximo" ],
                "notifications": [ "notificações", "notificação" ],
                "otherTabs": [ "outras abas", "other tabs" ],
                "orientation": [ "orientação" ],
                "popup": [ "popup" ],
                "portrait": [ "retrato", "portrait" ],
                "previous": [ "anterior" ],
                "prompt": [ "prompt" ],
                "right": [ "direita", "right" ],
                "script": [ "script" ],
                "second": [ "segundo" ],
                "slowly": [ "lentamente", "vagarosamente", "devagar" ],
                "style": [ "estilo", "style" ],
                "tab": [ "aba" ],
                "unchecked": [ "desmarcado", "desmarcada", "desticado", "desticada", "unchecked" ],
                "uninstalled": [ "desinstalado", "desinstalada" ],
                "unlocked": [ "desbloqueado", "destravado" ],
                "up": [ "cima", "acima", "up" ],
                "value": [ "valor" ],
                "visible": [ "visivel", "visíveis" ],
                "web": [ "web" ],
                "window": [ "janela", "window" ],
                "with": [ "com", "with", "contem", "contains" ]
            },

            "exec_action": {
                "execute": [ "tenho", "preciso", "necessito", "requeiro" ]
            }
        },


        "ui": {

            "ui_property": {
                "id": [ "id", "identificacao", "identificador", "localizador", "seletor" ],
                "type": [ "tipo" ],
                "editable": [ "editavel" ],
                "datatype": [ "tipo de dado" ],
                "value": [ "valor" ],
                "minlength": [ "comprimento mínimo" ],
                "maxlength": [ "comprimento máximo" ],
                "minvalue": [ "valor mínimo" ],
                "maxvalue": [ "valor máximo" ],
                "format": [ "formato" ],
                "required": [ "obrigatório", "requerido", "required" ],
                "locale": [ "localidade", "local", "locale" ],
                "localeFormat": [ "formato local", "formato de localidade", "formato de local", "formato da localidade", "formato do local", "locale format" ]
            },

            "ui_connector": {
                "in": [ "em", "está em" , "incluso em", "incluido em", "dentro de", "vem de" ],
                "equalTo": [ "é", "igual a", "é o mesmo que", "semelhante a", "similar a" ],
                "computedBy": [ "calculado como", "computado como", "computed by" ]
            },

            "ui_connector_modifier": {
                "not": [ "não" ]
            },

            "ui_data_type": {
                "string": [ "texto", "cadeia", "string" ],
                "integer": [ "inteiro", "integer", "int" ],
                "double": [ "flutuante", "double", "float", "real" ],
                "date": [ "data", "date" ],
                "time": [ "hora", "time" ],
                "longtime": [ "hora longa", "hora com segundo", "hora com segundos", "long time", "longtime" ],
                "datetime": [ "datahora", "datetime" ],
                "longdatetime": [ "datahora longa", "data e hora longa", "data e hora hora com segundo", "data e hora hora com segundos", "long datetime", "timestamp" ]
            },

            "bool_value": {
                "true": [ "verdadeiro", "true", "sim" ],
                "false": [ "falso", "false", "não" ]
            }
        },


        "database": {

            "db_property": {
                "type": [ "tipo", "type" ],
                "path": [ "caminho", "nome", "path", "name" ],
                "host": [ "hospedeiro", "host" ],
                "port": [ "porta", "port" ],
                "username": [ "usuário", "username", "user" ],
                "password": [ "senha", "password" ],
                "charset": [ "conjunto de caracteres", "codificação", "charset", "encoding" ],
                "options": [ "opções", "options" ]
            }

        }
    },



    "training": [
        {
            "intent": "testcase",
            "sentences": [
                "eu não vejo a url com {value}"
            ]
        },

        {
            "intent": "ui",
            "sentences": [
                "id é {value}",
                "comprimento máximo é {number}",
                "valor vem da consulta {query}",
                "valor vem da query {query}",
                "valor está em {query}",
                "valor está contido em {query}",
                "valor está presente em {query}",
                "tipo é {ui_element_type}",
                "tipo é botão"
            ]
        },

        {
            "intent": "database",
            "sentences": [
                "caminho é {value}",
                "nome é {value}",
                "tipo é {value}",
                "porta é {number}"
            ]
        }

    ]

};

export default dictionary;
