import _case from 'case';
import { cosmiconfig } from 'cosmiconfig';
import { distance } from 'damerau-levenshtein-js';
import * as fs from 'fs';
import * as path from 'path';
import path__default, { resolve, dirname, basename, join, relative, parse, normalize, isAbsolute } from 'path';
import readPkgUp from 'read-pkg-up';
import semverDiff from 'semver-diff';
import { UpdateNotifier } from 'update-notifier';
import { promisify } from 'util';
import { AbstractTestScript, NamedATSElement, ATSTestCase, ATSEvent, ATSCommand, ATSDatabaseCommand, ATSConsoleCommand, TestScriptGenerationOptions } from 'concordialang-plugin';
import { DateTimeFormatter, ResolverStyle, LocalDate as LocalDate$1, LocalDateTime as LocalDateTime$1, LocalTime as LocalTime$1, Clock, Instant, ZoneId, ChronoUnit } from '@js-joda/core';
import { createHash } from 'crypto';
import XRegExp from 'xregexp';
import isValidPath from 'is-valid-path';
import { LocalTime, LocalDateTime, LocalDate } from '@js-joda/core/dist/js-joda.js';
import cloneRegExp from 'clone-regexp';
import deepcopy from 'deepcopy';
import * as enumUtil from 'enum-util';
import { isValue } from 'enum-util';
import cartesian from 'cartesian';
import oneWise from 'one-wise';
import shuffleObjArrays from 'shuffle-obj-arrays';
import seedrandom from 'seedrandom';
import arrayDiff from 'arr-diff';
import { randstr } from 'better-randstr';
import jsesc from 'jsesc';
import RandExp from 'randexp';
import alasql from 'alasql';
import pMap from 'p-map';
import * as childProcess from 'child_process';
import dbjs from 'database-js';
import * as sqlstring from 'sqlstring';
import { format } from 'date-fns';
import * as allLocales from 'date-fns/locale/index.js';
import objectToArray from 'object-to-array';
import * as fsWalk from '@nodelib/fs.walk';
import colors from 'chalk';
import logSymbols from 'log-symbols';
import Graph from 'graph.js/dist/graph.full.js';
import * as globalDirs from 'global-dirs';
import getopts from 'getopts';
import figures from 'figures';
import * as readline from 'readline';
import { sprintf } from 'sprintf-js';
import terminalLink from 'terminal-link';
import * as inquirer from 'inquirer';

function sortErrorsByLocation(errors) {
  const compare = (a, b) => {
    if (a.location && b.location) {
      let lineDiff = a.location.line - b.location.line;

      if (0 === lineDiff) {
        return a.location.column - b.location.column;
      }

      return lineDiff;
    }

    if (a.isWarning && b.isWarning) {
      return 0;
    }

    return a.isWarning ? 1 : -1;
  };

  return errors.sort(compare);
}

function toUnixPath(path) {
  return path ? path.replace(/\\\\?/g, '/') : '';
}

const GENERIC_ERROR_KEY = '*';
class ProblemInfo {
  constructor(errors = [], warnings = []) {
    this.errors = errors;
    this.warnings = warnings;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  isEmpty() {
    return !this.hasErrors() && !this.hasWarnings();
  }

}
class ProblemMapper {
  constructor(_needsToConvertKey = false) {
    this._needsToConvertKey = _needsToConvertKey;
    this._map = new Map();
  }

  convertKey(key) {
    return key;
  }

  addError(key, ...errors) {
    let target = this.get(key, true);
    target.errors.push.apply(target.errors, errors);
  }

  addGenericError(...errors) {
    this.addError(GENERIC_ERROR_KEY, ...errors);
  }

  addWarning(key, ...errors) {
    let target = this.get(key, true);
    target.warnings.push.apply(target.warnings, errors);
  }

  addGenericWarning(...errors) {
    this.addWarning(GENERIC_ERROR_KEY, ...errors);
  }

  get(key, assureExists = true) {
    const cKey = this._needsToConvertKey ? this.convertKey(key) : key;

    let target = this._map.get(cKey);

    if (assureExists && !target) {
      target = new ProblemInfo();

      this._map.set(cKey, target);
    }

    return target;
  }

  getGeneric(assureExists = true) {
    return this.get(GENERIC_ERROR_KEY, assureExists);
  }

  getErrors(key) {
    const target = this.get(key, false);

    if (!target) {
      return [];
    }

    return target.errors;
  }

  getGenericErrors() {
    return this.getErrors(GENERIC_ERROR_KEY);
  }

  getAllErrors() {
    const errors = [];

    for (const [, value] of this._map) {
      errors.push.apply(errors, value.errors);
    }

    return errors;
  }

  getWarnings(key) {
    const target = this.get(key, false);

    if (!target) {
      return [];
    }

    return target.warnings;
  }

  getGenericWarnings() {
    return this.getWarnings(GENERIC_ERROR_KEY);
  }

  getAllWarnings() {
    const warnings = [];

    for (const [, value] of this._map) {
      warnings.push.apply(warnings, value.warnings);
    }

    return warnings;
  }

  nonGeneric() {
    const mapClone = new Map(this._map);
    mapClone.delete(GENERIC_ERROR_KEY);
    return mapClone;
  }

  remove(key) {
    const cKey = this._needsToConvertKey ? this.convertKey(key) : key;

    this._map.delete(cKey);
  }

  clear() {
    this._map.clear();
  }

  isEmpty() {
    return 0 === this._map.size;
  }

  count() {
    return this._map.size;
  }

}

class FileProblemMapper extends ProblemMapper {
  constructor() {
    super(true);
  }

  convertKey(key) {
    return GENERIC_ERROR_KEY === key ? key : toUnixPath(key);
  }

}

class LocatedException extends Error {
  constructor(message, location, messageShouldIncludeFilePath = false) {
    super(LocatedException.makeExceptionMessage(message, location, messageShouldIncludeFilePath));
    this.location = location;
    this.name = 'LocatedException';
    this.isWarning = false;
  }

  static makeExceptionMessage(originalMessage, location, includeFilePath = false) {
    let msg = '';

    if (location) {
      msg += '(' + location.line + ',' + location.column + ') ';

      if (includeFilePath && location.filePath) {
        msg += location.filePath + ': ';
      }
    }

    msg += originalMessage || '';
    return msg;
  }

}

class RuntimeException extends LocatedException {
  constructor() {
    super(...arguments);
    this.name = 'RuntimeException';
  }

  static createFrom(error) {
    const e = new RuntimeException(error.message);
    e.stack = error.stack;
    return e;
  }

}

class SemanticException extends RuntimeException {
  constructor() {
    super(...arguments);
    this.name = 'SemanticException';
  }

}

class Warning extends LocatedException {
  constructor() {
    super(...arguments);
    this.name = 'Warning';
    this.isWarning = true;
  }

}

const englishKeywords = {
  import: ['import'],
  regexBlock: ['regexes', 'regular expressions'],
  constantBlock: ['constants'],
  variant: ['variant'],
  variantBackground: ['variant background'],
  testCase: ['test case'],
  uiElement: ['ui element', 'user interface element'],
  database: ['database'],
  beforeAll: ['before all'],
  afterAll: ['after all'],
  beforeFeature: ['before feature'],
  afterFeature: ['after feature'],
  beforeEachScenario: ['before each scenario'],
  afterEachScenario: ['after each scenario'],
  i: ['I'],
  is: ['is'],
  with: ['with'],
  valid: ['valid'],
  invalid: ['invalid'],
  random: ['random'],
  from: ['from'],
  tagGlobal: ['global'],
  tagFeature: ['feature'],
  tagScenario: ['scenario'],
  tagVariant: ['variant'],
  tagImportance: ['importance'],
  tagIgnore: ['ignore'],
  tagGenerated: ['generated'],
  tagFail: ['fail'],
  tagGenerateOnlyValidValues: ['generate-only-valid-values'],
  language: ['language'],
  feature: ['feature', 'story', 'user story'],
  background: ['background'],
  scenario: ['scenario'],
  stepGiven: ['given that', 'given'],
  stepWhen: ['when'],
  stepThen: ['then'],
  stepAnd: ['and', 'but'],
  stepOtherwise: ['otherwise', 'when invalid', 'if invalid', 'whether invalid'],
  table: ['table']
};
const englishDictionary = {
  "keywords": englishKeywords,
  "testCaseNames": {
    "VALUE_LOWEST": "lowest applicable value",
    "VALUE_RANDOM_BELOW_MIN": "random value below the minimum",
    "VALUE_JUST_BELOW_MIN": "value just below the minimum",
    "VALUE_MIN": "minimum value",
    "VALUE_JUST_ABOVE_MIN": "value just above the minimum",
    "VALUE_ZERO": "zero",
    "VALUE_MEDIAN": "median value",
    "VALUE_RANDOM_BETWEEN_MIN_MAX": "random value between the minimum and the maximum",
    "VALUE_JUST_BELOW_MAX": "value just below the maximum",
    "VALUE_MAX": "maximum value",
    "VALUE_JUST_ABOVE_MAX": "value just above the maximum",
    "VALUE_RANDOM_ABOVE_MAX": "random value above the maximum",
    "VALUE_GREATEST": "greatest applicable value",
    "LENGTH_LOWEST": "lowest applicable length",
    "LENGTH_RANDOM_BELOW_MIN": "random length below the minimum",
    "LENGTH_JUST_BELOW_MIN": "length just below the minimum",
    "LENGTH_MIN": "minimum length",
    "LENGTH_JUST_ABOVE_MIN": "length just above the minimum",
    "LENGTH_MEDIAN": "median length",
    "LENGTH_RANDOM_BETWEEN_MIN_MAX": "random length between the minimum and the maximum",
    "LENGTH_JUST_BELOW_MAX": "length just below the maximum",
    "LENGTH_MAX": "maximum length",
    "LENGTH_JUST_ABOVE_MAX": "length just above the maximum",
    "LENGTH_RANDOM_ABOVE_MAX": "random length above the maximum",
    "LENGTH_GREATEST": "greatest applicable length",
    "FORMAT_VALID": "valid format",
    "FORMAT_INVALID": "invalid format",
    "SET_FIRST_ELEMENT": "first element",
    "SET_RANDOM_ELEMENT": "random element",
    "SET_LAST_ELEMENT": "last element",
    "SET_NOT_IN_SET": "inexistent element",
    "REQUIRED_FILLED": "filled",
    "REQUIRED_NOT_FILLED": "not filled",
    "COMPUTATION_RIGHT": "right computation",
    "COMPUTATION_WRONG": "wrong computation"
  },
  "nlp": {
    "testcase": {
      "ui_action_modifier": {
        "not": ["not", "no", "dont", "don't", "doesn't", "cannot", "shouldn't", "mustn't"]
      },
      "ui_action": {
        "accept": ["accept"],
        "amOn": ["am on", "am in", "am at", "visit"],
        "append": ["append", "add", "insert"],
        "attachFile": ["attach the file", "add the file", "insert the file", "overwrite the file"],
        "cancel": ["cancel", "reject", "dismiss"],
        "check": ["check"],
        "clear": ["clear"],
        "click": ["click", "activate", "trigger", "set"],
        "close": ["close", "leave"],
        "connect": ["connect"],
        "disconnect": ["disconnect"],
        "doubleClick": ["double click", "click twice"],
        "drag": ["drag"],
        "fill": ["fill", "enter", "inform", "type", "give"],
        "hide": ["hide"],
        "install": ["install"],
        "maximize": ["maximize"],
        "move": ["move"],
        "mouseOut": ["move the mouse out", "remove the mouse"],
        "mouseOver": ["put the mouse over", "place the mouse over", "set the mouse over"],
        "open": ["open", "navigate", "go"],
        "press": ["press", "hold", "hit"],
        "pull": ["pull", "extract"],
        "refresh": ["refresh", "reload", "update"],
        "remove": ["remove", "delete", "erase"],
        "resize": ["resize", "change the size"],
        "rotate": ["rotate"],
        "rightClick": ["right click"],
        "run": ["run", "execute", "launch"],
        "saveScreenshot": ["screenshot", "printscreen", "take a picture", "take a photo"],
        "scrollTo": ["scroll"],
        "see": ["see"],
        "select": ["select", "pick", "choose", "opt"],
        "shake": ["shake"],
        "show": ["show", "display", "present", "exhibit"],
        "swipe": ["swipe"],
        "switch": ["switch", "change to"],
        "tap": ["tap", "touch"],
        "uncheck": ["uncheck"],
        "uninstall": ["uninstall"],
        "wait": ["wait"]
      },
      "ui_element_type": {
        "button": ["button"],
        "checkbox": ["checkbox", "check"],
        "cookie": ["cookie"],
        "cursor": ["cursor", "mouse"],
        "div": ["div"],
        "fileInput": ["file input", "file", "attached file", "attachment"],
        "frame": ["frame", "iframe", "internal frame"],
        "image": ["image", "picture", "figure", "photo"],
        "label": ["label"],
        "li": ["list item", "li"],
        "link": ["link", "anchor"],
        "ol": ["ordered list", "ol"],
        "paragraph": ["paragraph"],
        "radio": ["radio", "radio button"],
        "screen": ["screen"],
        "select": ["select", "combo", "combobox", "combo box", "selection box"],
        "slider": ["slider"],
        "span": ["span"],
        "tab": ["tab"],
        "table": ["table"],
        "text": ["text"],
        "textbox": ["textbox", "input"],
        "textarea": ["textarea", "text area"],
        "title": ["title"],
        "window": ["window"],
        "ul": ["unordered list", "ul"],
        "url": ["url", "address", "ip", "domain", "website", "site"]
      },
      "ui_property": {
        "backgroundColor": ["background color"],
        "color": ["color", "foreground color"],
        "height": ["height"],
        "width": ["width"]
      },
      "ui_action_option": {
        "alert": ["alert"],
        "app": ["application", "app"],
        "attribute": ["attribute", "property"],
        "checked": ["checked"],
        "class": ["class"],
        "command": ["command"],
        "confirm": ["confirmation", "confirm"],
        "cookie": ["cookie"],
        "currentActivity": ["current activity"],
        "currentPage": ["current page", "page"],
        "currentTab": ["current tab"],
        "database": ["database"],
        "device": ["device", "phone", "tablet"],
        "disabled": ["disabled"],
        "down": ["down"],
        "elements": ["elements", "items"],
        "enabled": ["enabled"],
        "field": ["field"],
        "file": ["file"],
        "hide": ["hide"],
        "hidden": ["hidden"],
        "inside": ["inside", "in"],
        "installed": ["installed"],
        "invisible": ["invisible"],
        "keyboard": ["keyboard"],
        "landscape": ["landscape"],
        "left": ["left"],
        "locked": ["locked"],
        "millisecond": ["millisecond", "milliseconds"],
        "mobileName": ["mobile name"],
        "native": ["native"],
        "newTab": ["new tab"],
        "next": ["next"],
        "notifications": ["notifications", "notification", "notification panel"],
        "otherTabs": ["other tabs"],
        "orientation": ["orientation"],
        "popup": ["popup"],
        "portrait": ["portrait"],
        "previous": ["previous"],
        "prompt": ["prompt"],
        "right": ["right"],
        "script": ["script"],
        "second": ["second", "seconds"],
        "slowly": ["slowly", "leisurely"],
        "style": ["style"],
        "tab": ["tab"],
        "unchecked": ["unchecked"],
        "uninstalled": ["uninstalled"],
        "unlocked": ["unlocked"],
        "up": ["up"],
        "value": ["value"],
        "visible": ["visible"],
        "web": ["web"],
        "window": ["window"],
        "with": ["with", "containing", "contains"]
      },
      "exec_action": {
        "execute": ["have", "need", "require"]
      }
    },
    "ui": {
      "ui_property": {
        "id": ["id", "identification", "identificator", "locator", "selector"],
        "type": ["type"],
        "editable": ["editable"],
        "datatype": ["datatype", "data type"],
        "value": ["value"],
        "minlength": ["minlength", "min length", "minimum length"],
        "maxlength": ["maxlength", "max length", "maximum length"],
        "minvalue": ["minvalue", "min value", "minimum value"],
        "maxvalue": ["maxvalue", "max value", "maximum value"],
        "format": ["format"],
        "required": ["required", "mandatory", "obligatory", "necessary"],
        "locale": ["locale"],
        "localeFormat": ["locale format"]
      },
      "ui_connector": {
        "in": ["in", "included", "is one of"],
        "equalTo": ["equal to", "same as", "similar to"],
        "computedBy": ["computed by"]
      },
      "ui_connector_modifier": {
        "not": ["not", "do not", "don't", "cannot", "can not", "can't"]
      },
      "ui_data_type": {
        "string": ["string", "text"],
        "integer": ["integer", "int"],
        "double": ["double", "float", "real", "floating point"],
        "date": ["date"],
        "time": ["time"],
        "longtime": ["longtime", "long time", "time with second", "time with seconds"],
        "datetime": ["datetime", "date and time"],
        "longdatetime": ["long datetime", "long date and time", "timestamp"]
      },
      "bool_value": {
        "true": ["true", "yes"],
        "false": ["false", "no"]
      }
    },
    "database": {
      "db_property": {
        "type": ["type"],
        "path": ["path", "name"],
        "host": ["host"],
        "port": ["port"],
        "username": ["username", "user"],
        "password": ["password"],
        "charset": ["charset", "encoding"],
        "options": ["options", "parameters"]
      }
    }
  },
  "training": [{
    "intent": "testcase",
    "sentences": ["I {exec_action} the {state}", "I have {state}", "have {state}", "I {ui_action} in {ui_element}", "I {ui_action} in {ui_literal}", "I see {ui_element} inside {ui_element}", "I see {ui_element} inside {ui_literal}", "I see {ui_literal} inside {ui_element}", "I see {ui_literal} inside {ui_literal}", "I see {ui_literal} with {value}", "I see {ui_literal} with {number}", "I see {ui_literal} with {constant}", "I don't see url with {value}"]
  }, {
    "intent": "ui",
    "sentences": ["id is {value}", "maximum length is {number}", "value comes from the query {query}", "value comes is in {query}", "value comes is included in {query}", "value comes is on {query}", "value is {date}", "value is next year", "value is last year", "type is {ui_element_type}", "type is button"]
  }, {
    "intent": "database",
    "sentences": ["path is {value}", "name is {value}", "type is {value}", "port is {number}"]
  }]
};

const keywords = {
  "import": ["importe", "importar", "import"],
  "regexBlock": ["expressões", "expressões regulares", "regexes"],
  "constantBlock": ["constantes", "constants"],
  "variant": ["variante", "variação", "variant"],
  "variantBackground": ["contexto de variante", "contexto de variação", "cenário de variação", "variant background"],
  "testCase": ["caso de teste", "test case"],
  "uiElement": ["elemento da iu", "elemento de iu", "elemento de ui", "elemento de interface de usuário", "ui element"],
  "database": ["banco de dados", "database"],
  "beforeAll": ["antes de todas", "antes de todos", "antes de tudo", "before all"],
  "afterAll": ["depois de todas", "depois de todos", "após todos", "após todas", "depois de tudo", "após tudo", "after all"],
  "beforeFeature": ["antes da funcionalidade", "antes da característica", "antes da feature", "before feature"],
  "afterFeature": ["depois da funcionalidade", "depois da característica", "depois da feature", "após a funcionalidade", "após a característica", "após a feature", "after feature"],
  "beforeEachScenario": ["antes de cada cenário", "antes de cenário", "before each scenario"],
  "afterEachScenario": ["depois de cada cenário", "depois de cenário", "após cada cenário", "after each scenario"],
  "i": ["eu"],
  "is": ["é", "is"],
  "with": ["com"],
  "valid": ["válido"],
  "invalid": ["inválido"],
  "random": ["aleatório"],
  "from": ["de"],
  "tagGlobal": ["global"],
  "tagFeature": ["feature"],
  "tagScenario": ["scenario"],
  "tagVariant": ["variant"],
  "tagImportance": ["importance"],
  "tagIgnore": ["ignore"],
  "tagGenerated": ["generated"],
  "tagFail": ["fail"],
  "tagGenerateOnlyValidValues": ["generate-only-valid-values"],
  "language": ["language"],
  "feature": ["funcionalidade", "característica", "feature", "história", "história de usuário"],
  "background": ["contexto", "cenário de fundo", "fundo", "background"],
  "scenario": ["cenário", "scenario"],
  "stepGiven": ["dado que", "dado", "given"],
  "stepWhen": ["quando", "when"],
  "stepThen": ["então", "then"],
  "stepAnd": ["e", "mas", "and", "but"],
  "stepOtherwise": ["caso contrário", "senão", "quando inválido", "se inválido"],
  "table": ["tabela", "table"]
};
const dictionary = {
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
        "not": ["nao", "does not", "doesn't"]
      },
      "ui_action": {
        "accept": ["aceito"],
        "amOn": ["estou", "visito"],
        "append": ["adiciono", "acrescento", "insiro"],
        "attachFile": ["anexo", "adiciono o arquivo", "sobrescrevo o arquivo"],
        "cancel": ["cancelo", "rejeito"],
        "check": ["marco"],
        "clear": ["limpo", "apago"],
        "click": ["clico", "ativo", "aciono"],
        "close": ["fecho", "saio"],
        "connect": ["conecto"],
        "disconnect": ["desconecto"],
        "doubleClick": ["clico duplamente", "clico duas vezes", "dou um duplo clique"],
        "drag": ["arrasto"],
        "fill": ["preencho", "informo", "digito", "forneco", "entro"],
        "hide": ["escondo", "oculto"],
        "install": ["instalo"],
        "maximize": ["maximizo"],
        "move": ["movo", "posiciono"],
        "mouseOut": ["retiro o mouse"],
        "mouseOver": ["coloco o mouse", "ponho o mouse", "passo o mouse"],
        "open": ["abro", "navego para", "vou para"],
        "press": ["pressiono", "seguro", "teclo", "aperto"],
        "pull": ["extraio", "puxo", "pull"],
        "refresh": ["atualizo", "recarrego"],
        "remove": ["removo", "retiro", "apago", "deleto"],
        "resize": ["redimensiono", "modifico o tamanho", "mudo o tamanho"],
        "rotate": ["rotaciono", "giro"],
        "rightClick": ["clico com o botao direito", "aciono o botao direito"],
        "saveScreenshot": ["salvo a tela", "salvo uma foto", "foto da tela", "print da tela", "screenshot", "printscreen"],
        "scrollTo": ["rolo", "scroll"],
        "run": ["executo", "rodo"],
        "see": ["vejo", "enxergo", "consigo ver", "devo ver", "ver"],
        "select": ["seleciono"],
        "shake": ["sacudo", "balanço", "tremo", "mexo", "shake"],
        "show": ["mostro", "apresento", "exibo"],
        "swipe": ["deslizo"],
        "switch": ["troco", "mudo para"],
        "tap": ["toco", "dou um toque em"],
        "uncheck": ["desmarco"],
        "uninstall": ["desinstalo"],
        "wait": ["aguardo", "espero"]
      },
      "ui_element_type": {
        "button": ["botao", "button"],
        "checkbox": ["caixa de marcacao", "checkbox", "check"],
        "cookie": ["cookie"],
        "cursor": ["cursor", "mouse"],
        "div": ["div"],
        "fileInput": ["arquivo", "anexo"],
        "frame": ["frame", "moldura", "frame interno", "iframe"],
        "image": ["imagem", "figura", "foto", "image"],
        "label": ["rotulo", "label"],
        "li": ["item de lista", "item da lista", "list item", "li"],
        "link": ["ligacao", "ancora", "link"],
        "ol": ["lista ordenada", "ordered list", "ol"],
        "paragraph": ["paragrafo", "paragraph"],
        "radio": ["radio", "botao de radio", "radio button"],
        "screen": ["tela", "screen"],
        "select": ["caixa de selecao", "select", "combo", "combobox"],
        "slider": ["deslizador", "slider"],
        "span": ["span"],
        "tab": ["aba", "tab"],
        "table": ["tabela", "table"],
        "text": ["texto", "text"],
        "textbox": ["caixa de texto", "textbox", "input"],
        "textarea": ["area de texto", "textarea"],
        "title": ["titulo", "title"],
        "window": ["janela", "window"],
        "ul": ["lista nao ordenada", "lista desordenada", "unordered list", "ul"],
        "url": ["url", "endereco", "dominio", "ip", "local", "sitio"]
      },
      "ui_property": {
        "backgroundColor": ["cor de fundo", "background color"],
        "color": ["cor", "cor de frente", "color"],
        "height": ["altura", "height"],
        "width": ["largura", "width"]
      },
      "ui_action_option": {
        "alert": ["alerta"],
        "app": ["aplicação", "aplicativo", "app"],
        "attribute": ["atributo", "propriedade", "attribute"],
        "checked": ["marcado", "marcada", "ticado", "ticada", "checked"],
        "class": ["classe", "class"],
        "confirm": ["confirmação", "confirm"],
        "command": ["comando"],
        "cookie": ["cookie"],
        "currentActivity": ["atividade atual"],
        "currentPage": ["página atual", "site atual", "página"],
        "currentTab": ["aba atual", "current tab"],
        "database": ["banco de dados"],
        "device": ["dispositivo", "celular", "telefone", "fone", "tablet"],
        "disabled": ["desabilitado", "desabilitada", "disabled"],
        "down": ["baixo", "abaixo", "down"],
        "elements": ["elementos", "itens"],
        "enabled": ["habilitado", "habilitada", "enabled"],
        "field": ["campo"],
        "file": ["arquivo"],
        "hidden": ["estar oculto", "estar escondido", "estar oculta", "estar escondida", "ocultar", "esconder"],
        "inside": ["dentro de", "em", "no", "na", "contenha", "conter", "ter", "inside"],
        "installed": ["instalado", "instalada"],
        "invisible": ["invisivel"],
        "keyboard": ["teclado", "keyboard"],
        "landscape": ["paisagem", "landscape"],
        "left": ["esquerda", "left"],
        "locked": ["bloqueado", "travado"],
        "millisecond": ["milissegundo"],
        "mobileName": ["nome mobile", "mobile name"],
        "native": ["nativo"],
        "newTab": ["nova aba", "new tab"],
        "next": ["próxima", "próximo"],
        "notifications": ["notificações", "notificação"],
        "otherTabs": ["outras abas", "other tabs"],
        "orientation": ["orientação"],
        "popup": ["popup"],
        "portrait": ["retrato", "portrait"],
        "previous": ["anterior"],
        "prompt": ["prompt"],
        "right": ["direita", "right"],
        "script": ["script"],
        "second": ["segundo"],
        "slowly": ["lentamente", "vagarosamente", "devagar"],
        "style": ["estilo", "style"],
        "tab": ["aba"],
        "unchecked": ["desmarcado", "desmarcada", "desticado", "desticada", "unchecked"],
        "uninstalled": ["desinstalado", "desinstalada"],
        "unlocked": ["desbloqueado", "destravado"],
        "up": ["cima", "acima", "up"],
        "value": ["valor"],
        "visible": ["visivel", "visíveis"],
        "web": ["web"],
        "window": ["janela", "window"],
        "with": ["com", "with", "contem", "contains"]
      },
      "exec_action": {
        "execute": ["tenho", "preciso", "necessito", "requeiro"]
      }
    },
    "ui": {
      "ui_property": {
        "id": ["id", "identificacao", "identificador", "localizador", "seletor"],
        "type": ["tipo"],
        "editable": ["editavel"],
        "datatype": ["tipo de dado"],
        "value": ["valor"],
        "minlength": ["comprimento mínimo"],
        "maxlength": ["comprimento máximo"],
        "minvalue": ["valor mínimo"],
        "maxvalue": ["valor máximo"],
        "format": ["formato"],
        "required": ["obrigatório", "requerido", "required"],
        "locale": ["localidade", "local", "locale"],
        "localeFormat": ["formato local", "formato de localidade", "formato de local", "formato da localidade", "formato do local", "locale format"]
      },
      "ui_connector": {
        "in": ["em", "está em", "incluso em", "incluido em", "dentro de", "vem de"],
        "equalTo": ["é", "igual a", "é o mesmo que", "semelhante a", "similar a"],
        "computedBy": ["calculado como", "computado como", "computed by"]
      },
      "ui_connector_modifier": {
        "not": ["não"]
      },
      "ui_data_type": {
        "string": ["texto", "cadeia", "string"],
        "integer": ["inteiro", "integer", "int"],
        "double": ["flutuante", "double", "float", "real"],
        "date": ["data", "date"],
        "time": ["hora", "time"],
        "longtime": ["hora longa", "hora com segundo", "hora com segundos", "long time", "longtime"],
        "datetime": ["datahora", "datetime"],
        "longdatetime": ["datahora longa", "data e hora longa", "data e hora hora com segundo", "data e hora hora com segundos", "long datetime", "timestamp"]
      },
      "bool_value": {
        "true": ["verdadeiro", "true", "sim"],
        "false": ["falso", "false", "não"]
      }
    },
    "database": {
      "db_property": {
        "type": ["tipo", "type"],
        "path": ["caminho", "nome", "path", "name"],
        "host": ["hospedeiro", "host"],
        "port": ["porta", "port"],
        "username": ["usuário", "username", "user"],
        "password": ["senha", "password"],
        "charset": ["conjunto de caracteres", "codificação", "charset", "encoding"],
        "options": ["opções", "options"]
      }
    }
  },
  "training": [{
    "intent": "testcase",
    "sentences": ["eu não vejo a url com {value}"]
  }, {
    "intent": "ui",
    "sentences": ["id é {value}", "comprimento máximo é {number}", "valor vem da consulta {query}", "valor vem da query {query}", "valor está em {query}", "valor está contido em {query}", "valor está presente em {query}", "tipo é {ui_element_type}", "tipo é botão"]
  }, {
    "intent": "database",
    "sentences": ["caminho é {value}", "nome é {value}", "tipo é {value}", "porta é {number}"]
  }]
};

const availableLanguages = ['en', 'pt'];
const map = {
  'en': englishDictionary,
  'pt': dictionary
};
function dictionaryForLanguage(language) {
  return map[language] || englishDictionary;
}

var DatabaseProperties;

(function (DatabaseProperties) {
  DatabaseProperties["TYPE"] = "type";
  DatabaseProperties["PATH"] = "path";
  DatabaseProperties["HOST"] = "host";
  DatabaseProperties["PORT"] = "port";
  DatabaseProperties["USERNAME"] = "username";
  DatabaseProperties["PASSWORD"] = "password";
  DatabaseProperties["CHARSET"] = "charset";
  DatabaseProperties["OPTIONS"] = "options";
})(DatabaseProperties || (DatabaseProperties = {}));

var DatabasePropertyAlias;

(function (DatabasePropertyAlias) {
  DatabasePropertyAlias["NAME"] = "name";
})(DatabasePropertyAlias || (DatabasePropertyAlias = {}));

class Spec {
  constructor(basePath) {
    this.basePath = null;
    this.docs = [];
    this.basePath = basePath || process.cwd();
  }

}

var ReservedTags;

(function (ReservedTags) {
  ReservedTags["GENERATED"] = "generated";
  ReservedTags["FAIL"] = "fail";
  ReservedTags["FEATURE"] = "feature";
  ReservedTags["SCENARIO"] = "scenario";
  ReservedTags["VARIANT"] = "variant";
  ReservedTags["GLOBAL"] = "global";
  ReservedTags["IGNORE"] = "ignore";
  ReservedTags["IMPORTANCE"] = "importance";
  ReservedTags["GENERATE_ONLY_VALID_VALUES"] = "generate-only-valid-values";
})(ReservedTags || (ReservedTags = {}));
function tagsWithAnyOfTheNames(tags, names) {
  return tags.filter(t => names.indexOf(t.name.toLowerCase()) >= 0);
}

class UIElementInfo {
  constructor(document = null, uiLiteral = null, feature = null, fullVariableName = null) {
    this.document = document;
    this.uiLiteral = uiLiteral;
    this.feature = feature;
    this.fullVariableName = fullVariableName;
  }

  isGlobal() {
    return !this.feature;
  }

}
class EntityValue {
  constructor(entity, value, references = []) {
    this.entity = entity;
    this.value = value;
    this.references = references;
  }

}

class UIPropertyReference {
  constructor() {
    this.nodeType = 'ui_property_ref';
    this.location = null;
  }

}

var UIPropertyTypes;

(function (UIPropertyTypes) {
  UIPropertyTypes["ID"] = "id";
  UIPropertyTypes["TYPE"] = "type";
  UIPropertyTypes["EDITABLE"] = "editable";
  UIPropertyTypes["DATA_TYPE"] = "datatype";
  UIPropertyTypes["VALUE"] = "value";
  UIPropertyTypes["MIN_LENGTH"] = "minlength";
  UIPropertyTypes["MAX_LENGTH"] = "maxlength";
  UIPropertyTypes["MIN_VALUE"] = "minvalue";
  UIPropertyTypes["MAX_VALUE"] = "maxvalue";
  UIPropertyTypes["FORMAT"] = "format";
  UIPropertyTypes["REQUIRED"] = "required";
  UIPropertyTypes["LOCALE"] = "locale";
  UIPropertyTypes["LOCALE_FORMAT"] = "localeFormat";
})(UIPropertyTypes || (UIPropertyTypes = {}));

class State {
  constructor(name, stepIndex, notFound) {
    this.name = name;
    this.stepIndex = stepIndex;
    this.notFound = notFound;
  }

  toString() {
    return name;
  }

  equals(state) {
    return this.nameEquals(state.name);
  }

  nameEquals(name) {
    return this.name.toLowerCase() === name.toLowerCase();
  }

}

class Keywords {
  static all() {
    let set = [];

    for (let x in Keywords) {
      if ('string' === typeof x) {
        set.push(x);
      }
    }

    return set;
  }

}
Keywords.IMPORT = 'import';
Keywords.REGEX_BLOCK = 'regexBlock';
Keywords.CONSTANT_BLOCK = 'constantBlock';
Keywords.IS = 'is';
Keywords.VARIANT_BACKGROUND = 'variantBackground';
Keywords.VARIANT = 'variant';
Keywords.TEST_CASE = 'testCase';
Keywords.UI_ELEMENT = 'uiElement';
Keywords.DATABASE = 'database';
Keywords.BEFORE_ALL = 'beforeAll';
Keywords.AFTER_ALL = 'afterAll';
Keywords.BEFORE_FEATURE = 'beforeFeature';
Keywords.AFTER_FEATURE = 'afterFeature';
Keywords.BEFORE_EACH_SCENARIO = 'beforeEachScenario';
Keywords.AFTER_EACH_SCENARIO = 'afterEachScenario';
Keywords.TAG_GLOBAL = 'tagGlobal';
Keywords.TAG_FEATURE = 'tagFeature';
Keywords.TAG_SCENARIO = 'tagScenario';
Keywords.TAG_VARIANT = 'tagVariant';
Keywords.TAG_IMPORTANCE = 'tagImportance';
Keywords.TAG_IGNORE = 'tagIgnore';
Keywords.TAG_GENERATED = 'tagGenerated';
Keywords.TAG_FAIL = 'tagFail';
Keywords.LANGUAGE = 'language';
Keywords.FEATURE = 'feature';
Keywords.BACKGROUND = 'background';
Keywords.SCENARIO = 'scenario';
Keywords.STEP_GIVEN = 'stepGiven';
Keywords.STEP_WHEN = 'stepWhen';
Keywords.STEP_THEN = 'stepThen';
Keywords.STEP_AND = 'stepAnd';
Keywords.STEP_OTHERWISE = 'stepOtherwise';
Keywords.TABLE = 'table';

class NodeTypes extends Keywords {}
NodeTypes.REGEX = 'regex';
NodeTypes.CONSTANT = 'constant';
NodeTypes.UI_PROPERTY = 'uiProperty';
NodeTypes.DATABASE_PROPERTY = 'databaseProperty';
NodeTypes.TAG = 'tag';
NodeTypes.TABLE_ROW = 'tableRow';
NodeTypes.LONG_STRING = 'longString';
NodeTypes.TEXT = 'text';

class Expressions {
  static escape(text) {
    return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  static escapeAll(values) {
    return values.map(val => Expressions.escape(val));
  }

  static anythingBut(values, modifiers = 'ug') {
    return new RegExp('^((?![' + values.join('') + ']).)*$', modifiers);
  }

}
Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA = '(?:\t| |,)+';
Expressions.OPTIONAL_SPACES_OR_TABS = '(?:\t| )*';
Expressions.ANYTHING = '.*';
Expressions.SOMETHING_INSIDE_QUOTES = '("[^"\r\n]*")';
Expressions.A_NUMBER = '([0-9]+(\.[0-9]+)?)';
Expressions.AN_INTEGER_NUMBER = '([0-9]+)';

class LineChecker {
  isEmpty(line) {
    return 0 === line.trim().length;
  }

  countLeftSpacesAndTabs(line) {
    let i = 0,
        len = line.length,
        found = true,
        ch;

    while (i < len && found) {
      ch = line.charAt(i++);
      found = ' ' == ch || "\t" == ch;
    }

    return i - 1;
  }

  caseInsensitivePositionOf(text, line) {
    return line.toLowerCase().indexOf(text.toLowerCase());
  }

  textAfterSeparator(separator, line) {
    let i = line.indexOf(separator);
    return i >= 0 && i < line.length - 1 ? line.substr(i + 1) : '';
  }

  textBeforeSeparator(separator, line) {
    let i = line.indexOf(separator);
    return i > 0 ? line.substring(0, i) : '';
  }

}

class Symbols {}
Symbols.COMMENT_PREFIX = '#';
Symbols.IMPORT_PREFIX = '"';
Symbols.TAG_PREFIX = '@';
Symbols.LANGUAGE_PREFIX = '#';
Symbols.PY_STRING_PREFIX = '"""';
Symbols.TABLE_PREFIX = '|';
Symbols.LIST_ITEM_PREFIX = '-';
Symbols.UI_ELEMENT_PREFIX = '{';
Symbols.UI_LITERAL_PREFIX = '<';
Symbols.CONSTANT_PREFIX = '[';
Symbols.IMPORT_SUFFIX = '"';
Symbols.UI_LITERAL_SUFFIX = '>';
Symbols.UI_ELEMENT_SUFFIX = '}';
Symbols.CONSTANT_SUFFIX = ']';
Symbols.LANGUAGE_SEPARATOR = ':';
Symbols.TITLE_SEPARATOR = ':';
Symbols.TABLE_CELL_SEPARATOR = '|';
Symbols.IMPORT_SEPARATOR = ',';
Symbols.REGEX_SEPARATOR = ':';
Symbols.TAG_VALUE_SEPARATOR = ',';
Symbols.VALUE_SEPARATOR = ',';
Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR = ':';
Symbols.UI_PROPERTY_REF_SEPARATOR = '|';
Symbols.VALUE_WRAPPER = '"';
Symbols.COMMAND_WRAPPER = "'";

class CommentHandler {
  remove(content) {
    if (0 === content.trimLeft().indexOf(Symbols.COMMENT_PREFIX)) {
      return content.substring(0, content.indexOf(Symbols.COMMENT_PREFIX));
    }

    let commentPos = content.lastIndexOf(Symbols.COMMENT_PREFIX);

    if (commentPos < 0) {
      return content;
    }

    let lastValueIndex = content.lastIndexOf(Symbols.VALUE_WRAPPER);
    let lastUILiteralIndex = content.lastIndexOf(Symbols.UI_LITERAL_SUFFIX);
    let lastCommandIndex = content.lastIndexOf(Symbols.COMMAND_WRAPPER);

    if (lastValueIndex >= 0 && commentPos < lastValueIndex || lastUILiteralIndex >= 0 && commentPos < lastUILiteralIndex || lastCommandIndex >= 0 && commentPos < lastCommandIndex) {
      return content;
    }

    return content.substring(0, commentPos);
  }

  removeComment(content, ignoreTrim = false) {
    const result = this.remove(content);
    return ignoreTrim ? result : result.trim();
  }

}

class LexicalException extends LocatedException {
  constructor() {
    super(...arguments);
    this.name = 'LexicalError';
  }

}

class BlockLexer {
  constructor(_words, _nodeType) {
    this._words = _words;
    this._nodeType = _nodeType;
    this._separator = Symbols.TITLE_SEPARATOR;
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [];
  }

  affectedKeyword() {
    return this._nodeType;
  }

  updateWords(words) {
    this._words = words;
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + this._separator + Expressions.OPTIONAL_SPACES_OR_TABS;
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let content = new CommentHandler().removeComment(line);

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      }
    };
    let errors = [];

    let contentAfterSeparator = this._lineChecker.textAfterSeparator(this._separator, content);

    if (contentAfterSeparator.length != 0) {
      let loc = {
        line: lineNumber || 0,
        column: line.indexOf(contentAfterSeparator) + 1
      };
      let msg = 'Invalid content after the ' + this._nodeType + ': "' + contentAfterSeparator + '".';
      errors.push(new LexicalException(msg, loc));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

}

class BeforeAllLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.BEFORE_ALL);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}
class AfterAllLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.AFTER_ALL);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}
class BeforeFeatureLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.BEFORE_FEATURE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}
class AfterFeatureLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.AFTER_FEATURE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}
class BeforeEachScenarioLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.BEFORE_EACH_SCENARIO);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}
class AfterEachScenarioLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.AFTER_EACH_SCENARIO);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}

class BackgroundLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.BACKGROUND);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN, NodeTypes.VARIANT_BACKGROUND, NodeTypes.SCENARIO];
  }

}

class ConstantBlockLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.CONSTANT_BLOCK);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.CONSTANT];
  }

}

class ConstantLexer {
  constructor(_words) {
    this._words = _words;
    this._lineChecker = new LineChecker();
    this._nodeType = NodeTypes.CONSTANT;
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.CONSTANT];
  }

  affectedKeyword() {
    return NodeTypes.IS;
  }

  updateWords(words) {
    this._words = words;
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let name = result[1].replace(new RegExp(Symbols.VALUE_WRAPPER, 'g'), '').trim();
    let value = result[2];
    let firstWrapperIndex = value.indexOf(Symbols.VALUE_WRAPPER);

    if (firstWrapperIndex >= 0) {
      let lastWrapperIndex = value.lastIndexOf(Symbols.VALUE_WRAPPER);

      if (firstWrapperIndex != lastWrapperIndex) {
        value = value.substring(firstWrapperIndex + 1, lastWrapperIndex);
      }
    }

    let content = new CommentHandler().removeComment(line);
    content = this._lineChecker.textAfterSeparator(Symbols.LIST_ITEM_PREFIX, content).trim();
    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      name: name,
      value: value,
      content: content
    };
    let errors = [];

    if (0 == name.length) {
      let msg = this._nodeType + ' cannot have an empty name.';
      errors.push(new LexicalException(msg, node.location));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

  makeRegexForTheWords(words) {
    const regexStr = '^' + Expressions.OPTIONAL_SPACES_OR_TABS + Symbols.LIST_ITEM_PREFIX + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.SOMETHING_INSIDE_QUOTES + Expressions.OPTIONAL_SPACES_OR_TABS + '(?:' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + Expressions.SOMETHING_INSIDE_QUOTES + '|' + Expressions.A_NUMBER + ')' + Expressions.OPTIONAL_SPACES_OR_TABS;
    return regexStr;
  }

}

class NamedNodeLexer {
  constructor(_words, _nodeType) {
    this._words = _words;
    this._nodeType = _nodeType;
    this._separator = Symbols.TITLE_SEPARATOR;
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [];
  }

  affectedKeyword() {
    return this._nodeType;
  }

  updateWords(words) {
    this._words = words;
  }

  separator() {
    return this._separator;
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + this._separator + Expressions.ANYTHING;
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let name = new CommentHandler().removeComment(line);
    name = this._lineChecker.textAfterSeparator(this._separator, name).trim();
    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      name: name
    };
    let errors = [];

    if (!this.isValidName(name)) {
      let loc = {
        line: lineNumber || 0,
        column: line.indexOf(name) + 1
      };
      let msg = 'Invalid ' + this._nodeType + ' name: "' + name + '"';
      errors.push(new LexicalException(msg, loc));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

  isValidName(name) {
    return XRegExp('^[\\p{L}][\\p{L}0-9 ._-]*$', 'ui').test(name);
  }

}

class DatabaseLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.DATABASE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.DATABASE];
  }

}

class ListItemLexer {
  constructor(_nodeType) {
    this._nodeType = _nodeType;
    this._symbol = Symbols.LIST_ITEM_PREFIX;
    this._lineChecker = new LineChecker();
  }

  makeRegex() {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + this._symbol + Expressions.ANYTHING;
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [];
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegex(), "u");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let content = new CommentHandler().removeComment(line);
    content = this._lineChecker.textAfterSeparator(this._symbol, content).trim();

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      content: content
    };
    let errors = [];

    if (0 === content.length) {
      let msg = 'Empty content in ' + this._nodeType + '.';
      errors.push(new LexicalException(msg, node.location));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

}

class DatabasePropertyLexer extends ListItemLexer {
  constructor() {
    super(NodeTypes.DATABASE_PROPERTY);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.DATABASE_PROPERTY];
  }

}

class FeatureLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.FEATURE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.SCENARIO];
  }

}

class QuotedNodeLexer {
  constructor(_words, _nodeType) {
    this._words = _words;
    this._nodeType = _nodeType;
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [];
  }

  affectedKeyword() {
    return this._nodeType;
  }

  updateWords(words) {
    this._words = words;
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + '(?:' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.SOMETHING_INSIDE_QUOTES + Expressions.OPTIONAL_SPACES_OR_TABS;
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let value = new CommentHandler().removeComment(line);
    value = this._lineChecker.textAfterSeparator(Symbols.VALUE_WRAPPER, value).replace(new RegExp(Symbols.VALUE_WRAPPER, 'g'), '').trim();

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      value: value
    };
    let errors = [];

    if (!this.isValidName(value)) {
      let loc = {
        line: lineNumber || 0,
        column: line.indexOf(value) + 1
      };
      let msg = 'Invalid ' + this._nodeType + ': "' + value + '"';
      errors.push(new LexicalException(msg, loc));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

  isValidName(name) {
    return XRegExp('^[\\p{L}][\\p{L}0-9 ._-]*$', 'ui').test(name);
  }

}

class ImportLexer extends QuotedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.IMPORT);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.FEATURE, NodeTypes.VARIANT];
  }

  isValidName(name) {
    return isValidPath(name);
  }

}

class LanguageLexer {
  constructor(_words) {
    this._words = _words;
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return NodeTypes.LANGUAGE;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.IMPORT, NodeTypes.FEATURE, NodeTypes.VARIANT];
  }

  affectedKeyword() {
    return NodeTypes.LANGUAGE;
  }

  updateWords(words) {
    this._words = words;
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.escape(Symbols.LANGUAGE_PREFIX) + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.escape(Symbols.LANGUAGE_SEPARATOR) + Expressions.ANYTHING;
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let value = this._lineChecker.textAfterSeparator(Symbols.LANGUAGE_SEPARATOR, line).trim();

    let node = {
      nodeType: NodeTypes.LANGUAGE,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      value: value
    };
    return {
      nodes: [node],
      errors: []
    };
  }

}

class LongStringLexer {
  nodeType() {
    return NodeTypes.LONG_STRING;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.LONG_STRING];
  }

  analyze(line, lineNumber) {
    if (0 === line.trim().length) {
      return null;
    }

    let re = new RegExp('^""" *(' + Symbols.COMMENT_PREFIX + '.*)?$', 'u');

    if (!re.test(line)) {
      return null;
    }

    let node = {
      nodeType: NodeTypes.LONG_STRING,
      location: {
        line: lineNumber || 0,
        column: 1
      }
    };
    return {
      nodes: [node],
      errors: []
    };
  }

}

class RegexBlockLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.REGEX_BLOCK);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.REGEX];
  }

}

class RegexLexer {
  constructor(_words) {
    this._words = _words;
    this._lineChecker = new LineChecker();
    this._nodeType = NodeTypes.REGEX;
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.REGEX];
  }

  affectedKeyword() {
    return NodeTypes.IS;
  }

  updateWords(words) {
    this._words = words;
  }

  analyze(line, lineNumber) {
    let result = new RegExp(this.makeRegexForTheWords(this._words), 'ui').exec(line);

    if (!result) {
      return null;
    }

    const regex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    let m;
    let values = [];

    while ((m = regex.exec(line)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        if (match && match.trim().length > 1) {
          values.push(match);
        }
      });
    }

    if (values.length < 1) {
      return null;
    }

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let name = values[0].replace(new RegExp(Symbols.VALUE_WRAPPER, 'g'), '').trim();
    let value = values[1];
    let firstWrapperIndex = value.indexOf(Symbols.VALUE_WRAPPER);

    if (firstWrapperIndex >= 0) {
      let lastWrapperIndex = value.lastIndexOf(Symbols.VALUE_WRAPPER);

      if (firstWrapperIndex != lastWrapperIndex) {
        value = value.substring(firstWrapperIndex + 1, lastWrapperIndex);
      }
    }

    let content = new CommentHandler().removeComment(line);
    content = this._lineChecker.textAfterSeparator(Symbols.LIST_ITEM_PREFIX, content).trim();
    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      content: content,
      name: name,
      value: value
    };
    let errors = [];

    if (0 == name.length) {
      let msg = this._nodeType + ' cannot have an empty name.';
      errors.push(new LexicalException(msg, node.location));
    }

    return {
      nodes: [node],
      errors: errors
    };
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + Symbols.LIST_ITEM_PREFIX + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.SOMETHING_INSIDE_QUOTES + Expressions.OPTIONAL_SPACES_OR_TABS + '(?:' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + Expressions.SOMETHING_INSIDE_QUOTES + ')' + Expressions.OPTIONAL_SPACES_OR_TABS;
  }

}

class ScenarioLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.SCENARIO);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT_BACKGROUND, NodeTypes.VARIANT];
  }

}

class StartingKeywordLexer {
  constructor(_words, _nodeType) {
    this._words = _words;
    this._nodeType = _nodeType;
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return this._nodeType;
  }

  suggestedNextNodeTypes() {
    return [];
  }

  affectedKeyword() {
    return this._nodeType;
  }

  updateWords(words) {
    this._words = words;
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + '(?:' + words.join('|') + ')' + Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA + '(' + Expressions.ANYTHING + ')';
  }

  analyze(line, lineNumber) {
    let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
    let result = exp.exec(line);

    if (!result) {
      return null;
    }

    const commentHandler = new CommentHandler();
    let value = commentHandler.removeComment(result[1]);
    let content = commentHandler.removeComment(line);

    let pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let node = {
      nodeType: this._nodeType,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      content: content
    };

    if ('value' in node) {
      node['value'] = value;
    }

    let warnings = [];

    if (value.length < 1) {
      let w = new Warning('Value is empty', node.location);
      warnings.push(w);
    }

    return {
      nodes: [node],
      errors: [],
      warnings: warnings
    };
  }

}

class StepAndLexer extends StartingKeywordLexer {
  constructor(words) {
    super(words, NodeTypes.STEP_AND);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN];
  }

}

class StepGivenLexer extends StartingKeywordLexer {
  constructor(words) {
    super(words, NodeTypes.STEP_GIVEN);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN];
  }

}

class StepOtherwiseLexer extends StartingKeywordLexer {
  constructor(words) {
    super(words, NodeTypes.STEP_OTHERWISE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_AND];
  }

}

class StepThenLexer extends StartingKeywordLexer {
  constructor(words) {
    super(words, NodeTypes.STEP_THEN);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_AND];
  }

}

class StepWhenLexer extends StartingKeywordLexer {
  constructor(words) {
    super(words, NodeTypes.STEP_WHEN);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_AND, NodeTypes.STEP_THEN];
  }

}

class TableLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.TABLE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.TABLE_ROW];
  }

}

class TableRowLexer {
  nodeType() {
    return NodeTypes.TABLE_ROW;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.TABLE_ROW];
  }

  analyze(line, lineNumber) {
    if (line.trimLeft().startsWith(Symbols.COMMENT_PREFIX)) {
      return null;
    }

    line = line.replace(new RegExp(Expressions.escape(Symbols.TABLE_CELL_SEPARATOR + Symbols.TABLE_CELL_SEPARATOR), 'g'), Symbols.TABLE_CELL_SEPARATOR + ' ' + Symbols.TABLE_CELL_SEPARATOR);
    let index = line.indexOf(Symbols.TABLE_PREFIX);

    if (index < 0) {
      return null;
    }

    let lastIndex = line.lastIndexOf(Symbols.TABLE_PREFIX);

    if (lastIndex == index) {
      return null;
    }

    const content = line.substring(index + Symbols.TABLE_PREFIX.length, lastIndex - Symbols.TABLE_PREFIX.length);
    const cells = content.split(Symbols.TABLE_CELL_SEPARATOR).map(value => value.trim());
    const location = {
      column: index,
      line: lineNumber
    };
    let errors = [];

    if (cells.length < 1) {
      errors.push(new LexicalException('Invalid table row declaration: "' + line + '".', location));
    }

    let node = {
      nodeType: NodeTypes.TABLE_ROW,
      location: location,
      cells: cells
    };
    return {
      nodes: [node],
      errors: errors
    };
  }

}

class TagLexer {
  constructor(_subLexers = []) {
    this._subLexers = _subLexers;
  }

  nodeType() {
    return NodeTypes.TAG;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.TAG, NodeTypes.VARIANT, NodeTypes.FEATURE, NodeTypes.SCENARIO, NodeTypes.UI_ELEMENT, NodeTypes.UI_PROPERTY];
  }

  analyze(line, lineNumber) {
    let trimmedLine = line.trim();

    if (!trimmedLine.startsWith(Symbols.TAG_PREFIX)) {
      return null;
    }

    trimmedLine = new CommentHandler().removeComment(trimmedLine);
    const SPACE = ' ';
    let tags = (SPACE + trimmedLine).split(SPACE + Symbols.TAG_PREFIX).map(val => val.trim()).filter(val => val.length > 0);
    return this.analyzeEachTag(tags, line, lineNumber || 0);
  }

  analyzeEachTag(tags, line, lineNumber) {
    let regex = XRegExp('^([\\p{L}][\\p{L}0-9_-]*)(\((.*)\))?$', 'ui');
    let errors = [];
    let nodes = [];
    let lastIndex = -1;
    let location;

    for (let tag of tags) {
      lastIndex = line.indexOf(tag);
      location = {
        line: lineNumber,
        column: lastIndex
      };
      let result = regex.exec(tag);

      if (!result || result.length < 4) {
        errors.push(new LexicalException('Invalid tag declaration: ' + tag, location));
        continue;
      }

      let content = result[3];

      if (content) {
        content = content.substr(1, content.length - 2).split(Symbols.TAG_VALUE_SEPARATOR).map(s => s.trim());
      }

      let node = {
        nodeType: NodeTypes.TAG,
        location: location,
        name: result[1],
        content: content
      };

      for (let subLexer of this._subLexers) {
        if (subLexer.containsName(node.name)) {
          node.subType = subLexer.affectedKeyword();
        }
      }

      nodes.push(node);
    }

    return {
      nodes: nodes,
      errors: errors
    };
  }

}
class TagSubLexer {
  constructor(_affectedKeyword, _words) {
    this._affectedKeyword = _affectedKeyword;
    this._words = _words;
  }

  affectedKeyword() {
    return this._affectedKeyword;
  }

  updateWords(words) {
    this._words = words.map(w => w.toLowerCase());
  }

  containsName(name) {
    return this._words.indexOf(name.toLowerCase()) >= 0;
  }

}

class TestCaseLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.TEST_CASE);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}

class TextLexer {
  constructor() {
    this._lineChecker = new LineChecker();
  }

  nodeType() {
    return NodeTypes.TEXT;
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.TEXT];
  }

  analyze(line, lineNumber) {
    let trimmedLine = line.trim();

    if (0 === trimmedLine.length) {
      return null;
    }

    const commentPos = trimmedLine.indexOf(Symbols.COMMENT_PREFIX);

    if (0 === commentPos) {
      return null;
    }

    const pos = this._lineChecker.countLeftSpacesAndTabs(line);

    let node = {
      nodeType: NodeTypes.TEXT,
      location: {
        line: lineNumber || 0,
        column: pos + 1
      },
      content: line
    };
    return {
      nodes: [node],
      errors: []
    };
  }

}

class UIElementLexer extends NamedNodeLexer {
  constructor(words) {
    super(words, NodeTypes.UI_ELEMENT);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.UI_PROPERTY];
  }

}

class UIPropertyLexer extends ListItemLexer {
  constructor() {
    super(NodeTypes.UI_PROPERTY);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.UI_PROPERTY];
  }

}

class VariantBackgroundLexer extends BlockLexer {
  constructor(words) {
    super(words, NodeTypes.VARIANT_BACKGROUND);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT];
  }

}

class NamePlusNumberNodeLexer extends NamedNodeLexer {
  constructor(_words, _nodeType) {
    super(_words, _nodeType);
  }

  makeRegexForTheWords(words) {
    return '^' + Expressions.OPTIONAL_SPACES_OR_TABS + '(' + words.join('|') + ')' + Expressions.OPTIONAL_SPACES_OR_TABS + Expressions.AN_INTEGER_NUMBER + '?' + this.separator() + Expressions.ANYTHING;
  }

}

class VariantLexer extends NamePlusNumberNodeLexer {
  constructor(words) {
    super(words, NodeTypes.VARIANT);
  }

  suggestedNextNodeTypes() {
    return [NodeTypes.STEP_GIVEN];
  }

}

class Lexer {
  constructor(_defaultLanguage, _languageMap, _stopOnFirstError = false) {
    this._defaultLanguage = _defaultLanguage;
    this._languageMap = _languageMap;
    this._stopOnFirstError = _stopOnFirstError;
    this._nodes = [];
    this._errors = [];
    this._lexers = [];
    this._lexersMap = new Map();
    this._lastLexer = null;
    this._tagSubLexers = [];
    this._inLongString = false;
    this._mustRecognizeAsText = false;
    const dictionary = this.loadDictionary(_defaultLanguage);

    if (!dictionary) {
      throw new Error('Cannot load a dictionary for the language: ' + _defaultLanguage);
    }

    this._tagSubLexers = [new TagSubLexer(ReservedTags.IGNORE, dictionary.tagIgnore), new TagSubLexer(ReservedTags.GENERATED, dictionary.tagGenerated), new TagSubLexer(ReservedTags.FAIL, dictionary.tagFail), new TagSubLexer(ReservedTags.SCENARIO, dictionary.tagScenario), new TagSubLexer(ReservedTags.VARIANT, dictionary.tagVariant), new TagSubLexer(ReservedTags.FEATURE, dictionary.tagFeature), new TagSubLexer(ReservedTags.GENERATE_ONLY_VALID_VALUES, dictionary.tagGenerateOnlyValidValues), new TagSubLexer(ReservedTags.IMPORTANCE, dictionary.tagImportance), new TagSubLexer(ReservedTags.GLOBAL, dictionary.tagGlobal)];
    this._lexers = [new LongStringLexer(), new LanguageLexer(dictionary.language), new TagLexer(this._tagSubLexers), new ImportLexer(dictionary.import), new FeatureLexer(dictionary.feature), new BackgroundLexer(dictionary.background), new VariantBackgroundLexer(dictionary.variantBackground), new ScenarioLexer(dictionary.scenario), new StepGivenLexer(dictionary.stepGiven), new StepWhenLexer(dictionary.stepWhen), new StepThenLexer(dictionary.stepThen), new StepAndLexer(dictionary.stepAnd), new StepOtherwiseLexer(dictionary.stepOtherwise), new VariantLexer(dictionary.variant), new TestCaseLexer(dictionary.testCase), new ConstantBlockLexer(dictionary.constantBlock), new ConstantLexer(dictionary.is), new RegexBlockLexer(dictionary.regexBlock), new RegexLexer(dictionary.is), new TableLexer(dictionary.table), new TableRowLexer(), new UIElementLexer(dictionary.uiElement), new UIPropertyLexer(), new DatabaseLexer(dictionary.database), new DatabasePropertyLexer(), new BeforeAllLexer(dictionary.beforeAll), new AfterAllLexer(dictionary.afterAll), new BeforeFeatureLexer(dictionary.beforeFeature), new AfterFeatureLexer(dictionary.afterFeature), new BeforeEachScenarioLexer(dictionary.beforeEachScenario), new AfterEachScenarioLexer(dictionary.afterEachScenario), new TextLexer()];

    for (let lex of this._lexers) {
      this._lexersMap.set(lex.nodeType(), lex);
    }
  }

  defaultLanguage() {
    return this._defaultLanguage;
  }

  reset() {
    this._nodes = [];
    this._errors = [];
    this._inLongString = false;
    this._mustRecognizeAsText = false;
    this.changeLanguage(this.defaultLanguage());
  }

  nodes() {
    return this._nodes;
  }

  hasErrors() {
    return this._errors.length > 0;
  }

  errors() {
    return this._errors;
  }

  stopOnFirstError(stop) {
    if (stop !== undefined) {
      this._stopOnFirstError = stop;
    }

    return this._stopOnFirstError;
  }

  shouldStop() {
    return this._stopOnFirstError && this._errors.length > 0;
  }

  longStringDetected() {
    this._inLongString = !this._inLongString;
    this._mustRecognizeAsText = !this._mustRecognizeAsText;
  }

  mustRecognizeAsText() {
    return this._mustRecognizeAsText;
  }

  changeResultToRecognizedAsText(result) {
    result.errors = [];
    result.warnings = [];

    for (let node of result.nodes) {
      node.nodeType = NodeTypes.TEXT;
    }
  }

  addNodeFromLine(line, lineNumber) {
    if (this.shouldStop()) {
      return false;
    }

    if (0 === line.trim().length) {
      return false;
    }

    let result;

    if (this._lastLexer !== null) {
      const suggestedNodeTypes = this._lastLexer.suggestedNextNodeTypes();

      for (let nodeType of suggestedNodeTypes) {
        if (NodeTypes.TEXT === nodeType) {
          continue;
        }

        let lexer = this._lexersMap.get(nodeType);

        if (!lexer) {
          continue;
        }

        result = lexer.analyze(line, lineNumber);

        if (!result) {
          continue;
        }

        this._lastLexer = lexer;
        this.dealWithResult(result);
        return true;
      }
    }

    for (let lexer of this._lexers) {
      result = lexer.analyze(line, lineNumber);

      if (!result) {
        continue;
      }

      this._lastLexer = lexer;
      this.dealWithResult(result);
      return true;
    }

    return false;
  }

  dealWithResult(result) {
    if (result.nodes.length > 0 && NodeTypes.LONG_STRING === result.nodes[0].nodeType) {
      this.longStringDetected();
    } else if (this.mustRecognizeAsText()) {
      this.changeResultToRecognizedAsText(result);
    }

    if (result.nodes.length > 0 && NodeTypes.LANGUAGE === result.nodes[0].nodeType) {
      let language = result.nodes[0].value;

      if (language != this._defaultLanguage) {
        try {
          this.changeLanguage(language);
        } catch (e) {
          this._errors.push(e);
        }
      }
    }

    this._nodes.push.apply(this._nodes, result.nodes);

    if (result.errors) {
      this._errors.push.apply(this._errors, result.errors);
    }
  }

  addErrorMessage(message) {
    if (this.shouldStop()) {
      return false;
    }

    this._errors.push(new Error(message));

    return true;
  }

  changeLanguage(language) {
    let dict = this.loadDictionary(language) || {};

    for (let lexer of this._lexers) {
      if (this.isAWordBasedLexer(lexer)) {
        this.updateKeywordBasedLexer(lexer, dict);
      }
    }

    for (let subLexer of this._tagSubLexers) {
      this.updateKeywordBasedLexer(subLexer, dict);
    }

    return dict;
  }

  loadDictionary(language) {
    var _this$_languageMap$la;

    return (_this$_languageMap$la = this._languageMap[language]) == null ? void 0 : _this$_languageMap$la.keywords;
  }

  isAWordBasedLexer(obj) {
    return obj.updateWords !== undefined;
  }

  updateKeywordBasedLexer(kbl, dict) {
    const nodeType = kbl.affectedKeyword();
    const words = dict[nodeType];

    if (words) {
      kbl.updateWords(words);
    }
  }

}

function isString(val) {
  return typeof val === 'string' || isDefined(val) && 'object' === typeof val && '[object String]' === Object.prototype.toString.call(val);
}
function isNumber(val) {
  return isDefined(val) && !isNaN(val);
}
function isDefined(val) {
  return typeof val != 'undefined' && val !== null;
}
function valueOrNull(val) {
  return isDefined(val) ? val : null;
}

var Entities;

(function (Entities) {
  Entities["VALUE"] = "value";
  Entities["NUMBER"] = "number";
  Entities["UI_ELEMENT_REF"] = "ui_element";
  Entities["UI_LITERAL"] = "ui_literal";
  Entities["UI_PROPERTY_REF"] = "ui_property_ref";
  Entities["QUERY"] = "query";
  Entities["CONSTANT"] = "constant";
  Entities["VALUE_LIST"] = "value_list";
  Entities["STATE"] = "state";
  Entities["COMMAND"] = "command";
  Entities["DATE"] = "date";
  Entities["TIME"] = "time";
  Entities["LONG_TIME"] = "longtime";
  Entities["DATE_TIME"] = "datetime";
  Entities["LONG_DATE_TIME"] = "longdatetime";
  Entities["UI_ACTION"] = "ui_action";
  Entities["UI_ACTION_MODIFIER"] = "ui_action_modifier";
  Entities["UI_ACTION_OPTION"] = "ui_action_option";
  Entities["UI_ELEMENT_TYPE"] = "ui_element_type";
  Entities["EXEC_ACTION"] = "exec_action";
  Entities["UI_PROPERTY"] = "ui_property";
  Entities["UI_CONNECTOR"] = "ui_connector";
  Entities["UI_CONNECTOR_MODIFIER"] = "ui_connector_modifier";
  Entities["UI_DATA_TYPE"] = "ui_data_type";
  Entities["BOOL_VALUE"] = "bool_value";
  Entities["DB_PROPERTY"] = "db_property";
})(Entities || (Entities = {}));

var Intents;

(function (Intents) {
  Intents["ALL"] = "*";
  Intents["TEST_CASE"] = "testcase";
  Intents["UI"] = "ui";
  Intents["DATABASE"] = "database";
})(Intents || (Intents = {}));

class NLPException extends LocatedException {
  constructor() {
    super(...arguments);
    this.name = 'NLPError';
  }

}

class NodeSentenceRecognizer {
  constructor(_nlp) {
    this._nlp = _nlp;
  }

  recognize(language, nodes, targetIntents, targetDisplayName, errors, warnings, resultProcessor) {
    if (!nodes) {
      return true;
    }

    if (!this._nlp.isTrained(language)) {
      let msg = 'The language processor is not trained in ' + language;
      errors.push(new NLPException(msg, {
        line: 1,
        column: 1
      }));
      return false;
    }

    nodes.forEach((node, index, allNodes) => {
      let r = this._nlp.recognize(language, node.content);

      if (!r) {
        let msg = 'Unrecognized: "' + node.content + '". Intents: ' + targetIntents.join(',');
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      node['nlpResult'] = r;

      if (isDefined(r) && isDefined(r.intent) && targetIntents.indexOf(r.intent) < 0) {
        let msg = 'Different intent recognized for: ' + node.content + '. Intent: ' + r.intent;
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      let newNode = resultProcessor(node, r, errors, warnings);

      if (!newNode) {
        newNode = node;
      }

      allNodes[index] = newNode;
    });
    return 0 === errors.length;
  }

  validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings) {
    const propertyRuleIndex = syntaxRules.map(sr => sr.name).indexOf(property);

    if (propertyRuleIndex < 0) {
      const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for "' + property + '"';
      warnings.push(new Warning(msg, node.location));
      return false;
    }

    const rule = syntaxRules[propertyRuleIndex];
    const expectedTargetsCount = recognizedEntityNames.filter(name => rule.targets.indexOf(name) >= 0).length;

    if (expectedTargetsCount < rule.minTargets) {
      const msg = '"' + property + '" expects at least ' + rule.minTargets + ' values, but it was informed ' + expectedTargetsCount + '.';
      warnings.push(new Warning(msg, node.location));
      return false;
    }

    if (expectedTargetsCount > rule.maxTargets) {
      const msg = '"' + property + '" expects at most ' + rule.maxTargets + ' values, but it was informed ' + expectedTargetsCount + '.';
      warnings.push(new Warning(msg, node.location));
      return false;
    }

    for (let target of rule.targets) {
      if (!rule[target]) {
        const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for the target "' + target + '" of "' + property + '"';
        warnings.push(new Warning(msg, node.location));
        return false;
      }

      const targetRule = rule[target];

      if (targetRule.min > rule.minTargets || targetRule.max > rule.maxTargets) {
        continue;
      }

      const numberOfEntitiesOfTheTarget = recognizedEntityNames.filter(name => name === target).length;

      if (numberOfEntitiesOfTheTarget > 0) {
        if (numberOfEntitiesOfTheTarget < targetRule.min) {
          const msg = '"' + property + '" expects at least ' + targetRule.min + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget + '.';
          warnings.push(new Warning(msg, node.location));
          return false;
        }

        if (numberOfEntitiesOfTheTarget > targetRule.max) {
          const msg = '"' + property + '" expects at most ' + targetRule.max + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget + '.';
          warnings.push(new Warning(msg, node.location));
          return false;
        }
      }
    }

    for (let otherEntity of rule.mustBeUsedWith || []) {
      if (recognizedEntityNames.indexOf(otherEntity) < 0) {
        const msg = '"' + property + '" must be used with "' + otherEntity + '".';
        warnings.push(new Warning(msg, node.location));
        return false;
      }
    }

    return true;
  }

}

const DB_RULES = {
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE]
};
DB_RULES[Entities.VALUE] = {
  min: 1,
  max: 1
};
DB_RULES[Entities.NUMBER] = {
  min: 1,
  max: 1
};
const DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = DB_RULES;
const DATABASE_PROPERTY_SYNTAX_RULES = [{
  name: DatabaseProperties.TYPE,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.PATH,
  targets: [Entities.VALUE]
}, {
  name: DatabasePropertyAlias.NAME,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.HOST,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.PORT,
  targets: [Entities.VALUE, Entities.NUMBER]
}, {
  name: DatabaseProperties.USERNAME,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.PASSWORD,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.CHARSET,
  targets: [Entities.VALUE]
}, {
  name: DatabaseProperties.OPTIONS,
  targets: [Entities.VALUE]
}];

class SyntaxRuleBuilder {
  build(partialRules, defaultRule) {
    let rules = [];

    for (let rule of partialRules) {
      let newRule = Object.assign({}, defaultRule);
      newRule = Object.assign(newRule, rule);
      rules.push(newRule);
    }

    return rules;
  }

}

class DatabasePropertyRecognizer {
  constructor(_nlp) {
    this._nlp = _nlp;
    this._syntaxRules = this.buildSyntaxRules();
  }

  nlp() {
    return this._nlp;
  }

  isTrained(language) {
    return this._nlp.isTrained(language);
  }

  trainMe(trainer, language) {
    return trainer.trainNLP(this._nlp, language, Intents.DATABASE);
  }

  recognizeSentences(language, nodes, errors, warnings) {
    const recognizer = new NodeSentenceRecognizer(this._nlp);
    const syntaxRules = this._syntaxRules;

    let processor = function (node, r, errors, warnings) {
      const recognizedEntityNames = r.entities.map(e => e.entity);
      const propertyIndex = recognizedEntityNames.indexOf(Entities.DB_PROPERTY);

      if (propertyIndex < 0) {
        const msg = 'Unrecognized: ' + node.content;
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      const property = r.entities[propertyIndex].value;
      recognizer.validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings);
      let values = r.entities.filter(e => e.entity == Entities.VALUE || e.entity == Entities.NUMBER).map(e => e.value);

      if (values.length < 1) {
        const msg = 'Value expected in the sentence "' + node.content + '".';
        errors.push(new NLPException(msg, node.location));
        return;
      }

      let item = node;
      item.property = property;
      item.value = values[0];
      return item;
    };

    recognizer.recognize(language, nodes, [Intents.DATABASE], 'Database Property', errors, warnings, processor);
  }

  buildSyntaxRules() {
    return new SyntaxRuleBuilder().build(DATABASE_PROPERTY_SYNTAX_RULES, DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE);
  }

}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var Actions;

(function (Actions) {
  Actions["ACCEPT"] = "accept";
  Actions["AM_ON"] = "amOn";
  Actions["APPEND"] = "append";
  Actions["ATTACH_FILE"] = "attachFile";
  Actions["CANCEL"] = "cancel";
  Actions["CHECK"] = "check";
  Actions["CLEAR"] = "clear";
  Actions["CLICK"] = "click";
  Actions["CLOSE"] = "close";
  Actions["CONNECT"] = "connect";
  Actions["DISCONNECT"] = "disconnect";
  Actions["DOUBLE_CLICK"] = "doubleClick";
  Actions["DRAG"] = "drag";
  Actions["FILL"] = "fill";
  Actions["HIDE"] = "hide";
  Actions["INSTALL"] = "install";
  Actions["MAXIMIZE"] = "maximize";
  Actions["MOVE"] = "move";
  Actions["MOUSE_OUT"] = "mouseOut";
  Actions["MOUSE_OVER"] = "mouseOver";
  Actions["OPEN"] = "open";
  Actions["PRESS"] = "press";
  Actions["PULL"] = "pull";
  Actions["REFRESH"] = "refresh";
  Actions["REMOVE"] = "remove";
  Actions["RESIZE"] = "resize";
  Actions["RIGHT_CLICK"] = "rightClick";
  Actions["ROTATE"] = "rotate";
  Actions["RUN"] = "run";
  Actions["SAVE_SCREENSHOT"] = "saveScreenshot";
  Actions["SCROLL_TO"] = "scrollTo";
  Actions["SEE"] = "see";
  Actions["SELECT"] = "select";
  Actions["SHAKE"] = "shake";
  Actions["SWIPE"] = "swipe";
  Actions["SWITCH"] = "switch";
  Actions["TAP"] = "tap";
  Actions["UNCHECK"] = "uncheck";
  Actions["UNINSTALL"] = "uninstall";
  Actions["WAIT"] = "wait";
})(Actions || (Actions = {}));

const UI_ACTION_RULE = {
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE, Entities.UI_ELEMENT_REF, Entities.UI_LITERAL]
};
UI_ACTION_RULE[Entities.UI_ELEMENT_REF] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.UI_LITERAL] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.UI_PROPERTY_REF] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.VALUE] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.NUMBER] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.CONSTANT] = {
  min: 1,
  max: 999
};
UI_ACTION_RULE[Entities.STATE] = {
  min: 1,
  max: 1
};
UI_ACTION_RULE[Entities.COMMAND] = {
  min: 1,
  max: 1
};
const DEFAULT_UI_ACTION_SYNTAX_RULE = UI_ACTION_RULE;
const ACCEPT = {
  name: Actions.ACCEPT,
  minTargets: 0,
  maxTargets: 1,
  targets: [Entities.UI_ELEMENT_REF, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const AM_ON = {
  name: Actions.AM_ON,
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const APPEND = {
  name: Actions.APPEND,
  minTargets: 1,
  maxTargets: 999,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
APPEND[Entities.VALUE] = {
  min: 0,
  max: 1
};
APPEND[Entities.NUMBER] = {
  min: 0,
  max: 1
};
APPEND[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
APPEND[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const ATTACH_FILE = {
  name: Actions.ATTACH_FILE,
  minTargets: 1,
  maxTargets: 2,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const CANCEL = {
  name: Actions.CANCEL,
  minTargets: 0,
  maxTargets: 0
};
const CHECK = {
  name: Actions.CHECK,
  minTargets: 1,
  maxTargets: 2,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
CHECK[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 2
};
CHECK[Entities.UI_LITERAL] = {
  min: 0,
  max: 2
};
CHECK[Entities.VALUE] = {
  min: 0,
  max: 1
};
CHECK[Entities.NUMBER] = {
  min: 0,
  max: 1
};
CHECK[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
CHECK[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const CLEAR = {
  name: Actions.CLEAR,
  minTargets: 1,
  maxTargets: 999,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
CLEAR[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 999
};
CLEAR[Entities.UI_LITERAL] = {
  min: 0,
  max: 999
};
CLEAR[Entities.VALUE] = {
  min: 0,
  max: 1
};
CLEAR[Entities.NUMBER] = {
  min: 0,
  max: 1
};
CLEAR[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
CLEAR[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const CLICK = {
  name: Actions.CLICK,
  minTargets: 1,
  maxTargets: 999,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
CLICK[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 999
};
CLICK[Entities.UI_LITERAL] = {
  min: 0,
  max: 999
};
CLICK[Entities.VALUE] = {
  min: 0,
  max: 1
};
CLICK[Entities.NUMBER] = {
  min: 0,
  max: 1
};
CLICK[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
CLICK[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const CLOSE = {
  name: Actions.CLOSE,
  minTargets: 0
};
const CONNECT = {
  name: Actions.CONNECT,
  minTargets: 0,
  maxTargets: 1,
  targets: [Entities.CONSTANT]
};
CONNECT[Entities.CONSTANT] = {
  min: 1,
  max: 1
};
const DISCONNECT = {
  name: Actions.DISCONNECT,
  minTargets: 0,
  maxTargets: 1,
  targets: [Entities.CONSTANT]
};
DISCONNECT[Entities.CONSTANT] = {
  min: 1,
  max: 1
};

const DOUBLE_CLICK = _extends({}, CLICK, {
  name: Actions.DOUBLE_CLICK
});

const DRAG = {
  name: Actions.DRAG,
  minTargets: 2,
  maxTargets: 2,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL]
};
const FILL = {
  name: Actions.FILL,
  minTargets: 1,
  maxTargets: 999,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
FILL[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 999
};
FILL[Entities.UI_LITERAL] = {
  min: 0,
  max: 999
};
FILL[Entities.VALUE] = {
  min: 0,
  max: 1
};
FILL[Entities.NUMBER] = {
  min: 0,
  max: 1
};
FILL[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
FILL[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const HIDE = {
  name: Actions.HIDE,
  minTargets: 0
};
const INSTALL = {
  name: Actions.INSTALL,
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const MAXIMIZE = {
  name: Actions.MAXIMIZE,
  minTargets: 0
};
const MOVE = {
  name: Actions.MOVE,
  minTargets: 1,
  maxTargets: 3,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
MOVE[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 1
};
MOVE[Entities.UI_LITERAL] = {
  min: 0,
  max: 1
};
MOVE[Entities.VALUE] = {
  min: 0,
  max: 2
};
MOVE[Entities.NUMBER] = {
  min: 0,
  max: 2
};
MOVE[Entities.CONSTANT] = {
  min: 0,
  max: 2
};
MOVE[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 2
};

const MOUSE_OUT = _extends({}, CLICK, {
  name: Actions.MOUSE_OUT
});

const MOUSE_OVER = _extends({}, CLICK, {
  name: Actions.MOUSE_OVER
});

const OPEN = {
  name: Actions.OPEN,
  minTargets: 0
};
const PRESS = {
  name: Actions.PRESS,
  minTargets: 1,
  maxTargets: 6,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT]
};
const PULL = {
  name: Actions.PULL,
  minTargets: 2,
  maxTargets: 2,
  targets: [Entities.VALUE, Entities.CONSTANT]
};
const REFRESH = {
  name: Actions.REFRESH,
  minTargets: 0
};
const REMOVE = {
  name: Actions.REMOVE,
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const RESIZE = {
  name: Actions.RESIZE,
  minTargets: 2,
  maxTargets: 2,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT]
};

const RIGHT_CLICK = _extends({}, CLICK, {
  name: Actions.RIGHT_CLICK
});

const ROTATE = {
  name: Actions.ROTATE,
  minTargets: 2,
  maxTargets: 2,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT]
};
const RUN = {
  name: Actions.RUN,
  minTargets: 1,
  maxTargets: 2,
  targets: [Entities.VALUE, Entities.CONSTANT, Entities.COMMAND]
};
RUN[Entities.VALUE] = {
  min: 0,
  max: 1
};
RUN[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
RUN[Entities.COMMAND] = {
  min: 0,
  max: 1
};
const SAVE_SCREENSHOT = {
  name: Actions.SAVE_SCREENSHOT,
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
const SCROLL_TO = {
  name: Actions.SCROLL_TO,
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
SCROLL_TO[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 1
};
SCROLL_TO[Entities.UI_LITERAL] = {
  min: 0,
  max: 1
};
SCROLL_TO[Entities.VALUE] = {
  min: 0,
  max: 1
};
SCROLL_TO[Entities.NUMBER] = {
  min: 0,
  max: 1
};
SCROLL_TO[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
SCROLL_TO[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const SEE = {
  name: Actions.SEE,
  minTargets: 0,
  maxTargets: 3,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
SEE[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 1
};
SEE[Entities.UI_LITERAL] = {
  min: 0,
  max: 1
};
SEE[Entities.VALUE] = {
  min: 0,
  max: 2
};
SEE[Entities.NUMBER] = {
  min: 0,
  max: 2
};
SEE[Entities.CONSTANT] = {
  min: 0,
  max: 2
};
SEE[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const SELECT = {
  name: Actions.SELECT,
  minTargets: 1,
  maxTargets: 2,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
SELECT[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 1
};
SELECT[Entities.UI_LITERAL] = {
  min: 0,
  max: 1
};
SELECT[Entities.VALUE] = {
  min: 0,
  max: 1
};
SELECT[Entities.NUMBER] = {
  min: 0,
  max: 1
};
SELECT[Entities.CONSTANT] = {
  min: 0,
  max: 1
};
SELECT[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 1
};
const SHAKE = {
  name: Actions.SHAKE,
  minTargets: 0
};
const SWIPE = {
  name: Actions.SWIPE,
  minTargets: 1,
  maxTargets: 5,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
SWIPE[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 2
};
SWIPE[Entities.UI_LITERAL] = {
  min: 0,
  max: 2
};
SWIPE[Entities.VALUE] = {
  min: 0,
  max: 3
};
SWIPE[Entities.NUMBER] = {
  min: 0,
  max: 3
};
SWIPE[Entities.CONSTANT] = {
  min: 0,
  max: 3
};
SWIPE[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 3
};
const SWITCH = {
  name: Actions.SWITCH,
  minTargets: 0,
  maxTargets: 3,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
SWITCH[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 3
};
SWITCH[Entities.UI_LITERAL] = {
  min: 0,
  max: 3
};

const TAP = _extends({}, CLICK, {
  name: Actions.TAP
});

const UNCHECK = _extends({}, CHECK, {
  name: Actions.UNCHECK
});

const UNINSTALL = _extends({}, INSTALL, {
  name: Actions.UNINSTALL
});

const WAIT = {
  name: Actions.WAIT,
  minTargets: 1,
  maxTargets: 3,
  targets: [Entities.UI_ELEMENT_REF, Entities.UI_LITERAL, Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.UI_PROPERTY_REF]
};
WAIT[Entities.UI_ELEMENT_REF] = {
  min: 0,
  max: 1
};
WAIT[Entities.UI_LITERAL] = {
  min: 0,
  max: 1
};
WAIT[Entities.VALUE] = {
  min: 0,
  max: 2
};
WAIT[Entities.NUMBER] = {
  min: 0,
  max: 2
};
WAIT[Entities.CONSTANT] = {
  min: 0,
  max: 2
};
WAIT[Entities.UI_PROPERTY_REF] = {
  min: 0,
  max: 2
};
const UI_ACTION_SYNTAX_RULES = [ACCEPT, AM_ON, APPEND, ATTACH_FILE, CANCEL, CHECK, CLEAR, CLICK, CLOSE, CONNECT, DISCONNECT, DOUBLE_CLICK, DRAG, FILL, HIDE, INSTALL, MAXIMIZE, MOVE, MOUSE_OUT, MOUSE_OVER, OPEN, PRESS, PULL, REFRESH, REMOVE, RESIZE, RIGHT_CLICK, ROTATE, RUN, SAVE_SCREENSHOT, SCROLL_TO, SEE, SELECT, SHAKE, SWIPE, SWITCH, TAP, UNCHECK, UNINSTALL, WAIT];

class GivenWhenThenSentenceRecognizer {
  constructor(_nlp) {
    this._nlp = _nlp;
    this._syntaxRules = this.buildSyntaxRules();
  }

  nlp() {
    return this._nlp;
  }

  isTrained(language) {
    return this._nlp.isTrained(language);
  }

  trainMe(trainer, language) {
    return trainer.trainNLP(this._nlp, language, Intents.TEST_CASE);
  }

  recognizeSentences(language, nodes, errors, warnings, ownerName = 'Variant') {
    nodes = nodes || [];
    const recognizer = new NodeSentenceRecognizer(this._nlp);
    const syntaxRules = this._syntaxRules;

    let processor = function (node, r, errors, warnings) {
      if (!r.entities || r.entities.length < 1) {
        const msg = 'Unrecognized entities in: ' + node.content;
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      const recognizedEntityNames = r.entities.map(e => e.entity);
      const actionIndex = recognizedEntityNames.indexOf(Entities.UI_ACTION);
      const execActionIndex = recognizedEntityNames.indexOf(Entities.EXEC_ACTION);

      if (actionIndex < 0 && execActionIndex < 0) {
        const msg = 'Unrecognized action in: ' + node.content;
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      let action;

      if (actionIndex >= 0) {
        action = r.entities[actionIndex].value;
        recognizer.validate(node, recognizedEntityNames, syntaxRules, action, errors, warnings);
      } else if (execActionIndex > 0) {
        action = r.entities[execActionIndex].value;
      }

      let item = node;
      item.action = action;
      const modifiers = r.entities.filter(e => e.entity === Entities.UI_ACTION_MODIFIER).map(e => e.value);

      if (modifiers.length > 0) {
        item.actionModifier = modifiers[0];
      }

      const options = r.entities.filter(e => e.entity === Entities.UI_ACTION_OPTION).map(e => e.value);

      if (options.length > 0) {
        item.actionOptions = options;
      }

      item.targets = r.entities.filter(e => e.entity === Entities.UI_LITERAL).map(e => e.value);
      item.targetTypes = r.entities.filter(e => e.entity === Entities.UI_ELEMENT_TYPE).map(e => e.value);
      item.values = r.entities.filter(e => e.entity === Entities.VALUE || e.entity === Entities.NUMBER).map(e => e.value);
      let commands = r.entities.filter(e => e.entity === Entities.COMMAND).map(e => e.value.toString());

      for (let cmd of commands) {
        item.values.push(cmd);
      }

      return item;
    };

    recognizer.recognize(language, nodes, [Intents.TEST_CASE], ownerName, errors, warnings, processor);
  }

  buildSyntaxRules() {
    return new SyntaxRuleBuilder().build(UI_ACTION_SYNTAX_RULES, DEFAULT_UI_ACTION_SYNTAX_RULE);
  }

}

var Bravey = {
  REVISION: '0.1',
  DEBUG: false
};
Bravey.DATA = {};
Bravey.Language = {};
Bravey.Nlp = {};
Bravey.Filter = {};
Bravey.SessionManager = {};
Bravey.Clock = {
  _value: undefined,
  setValue: function (clock) {
    this._value = clock;
  },
  resetValue: function () {
    this.setValue(undefined);
  },
  getValue: function () {
    return this._value;
  }
};
Bravey.File = {};

Bravey.File.load = function (url, cb, method, data) {
  if (typeof module !== 'undefined' && module.exports) {
    if (!Bravey.DATA.fs) Bravey.DATA.fs = require("fs");
    cb(Bravey.DATA.fs.readFileSync(url, 'utf8'));
  } else {
    var xmlhttp = null;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) if (xmlhttp.status == 200) cb(xmlhttp.responseText);else cb();
    };

    xmlhttp.open(method || "GET", url);
    xmlhttp.send(null);
  }
};

Bravey.Text = {};
Bravey.Text.WORDSEP = "[^(a-zA-ZA-Яa-я0-9_!?.:)+\s]*";
Bravey.Text.TRIMSTART = new RegExp("^(" + Bravey.Text.WORDSEP + ")", "gi");
Bravey.Text.TRIMEND = new RegExp("(" + Bravey.Text.WORDSEP + ")$", "gi");

Bravey.Text.spaceToRegex = function (text) {
  return text.replace(/ /g, '(?: |\\t)+');
};

Bravey.Text.generateGUID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

Bravey.Text.calculateScore = function (match, positions) {
  var score = 0;

  for (let i = 0; i < positions.length; i++) if (match[positions[i]]) score++;

  return score;
};

Bravey.Text.entityTrim = function (ent) {
  var firstText = ent.string.match(Bravey.Text.TRIMSTART);
  var lastText = ent.string.match(Bravey.Text.TRIMEND);
  var firstlen = firstText ? firstText[0].length : 0;
  var lastlen = lastText ? lastText[0].length : 0;
  ent.position += firstlen;
  ent.string = ent.string.substr(firstlen, ent.string.length - firstlen - lastlen);
  return ent;
};

Bravey.Text.RegexMap = function (map, def) {
  for (let i = 0; i < map.length; i++) {
    map[i].mtch = [];

    for (let j = 0; j < map[i].str.length; j++) map[i].mtch.push(map[i].str[j].replace(/~/g, ""));
  }

  this.regex = function (must) {
    var out = "(";

    for (let i = 0; i < map.length; i++) for (let j = 0; j < map[i].str.length; j++) out += map[i].str[j].replace(/~/g, "\\b") + "|";

    return out.substr(0, out.length - 1) + ")" + (must ? "" : "?");
  };

  this.get = function (matches, pos, ldef) {
    for (let i = 0; i < map.length; i++) for (let j = 0; j < map[i].mtch.length; j++) if (matches[pos] == map[i].mtch[j]) return map[i].val;

    return ldef == undefined ? def : ldef;
  };
};

Bravey.Text.unique = function (list) {
  var u = {},
      a = [];

  for (let i = 0, l = list.length; i < l; ++i) {
    if (u.hasOwnProperty(list[i])) {
      continue;
    }

    a.push(list[i]);
    u[list[i]] = 1;
  }

  return a;
};

Bravey.Text.clean = function (text, toLowerCase) {
  var newText = Bravey.Text.removeDiacritics(text);

  if (toLowerCase) {
    newText = newText.toLowerCase();
  }

  return newText.trim().replace(/ +(?= )/g, '').replace(/[()]/g, '');
};

Bravey.Text.pad = function (n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

Bravey.Text.tokenize = function (text) {
  var sanitized = text.replace(/[^(a-zA-ZA-Яa-я0-9_)+\s]/g, ' ').trim().replace(/ +(?= )/g, '');
  return Bravey.Text.unique(sanitized.split(/\s+/));
};

Bravey.DATA.diacriticsMap = {};

Bravey.Text.removeDiacritics = function (text) {
  return text.replace(/[^\u0000-\u007E]/g, function (a) {
    return Bravey.DATA.diacriticsMap[a] || a;
  });
};

(function () {
  var defaultDiacriticsRemovalap = [{
    base: ' ',
    letters: "\u00A0"
  }, {
    base: '0',
    letters: "\u07C0"
  }, {
    base: 'A',
    letters: "\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F"
  }, {
    base: 'AA',
    letters: "\uA732"
  }, {
    base: 'AE',
    letters: "\u00C6\u01FC\u01E2"
  }, {
    base: 'AO',
    letters: "\uA734"
  }, {
    base: 'AU',
    letters: "\uA736"
  }, {
    base: 'AV',
    letters: "\uA738\uA73A"
  }, {
    base: 'AY',
    letters: "\uA73C"
  }, {
    base: 'B',
    letters: "\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0181"
  }, {
    base: 'C',
    letters: "\u24b8\uff23\uA73E\u1E08\u0106\u0043\u0108\u010A\u010C\u00C7\u0187\u023B"
  }, {
    base: 'D',
    letters: "\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018A\u0189\u1D05\uA779"
  }, {
    base: 'Dh',
    letters: "\u00D0"
  }, {
    base: 'DZ',
    letters: "\u01F1\u01C4"
  }, {
    base: 'Dz',
    letters: "\u01F2\u01C5"
  }, {
    base: 'E',
    letters: "\u025B\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E\u1D07"
  }, {
    base: 'F',
    letters: "\uA77C\u24BB\uFF26\u1E1E\u0191\uA77B"
  }, {
    base: 'G',
    letters: "\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E\u0262"
  }, {
    base: 'H',
    letters: "\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D"
  }, {
    base: 'I',
    letters: "\u24BE\uFF29\xCC\xCD\xCE\u0128\u012A\u012C\u0130\xCF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197"
  }, {
    base: 'J',
    letters: "\u24BF\uFF2A\u0134\u0248\u0237"
  }, {
    base: 'K',
    letters: "\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2"
  }, {
    base: 'L',
    letters: "\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780"
  }, {
    base: 'LJ',
    letters: "\u01C7"
  }, {
    base: 'Lj',
    letters: "\u01C8"
  }, {
    base: 'M',
    letters: "\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C\u03FB"
  }, {
    base: 'N',
    letters: "\uA7A4\u0220\u24C3\uFF2E\u01F8\u0143\xD1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u019D\uA790\u1D0E"
  }, {
    base: 'NJ',
    letters: "\u01CA"
  }, {
    base: 'Nj',
    letters: "\u01CB"
  }, {
    base: 'O',
    letters: "\u24C4\uFF2F\xD2\xD3\xD4\u1ED2\u1ED0\u1ED6\u1ED4\xD5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\xD6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\xD8\u01FE\u0186\u019F\uA74A\uA74C"
  }, {
    base: 'OE',
    letters: "\u0152"
  }, {
    base: 'OI',
    letters: "\u01A2"
  }, {
    base: 'OO',
    letters: "\uA74E"
  }, {
    base: 'OU',
    letters: "\u0222"
  }, {
    base: 'P',
    letters: "\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754"
  }, {
    base: 'Q',
    letters: "\u24C6\uFF31\uA756\uA758\u024A"
  }, {
    base: 'R',
    letters: "\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782"
  }, {
    base: 'S',
    letters: "\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784"
  }, {
    base: 'T',
    letters: "\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786"
  }, {
    base: 'Th',
    letters: "\u00DE"
  }, {
    base: 'TZ',
    letters: "\uA728"
  }, {
    base: 'U',
    letters: "\u24CA\uFF35\xD9\xDA\xDB\u0168\u1E78\u016A\u1E7A\u016C\xDC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244"
  }, {
    base: 'V',
    letters: "\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245"
  }, {
    base: 'VY',
    letters: "\uA760"
  }, {
    base: 'W',
    letters: "\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72"
  }, {
    base: 'X',
    letters: "\u24CD\uFF38\u1E8A\u1E8C"
  }, {
    base: 'Y',
    letters: "\u24CE\uFF39\u1EF2\xDD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE"
  }, {
    base: 'Z',
    letters: "\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762"
  }, {
    base: 'a',
    letters: "\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250\u0251"
  }, {
    base: 'aa',
    letters: "\uA733"
  }, {
    base: 'ae',
    letters: "\u00E6\u01FD\u01E3"
  }, {
    base: 'ao',
    letters: "\uA735"
  }, {
    base: 'au',
    letters: "\uA737"
  }, {
    base: 'av',
    letters: "\uA739\uA73B"
  }, {
    base: 'ay',
    letters: "\uA73D"
  }, {
    base: 'b',
    letters: "\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253\u0182"
  }, {
    base: 'c',
    letters: "\uFF43\u24D2\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184"
  }, {
    base: 'd',
    letters: "\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\u018B\u13E7\u0501\uA7AA"
  }, {
    base: 'dh',
    letters: "\u00F0"
  }, {
    base: 'dz',
    letters: "\u01F3\u01C6"
  }, {
    base: 'e',
    letters: "\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u01DD"
  }, {
    base: 'f',
    letters: "\u24D5\uFF46\u1E1F\u0192"
  }, {
    base: 'ff',
    letters: "\uFB00"
  }, {
    base: 'fi',
    letters: "\uFB01"
  }, {
    base: 'fl',
    letters: "\uFB02"
  }, {
    base: 'ffi',
    letters: "\uFB03"
  }, {
    base: 'ffl',
    letters: "\uFB04"
  }, {
    base: 'g',
    letters: "\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\uA77F\u1D79"
  }, {
    base: 'h',
    letters: "\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265"
  }, {
    base: 'hv',
    letters: "\u0195"
  }, {
    base: 'i',
    letters: "\u24D8\uFF49\xEC\xED\xEE\u0129\u012B\u012D\xEF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131"
  }, {
    base: 'j',
    letters: "\u24D9\uFF4A\u0135\u01F0\u0249"
  }, {
    base: 'k',
    letters: "\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3"
  }, {
    base: 'l',
    letters: "\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747\u026D"
  }, {
    base: 'lj',
    letters: "\u01C9"
  }, {
    base: 'm',
    letters: "\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F"
  }, {
    base: 'n',
    letters: "\u24DD\uFF4E\u01F9\u0144\xF1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5\u043B\u0509"
  }, {
    base: 'nj',
    letters: "\u01CC"
  }, {
    base: 'o',
    letters: "\u24DE\uFF4F\xF2\xF3\xF4\u1ED3\u1ED1\u1ED7\u1ED5\xF5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\xF6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\xF8\u01FF\uA74B\uA74D\u0275\u0254\u1D11"
  }, {
    base: 'oe',
    letters: "\u0153"
  }, {
    base: 'oi',
    letters: "\u01A3"
  }, {
    base: 'oo',
    letters: "\uA74F"
  }, {
    base: 'ou',
    letters: "\u0223"
  }, {
    base: 'p',
    letters: "\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755\u03C1"
  }, {
    base: 'q',
    letters: "\u24E0\uFF51\u024B\uA757\uA759"
  }, {
    base: 'r',
    letters: "\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783"
  }, {
    base: 's',
    letters: "\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B\u0282"
  }, {
    base: 'ss',
    letters: "\xDF"
  }, {
    base: 't',
    letters: "\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787"
  }, {
    base: 'th',
    letters: "\u00FE"
  }, {
    base: 'tz',
    letters: "\uA729"
  }, {
    base: 'u',
    letters: "\u24E4\uFF55\xF9\xFA\xFB\u0169\u1E79\u016B\u1E7B\u016D\xFC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289"
  }, {
    base: 'v',
    letters: "\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C"
  }, {
    base: 'vy',
    letters: "\uA761"
  }, {
    base: 'w',
    letters: "\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73"
  }, {
    base: 'x',
    letters: "\u24E7\uFF58\u1E8B\u1E8D"
  }, {
    base: 'y',
    letters: "\u24E8\uFF59\u1EF3\xFD\u0177\u1EF9\u0233\u1E8F\xFF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF"
  }, {
    base: 'z',
    letters: "\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763"
  }];

  for (let i = 0; i < defaultDiacriticsRemovalap.length; i++) {
    var letters = defaultDiacriticsRemovalap[i].letters;

    for (let j = 0; j < letters.length; j++) Bravey.DATA.diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
  }
})();

Bravey.Date = {};
Bravey.Date.SECOND = 1000;
Bravey.Date.MINUTE = Bravey.Date.SECOND * 60;
Bravey.Date.HOUR = Bravey.Date.MINUTE * 60;
Bravey.Date.DAY = Bravey.Date.HOUR * 24;

Bravey.Date.formatDate = function (timestamp) {
  var myDate = new Date(timestamp);
  return Bravey.Text.pad(myDate.getFullYear(), 4) + "-" + Bravey.Text.pad(myDate.getMonth() + 1, 2) + "-" + Bravey.Text.pad(myDate.getDate(), 2);
};

Bravey.Date.formatTime = function (time) {
  return Bravey.Text.pad(Math.floor(time / Bravey.Date.HOUR), 2) + ":" + Bravey.Text.pad(Math.floor(time % Bravey.Date.HOUR / Bravey.Date.MINUTE), 2) + ":" + Bravey.Text.pad(Math.floor(time % Bravey.Date.MINUTE / Bravey.Date.SECOND), 2);
};

Bravey.Date.centuryFinder = function (year) {
  if (year < 100) if (year > 20) return year + 1900;else return year + 2000;
  return year;
};

Bravey.Data = {};

Bravey.Data.getEntityValue = function (matchdata, entityname, defaultvalue) {
  var found;

  if (matchdata) {
    if (matchdata.result !== undefined && matchdata.result.entitiesIndex !== undefined && matchdata.result.entitiesIndex[entityname] !== undefined) found = matchdata.result.entitiesIndex[entityname].value;
    if (found == defaultvalue) found = undefined;
    if (found == undefined && matchdata.sessionData !== undefined) found = matchdata.sessionData[entityname];
  }

  return found;
};

Bravey.Data.isExplicit = function (matchdata, entityname) {
  return matchdata && matchdata.result !== undefined && matchdata.result.entitiesIndex !== undefined && matchdata.result.entitiesIndex[entityname] !== undefined;
};

Bravey.stemmerSupport = {
  Among: function (s, substring_i, result, method) {
    this.toCharArray = function (s) {
      var sLength = s.length,
          charArr = new Array(sLength);

      for (let i = 0; i < sLength; i++) charArr[i] = s.charCodeAt(i);

      return charArr;
    };

    if (!s && s != "" || !substring_i && substring_i != 0 || !result) throw new Error("Bad Among initialisation: s:" + s + ", substring_i: " + substring_i + ", result: " + result);
    this.s_size = s.length;
    this.s = this.toCharArray(s);
    this.substring_i = substring_i;
    this.result = result;
    this.method = method;
  },
  SnowballProgram: function () {
    var current;
    return {
      bra: 0,
      ket: 0,
      limit: 0,
      cursor: 0,
      limit_backward: 0,
      setCurrent: function (word) {
        current = word;
        this.cursor = 0;
        this.limit = word.length;
        this.limit_backward = 0;
        this.bra = this.cursor;
        this.ket = this.limit;
      },
      getCurrent: function () {
        var result = current;
        current = null;
        return result;
      },
      in_grouping: function (s, min, max) {
        if (this.cursor < this.limit) {
          var ch = current.charCodeAt(this.cursor);

          if (ch <= max && ch >= min) {
            ch -= min;

            if (s[ch >> 3] & 0X1 << (ch & 0X7)) {
              this.cursor++;
              return true;
            }
          }
        }

        return false;
      },
      in_grouping_b: function (s, min, max) {
        if (this.cursor > this.limit_backward) {
          var ch = current.charCodeAt(this.cursor - 1);

          if (ch <= max && ch >= min) {
            ch -= min;

            if (s[ch >> 3] & 0X1 << (ch & 0X7)) {
              this.cursor--;
              return true;
            }
          }
        }

        return false;
      },
      out_grouping: function (s, min, max) {
        if (this.cursor < this.limit) {
          var ch = current.charCodeAt(this.cursor);

          if (ch > max || ch < min) {
            this.cursor++;
            return true;
          }

          ch -= min;

          if (!(s[ch >> 3] & 0X1 << (ch & 0X7))) {
            this.cursor++;
            return true;
          }
        }

        return false;
      },
      out_grouping_b: function (s, min, max) {
        if (this.cursor > this.limit_backward) {
          var ch = current.charCodeAt(this.cursor - 1);

          if (ch > max || ch < min) {
            this.cursor--;
            return true;
          }

          ch -= min;

          if (!(s[ch >> 3] & 0X1 << (ch & 0X7))) {
            this.cursor--;
            return true;
          }
        }

        return false;
      },
      eq_s: function (s_size, s) {
        if (this.limit - this.cursor < s_size) return false;

        for (let i = 0; i < s_size; i++) if (current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) return false;

        this.cursor += s_size;
        return true;
      },
      eq_s_b: function (s_size, s) {
        if (this.cursor - this.limit_backward < s_size) return false;

        for (let i = 0; i < s_size; i++) if (current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) return false;

        this.cursor -= s_size;
        return true;
      },
      find_among: function (v, v_size) {
        let i = 0,
            j = v_size,
            c = this.cursor,
            l = this.limit,
            common_i = 0,
            common_j = 0,
            first_key_inspected = false;

        while (true) {
          var k = i + (j - i >> 1),
              diff = 0,
              common = common_i < common_j ? common_i : common_j,
              w = v[k];

          for (var i2 = common; i2 < w.s_size; i2++) {
            if (c + common == l) {
              diff = -1;
              break;
            }

            diff = current.charCodeAt(c + common) - w.s[i2];
            if (diff) break;
            common++;
          }

          if (diff < 0) {
            j = k;
            common_j = common;
          } else {
            i = k;
            common_i = common;
          }

          if (j - i <= 1) {
            if (i > 0 || j == i || first_key_inspected) break;
            first_key_inspected = true;
          }
        }

        while (true) {
          let w = v[i];

          if (common_i >= w.s_size) {
            this.cursor = c + w.s_size;
            if (!w.method) return w.result;
            var res = w.method();
            this.cursor = c + w.s_size;
            if (res) return w.result;
          }

          i = w.substring_i;
          if (i < 0) return 0;
        }
      },
      find_among_b: function (v, v_size) {
        let i = 0,
            j = v_size,
            c = this.cursor,
            lb = this.limit_backward,
            common_i = 0,
            common_j = 0,
            first_key_inspected = false;

        while (true) {
          var k = i + (j - i >> 1),
              diff = 0,
              common = common_i < common_j ? common_i : common_j,
              w = v[k];

          for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
            if (c - common == lb) {
              diff = -1;
              break;
            }

            diff = current.charCodeAt(c - 1 - common) - w.s[i2];
            if (diff) break;
            common++;
          }

          if (diff < 0) {
            j = k;
            common_j = common;
          } else {
            i = k;
            common_i = common;
          }

          if (j - i <= 1) {
            if (i > 0 || j == i || first_key_inspected) break;
            first_key_inspected = true;
          }
        }

        while (true) {
          let w = v[i];

          if (common_i >= w.s_size) {
            this.cursor = c - w.s_size;
            if (!w.method) return w.result;
            var res = w.method();
            this.cursor = c - w.s_size;
            if (res) return w.result;
          }

          i = w.substring_i;
          if (i < 0) return 0;
        }
      },
      replace_s: function (c_bra, c_ket, s) {
        var adjustment = s.length - (c_ket - c_bra),
            left = current.substring(0, c_bra),
            right = current.substring(c_ket);
        current = left + s + right;
        this.limit += adjustment;
        if (this.cursor >= c_ket) this.cursor += adjustment;else if (this.cursor > c_bra) this.cursor = c_bra;
        return adjustment;
      },
      slice_check: function () {
        if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > current.length) throw "faulty slice operation";
      },
      slice_from: function (s) {
        this.slice_check();
        this.replace_s(this.bra, this.ket, s);
      },
      slice_del: function () {
        this.slice_from("");
      },
      insert: function (c_bra, c_ket, s) {
        var adjustment = this.replace_s(c_bra, c_ket, s);
        if (c_bra <= this.bra) this.bra += adjustment;
        if (c_bra <= this.ket) this.ket += adjustment;
      },
      slice_to: function () {
        this.slice_check();
        return current.substring(this.bra, this.ket);
      },
      eq_v_b: function (s) {
        return this.eq_s_b(s.length, s);
      }
    };
  }
};

Bravey.FreeTextEntityRecognizer = function (entityName, priority) {
  var quotes = /\"([^\"]*)\"/;
  var prefixes = [];
  var conjunctions = [];

  this.getName = function () {
    return entityName;
  };

  this.addPrefix = function (prefix) {
    if (prefixes.indexOf(prefix) == -1) prefixes.push(prefix);
  };

  this.addConjunction = function (conjunction) {
    conjunctions.push(new RegExp("^\\b" + conjunction + "\\b", "gi"));
    conjunctions.push(new RegExp("\\b" + conjunction + "\\b$", "gi"));
  };

  this.getEntities = function (string, out) {
    return out;
  };

  this.expand = function (match) {
    var pos,
        found,
        foundcrop = -1,
        foundpos = -1;

    if ((found = quotes.exec(match.string)) != null) {
      match.position += found.index + 1;
      match.string = found[1];
    } else {
      for (let i = 0; i < prefixes.length; i++) {
        if ((pos = match.string.indexOf(prefixes[i])) != -1 && (foundpos == -1 || pos < foundpos)) {
          foundpos = pos;
          foundcrop = pos + prefixes[i].length;
        }
      }

      if (foundcrop != -1) {
        match.position += foundcrop;
        match.string = match.string.substr(foundcrop);
      }

      Bravey.Text.entityTrim(match);

      do {
        foundpos = 0;

        for (let i = 0; i < conjunctions.length; i++) {
          if ((found = conjunctions[i].exec(match.string)) != null) {
            foundpos = 1;

            if (found.index == 0) {
              match.string = match.string.substr(found[0].length);
              match.position += found[0].length;
            } else {
              match.string = match.string.substr(0, found.index);
            }

            Bravey.Text.entityTrim(match);
          }
        }
      } while (foundpos);

      if ((pos = match.string.lastIndexOf(".")) != -1) match.string = match.string.substr(0, pos);
      Bravey.Text.entityTrim(match);
    }

    match.value = match.string;
  };
};

Bravey.StringEntityRecognizer = function (entityName, priority) {
  var index = [];
  var cache = {};
  var sorted = false;

  function reSort() {
    index.sort(function (a, b) {
      if (a.text.length > b.text.length) return -1;
      if (a.text.length < b.text.length) return 1;
      return 0;
    });
  }

  this.getName = function () {
    return entityName;
  };

  this.addMatch = function (entityId, entityText) {
    entityText = Bravey.Text.clean(entityText);

    if (!cache[entityText]) {
      cache[entityText] = 1;
      sorted = false;
      index.push({
        text: entityText,
        id: entityId,
        regex: new RegExp("\\b" + entityText + "\\b", "gi")
      });
    }

    return true;
  };

  this.getEntities = function (string, out) {
    string = Bravey.Text.clean(string);

    if (!sorted) {
      sorted = true;
      reSort();
    }

    var piece, match;
    if (!out) out = [];
    var news,
        s = string;

    for (let i = 0; i < index.length; i++) {
      while ((match = index[i].regex.exec(s)) != null) {
        piece = string.substr(match.index, match[0].length);
        out.push({
          position: match.index,
          entity: entityName,
          value: index[i].id,
          string: piece,
          priority: priority || 0
        });
        news = s.substr(0, match.index);

        for (let j = 0; j < match[0].length; j++) news += " ";

        news += s.substr(match.index + match[0].length);
        s = news;
      }
    }

    return out;
  };
};

Bravey.NumberEntityRecognizer = function (entityName) {
  var regex = new RegExp("\\b[0-9]+\\b", "gi");

  this.getName = function () {
    return entityName;
  };

  this.getEntities = function (string, out) {
    string = Bravey.Text.clean(string);
    var piece, match;
    if (!out) out = [];
    var s = string;

    while ((match = regex.exec(s)) != null) {
      piece = string.substr(match.index, match[0].length);
      out.push({
        position: match.index,
        entity: entityName,
        value: piece * 1,
        string: piece
      });
    }

    return out;
  };
};

Bravey.RegexEntityRecognizer = function (entityName, additionalPriority) {
  function sortEntities(ent) {
    ent.sort(function (a, b) {
      if (a.position < b.position) return -1;
      if (a.position > b.position) return 1;
      if (a.string.length > b.string.length) return -1;
      if (a.string.length < b.string.length) return 1;
      if (a.priority > b.priority) return -1;
      if (a.priority < b.priority) return 1;
      return 0;
    });
  }

  var regexs = [];

  this.addMatch = function addMatch(regex, callback, priority) {
    regexs.push({
      regex: regex,
      callback: callback,
      priority: (priority || 0) + (additionalPriority || 0)
    });
  };

  this.getName = function () {
    return entityName;
  };

  this.getEntities = function (string, out) {
    var found,
        piece,
        match,
        entitiesFound = [],
        pos = -1;
    if (!out) out = [];
    var s = string;

    for (let i = 0; i < regexs.length; i++) {
      while ((match = regexs[i].regex.exec(s)) != null) {
        piece = string.substr(match.index, match[0].length);
        found = regexs[i].callback(match);
        if (found !== undefined) entitiesFound.push(Bravey.Text.entityTrim({
          value: found,
          entity: entityName,
          position: match.index,
          string: piece,
          priority: regexs[i].priority
        }));
      }
    }

    sortEntities(entitiesFound);

    for (let i = 0; i < entitiesFound.length; i++) if (entitiesFound[i].position >= pos) {
      out.push(entitiesFound[i]);
      pos = entitiesFound[i].position + entitiesFound[i].string.length;
    }

    return out;
  };

  this.bindTo = function (obj) {
    var self = this;

    obj.getName = function () {
      return self.getName();
    };

    obj.getEntities = function (string, out) {
      return self.getEntities(string, out);
    };
  };
};

Bravey.EMailEntityRecognizer = function (entityName, priority) {
  var regex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

  this.getName = function () {
    return entityName;
  };

  this.getEntities = function (string, out) {
    var piece, match;
    if (!out) out = [];

    while ((match = regex.exec(string)) != null) {
      piece = string.substr(match.index, match[0].length);
      out.push({
        position: match.index,
        entity: entityName,
        value: piece,
        string: piece,
        priority: priority || 0
      });
    }

    return out;
  };
};

Bravey.DocumentClassifier = function (extensions) {
  extensions = extensions || {};
  var storage = {};

  var stemKey = function (stem, label) {
    return 'stem:' + stem + '::label:' + label;
  };

  var docCountKey = function (label) {
    return 'docCount:' + label;
  };

  var stemCountKey = function (stem) {
    return 'stemCount:' + stem;
  };

  var getLabels = function () {
    var labels = storage['registeredLabels'];
    if (!labels) labels = '';
    return labels.split(',').filter(function (a) {
      return a.length;
    });
  };

  var registerLabel = function (label) {
    var labels = getLabels();

    if (labels.indexOf(label) === -1) {
      labels.push(label);
      storage['registeredLabels'] = labels.join(',');
    }

    return true;
  };

  var stemLabelCount = function (stem, label) {
    var count = parseInt(storage[stemKey(stem, label)]);
    if (!count) count = 0;
    return count;
  };

  var stemInverseLabelCount = function (stem, label) {
    var labels = getLabels();
    var total = 0;

    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += stemLabelCount(stem, labels[i]);
    }

    return total;
  };

  var stemTotalCount = function (stem) {
    var count = parseInt(storage[stemCountKey(stem)]);
    if (!count) count = 0;
    return count;
  };

  var docCount = function (label) {
    var count = parseInt(storage[docCountKey(label)]);
    if (!count) count = 0;
    return count;
  };

  var docInverseCount = function (label) {
    var labels = getLabels();
    var total = 0;

    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += docCount(labels[i]);
    }

    return total;
  };

  var increment = function (key) {
    var count = parseInt(storage[key]);
    if (!count) count = 0;
    storage[key] = count + 1;
    return count + 1;
  };

  var incrementStem = function (stem, label) {
    increment(stemCountKey(stem));
    increment(stemKey(stem, label));
  };

  var incrementDocCount = function (label) {
    return increment(docCountKey(label));
  };

  var train = function (text, label) {
    registerLabel(label);
    var words = Bravey.Text.tokenize(Bravey.Text.clean(text));
    if (extensions.filter) words = extensions.filter(words);
    var length = words.length;

    for (let i = 0; i < length; i++) incrementStem(extensions.stemmer ? extensions.stemmer(words[i]) : words[i], label);

    incrementDocCount(label);
  };

  var guess = function (text) {
    var words = Bravey.Text.tokenize(Bravey.Text.clean(text));
    if (extensions.filter) words = extensions.filter(words);
    var length = words.length;
    var labels = getLabels();
    var totalDocCount = 0;
    var docCounts = {};
    var docInverseCounts = {};
    var scores = {};
    var labelProbability = {};

    for (let j = 0; j < labels.length; j++) {
      var label = labels[j];
      docCounts[label] = docCount(label);
      docInverseCounts[label] = docInverseCount(label);
      totalDocCount += parseInt(docCounts[label]);
    }

    for (let j = 0; j < labels.length; j++) {
      var label = labels[j];
      var logSum = 0;
      labelProbability[label] = docCounts[label] / totalDocCount;

      for (let i = 0; i < length; i++) {
        var word = extensions.stemmer ? extensions.stemmer(words[i]) : words[i];

        var _stemTotalCount = stemTotalCount(word);

        if (_stemTotalCount === 0) {
          continue;
        } else {
          var wordProbability = stemLabelCount(word, label) / docCounts[label];
          var wordInverseProbability = stemInverseLabelCount(word, label) / docInverseCounts[label];
          var wordicity = wordProbability / (wordProbability + wordInverseProbability);
          wordicity = (1 * 0.5 + _stemTotalCount * wordicity) / (1 + _stemTotalCount);
          if (wordicity === 0) wordicity = 0.01;else if (wordicity === 1) wordicity = 0.99;
        }

        logSum += Math.log(1 - wordicity) - Math.log(wordicity);
      }

      scores[label] = 1 / (1 + Math.exp(logSum));
    }

    return scores;
  };

  var extractWinner = function (scores) {
    var bestScore = 0;
    var bestLabel = null;

    for (var label in scores) {
      if (scores[label] > bestScore) {
        bestScore = scores[label];
        bestLabel = label;
      }
    }

    return {
      label: bestLabel,
      score: bestScore
    };
  };

  this.addDocument = function (text, label) {
    train(text, label);
    return text;
  };

  this.classifyDocument = function (text) {
    var scores = guess(text);
    var winner = extractWinner(scores);
    return {
      scores: scores,
      winner: winner
    };
  };

  this.addDocument("", "none");
};

Bravey.Language.IT = {};

Bravey.Language.IT.Stemmer = function () {
  var Among = Bravey.stemmerSupport.Among,
      SnowballProgram = Bravey.stemmerSupport.SnowballProgram,
      st = new function ItalianStemmer() {
    var a_0 = [new Among("", -1, 7), new Among("qu", 0, 6), new Among("\u00E1", 0, 1), new Among("\u00E9", 0, 2), new Among("\u00ED", 0, 3), new Among("\u00F3", 0, 4), new Among("\u00FA", 0, 5)],
        a_1 = [new Among("", -1, 3), new Among("I", 0, 1), new Among("U", 0, 2)],
        a_2 = [new Among("la", -1, -1), new Among("cela", 0, -1), new Among("gliela", 0, -1), new Among("mela", 0, -1), new Among("tela", 0, -1), new Among("vela", 0, -1), new Among("le", -1, -1), new Among("cele", 6, -1), new Among("gliele", 6, -1), new Among("mele", 6, -1), new Among("tele", 6, -1), new Among("vele", 6, -1), new Among("ne", -1, -1), new Among("cene", 12, -1), new Among("gliene", 12, -1), new Among("mene", 12, -1), new Among("sene", 12, -1), new Among("tene", 12, -1), new Among("vene", 12, -1), new Among("ci", -1, -1), new Among("li", -1, -1), new Among("celi", 20, -1), new Among("glieli", 20, -1), new Among("meli", 20, -1), new Among("teli", 20, -1), new Among("veli", 20, -1), new Among("gli", 20, -1), new Among("mi", -1, -1), new Among("si", -1, -1), new Among("ti", -1, -1), new Among("vi", -1, -1), new Among("lo", -1, -1), new Among("celo", 31, -1), new Among("glielo", 31, -1), new Among("melo", 31, -1), new Among("telo", 31, -1), new Among("velo", 31, -1)],
        a_3 = [new Among("ando", -1, 1), new Among("endo", -1, 1), new Among("ar", -1, 2), new Among("er", -1, 2), new Among("ir", -1, 2)],
        a_4 = [new Among("ic", -1, -1), new Among("abil", -1, -1), new Among("os", -1, -1), new Among("iv", -1, 1)],
        a_5 = [new Among("ic", -1, 1), new Among("abil", -1, 1), new Among("iv", -1, 1)],
        a_6 = [new Among("ica", -1, 1), new Among("logia", -1, 3), new Among("osa", -1, 1), new Among("ista", -1, 1), new Among("iva", -1, 9), new Among("anza", -1, 1), new Among("enza", -1, 5), new Among("ice", -1, 1), new Among("atrice", 7, 1), new Among("iche", -1, 1), new Among("logie", -1, 3), new Among("abile", -1, 1), new Among("ibile", -1, 1), new Among("usione", -1, 4), new Among("azione", -1, 2), new Among("uzione", -1, 4), new Among("atore", -1, 2), new Among("ose", -1, 1), new Among("ante", -1, 1), new Among("mente", -1, 1), new Among("amente", 19, 7), new Among("iste", -1, 1), new Among("ive", -1, 9), new Among("anze", -1, 1), new Among("enze", -1, 5), new Among("ici", -1, 1), new Among("atrici", 25, 1), new Among("ichi", -1, 1), new Among("abili", -1, 1), new Among("ibili", -1, 1), new Among("ismi", -1, 1), new Among("usioni", -1, 4), new Among("azioni", -1, 2), new Among("uzioni", -1, 4), new Among("atori", -1, 2), new Among("osi", -1, 1), new Among("anti", -1, 1), new Among("amenti", -1, 6), new Among("imenti", -1, 6), new Among("isti", -1, 1), new Among("ivi", -1, 9), new Among("ico", -1, 1), new Among("ismo", -1, 1), new Among("oso", -1, 1), new Among("amento", -1, 6), new Among("imento", -1, 6), new Among("ivo", -1, 9), new Among("it\u00E0", -1, 8), new Among("ist\u00E0", -1, 1), new Among("ist\u00E8", -1, 1), new Among("ist\u00EC", -1, 1)],
        a_7 = [new Among("isca", -1, 1), new Among("enda", -1, 1), new Among("ata", -1, 1), new Among("ita", -1, 1), new Among("uta", -1, 1), new Among("ava", -1, 1), new Among("eva", -1, 1), new Among("iva", -1, 1), new Among("erebbe", -1, 1), new Among("irebbe", -1, 1), new Among("isce", -1, 1), new Among("ende", -1, 1), new Among("are", -1, 1), new Among("ere", -1, 1), new Among("ire", -1, 1), new Among("asse", -1, 1), new Among("ate", -1, 1), new Among("avate", 16, 1), new Among("evate", 16, 1), new Among("ivate", 16, 1), new Among("ete", -1, 1), new Among("erete", 20, 1), new Among("irete", 20, 1), new Among("ite", -1, 1), new Among("ereste", -1, 1), new Among("ireste", -1, 1), new Among("ute", -1, 1), new Among("erai", -1, 1), new Among("irai", -1, 1), new Among("isci", -1, 1), new Among("endi", -1, 1), new Among("erei", -1, 1), new Among("irei", -1, 1), new Among("assi", -1, 1), new Among("ati", -1, 1), new Among("iti", -1, 1), new Among("eresti", -1, 1), new Among("iresti", -1, 1), new Among("uti", -1, 1), new Among("avi", -1, 1), new Among("evi", -1, 1), new Among("ivi", -1, 1), new Among("isco", -1, 1), new Among("ando", -1, 1), new Among("endo", -1, 1), new Among("Yamo", -1, 1), new Among("iamo", -1, 1), new Among("avamo", -1, 1), new Among("evamo", -1, 1), new Among("ivamo", -1, 1), new Among("eremo", -1, 1), new Among("iremo", -1, 1), new Among("assimo", -1, 1), new Among("ammo", -1, 1), new Among("emmo", -1, 1), new Among("eremmo", 54, 1), new Among("iremmo", 54, 1), new Among("immo", -1, 1), new Among("ano", -1, 1), new Among("iscano", 58, 1), new Among("avano", 58, 1), new Among("evano", 58, 1), new Among("ivano", 58, 1), new Among("eranno", -1, 1), new Among("iranno", -1, 1), new Among("ono", -1, 1), new Among("iscono", 65, 1), new Among("arono", 65, 1), new Among("erono", 65, 1), new Among("irono", 65, 1), new Among("erebbero", -1, 1), new Among("irebbero", -1, 1), new Among("assero", -1, 1), new Among("essero", -1, 1), new Among("issero", -1, 1), new Among("ato", -1, 1), new Among("ito", -1, 1), new Among("uto", -1, 1), new Among("avo", -1, 1), new Among("evo", -1, 1), new Among("ivo", -1, 1), new Among("ar", -1, 1), new Among("ir", -1, 1), new Among("er\u00E0", -1, 1), new Among("ir\u00E0", -1, 1), new Among("er\u00F2", -1, 1), new Among("ir\u00F2", -1, 1)],
        g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2, 1],
        g_AEIO = [17, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2],
        g_CG = [17],
        I_p2,
        I_p1,
        I_pV,
        sbp = new SnowballProgram();

    this.setCurrent = function (word) {
      sbp.setCurrent(word);
    };

    this.getCurrent = function () {
      return sbp.getCurrent();
    };

    function habr1(c1, c2, v_1) {
      if (sbp.eq_s(1, c1)) {
        sbp.ket = sbp.cursor;

        if (sbp.in_grouping(g_v, 97, 249)) {
          sbp.slice_from(c2);
          sbp.cursor = v_1;
          return true;
        }
      }

      return false;
    }

    function r_prelude() {
      var among_var,
          v_1 = sbp.cursor,
          v_2,
          v_3,
          v_4;

      while (true) {
        sbp.bra = sbp.cursor;
        among_var = sbp.find_among(a_0, 7);

        if (among_var) {
          sbp.ket = sbp.cursor;

          switch (among_var) {
            case 1:
              sbp.slice_from("\u00E0");
              continue;

            case 2:
              sbp.slice_from("\u00E8");
              continue;

            case 3:
              sbp.slice_from("\u00EC");
              continue;

            case 4:
              sbp.slice_from("\u00F2");
              continue;

            case 5:
              sbp.slice_from("\u00F9");
              continue;

            case 6:
              sbp.slice_from("qU");
              continue;

            case 7:
              if (sbp.cursor >= sbp.limit) break;
              sbp.cursor++;
              continue;
          }
        }

        break;
      }

      sbp.cursor = v_1;

      while (true) {
        v_2 = sbp.cursor;

        while (true) {
          v_3 = sbp.cursor;

          if (sbp.in_grouping(g_v, 97, 249)) {
            sbp.bra = sbp.cursor;
            v_4 = sbp.cursor;
            if (habr1("u", "U", v_3)) break;
            sbp.cursor = v_4;
            if (habr1("i", "I", v_3)) break;
          }

          sbp.cursor = v_3;

          if (sbp.cursor >= sbp.limit) {
            sbp.cursor = v_2;
            return;
          }

          sbp.cursor++;
        }
      }
    }

    function habr2(v_1) {
      sbp.cursor = v_1;
      if (!sbp.in_grouping(g_v, 97, 249)) return false;

      while (!sbp.out_grouping(g_v, 97, 249)) {
        if (sbp.cursor >= sbp.limit) return false;
        sbp.cursor++;
      }

      return true;
    }

    function habr3() {
      if (sbp.in_grouping(g_v, 97, 249)) {
        var v_1 = sbp.cursor;

        if (sbp.out_grouping(g_v, 97, 249)) {
          while (!sbp.in_grouping(g_v, 97, 249)) {
            if (sbp.cursor >= sbp.limit) return habr2(v_1);
            sbp.cursor++;
          }

          return true;
        }

        return habr2(v_1);
      }

      return false;
    }

    function habr4() {
      var v_1 = sbp.cursor,
          v_2;

      if (!habr3()) {
        sbp.cursor = v_1;
        if (!sbp.out_grouping(g_v, 97, 249)) return;
        v_2 = sbp.cursor;

        if (sbp.out_grouping(g_v, 97, 249)) {
          while (!sbp.in_grouping(g_v, 97, 249)) {
            if (sbp.cursor >= sbp.limit) {
              sbp.cursor = v_2;
              if (sbp.in_grouping(g_v, 97, 249) && sbp.cursor < sbp.limit) sbp.cursor++;
              return;
            }

            sbp.cursor++;
          }

          I_pV = sbp.cursor;
          return;
        }

        sbp.cursor = v_2;
        if (!sbp.in_grouping(g_v, 97, 249) || sbp.cursor >= sbp.limit) return;
        sbp.cursor++;
      }

      I_pV = sbp.cursor;
    }

    function habr5() {
      while (!sbp.in_grouping(g_v, 97, 249)) {
        if (sbp.cursor >= sbp.limit) return false;
        sbp.cursor++;
      }

      while (!sbp.out_grouping(g_v, 97, 249)) {
        if (sbp.cursor >= sbp.limit) return false;
        sbp.cursor++;
      }

      return true;
    }

    function r_mark_regions() {
      var v_1 = sbp.cursor;
      I_pV = sbp.limit;
      I_p1 = I_pV;
      I_p2 = I_pV;
      habr4();
      sbp.cursor = v_1;

      if (habr5()) {
        I_p1 = sbp.cursor;
        if (habr5()) I_p2 = sbp.cursor;
      }
    }

    function r_postlude() {
      var among_var;

      while (true) {
        sbp.bra = sbp.cursor;
        among_var = sbp.find_among(a_1, 3);
        if (!among_var) break;
        sbp.ket = sbp.cursor;

        switch (among_var) {
          case 1:
            sbp.slice_from("i");
            break;

          case 2:
            sbp.slice_from("u");
            break;

          case 3:
            if (sbp.cursor >= sbp.limit) return;
            sbp.cursor++;
            break;
        }
      }
    }

    function r_RV() {
      return I_pV <= sbp.cursor;
    }

    function r_R1() {
      return I_p1 <= sbp.cursor;
    }

    function r_R2() {
      return I_p2 <= sbp.cursor;
    }

    function r_attached_pronoun() {
      var among_var;
      sbp.ket = sbp.cursor;

      if (sbp.find_among_b(a_2, 37)) {
        sbp.bra = sbp.cursor;
        among_var = sbp.find_among_b(a_3, 5);

        if (among_var && r_RV()) {
          switch (among_var) {
            case 1:
              sbp.slice_del();
              break;

            case 2:
              sbp.slice_from("e");
              break;
          }
        }
      }
    }

    function r_standard_suffix() {
      var among_var;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_6, 51);
      if (!among_var) return false;
      sbp.bra = sbp.cursor;

      switch (among_var) {
        case 1:
          if (!r_R2()) return false;
          sbp.slice_del();
          break;

        case 2:
          if (!r_R2()) return false;
          sbp.slice_del();
          sbp.ket = sbp.cursor;

          if (sbp.eq_s_b(2, "ic")) {
            sbp.bra = sbp.cursor;
            if (r_R2()) sbp.slice_del();
          }

          break;

        case 3:
          if (!r_R2()) return false;
          sbp.slice_from("log");
          break;

        case 4:
          if (!r_R2()) return false;
          sbp.slice_from("u");
          break;

        case 5:
          if (!r_R2()) return false;
          sbp.slice_from("ente");
          break;

        case 6:
          if (!r_RV()) return false;
          sbp.slice_del();
          break;

        case 7:
          if (!r_R1()) return false;
          sbp.slice_del();
          sbp.ket = sbp.cursor;
          among_var = sbp.find_among_b(a_4, 4);

          if (among_var) {
            sbp.bra = sbp.cursor;

            if (r_R2()) {
              sbp.slice_del();

              if (among_var == 1) {
                sbp.ket = sbp.cursor;

                if (sbp.eq_s_b(2, "at")) {
                  sbp.bra = sbp.cursor;
                  if (r_R2()) sbp.slice_del();
                }
              }
            }
          }

          break;

        case 8:
          if (!r_R2()) return false;
          sbp.slice_del();
          sbp.ket = sbp.cursor;
          among_var = sbp.find_among_b(a_5, 3);

          if (among_var) {
            sbp.bra = sbp.cursor;
            if (among_var == 1) if (r_R2()) sbp.slice_del();
          }

          break;

        case 9:
          if (!r_R2()) return false;
          sbp.slice_del();
          sbp.ket = sbp.cursor;

          if (sbp.eq_s_b(2, "at")) {
            sbp.bra = sbp.cursor;

            if (r_R2()) {
              sbp.slice_del();
              sbp.ket = sbp.cursor;

              if (sbp.eq_s_b(2, "ic")) {
                sbp.bra = sbp.cursor;
                if (r_R2()) sbp.slice_del();
              }
            }
          }

          break;
      }

      return true;
    }

    function r_verb_suffix() {
      var among_var, v_1;

      if (sbp.cursor >= I_pV) {
        v_1 = sbp.limit_backward;
        sbp.limit_backward = I_pV;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_7, 87);

        if (among_var) {
          sbp.bra = sbp.cursor;
          if (among_var == 1) sbp.slice_del();
        }

        sbp.limit_backward = v_1;
      }
    }

    function habr6() {
      var v_1 = sbp.limit - sbp.cursor;
      sbp.ket = sbp.cursor;

      if (sbp.in_grouping_b(g_AEIO, 97, 242)) {
        sbp.bra = sbp.cursor;

        if (r_RV()) {
          sbp.slice_del();
          sbp.ket = sbp.cursor;

          if (sbp.eq_s_b(1, "i")) {
            sbp.bra = sbp.cursor;

            if (r_RV()) {
              sbp.slice_del();
              return;
            }
          }
        }
      }

      sbp.cursor = sbp.limit - v_1;
    }

    function r_vowel_suffix() {
      habr6();
      sbp.ket = sbp.cursor;

      if (sbp.eq_s_b(1, "h")) {
        sbp.bra = sbp.cursor;
        if (sbp.in_grouping_b(g_CG, 99, 103)) if (r_RV()) sbp.slice_del();
      }
    }

    this.stem = function () {
      var v_1 = sbp.cursor;
      r_prelude();
      sbp.cursor = v_1;
      r_mark_regions();
      sbp.limit_backward = v_1;
      sbp.cursor = sbp.limit;
      r_attached_pronoun();
      sbp.cursor = sbp.limit;

      if (!r_standard_suffix()) {
        sbp.cursor = sbp.limit;
        r_verb_suffix();
      }

      sbp.cursor = sbp.limit;
      r_vowel_suffix();
      sbp.cursor = sbp.limit_backward;
      r_postlude();
      return true;
    };
  }();
  return function (word) {
    st.setCurrent(word);
    st.stem();
    return st.getCurrent();
  };
}();

Bravey.Language.IT.TimeEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var mins = new Bravey.Text.RegexMap([{
    str: ["meno un quarto~"],
    val: -45 * Bravey.Date.MINUTE
  }, {
    str: ["meno venti~", " meno 20"],
    val: -20 * Bravey.Date.MINUTE
  }, {
    str: ["meno un quarto~"],
    val: -15 * Bravey.Date.MINUTE
  }, {
    str: ["mezza~", "trenta"],
    val: 30 * Bravey.Date.MINUTE
  }, {
    str: ["venti~"],
    val: 30 * Bravey.Date.MINUTE
  }, {
    str: ["un quarto~", "quindici~", "un quarto~"],
    val: 15 * Bravey.Date.MINUTE
  }], 0);
  var daytime = new Bravey.Text.RegexMap([{
    str: ["di mattina~", "del mattino~", "am~", "antimeridiane~"],
    val: 0
  }, {
    str: ["di pomeriggio~", "del pomeriggio~", "di sera~", "della sera~", "pomeridiane~", "pm~"],
    val: 12 * Bravey.Date.HOUR
  }], 0);
  matcher.addMatch(new RegExp("\\b(per le\\b|l\\b|alle\\b|la\\b|le\\b)?" + Bravey.Text.WORDSEP + "(ore\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + "(e\\b|:\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)?" + Bravey.Text.WORDSEP + mins.regex() + Bravey.Text.WORDSEP + "( minuti)?" + Bravey.Text.WORDSEP + daytime.regex() + "\\b", "gi"), function (match) {
    var time = match[3] * 1 * Bravey.Date.HOUR;
    if (match[4] && match[5]) time += match[5] * 1 * Bravey.Date.MINUTE;
    time += mins.get(match, 6);
    time += daytime.get(match, 8);
    if (Bravey.Text.calculateScore(match, [1, 2, 5, 6, 7, 8])) return Bravey.Date.formatTime(time);
  });
  matcher.bindTo(this);
};

Bravey.Language.IT.TimePeriodEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var rangematcher = new Bravey.Text.RegexMap([{
    str: ["secondo~", "secondi~"],
    val: Bravey.Date.SECOND
  }, {
    str: ["minuti~", "minuto~"],
    val: Bravey.Date.MINUTE
  }, {
    str: ["ore~", "ora~"],
    val: Bravey.Date.HOUR
  }], 0);
  matcher.addMatch(new RegExp("\\b(entro\\b|tra\\b|in\\b)" + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + rangematcher.regex(1), "gi"), function (match) {
    var now,
        then,
        date = new Date();
    now = then = date.getHours() * Bravey.Date.HOUR + date.getMinutes() * Bravey.Date.MINUTE;
    then += match[2] * rangematcher.get(match, 3);
    if (Bravey.Text.calculateScore(match, [1, 3])) return {
      start: Bravey.Date.formatTime(now),
      end: Bravey.Date.formatTime(then)
    };
  });
  matcher.addMatch(new RegExp("\\b(di sera|della sera|in serata|nella serata|la sera|sera|stasera)\\b", "gi"), function (match) {
    return {
      start: "12:00:00",
      end: "23:59:00"
    };
  });
  matcher.addMatch(new RegExp("\\b(di pomeriggio|del pomeriggio|nel pomeriggio|il pomeriggio|pomeriggio)\\b", "gi"), function (match) {
    return {
      start: "15:00:00",
      end: "23:59:00"
    };
  });
  matcher.addMatch(new RegExp("\\b(di mattina|del mattino|in mattinata|della mattinata|la mattinata|mattina|stamattina)\\b", "gi"), function (match) {
    return {
      start: "08:00:00",
      end: "12:00:00"
    };
  });
  matcher.bindTo(this);
};

Bravey.Language.IT.DateEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var prefixes = "\\b(per il\\b|di\\b|nel giorno di\\b|nella giornata di\\b|la giornata di\\b|il\\b|nel\\b|lo scorso\\b)?" + Bravey.Text.WORDSEP;
  var months = new Bravey.Text.RegexMap([{
    str: ["gennaio~", "gen~", "1~", "01~"],
    val: 0
  }, {
    str: ["febbraio~", "feb~", "2~", "02~"],
    val: 1
  }, {
    str: ["marzo~", "mar~", "3~", "03~"],
    val: 2
  }, {
    str: ["aprile~", "apr~", "4~", "04~"],
    val: 3
  }, {
    str: ["maggio~", "mag~", "5~", "05~"],
    val: 4
  }, {
    str: ["giugno~", "giu~", "6~", "06~"],
    val: 5
  }, {
    str: ["luglio~", "lug~", "7~", "07~"],
    val: 6
  }, {
    str: ["agosto~", "ago~", "8~", "08~"],
    val: 7
  }, {
    str: ["settembre~", "set~", "sept~", "9~", "09~"],
    val: 8
  }, {
    str: ["ottobre~", "ott~", "10~"],
    val: 9
  }, {
    str: ["novembre~", "nov~", "11~"],
    val: 10
  }, {
    str: ["dicembre~", "dic~", "12~"],
    val: 11
  }], 0);
  matcher.addMatch(new RegExp(prefixes + "([0-9]{1,2})" + Bravey.Text.WORDSEP + "(di\\b|,\\b|/\\b|-\\b|\\b)" + Bravey.Text.WORDSEP + months.regex() + Bravey.Text.WORDSEP + "(del\\b|dell'\\b|nel\\b|,\\b|/\\b|-\\b)?" + Bravey.Text.WORDSEP + "([0-9]{2,4})?" + "\\b", "gi"), function (match) {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    var d = now.getDate();
    d = match[2] * 1;
    m = months.get(match, 4, m);
    if (match[6]) y = match[6] * 1;
    y = Bravey.Date.centuryFinder(y);
    if (Bravey.Text.calculateScore(match, [1, 4, 6])) return Bravey.Date.formatDate(new Date(y, m, d, 0, 0, 0, 0).getTime());
  }, 10);
  matcher.addMatch(new RegExp(prefixes + months.regex(1) + Bravey.Text.WORDSEP + "([0-9]{1,2})?" + Bravey.Text.WORDSEP + "(del\\b|dell'\\b|,\\b)?" + Bravey.Text.WORDSEP + "([0-9]{2,4})?" + "\\b", "gi"), function (match) {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    var d = 1;
    m = months.get(match, 2, m);
    if (match[3]) d = match[3] * 1;
    if (match[5]) y = match[5] * 1;
    y = Bravey.Date.centuryFinder(y);
    if (Bravey.Text.calculateScore(match, [1, 3, 4])) return Bravey.Date.formatDate(new Date(y, m, d, 0, 0, 0, 0).getTime());
  }, 5);
  prefixes = "\\b(per\\b|di\\b|nel giorno di\\b|nella giornata di\\b|la giornata di\\b|lo scorso\\b)?" + Bravey.Text.WORDSEP;
  matcher.addMatch(new RegExp(prefixes + "(oggi)\\b", "gi"), function (match) {
    return Bravey.Date.formatDate(new Date().getTime());
  });
  matcher.addMatch(new RegExp(prefixes + "(domani)\\b", "gi"), function (match) {
    return Bravey.Date.formatDate(new Date().getTime() + Bravey.Date.DAY);
  });
  matcher.addMatch(new RegExp(prefixes + "(dopodomani)\\b", "gi"), function (match) {
    return Bravey.Date.formatDate(new Date().getTime() + Bravey.Date.DAY * 2);
  });
  matcher.addMatch(new RegExp(prefixes + "(ieri)\\b", "gi"), function (match) {
    return Bravey.Date.formatDate(new Date().getTime() - Bravey.Date.DAY);
  });
  matcher.addMatch(new RegExp(prefixes + "(l'altro ieri|ieri l'altro)\\b", "gi"), function (match) {
    return Bravey.Date.formatDate(new Date().getTime() - Bravey.Date.DAY * 2);
  });
  matcher.bindTo(this);
};

Bravey.Language.IT.FreeTextEntityRecognizer = function (entityName, priority) {
  var commas = ["grazie", "per favore"];
  var matcher = new Bravey.FreeTextEntityRecognizer(entityName, priority);
  matcher.addConjunction("il");
  matcher.addConjunction("lo");
  matcher.addConjunction("la");
  matcher.addConjunction("i");
  matcher.addConjunction("gli");
  matcher.addConjunction("le");
  matcher.addConjunction("è");
  matcher.addConjunction("é");
  matcher.addConjunction("e");
  matcher.addConjunction("ed");
  matcher.addConjunction("e'");
  matcher.addConjunction("sia");
  matcher.addConjunction("mi pare");
  matcher.addConjunction("dovrebbe essere");
  matcher.addConjunction("sarebbe");

  for (let i = 0; i < commas.length; i++) {
    matcher.addConjunction(commas[i]);
    matcher.addConjunction("," + commas[i]);
    matcher.addConjunction(", " + commas[i]);
  }

  return matcher;
};

Bravey.Language.IT.Numbers = [{
  prefix: "zero",
  value: 0
}, {
  prefix: "vent",
  value: 20
}, {
  prefix: "trent",
  value: 30
}, {
  prefix: "quarant",
  value: 40
}, {
  prefix: "cinquant",
  value: 50
}, {
  prefix: "sessant",
  value: 60
}, {
  prefix: "settant",
  value: 70
}, {
  prefix: "ottant",
  value: 80
}, {
  prefix: "novant",
  value: 90
}, {
  prefix: "uno",
  value: 1
}, {
  prefix: "quattro",
  value: 4
}, {
  prefix: "quattor",
  value: 4
}, {
  prefix: "cinque",
  value: 5
}, {
  prefix: "quin",
  value: 5
}, {
  prefix: "sei",
  value: 6
}, {
  prefix: "sette",
  value: 7
}, {
  prefix: "otto",
  value: 8
}, {
  prefix: "nove",
  value: 9
}, {
  prefix: "dieci",
  value: 10
}, {
  prefix: "dici",
  value: 10
}, {
  prefix: "se",
  value: 6
}, {
  prefix: "un",
  value: 1
}, {
  prefix: "due",
  value: 2
}, {
  prefix: "do",
  value: 2
}, {
  prefix: "tre",
  value: 3
}, {
  prefix: "a",
  skip: 1
}, {
  prefix: "tor",
  skip: 1
}, {
  prefix: "i",
  skip: 1
}, {
  prefix: "n",
  skip: 1
}, {
  prefix: "s",
  skip: 1
}, {
  prefix: "cento",
  mul: 100
}, {
  prefix: "mila",
  mul: 1000,
  end: 1
}, {
  prefix: "mille",
  mul: 1000,
  end: 1
}, {
  prefix: "milion",
  mul: 1000000,
  end: 1
}, {
  prefix: "miliard",
  mul: 1000000000,
  end: 1
}, {
  prefix: "e",
  skip: 1
}, {
  prefix: "i",
  skip: 1
}, {
  prefix: "o",
  skip: 1
}];

Bravey.Language.IT.NumberEntityRecognizer = function (entityName, priority) {
  var digits = new RegExp("^[0-9]+$", "gi");
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(\\w+)", "gi"), function (match) {
    var word = match[0].toLowerCase();
    var value = 0,
        partial = 0,
        found,
        number,
        ending = 9990,
        valid = false;
    if (word.match(digits)) return word * 1;else {
      do {
        found = false;

        for (let i = 0; i < Bravey.Language.IT.Numbers.length; i++) {
          number = Bravey.Language.IT.Numbers[i];

          if (word.substr(0, number.prefix.length) == number.prefix) {
            word = word.substr(number.prefix.length);

            if (!number.skip) {
              if (ending) {
                if (number.end) {
                  if (i < ending) {
                    value += partial;
                    partial = 0;
                  }

                  ending = i;
                } else {
                  value += partial;
                  partial = 0;
                  ending = 0;
                }
              } else if (number.end) ending = i;

              if (number.value !== undefined) {
                partial += number.value;
                found = true;
                valid = true;
              }

              if (number.mul !== undefined) {
                if (partial) partial *= number.mul;else partial = number.mul;
                found = true;
                valid = true;
              }
            } else found = true;

            if (found) break;
          }
        }
      } while (found);

      value += partial;
      if (!word && valid) return value;
    }
  });
  return matcher;
};

Bravey.Language.EN = {};

Bravey.Language.EN.Stemmer = function () {
  var Among = Bravey.stemmerSupport.Among,
      SnowballProgram = Bravey.stemmerSupport.SnowballProgram,
      st = new function ItalianStemmer() {
    var a_0 = [new Among("arsen", -1, -1), new Among("commun", -1, -1), new Among("gener", -1, -1)],
        a_1 = [new Among("'", -1, 1), new Among("'s'", 0, 1), new Among("'s", -1, 1)],
        a_2 = [new Among("ied", -1, 2), new Among("s", -1, 3), new Among("ies", 1, 2), new Among("sses", 1, 1), new Among("ss", 1, -1), new Among("us", 1, -1)],
        a_3 = [new Among("", -1, 3), new Among("bb", 0, 2), new Among("dd", 0, 2), new Among("ff", 0, 2), new Among("gg", 0, 2), new Among("bl", 0, 1), new Among("mm", 0, 2), new Among("nn", 0, 2), new Among("pp", 0, 2), new Among("rr", 0, 2), new Among("at", 0, 1), new Among("tt", 0, 2), new Among("iz", 0, 1)],
        a_4 = [new Among("ed", -1, 2), new Among("eed", 0, 1), new Among("ing", -1, 2), new Among("edly", -1, 2), new Among("eedly", 3, 1), new Among("ingly", -1, 2)],
        a_5 = [new Among("anci", -1, 3), new Among("enci", -1, 2), new Among("ogi", -1, 13), new Among("li", -1, 16), new Among("bli", 3, 12), new Among("abli", 4, 4), new Among("alli", 3, 8), new Among("fulli", 3, 14), new Among("lessli", 3, 15), new Among("ousli", 3, 10), new Among("entli", 3, 5), new Among("aliti", -1, 8), new Among("biliti", -1, 12), new Among("iviti", -1, 11), new Among("tional", -1, 1), new Among("ational", 14, 7), new Among("alism", -1, 8), new Among("ation", -1, 7), new Among("ization", 17, 6), new Among("izer", -1, 6), new Among("ator", -1, 7), new Among("iveness", -1, 11), new Among("fulness", -1, 9), new Among("ousness", -1, 10)],
        a_6 = [new Among("icate", -1, 4), new Among("ative", -1, 6), new Among("alize", -1, 3), new Among("iciti", -1, 4), new Among("ical", -1, 4), new Among("tional", -1, 1), new Among("ational", 5, 2), new Among("ful", -1, 5), new Among("ness", -1, 5)],
        a_7 = [new Among("ic", -1, 1), new Among("ance", -1, 1), new Among("ence", -1, 1), new Among("able", -1, 1), new Among("ible", -1, 1), new Among("ate", -1, 1), new Among("ive", -1, 1), new Among("ize", -1, 1), new Among("iti", -1, 1), new Among("al", -1, 1), new Among("ism", -1, 1), new Among("ion", -1, 2), new Among("er", -1, 1), new Among("ous", -1, 1), new Among("ant", -1, 1), new Among("ent", -1, 1), new Among("ment", 15, 1), new Among("ement", 16, 1)],
        a_8 = [new Among("e", -1, 1), new Among("l", -1, 2)],
        a_9 = [new Among("succeed", -1, -1), new Among("proceed", -1, -1), new Among("exceed", -1, -1), new Among("canning", -1, -1), new Among("inning", -1, -1), new Among("earring", -1, -1), new Among("herring", -1, -1), new Among("outing", -1, -1)],
        a_10 = [new Among("andes", -1, -1), new Among("atlas", -1, -1), new Among("bias", -1, -1), new Among("cosmos", -1, -1), new Among("dying", -1, 3), new Among("early", -1, 9), new Among("gently", -1, 7), new Among("howe", -1, -1), new Among("idly", -1, 6), new Among("lying", -1, 4), new Among("news", -1, -1), new Among("only", -1, 10), new Among("singly", -1, 11), new Among("skies", -1, 2), new Among("skis", -1, 1), new Among("sky", -1, -1), new Among("tying", -1, 5), new Among("ugly", -1, 8)],
        g_v = [17, 65, 16, 1],
        g_v_WXY = [1, 17, 65, 208, 1],
        g_valid_LI = [55, 141, 2],
        B_Y_found,
        I_p2,
        I_p1,
        habr = [r_Step_1b, r_Step_1c, r_Step_2, r_Step_3, r_Step_4, r_Step_5],
        sbp = new SnowballProgram();

    this.setCurrent = function (word) {
      sbp.setCurrent(word);
    };

    this.getCurrent = function () {
      return sbp.getCurrent();
    };

    function r_prelude() {
      var v_1 = sbp.cursor,
          v_2;
      B_Y_found = false;
      sbp.bra = sbp.cursor;

      if (sbp.eq_s(1, "'")) {
        sbp.ket = sbp.cursor;
        sbp.slice_del();
      }

      sbp.cursor = v_1;
      sbp.bra = v_1;

      if (sbp.eq_s(1, "y")) {
        sbp.ket = sbp.cursor;
        sbp.slice_from("Y");
        B_Y_found = true;
      }

      sbp.cursor = v_1;

      while (true) {
        v_2 = sbp.cursor;

        if (sbp.in_grouping(g_v, 97, 121)) {
          sbp.bra = sbp.cursor;

          if (sbp.eq_s(1, "y")) {
            sbp.ket = sbp.cursor;
            sbp.cursor = v_2;
            sbp.slice_from("Y");
            B_Y_found = true;
            continue;
          }
        }

        if (v_2 >= sbp.limit) {
          sbp.cursor = v_1;
          return;
        }

        sbp.cursor = v_2 + 1;
      }
    }

    function r_mark_regions() {
      var v_1 = sbp.cursor;
      I_p1 = sbp.limit;
      I_p2 = I_p1;

      if (!sbp.find_among(a_0, 3)) {
        sbp.cursor = v_1;

        if (habr1()) {
          sbp.cursor = v_1;
          return;
        }
      }

      I_p1 = sbp.cursor;
      if (!habr1()) I_p2 = sbp.cursor;
    }

    function habr1() {
      while (!sbp.in_grouping(g_v, 97, 121)) {
        if (sbp.cursor >= sbp.limit) return true;
        sbp.cursor++;
      }

      while (!sbp.out_grouping(g_v, 97, 121)) {
        if (sbp.cursor >= sbp.limit) return true;
        sbp.cursor++;
      }

      return false;
    }

    function r_shortv() {
      var v_1 = sbp.limit - sbp.cursor;

      if (!(sbp.out_grouping_b(g_v_WXY, 89, 121) && sbp.in_grouping_b(g_v, 97, 121) && sbp.out_grouping_b(g_v, 97, 121))) {
        sbp.cursor = sbp.limit - v_1;
        if (!sbp.out_grouping_b(g_v, 97, 121) || !sbp.in_grouping_b(g_v, 97, 121) || sbp.cursor > sbp.limit_backward) return false;
      }

      return true;
    }

    function r_R1() {
      return I_p1 <= sbp.cursor;
    }

    function r_R2() {
      return I_p2 <= sbp.cursor;
    }

    function r_Step_1a() {
      var among_var,
          v_1 = sbp.limit - sbp.cursor;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_1, 3);

      if (among_var) {
        sbp.bra = sbp.cursor;
        if (among_var == 1) sbp.slice_del();
      } else sbp.cursor = sbp.limit - v_1;

      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_2, 6);

      if (among_var) {
        sbp.bra = sbp.cursor;

        switch (among_var) {
          case 1:
            sbp.slice_from("ss");
            break;

          case 2:
            var c = sbp.cursor - 2;

            if (sbp.limit_backward > c || c > sbp.limit) {
              sbp.slice_from("ie");
              break;
            }

            sbp.cursor = c;
            sbp.slice_from("i");
            break;

          case 3:
            do {
              if (sbp.cursor <= sbp.limit_backward) return;
              sbp.cursor--;
            } while (!sbp.in_grouping_b(g_v, 97, 121));

            sbp.slice_del();
            break;
        }
      }
    }

    function r_Step_1b() {
      var among_var, v_1, v_3, v_4;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_4, 6);

      if (among_var) {
        sbp.bra = sbp.cursor;

        switch (among_var) {
          case 1:
            if (r_R1()) sbp.slice_from("ee");
            break;

          case 2:
            v_1 = sbp.limit - sbp.cursor;

            while (!sbp.in_grouping_b(g_v, 97, 121)) {
              if (sbp.cursor <= sbp.limit_backward) return;
              sbp.cursor--;
            }

            sbp.cursor = sbp.limit - v_1;
            sbp.slice_del();
            v_3 = sbp.limit - sbp.cursor;
            among_var = sbp.find_among_b(a_3, 13);

            if (among_var) {
              sbp.cursor = sbp.limit - v_3;

              switch (among_var) {
                case 1:
                  var c = sbp.cursor;
                  sbp.insert(sbp.cursor, sbp.cursor, "e");
                  sbp.cursor = c;
                  break;

                case 2:
                  sbp.ket = sbp.cursor;

                  if (sbp.cursor > sbp.limit_backward) {
                    sbp.cursor--;
                    sbp.bra = sbp.cursor;
                    sbp.slice_del();
                  }

                  break;

                case 3:
                  if (sbp.cursor == I_p1) {
                    v_4 = sbp.limit - sbp.cursor;

                    if (r_shortv()) {
                      sbp.cursor = sbp.limit - v_4;
                      var c = sbp.cursor;
                      sbp.insert(sbp.cursor, sbp.cursor, "e");
                      sbp.cursor = c;
                    }
                  }

                  break;
              }
            }

            break;
        }
      }
    }

    function r_Step_1c() {
      var v_1 = sbp.limit - sbp.cursor;
      sbp.ket = sbp.cursor;

      if (!sbp.eq_s_b(1, "y")) {
        sbp.cursor = sbp.limit - v_1;
        if (!sbp.eq_s_b(1, "Y")) return;
      }

      sbp.bra = sbp.cursor;
      if (sbp.out_grouping_b(g_v, 97, 121) && sbp.cursor > sbp.limit_backward) sbp.slice_from("i");
    }

    function r_Step_2() {
      var among_var;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_5, 24);

      if (among_var) {
        sbp.bra = sbp.cursor;

        if (r_R1()) {
          switch (among_var) {
            case 1:
              sbp.slice_from("tion");
              break;

            case 2:
              sbp.slice_from("ence");
              break;

            case 3:
              sbp.slice_from("ance");
              break;

            case 4:
              sbp.slice_from("able");
              break;

            case 5:
              sbp.slice_from("ent");
              break;

            case 6:
              sbp.slice_from("ize");
              break;

            case 7:
              sbp.slice_from("ate");
              break;

            case 8:
              sbp.slice_from("al");
              break;

            case 9:
              sbp.slice_from("ful");
              break;

            case 10:
              sbp.slice_from("ous");
              break;

            case 11:
              sbp.slice_from("ive");
              break;

            case 12:
              sbp.slice_from("ble");
              break;

            case 13:
              if (sbp.eq_s_b(1, "l")) sbp.slice_from("og");
              break;

            case 14:
              sbp.slice_from("ful");
              break;

            case 15:
              sbp.slice_from("less");
              break;

            case 16:
              if (sbp.in_grouping_b(g_valid_LI, 99, 116)) sbp.slice_del();
              break;
          }
        }
      }
    }

    function r_Step_3() {
      var among_var;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_6, 9);

      if (among_var) {
        sbp.bra = sbp.cursor;

        if (r_R1()) {
          switch (among_var) {
            case 1:
              sbp.slice_from("tion");
              break;

            case 2:
              sbp.slice_from("ate");
              break;

            case 3:
              sbp.slice_from("al");
              break;

            case 4:
              sbp.slice_from("ic");
              break;

            case 5:
              sbp.slice_del();
              break;

            case 6:
              if (r_R2()) sbp.slice_del();
              break;
          }
        }
      }
    }

    function r_Step_4() {
      var among_var, v_1;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_7, 18);

      if (among_var) {
        sbp.bra = sbp.cursor;

        if (r_R2()) {
          switch (among_var) {
            case 1:
              sbp.slice_del();
              break;

            case 2:
              v_1 = sbp.limit - sbp.cursor;

              if (!sbp.eq_s_b(1, "s")) {
                sbp.cursor = sbp.limit - v_1;
                if (!sbp.eq_s_b(1, "t")) return;
              }

              sbp.slice_del();
              break;
          }
        }
      }
    }

    function r_Step_5() {
      var among_var, v_1;
      sbp.ket = sbp.cursor;
      among_var = sbp.find_among_b(a_8, 2);

      if (among_var) {
        sbp.bra = sbp.cursor;

        switch (among_var) {
          case 1:
            v_1 = sbp.limit - sbp.cursor;

            if (!r_R2()) {
              sbp.cursor = sbp.limit - v_1;
              if (!r_R1() || r_shortv()) return;
              sbp.cursor = sbp.limit - v_1;
            }

            sbp.slice_del();
            break;

          case 2:
            if (!r_R2() || !sbp.eq_s_b(1, "l")) return;
            sbp.slice_del();
            break;
        }
      }
    }

    function r_exception2() {
      sbp.ket = sbp.cursor;

      if (sbp.find_among_b(a_9, 8)) {
        sbp.bra = sbp.cursor;
        return sbp.cursor <= sbp.limit_backward;
      }

      return false;
    }

    function r_exception1() {
      var among_var;
      sbp.bra = sbp.cursor;
      among_var = sbp.find_among(a_10, 18);

      if (among_var) {
        sbp.ket = sbp.cursor;

        if (sbp.cursor >= sbp.limit) {
          switch (among_var) {
            case 1:
              sbp.slice_from("ski");
              break;

            case 2:
              sbp.slice_from("sky");
              break;

            case 3:
              sbp.slice_from("die");
              break;

            case 4:
              sbp.slice_from("lie");
              break;

            case 5:
              sbp.slice_from("tie");
              break;

            case 6:
              sbp.slice_from("idl");
              break;

            case 7:
              sbp.slice_from("gentl");
              break;

            case 8:
              sbp.slice_from("ugli");
              break;

            case 9:
              sbp.slice_from("earli");
              break;

            case 10:
              sbp.slice_from("onli");
              break;

            case 11:
              sbp.slice_from("singl");
              break;
          }

          return true;
        }
      }

      return false;
    }

    function r_postlude() {
      var v_1;

      if (B_Y_found) {
        while (true) {
          v_1 = sbp.cursor;
          sbp.bra = v_1;

          if (sbp.eq_s(1, "Y")) {
            sbp.ket = sbp.cursor;
            sbp.cursor = v_1;
            sbp.slice_from("y");
            continue;
          }

          sbp.cursor = v_1;
          if (sbp.cursor >= sbp.limit) return;
          sbp.cursor++;
        }
      }
    }

    this.stem = function () {
      var v_1 = sbp.cursor;

      if (!r_exception1()) {
        sbp.cursor = v_1;
        var c = sbp.cursor + 3;

        if (0 <= c && c <= sbp.limit) {
          sbp.cursor = v_1;
          r_prelude();
          sbp.cursor = v_1;
          r_mark_regions();
          sbp.limit_backward = v_1;
          sbp.cursor = sbp.limit;
          r_Step_1a();
          sbp.cursor = sbp.limit;
          if (!r_exception2()) for (let i = 0; i < habr.length; i++) {
            sbp.cursor = sbp.limit;
            habr[i]();
          }
          sbp.cursor = sbp.limit_backward;
          r_postlude();
        }
      }

      return true;
    };
  }();
  return function (word) {
    st.setCurrent(word);
    st.stem();
    return st.getCurrent();
  };
}();

Bravey.Language.EN.TimeEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var mins = new Bravey.Text.RegexMap([{
    str: ["quarter to~"],
    val: -15 * Bravey.Date.MINUTE
  }, {
    str: ["half past~"],
    val: 30 * Bravey.Date.MINUTE
  }, {
    str: ["quarter past~"],
    val: 15 * Bravey.Date.MINUTE
  }], 0);
  var daytime = new Bravey.Text.RegexMap([{
    str: ["in the morning~", "am~"],
    val: 0
  }, {
    str: ["in the afternoon~", "in the evening~", "pm~"],
    val: 12 * Bravey.Date.HOUR
  }], 0);
  matcher.addMatch(new RegExp("\\b(at\\b)?" + Bravey.Text.WORDSEP + mins.regex() + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + "(and\\b|:\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)?" + Bravey.Text.WORDSEP + "(minutes\\b)?" + Bravey.Text.WORDSEP + "(o'clock\\b)?" + Bravey.Text.WORDSEP + daytime.regex(), "gi"), function (match) {
    var time = match[3] * 1 * Bravey.Date.HOUR;
    if (match[5]) time += match[5] * 1 * Bravey.Date.MINUTE;
    time += mins.get(match, 2);
    time += daytime.get(match, 8);
    if (Bravey.Text.calculateScore(match, [1, 2, 4, 5, 6, 7, 8])) return Bravey.Date.formatTime(time);
  });
  matcher.bindTo(this);
};

Bravey.Language.EN.TimeEntityRecognizer2 = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("([01][0-9]|2[0-3])\\:([0-5][0-9])(?:\\:([0-5][0-9]))?", "gi"), function (match) {
    var hour = match[1];
    var minute = match[2];
    var second = match[3] || '00';
    return LocalTime.of(hour, minute, second);
  });

  var timeFromMatch = function (time) {
    return function (match) {
      var prefixMatch = match[prefixMatchIndex];

      if (!prefixMatch) {
        return time;
      } else if (new RegExp(hour, "i").test(prefixMatch)) {
        return time.hour();
      } else if (new RegExp(minute, "i").test(prefixMatch)) {
        return time.minute();
      } else if (new RegExp(second, "i").test(prefixMatch)) {
        return time.second();
      }

      return time;
    };
  };

  var hour = "hours?";
  var minute = "minutes?";
  var second = "seconds?";
  var ofPrefixes = "(?:(" + [hour, minute, second].join('|') + ")(?: |\\t)+(?:of|from|of(?: |\\t)+the|from(?: |\\t)+the))?(?: |\\t)*";
  var prefixMatchIndex = 1;

  var timeFromMatch = function (time) {
    return function (match) {
      var prefixMatch = match[prefixMatchIndex];

      if (!prefixMatch) {
        return time;
      } else if (new RegExp(hour, "i").test(prefixMatch)) {
        return time.hour();
      } else if (new RegExp(minute, "i").test(prefixMatch)) {
        return time.minute();
      } else if (new RegExp(second, "i").test(prefixMatch)) {
        return time.second();
      }

      return time;
    };
  };

  function now() {
    return LocalTime.now(Bravey.Clock.getValue());
  }

  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(ofPrefixes + _s("now|current time"), "gi"), timeFromMatch(now()));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last hour|previous hour"), "gi"), timeFromMatch(now().minusHours(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last minute|previous minute"), "gi"), timeFromMatch(now().minusMinutes(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last second|previous second"), "gi"), timeFromMatch(now().minusSeconds(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next hour"), "gi"), timeFromMatch(now().plusHours(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next minute"), "gi"), timeFromMatch(now().plusMinutes(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next second"), "gi"), timeFromMatch(now().plusSeconds(1)));
  var pastPrefix = "last|past";
  var futurePrefix = "in|next";

  var pastSuffix = _s("ago|in the past");

  var futureSuffix = _s("ahead|in the future|later|from now");

  addDynamicTimeMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, hour, minute, second, ofPrefixes);
  matcher.bindTo(this);
};

Bravey.Language.EN.DateTimeEntityRecognizer = function (entityName) {
  function now() {
    return LocalDateTime.now(Bravey.Clock.getValue());
  }

  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(?:(0[1-9]|1[012])(?:\\/|-)(0[1-9]|[12][0-9]|3[01])(?:\\/|-)([0-9]{2,4})(?: |\\t)+([01][0-9]|2[0-3])\\:([0-5][0-9])(?:\\:([0-5][0-9]))?)", "gi"), function (match) {
    var month = Number(match[1]);
    var day = Number(match[2]);
    var year = Number(match[3]);
    var hour = Number(match[4]);
    var minute = Number(match[5]);
    var second = Number(match[6] || '00');
    return LocalDateTime.of(LocalDate.of(year, month, day), LocalTime.of(hour, minute, second));
  });
  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(_s("current date and time"), "gi"), function (match) {
    return now();
  });
  matcher.bindTo(this);
};

Bravey.Language.EN.TimePeriodEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var rangematcher = new Bravey.Text.RegexMap([{
    str: ["second", "seconds"],
    val: Bravey.Date.SECOND
  }, {
    str: ["minute", "minutes"],
    val: Bravey.Date.MINUTE
  }, {
    str: ["hour", "hours"],
    val: Bravey.Date.HOUR
  }], 0);
  matcher.addMatch(new RegExp("\\b(in\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + rangematcher.regex(1) + "\\b", "gi"), function (match) {
    var then,
        now,
        date = new Date();
    now = then = date.getHours() * Bravey.Date.HOUR + date.getMinutes() * Bravey.Date.MINUTE;
    then += match[2] * rangematcher.get(match, 3);
    if (Bravey.Text.calculateScore(match, [1, 3])) return {
      start: Bravey.Date.formatTime(now),
      end: Bravey.Date.formatTime(then)
    };
  });
  matcher.addMatch(new RegExp("\\b(in the evening|this evening|evening)\\b", "gi"), function (match) {
    return {
      start: "12:00:00",
      end: "23:59:00"
    };
  });
  matcher.addMatch(new RegExp("\\b(in the afternoon|this afternoon|afternoon)\\b", "gi"), function (match) {
    return {
      start: "15:00:00",
      end: "23:59:00"
    };
  });
  matcher.addMatch(new RegExp("\\b(in the morning|this morning|morning)\\b", "gi"), function (match) {
    return {
      start: "08:00:00",
      end: "12:00:00"
    };
  });
  matcher.bindTo(this);
};

Bravey.Language.EN.DateEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(?:(0[1-9]|1[012])(?:\\/|-)(0[1-9]|[12][0-9]|3[01])(?:(?:\\/|-)([0-9]{2,4}))?)", "gi"), function (match) {
    var month = Number(match[1]);
    var day = Number(match[2]);
    var year = Number(match[3] || new Date().getFullYear());
    return LocalDate.of(year, month, day);
  });
  var pDay = 'day';
  var pMonth = 'month';
  var pYear = 'year';
  var ofPrefixes = "(?:(" + [pDay, pMonth, pYear].join('|') + ")(?: |\\t)+(?:of|from))?(?: |\\t)*";
  var ofPrefixMatchIndex = 1;

  var dateFromMatch = function (date) {
    return function (match) {
      var prefixMatch = match[ofPrefixMatchIndex];

      if (!prefixMatch) {
        return date;
      } else if (new RegExp(pYear, "i").test(prefixMatch)) {
        return date.year();
      } else if (new RegExp(pMonth, "i").test(prefixMatch)) {
        return date.monthValue();
      } else if (new RegExp(pDay, "i").test(prefixMatch)) {
        return date.dayOfMonth();
      }

      return date;
    };
  };

  function now() {
    return LocalDate.now(Bravey.Clock.getValue());
  }

  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(ofPrefixes + _s("last year"), "gi"), dateFromMatch(now().minusYears(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last semester"), "gi"), dateFromMatch(now().minusMonths(6)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last month"), "gi"), dateFromMatch(now().minusMonths(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("last week"), "gi"), dateFromMatch(now().minusDays(7)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("the day before yesterday"), "gi"), dateFromMatch(now().minusDays(2)));
  matcher.addMatch(new RegExp(ofPrefixes + "yesterday", "gi"), dateFromMatch(now().minusDays(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("today|current date"), "gi"), dateFromMatch(now()));
  matcher.addMatch(new RegExp(ofPrefixes + _s("tomorrow"), "gi"), dateFromMatch(now().plusDays(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("the day after tomorrow"), "gi"), dateFromMatch(now().plusDays(2)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next week"), "gi"), dateFromMatch(now().plusDays(7)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next month"), "gi"), dateFromMatch(now().plusMonths(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next semester"), "gi"), dateFromMatch(now().plusMonths(6)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("next year"), "gi"), dateFromMatch(now().plusYears(1)));
  var pastPrefix = "last|past";
  var futurePrefix = "in|next";

  var pastSuffix = _s("ago|in the past");

  var futureSuffix = _s("ahead|in the future|later|from today|from now");

  var year = "years?";
  var month = "months?";
  var week = "weeks?";
  var day = "days?";
  addDynamicDateMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, year, month, week, day, pYear, pMonth, pDay, ofPrefixes);
  matcher.bindTo(this);
};

Bravey.Language.EN.FreeTextEntityRecognizer = function (entityName, priority) {
  var commas = ["thanks", "please"];
  var matcher = new Bravey.FreeTextEntityRecognizer(entityName, priority);
  matcher.addConjunction("is");
  matcher.addConjunction("are");
  matcher.addConjunction("should be");
  matcher.addConjunction("may be");

  for (let i = 0; i < commas.length; i++) {
    matcher.addConjunction(commas[i]);
    matcher.addConjunction("," + commas[i]);
    matcher.addConjunction(", " + commas[i]);
  }

  return matcher;
};

Bravey.Language.EN.Numbers = {
  wordsSeparator: /(\w+)([^\w]+)/gi,
  sum: {
    'zero': 0,
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'eleven': 11,
    'twelve': 12,
    'thirteen': 13,
    'fourteen': 14,
    'fifteen': 15,
    'sixteen': 16,
    'seventeen': 17,
    'eighteen': 18,
    'nineteen': 19,
    'twenty': 20,
    'thirty': 30,
    'forty': 40,
    'fifty': 50,
    'sixty': 60,
    'seventy': 70,
    'eighty': 80,
    'ninety': 90
  },
  mul: {
    'thousand': 1000,
    'million': 1000000
  }
};

Bravey.Language.EN.NumberEntityRecognizer = function (entityName, priority) {
  this.getName = function () {
    return entityName;
  };

  this.getEntities = function (string, out) {
    if (!out) out = [];
    var tokens = string.toLowerCase().split(/(\w+)/);
    var mul,
        token,
        temp = 0,
        sum = 0,
        isnumber,
        current,
        valid,
        cursor = 0,
        end;

    for (let i = 0; i < tokens.length + 1; i++) {
      token = tokens[i] == undefined ? "*" : tokens[i];
      isnumber = true;

      if (!current) {
        valid = 0;
        current = {
          value: 0,
          entity: entityName,
          string: "",
          priority: priority || 0
        };
      }

      if (token.trim()) {
        if (Bravey.Language.EN.Numbers.sum[token] != null) sum += Bravey.Language.EN.Numbers.sum[token];else if (token == 'hundred') sum *= 100;else if (!isNaN(token * 1)) {
          if (valid) {
            i--;
            token = "";
            isnumber = false;
          } else temp = token * 1;
        } else if (Bravey.Language.EN.Numbers.mul[token]) {
          mul = Bravey.Language.EN.Numbers.mul[token];
          temp += sum * mul;
          sum = 0;
        } else isnumber = false;

        if (isnumber) {
          valid = 1;
          end = cursor + token.length;
          if (current.position == undefined) current.position = cursor;
        } else if (valid) {
          current.value = temp + sum;
          current.string = string.substr(current.position, end - current.position);
          out.push(current);
          temp = sum = current = 0;
        }
      }

      cursor += token.length;
    }

    return out;
  };
};

Bravey.Language.PT = {};

Bravey.Language.PT.Stemmer = function () {
  function BaseStemmer() {
    this.setCurrent = function (value) {
      this.current = value;
      this.cursor = 0;
      this.limit = this.current.length;
      this.limit_backward = 0;
      this.bra = this.cursor;
      this.ket = this.limit;
    };

    this.getCurrent = function () {
      return this.current;
    };

    this.copy_from = function (other) {
      this.current = other.current;
      this.cursor = other.cursor;
      this.limit = other.limit;
      this.limit_backward = other.limit_backward;
      this.bra = other.bra;
      this.ket = other.ket;
    };

    this.in_grouping = function (s, min, max) {
      if (this.cursor >= this.limit) return false;
      var ch = this.current.charCodeAt(this.cursor);
      if (ch > max || ch < min) return false;
      ch -= min;
      if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) return false;
      this.cursor++;
      return true;
    };

    this.in_grouping_b = function (s, min, max) {
      if (this.cursor <= this.limit_backward) return false;
      var ch = this.current.charCodeAt(this.cursor - 1);
      if (ch > max || ch < min) return false;
      ch -= min;
      if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) return false;
      this.cursor--;
      return true;
    };

    this.out_grouping = function (s, min, max) {
      if (this.cursor >= this.limit) return false;
      var ch = this.current.charCodeAt(this.cursor);

      if (ch > max || ch < min) {
        this.cursor++;
        return true;
      }

      ch -= min;

      if ((s[ch >>> 3] & 0X1 << (ch & 0x7)) == 0) {
        this.cursor++;
        return true;
      }

      return false;
    };

    this.out_grouping_b = function (s, min, max) {
      if (this.cursor <= this.limit_backward) return false;
      var ch = this.current.charCodeAt(this.cursor - 1);

      if (ch > max || ch < min) {
        this.cursor--;
        return true;
      }

      ch -= min;

      if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) {
        this.cursor--;
        return true;
      }

      return false;
    };

    this.eq_s = function (s) {
      if (this.limit - this.cursor < s.length) return false;

      if (this.current.slice(this.cursor, this.cursor + s.length) != s) {
        return false;
      }

      this.cursor += s.length;
      return true;
    };

    this.eq_s_b = function (s) {
      if (this.cursor - this.limit_backward < s.length) return false;

      if (this.current.slice(this.cursor - s.length, this.cursor) != s) {
        return false;
      }

      this.cursor -= s.length;
      return true;
    };

    this.find_among = function (v) {
      let i = 0;
      let j = v.length;
      var c = this.cursor;
      var l = this.limit;
      var common_i = 0;
      var common_j = 0;
      var first_key_inspected = false;

      while (true) {
        var k = i + (j - i >>> 1);
        var diff = 0;
        var common = common_i < common_j ? common_i : common_j;
        var w = v[k];
        var i2;

        for (i2 = common; i2 < w[0].length; i2++) {
          if (c + common == l) {
            diff = -1;
            break;
          }

          diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
          if (diff != 0) break;
          common++;
        }

        if (diff < 0) {
          j = k;
          common_j = common;
        } else {
          i = k;
          common_i = common;
        }

        if (j - i <= 1) {
          if (i > 0) break;
          if (j == i) break;
          if (first_key_inspected) break;
          first_key_inspected = true;
        }
      }

      while (true) {
        var w = v[i];

        if (common_i >= w[0].length) {
          this.cursor = c + w[0].length;
          if (w.length < 4) return w[2];
          var res = w[3](this);
          this.cursor = c + w[0].length;
          if (res) return w[2];
        }

        i = w[1];
        if (i < 0) return 0;
      }
    };

    this.find_among_b = function (v) {
      let i = 0;
      let j = v.length;
      var c = this.cursor;
      var lb = this.limit_backward;
      var common_i = 0;
      var common_j = 0;
      var first_key_inspected = false;

      while (true) {
        var k = i + (j - i >> 1);
        var diff = 0;
        var common = common_i < common_j ? common_i : common_j;
        var w = v[k];
        var i2;

        for (i2 = w[0].length - 1 - common; i2 >= 0; i2--) {
          if (c - common == lb) {
            diff = -1;
            break;
          }

          diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
          if (diff != 0) break;
          common++;
        }

        if (diff < 0) {
          j = k;
          common_j = common;
        } else {
          i = k;
          common_i = common;
        }

        if (j - i <= 1) {
          if (i > 0) break;
          if (j == i) break;
          if (first_key_inspected) break;
          first_key_inspected = true;
        }
      }

      while (true) {
        var w = v[i];

        if (common_i >= w[0].length) {
          this.cursor = c - w[0].length;
          if (w.length < 4) return w[2];
          var res = w[3](this);
          this.cursor = c - w[0].length;
          if (res) return w[2];
        }

        i = w[1];
        if (i < 0) return 0;
      }
    };

    this.replace_s = function (c_bra, c_ket, s) {
      var adjustment = s.length - (c_ket - c_bra);
      this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
      this.limit += adjustment;
      if (this.cursor >= c_ket) this.cursor += adjustment;else if (this.cursor > c_bra) this.cursor = c_bra;
      return adjustment;
    };

    this.slice_check = function () {
      if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > this.current.length) {
        return false;
      }

      return true;
    };

    this.slice_from = function (s) {
      var result = false;

      if (this.slice_check()) {
        this.replace_s(this.bra, this.ket, s);
        result = true;
      }

      return result;
    };

    this.slice_del = function () {
      return this.slice_from("");
    };

    this.insert = function (c_bra, c_ket, s) {
      var adjustment = this.replace_s(c_bra, c_ket, s);
      if (c_bra <= this.bra) this.bra += adjustment;
      if (c_bra <= this.ket) this.ket += adjustment;
    };

    this.slice_to = function () {
      var result = '';

      if (this.slice_check()) {
        result = this.current.slice(this.bra, this.ket);
      }

      return result;
    };

    this.assign_to = function () {
      return this.current.slice(0, this.limit);
    };
  }

  function PortugueseStemmer() {
    var base = new BaseStemmer();
    var a_0 = [["", -1, 3], ["\u00E3", 0, 1], ["\u00F5", 0, 2]];
    var a_1 = [["", -1, 3], ["a~", 0, 1], ["o~", 0, 2]];
    var a_2 = [["ic", -1, -1], ["ad", -1, -1], ["os", -1, -1], ["iv", -1, 1]];
    var a_3 = [["ante", -1, 1], ["avel", -1, 1], ["\u00EDvel", -1, 1]];
    var a_4 = [["ic", -1, 1], ["abil", -1, 1], ["iv", -1, 1]];
    var a_5 = [["ica", -1, 1], ["\u00E2ncia", -1, 1], ["\u00EAncia", -1, 4], ["logia", -1, 2], ["ira", -1, 9], ["adora", -1, 1], ["osa", -1, 1], ["ista", -1, 1], ["iva", -1, 8], ["eza", -1, 1], ["idade", -1, 7], ["ante", -1, 1], ["mente", -1, 6], ["amente", 12, 5], ["\u00E1vel", -1, 1], ["\u00EDvel", -1, 1], ["ico", -1, 1], ["ismo", -1, 1], ["oso", -1, 1], ["amento", -1, 1], ["imento", -1, 1], ["ivo", -1, 8], ["a\u00E7a~o", -1, 1], ["u\u00E7a~o", -1, 3], ["ador", -1, 1], ["icas", -1, 1], ["\u00EAncias", -1, 4], ["logias", -1, 2], ["iras", -1, 9], ["adoras", -1, 1], ["osas", -1, 1], ["istas", -1, 1], ["ivas", -1, 8], ["ezas", -1, 1], ["idades", -1, 7], ["adores", -1, 1], ["antes", -1, 1], ["a\u00E7o~es", -1, 1], ["u\u00E7o~es", -1, 3], ["icos", -1, 1], ["ismos", -1, 1], ["osos", -1, 1], ["amentos", -1, 1], ["imentos", -1, 1], ["ivos", -1, 8]];
    var a_6 = [["ada", -1, 1], ["ida", -1, 1], ["ia", -1, 1], ["aria", 2, 1], ["eria", 2, 1], ["iria", 2, 1], ["ara", -1, 1], ["era", -1, 1], ["ira", -1, 1], ["ava", -1, 1], ["asse", -1, 1], ["esse", -1, 1], ["isse", -1, 1], ["aste", -1, 1], ["este", -1, 1], ["iste", -1, 1], ["ei", -1, 1], ["arei", 16, 1], ["erei", 16, 1], ["irei", 16, 1], ["am", -1, 1], ["iam", 20, 1], ["ariam", 21, 1], ["eriam", 21, 1], ["iriam", 21, 1], ["aram", 20, 1], ["eram", 20, 1], ["iram", 20, 1], ["avam", 20, 1], ["em", -1, 1], ["arem", 29, 1], ["erem", 29, 1], ["irem", 29, 1], ["assem", 29, 1], ["essem", 29, 1], ["issem", 29, 1], ["ado", -1, 1], ["ido", -1, 1], ["ando", -1, 1], ["endo", -1, 1], ["indo", -1, 1], ["ara~o", -1, 1], ["era~o", -1, 1], ["ira~o", -1, 1], ["ar", -1, 1], ["er", -1, 1], ["ir", -1, 1], ["as", -1, 1], ["adas", 47, 1], ["idas", 47, 1], ["ias", 47, 1], ["arias", 50, 1], ["erias", 50, 1], ["irias", 50, 1], ["aras", 47, 1], ["eras", 47, 1], ["iras", 47, 1], ["avas", 47, 1], ["es", -1, 1], ["ardes", 58, 1], ["erdes", 58, 1], ["irdes", 58, 1], ["ares", 58, 1], ["eres", 58, 1], ["ires", 58, 1], ["asses", 58, 1], ["esses", 58, 1], ["isses", 58, 1], ["astes", 58, 1], ["estes", 58, 1], ["istes", 58, 1], ["is", -1, 1], ["ais", 71, 1], ["eis", 71, 1], ["areis", 73, 1], ["ereis", 73, 1], ["ireis", 73, 1], ["\u00E1reis", 73, 1], ["\u00E9reis", 73, 1], ["\u00EDreis", 73, 1], ["\u00E1sseis", 73, 1], ["\u00E9sseis", 73, 1], ["\u00EDsseis", 73, 1], ["\u00E1veis", 73, 1], ["\u00EDeis", 73, 1], ["ar\u00EDeis", 84, 1], ["er\u00EDeis", 84, 1], ["ir\u00EDeis", 84, 1], ["ados", -1, 1], ["idos", -1, 1], ["amos", -1, 1], ["\u00E1ramos", 90, 1], ["\u00E9ramos", 90, 1], ["\u00EDramos", 90, 1], ["\u00E1vamos", 90, 1], ["\u00EDamos", 90, 1], ["ar\u00EDamos", 95, 1], ["er\u00EDamos", 95, 1], ["ir\u00EDamos", 95, 1], ["emos", -1, 1], ["aremos", 99, 1], ["eremos", 99, 1], ["iremos", 99, 1], ["\u00E1ssemos", 99, 1], ["\u00EAssemos", 99, 1], ["\u00EDssemos", 99, 1], ["imos", -1, 1], ["armos", -1, 1], ["ermos", -1, 1], ["irmos", -1, 1], ["\u00E1mos", -1, 1], ["ar\u00E1s", -1, 1], ["er\u00E1s", -1, 1], ["ir\u00E1s", -1, 1], ["eu", -1, 1], ["iu", -1, 1], ["ou", -1, 1], ["ar\u00E1", -1, 1], ["er\u00E1", -1, 1], ["ir\u00E1", -1, 1]];
    var a_7 = [["a", -1, 1], ["i", -1, 1], ["o", -1, 1], ["os", -1, 1], ["\u00E1", -1, 1], ["\u00ED", -1, 1], ["\u00F3", -1, 1]];
    var a_8 = [["e", -1, 1], ["\u00E7", -1, 2], ["\u00E9", -1, 1], ["\u00EA", -1, 1]];
    var g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2];
    var I_p2 = 0;
    var I_p1 = 0;
    var I_pV = 0;

    function r_prelude() {
      var among_var;

      replab0: while (true) {
        var v_1 = base.cursor;

        lab1: {
          base.bra = base.cursor;
          among_var = base.find_among(a_0);

          if (among_var == 0) {
            break lab1;
          }

          base.ket = base.cursor;

          switch (among_var) {
            case 0:
              break lab1;

            case 1:
              if (!base.slice_from("a~")) {
                return false;
              }

              break;

            case 2:
              if (!base.slice_from("o~")) {
                return false;
              }

              break;

            case 3:
              if (base.cursor >= base.limit) {
                break lab1;
              }

              base.cursor++;
              break;
          }

          continue replab0;
        }

        base.cursor = v_1;
        break replab0;
      }

      return true;
    }

    function r_mark_regions() {
      I_pV = base.limit;
      I_p1 = base.limit;
      I_p2 = base.limit;
      var v_1 = base.cursor;

      lab0: {
        lab1: {
          var v_2 = base.cursor;

          lab2: {
            if (!base.in_grouping(g_v, 97, 250)) {
              break lab2;
            }

            lab3: {
              var v_3 = base.cursor;

              lab4: {
                if (!base.out_grouping(g_v, 97, 250)) {
                  break lab4;
                }

                golab5: while (true) {
                  lab6: {
                    if (!base.in_grouping(g_v, 97, 250)) {
                      break lab6;
                    }

                    break golab5;
                  }

                  if (base.cursor >= base.limit) {
                    break lab4;
                  }

                  base.cursor++;
                }

                break lab3;
              }

              base.cursor = v_3;

              if (!base.in_grouping(g_v, 97, 250)) {
                break lab2;
              }

              golab7: while (true) {
                lab8: {
                  if (!base.out_grouping(g_v, 97, 250)) {
                    break lab8;
                  }

                  break golab7;
                }

                if (base.cursor >= base.limit) {
                  break lab2;
                }

                base.cursor++;
              }
            }

            break lab1;
          }

          base.cursor = v_2;

          if (!base.out_grouping(g_v, 97, 250)) {
            break lab0;
          }

          lab9: {
            var v_6 = base.cursor;

            lab10: {
              if (!base.out_grouping(g_v, 97, 250)) {
                break lab10;
              }

              golab11: while (true) {
                lab12: {
                  if (!base.in_grouping(g_v, 97, 250)) {
                    break lab12;
                  }

                  break golab11;
                }

                if (base.cursor >= base.limit) {
                  break lab10;
                }

                base.cursor++;
              }

              break lab9;
            }

            base.cursor = v_6;

            if (!base.in_grouping(g_v, 97, 250)) {
              break lab0;
            }

            if (base.cursor >= base.limit) {
              break lab0;
            }

            base.cursor++;
          }
        }

        I_pV = base.cursor;
      }

      base.cursor = v_1;
      var v_8 = base.cursor;

      lab13: {
        golab14: while (true) {
          lab15: {
            if (!base.in_grouping(g_v, 97, 250)) {
              break lab15;
            }

            break golab14;
          }

          if (base.cursor >= base.limit) {
            break lab13;
          }

          base.cursor++;
        }

        golab16: while (true) {
          lab17: {
            if (!base.out_grouping(g_v, 97, 250)) {
              break lab17;
            }

            break golab16;
          }

          if (base.cursor >= base.limit) {
            break lab13;
          }

          base.cursor++;
        }

        I_p1 = base.cursor;

        golab18: while (true) {
          lab19: {
            if (!base.in_grouping(g_v, 97, 250)) {
              break lab19;
            }

            break golab18;
          }

          if (base.cursor >= base.limit) {
            break lab13;
          }

          base.cursor++;
        }

        golab20: while (true) {
          lab21: {
            if (!base.out_grouping(g_v, 97, 250)) {
              break lab21;
            }

            break golab20;
          }

          if (base.cursor >= base.limit) {
            break lab13;
          }

          base.cursor++;
        }

        I_p2 = base.cursor;
      }

      base.cursor = v_8;
      return true;
    }

    function r_postlude() {
      var among_var;

      replab0: while (true) {
        var v_1 = base.cursor;

        lab1: {
          base.bra = base.cursor;
          among_var = base.find_among(a_1);

          if (among_var == 0) {
            break lab1;
          }

          base.ket = base.cursor;

          switch (among_var) {
            case 0:
              break lab1;

            case 1:
              if (!base.slice_from("\u00E3")) {
                return false;
              }

              break;

            case 2:
              if (!base.slice_from("\u00F5")) {
                return false;
              }

              break;

            case 3:
              if (base.cursor >= base.limit) {
                break lab1;
              }

              base.cursor++;
              break;
          }

          continue replab0;
        }

        base.cursor = v_1;
        break replab0;
      }

      return true;
    }

    function r_RV() {
      if (!(I_pV <= base.cursor)) {
        return false;
      }

      return true;
    }

    function r_R1() {
      if (!(I_p1 <= base.cursor)) {
        return false;
      }

      return true;
    }

    function r_R2() {
      if (!(I_p2 <= base.cursor)) {
        return false;
      }

      return true;
    }

    function r_standard_suffix() {
      var among_var;
      base.ket = base.cursor;
      among_var = base.find_among_b(a_5);

      if (among_var == 0) {
        return false;
      }

      base.bra = base.cursor;

      switch (among_var) {
        case 0:
          return false;

        case 1:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          break;

        case 2:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_from("log")) {
            return false;
          }

          break;

        case 3:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_from("u")) {
            return false;
          }

          break;

        case 4:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_from("ente")) {
            return false;
          }

          break;

        case 5:
          if (!r_R1()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          var v_1 = base.limit - base.cursor;

          lab0: {
            base.ket = base.cursor;
            among_var = base.find_among_b(a_2);

            if (among_var == 0) {
              base.cursor = base.limit - v_1;
              break lab0;
            }

            base.bra = base.cursor;

            if (!r_R2()) {
              base.cursor = base.limit - v_1;
              break lab0;
            }

            if (!base.slice_del()) {
              return false;
            }

            switch (among_var) {
              case 0:
                base.cursor = base.limit - v_1;
                break lab0;

              case 1:
                base.ket = base.cursor;

                if (!base.eq_s_b("at")) {
                  base.cursor = base.limit - v_1;
                  break lab0;
                }

                base.bra = base.cursor;

                if (!r_R2()) {
                  base.cursor = base.limit - v_1;
                  break lab0;
                }

                if (!base.slice_del()) {
                  return false;
                }

                break;
            }
          }

          break;

        case 6:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          var v_2 = base.limit - base.cursor;

          lab1: {
            base.ket = base.cursor;
            among_var = base.find_among_b(a_3);

            if (among_var == 0) {
              base.cursor = base.limit - v_2;
              break lab1;
            }

            base.bra = base.cursor;

            switch (among_var) {
              case 0:
                base.cursor = base.limit - v_2;
                break lab1;

              case 1:
                if (!r_R2()) {
                  base.cursor = base.limit - v_2;
                  break lab1;
                }

                if (!base.slice_del()) {
                  return false;
                }

                break;
            }
          }

          break;

        case 7:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          var v_3 = base.limit - base.cursor;

          lab2: {
            base.ket = base.cursor;
            among_var = base.find_among_b(a_4);

            if (among_var == 0) {
              base.cursor = base.limit - v_3;
              break lab2;
            }

            base.bra = base.cursor;

            switch (among_var) {
              case 0:
                base.cursor = base.limit - v_3;
                break lab2;

              case 1:
                if (!r_R2()) {
                  base.cursor = base.limit - v_3;
                  break lab2;
                }

                if (!base.slice_del()) {
                  return false;
                }

                break;
            }
          }

          break;

        case 8:
          if (!r_R2()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          var v_4 = base.limit - base.cursor;

          lab3: {
            base.ket = base.cursor;

            if (!base.eq_s_b("at")) {
              base.cursor = base.limit - v_4;
              break lab3;
            }

            base.bra = base.cursor;

            if (!r_R2()) {
              base.cursor = base.limit - v_4;
              break lab3;
            }

            if (!base.slice_del()) {
              return false;
            }
          }

          break;

        case 9:
          if (!r_RV()) {
            return false;
          }

          if (!base.eq_s_b("e")) {
            return false;
          }

          if (!base.slice_from("ir")) {
            return false;
          }

          break;
      }

      return true;
    }

    function r_verb_suffix() {
      var among_var;
      var v_1 = base.limit - base.cursor;

      if (base.cursor < I_pV) {
        return false;
      }

      base.cursor = I_pV;
      var v_2 = base.limit_backward;
      base.limit_backward = base.cursor;
      base.cursor = base.limit - v_1;
      base.ket = base.cursor;
      among_var = base.find_among_b(a_6);

      if (among_var == 0) {
        base.limit_backward = v_2;
        return false;
      }

      base.bra = base.cursor;

      switch (among_var) {
        case 0:
          base.limit_backward = v_2;
          return false;

        case 1:
          if (!base.slice_del()) {
            return false;
          }

          break;
      }

      base.limit_backward = v_2;
      return true;
    }

    function r_residual_suffix() {
      var among_var;
      base.ket = base.cursor;
      among_var = base.find_among_b(a_7);

      if (among_var == 0) {
        return false;
      }

      base.bra = base.cursor;

      switch (among_var) {
        case 0:
          return false;

        case 1:
          if (!r_RV()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          break;
      }

      return true;
    }

    function r_residual_form() {
      var among_var;
      base.ket = base.cursor;
      among_var = base.find_among_b(a_8);

      if (among_var == 0) {
        return false;
      }

      base.bra = base.cursor;

      switch (among_var) {
        case 0:
          return false;

        case 1:
          if (!r_RV()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          base.ket = base.cursor;

          lab0: {
            var v_1 = base.limit - base.cursor;

            lab1: {
              if (!base.eq_s_b("u")) {
                break lab1;
              }

              base.bra = base.cursor;
              var v_2 = base.limit - base.cursor;

              if (!base.eq_s_b("g")) {
                break lab1;
              }

              base.cursor = base.limit - v_2;
              break lab0;
            }

            base.cursor = base.limit - v_1;

            if (!base.eq_s_b("i")) {
              return false;
            }

            base.bra = base.cursor;
            var v_3 = base.limit - base.cursor;

            if (!base.eq_s_b("c")) {
              return false;
            }

            base.cursor = base.limit - v_3;
          }

          if (!r_RV()) {
            return false;
          }

          if (!base.slice_del()) {
            return false;
          }

          break;

        case 2:
          if (!base.slice_from("c")) {
            return false;
          }

          break;
      }

      return true;
    }

    this.stem = function () {
      var v_1 = base.cursor;

      lab0: {
        if (!r_prelude()) {
          break lab0;
        }
      }

      base.cursor = v_1;
      var v_2 = base.cursor;

      {
        if (!r_mark_regions()) ;
      }

      base.cursor = v_2;
      base.limit_backward = base.cursor;
      base.cursor = base.limit;
      var v_3 = base.limit - base.cursor;

      lab2: {
        lab3: {
          var v_4 = base.limit - base.cursor;

          lab4: {
            var v_5 = base.limit - base.cursor;

            lab5: {
              var v_6 = base.limit - base.cursor;

              lab6: {
                if (!r_standard_suffix()) {
                  break lab6;
                }

                break lab5;
              }

              base.cursor = base.limit - v_6;

              if (!r_verb_suffix()) {
                break lab4;
              }
            }

            base.cursor = base.limit - v_5;
            var v_7 = base.limit - base.cursor;

            lab7: {
              base.ket = base.cursor;

              if (!base.eq_s_b("i")) {
                break lab7;
              }

              base.bra = base.cursor;
              var v_8 = base.limit - base.cursor;

              if (!base.eq_s_b("c")) {
                break lab7;
              }

              base.cursor = base.limit - v_8;

              if (!r_RV()) {
                break lab7;
              }

              if (!base.slice_del()) {
                return false;
              }
            }

            base.cursor = base.limit - v_7;
            break lab3;
          }

          base.cursor = base.limit - v_4;

          if (!r_residual_suffix()) {
            break lab2;
          }
        }
      }

      base.cursor = base.limit - v_3;
      var v_9 = base.limit - base.cursor;

      lab8: {
        if (!r_residual_form()) {
          break lab8;
        }
      }

      base.cursor = base.limit - v_9;
      base.cursor = base.limit_backward;
      var v_10 = base.cursor;

      lab9: {
        if (!r_postlude()) {
          break lab9;
        }
      }

      base.cursor = v_10;
      return true;
    };

    this['stemWord'] = function (word) {
      base.setCurrent(word);
      this.stem();
      return base.getCurrent();
    };
  }

  return function (word) {
    return new PortugueseStemmer().stemWord(word);
  };
}();

Bravey.Language.PT.TimeEntityRecognizer2 = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(?:([01][0-9]|2[0-3])\\:([0-5][0-9])(?:\\:([0-5][0-9]))?)", "gi"), function (match) {
    var hour = match[1];
    var minute = match[2];
    var second = match[3] || '00';
    return LocalTime.of(hour, minute, second);
  });
  var hour = "horas?";
  var minute = "minutos?";
  var second = "segundos?";
  var ofPrefixes = "(?:(" + [hour, minute, second].join('|') + ")(?: |\\t)*(?:d[eoa]))?(?: |\\t)*";
  var prefixMatchIndex = 1;

  var timeFromMatch = function (time) {
    return function (match) {
      var prefixMatch = match[prefixMatchIndex];

      if (!prefixMatch) {
        return time;
      } else if (new RegExp(hour, "i").test(prefixMatch)) {
        return time.hour();
      } else if (new RegExp(minute, "i").test(prefixMatch)) {
        return time.minute();
      } else if (new RegExp(second, "i").test(prefixMatch)) {
        return time.second();
      }

      return time;
    };
  };

  function now() {
    return LocalTime.now(Bravey.Clock.getValue());
  }

  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(ofPrefixes + _s("agora|hora atual"), "gi"), timeFromMatch(now()));
  matcher.addMatch(new RegExp(ofPrefixes + _s("[úu]ltima hora|hora anterior"), "gi"), timeFromMatch(now().minusHours(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("[úu]ltimo minuto|minuto anterior"), "gi"), timeFromMatch(now().minusMinutes(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("[úu]ltimo segundo|segundo anterior"), "gi"), timeFromMatch(now().minusSeconds(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("pr[óo]xima hora|hora seguinte"), "gi"), timeFromMatch(now().plusHours(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("pr[óo]ximo minuto|minuto seguinte"), "gi"), timeFromMatch(now().plusMinutes(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("pr[óo]ximo segundo|segundo seguinte"), "gi"), timeFromMatch(now().plusSeconds(1)));
  var pastPrefix = "h[áa]";

  var futurePrefix = _s("daqui|daqui a|em");

  var pastSuffix = _s("atr[áa]s|no passado");

  var futureSuffix = _s("adiante|[àa] frente|no futuro");

  addDynamicTimeMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, hour, minute, second, ofPrefixes);
  matcher.bindTo(this);
};

Bravey.Language.PT.DateTimeEntityRecognizer = function (entityName) {
  function now() {
    return LocalDateTime.now(Bravey.Clock.getValue());
  }

  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(?:(0[1-9]|[12][0-9]|3[01])(?:\\/|-)(0[1-9]|1[012])(?:\\/|-)([0-9]{2,4})(?: |\\t)+([01][0-9]|2[0-3])\\:([0-5][0-9])(?:\\:([0-5][0-9]))?)", "gi"), function (match) {
    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3]);
    var hour = Number(match[4]);
    var minute = Number(match[5]);
    var second = Number(match[6] || '00');
    return LocalDateTime.of(LocalDate.of(year, month, day), LocalTime.of(hour, minute, second));
  });
  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(_s("data e hora (atual|atuais)"), "gi"), function (match) {
    return now();
  });
  matcher.bindTo(this);
};

Bravey.Language.PT.TimeEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  var exp1 = "\\b(às\\b|as\\b|em\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + "\\b(horas\\b|hrs\\b|h\\b|:\\b)?" + Bravey.Text.WORDSEP + "\\b(e\\b|,\\b|com\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)?" + Bravey.Text.WORDSEP + "\\b(minutos\\b|min\\b|m\\b)?" + Bravey.Text.WORDSEP + "\\b(e\\b|,\\b|:\\b)?" + Bravey.Text.WORDSEP + "([0-9]+)?" + Bravey.Text.WORDSEP + "\\b(segundos\\b|seg\\b|s\\b)?" + Bravey.Text.WORDSEP + "\\b(meia\\b|quinze\\b|quarenta e cinco\\b)?" + Bravey.Text.WORDSEP + "\\b(da noite\\b|da tarde\\b|pm\\b|da manha\\b|am\\b)?" + Bravey.Text.WORDSEP;
  matcher.addMatch(new RegExp(exp1, "gi"), function (match) {
    var hour = 0;

    if (match[2]) {
      hour = match[2] * 1;
    }

    var min = 0;

    if (match[5]) {
      min = match[5] * 1;
    } else if (match[10]) {
      if ('meia' === match[10]) min = 30;else if ('quinze' === match[10]) min = 15;else if ('quarenta e cinco' === match[10]) min = 45;
    }

    var sec = 0;

    if (match[8]) {
      sec = match[8] * 1;
    }

    if (match[11]) {
      if (('da manha' == match[11] || 'am' == match[11]) && hour > 12) {
        hour -= 12;
      }

      if (('da noite' == match[11] || 'da tarde' == match[11] || 'pm' == match[11]) && hour < 12) {
        hour += 12;
      }
    }

    return Bravey.Text.pad(hour, 2) + ':' + Bravey.Text.pad(min, 2) + ':' + Bravey.Text.pad(sec, 2);
  });
  matcher.bindTo(this);
};

Bravey.Language.PT.TimePeriodEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("\\b(de madrugada|na madrugada)\\b", "gi"), function (match) {
    return {
      start: "00:00:00",
      end: "05:59:59"
    };
  });
  matcher.addMatch(new RegExp("\\b(de manh[aã]|na manh[aã])\\b", "gi"), function (match) {
    return {
      start: "06:00:00",
      end: "11:59:59"
    };
  });
  matcher.addMatch(new RegExp("\\b([aà] tarde|de tarde|na tarde)\\b", "gi"), function (match) {
    return {
      start: "12:00:00",
      end: "17:59:59"
    };
  });
  matcher.addMatch(new RegExp("\\b([aà] noite|de noite|na noite)\\b", "gi"), function (match) {
    return {
      start: "18:00:00",
      end: "23:59:59"
    };
  });
  matcher.addMatch(new RegExp("\\b(daqui a|daqui|em)\\b" + Bravey.Text.WORDSEP + "([0-9]+)" + Bravey.Text.WORDSEP + "\\b(horas?|minutos?|segundos?)\\b" + Bravey.Text.WORDSEP, "gi"), function (match) {
    if (match[2] && match[3]) {
      var value = match[2] * 1;
      var increase = 0;

      switch (match[3]) {
        case "hora":
        case "horas":
          increase = Bravey.Date.HOUR * value;
          break;

        case "minuto":
        case "minutos":
          increase = Bravey.Date.MINUTE * value;
          break;

        case "segundo":
        case "segundos":
          increase = Bravey.Date.SECOND * value;
          break;
      }

      var now = new Date();
      var end = new Date();
      end.setTime(end.getTime() + increase);
      return {
        start: now.toLocaleTimeString('pt-BR'),
        end: end.toLocaleTimeString('pt-BR')
      };
    }
  });
  matcher.bindTo(this);
};

function addDynamicDateMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, year, month, week, day, yearOf, monthOf, dayOf, ofPrefixes) {
  function now() {
    return LocalDate.now(Bravey.Clock.getValue());
  }

  function dateFor(isPast, period, value) {
    var date = now();

    if (new RegExp(year).test(period)) {
      date = isPast ? date.minusYears(value) : date.plusYears(value);
    } else if (new RegExp(month).test(period)) {
      date = isPast ? date.minusMonths(value) : date.plusMonths(value);
    } else if (new RegExp(week).test(period)) {
      date = isPast ? date.minusDays(value * 7) : date.plusDays(value * 7);
    } else if (new RegExp(day).test(period)) {
      date = isPast ? date.minusDays(value) : date.plusDays(value);
    }

    return date;
  }

  function analyzeDate(date, ofPrefixMatch) {
    if (!ofPrefixMatch) {
      return date;
    } else if (new RegExp(yearOf, "i").test(ofPrefixMatch)) {
      return date.year();
    } else if (new RegExp(monthOf, "i").test(ofPrefixMatch)) {
      return date.monthValue();
    } else if (new RegExp(dayOf, "i").test(ofPrefixMatch)) {
      return date.dayOfMonth();
    }

    return date;
  }

  var prefixedExp = ofPrefixes + "(" + pastPrefix + "|" + futurePrefix + ")(?: |\\t)+([0-9]+)(?: |\\t)+" + "(" + [year, month, week, day].join("|") + ")";
  matcher.addMatch(new RegExp(prefixedExp, "gi"), function (match) {
    var ofPrefixMatch = match[1];
    var prefix = match[2];
    var value = Number(match[3]);
    var period = match[4];
    var isPast = new RegExp(pastPrefix).test(prefix);
    var date = dateFor(isPast, period, value);
    return analyzeDate(date, ofPrefixMatch);
  });
  var suffixedExp = ofPrefixes + "([0-9]+)(?: |\\t)+(" + [year, month, week, day].join("|") + ")(?: |\\t)*" + "(" + pastSuffix + "|" + futureSuffix + ")\\b";
  matcher.addMatch(new RegExp(suffixedExp, "gi"), function (match) {
    var ofPrefixMatch = match[1];
    var value = Number(match[2]);
    var period = match[3];
    var suffix = match[4];
    var isPast = new RegExp(pastSuffix).test(suffix);
    var date = dateFor(isPast, period, value);
    return analyzeDate(date, ofPrefixMatch);
  });
}

function addDynamicTimeMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, hour, minute, second, ofPrefixes) {
  function now() {
    return LocalTime.now(Bravey.Clock.getValue());
  }

  function timeFor(isPast, period, value) {
    var time = now();

    if (new RegExp(hour).test(period)) {
      time = isPast ? time.minusHours(value) : time.plusHours(value);
    } else if (new RegExp(minute).test(period)) {
      time = isPast ? time.minusMinutes(value) : time.plusMinutes(value);
    } else if (new RegExp(second).test(period)) {
      time = isPast ? time.minusSeconds(value) : time.plusSeconds(value);
    }

    return time;
  }

  function analyzeTime(localTime, ofPrefixMatch) {
    if (!ofPrefixMatch) {
      return localTime;
    } else if (new RegExp(hour, "i").test(ofPrefixMatch)) {
      return localTime.hour();
    } else if (new RegExp(minute, "i").test(ofPrefixMatch)) {
      return localTime.minute();
    } else if (new RegExp(second, "i").test(ofPrefixMatch)) {
      return localTime.second();
    }

    return localTime;
  }

  var prefixedExp = "(?:" + ofPrefixes + "(?: |\\t)*" + "(" + pastPrefix + "|" + futurePrefix + ")(?: |\\t)*([0-9]+)(?: |\\t)+" + "(" + [hour, minute, second].join("|") + "))";
  matcher.addMatch(new RegExp(prefixedExp, "gi"), function (match) {
    var ofPrefixMatch = match[1];
    var prefix = match[2];
    var value = Number(match[3]);
    var period = match[4];
    var isPast = new RegExp(pastPrefix).test(prefix);
    var date = timeFor(isPast, period, value);
    return analyzeTime(date, ofPrefixMatch);
  });
  var suffixedExp = "(?:" + ofPrefixes + "(?: |\\t)*" + "([0-9]+)(?: |\\t)+(" + [hour, minute, second].join("|") + ")(?: |\\t)*" + "(" + pastSuffix + "|" + futureSuffix + "))";
  matcher.addMatch(new RegExp(suffixedExp, "gi"), function (match) {
    var ofPrefixMatch = match[1];
    var value = Number(match[2]);
    var period = match[3];
    var suffix = match[4];
    var isPast = new RegExp(pastSuffix).test(suffix);
    var time = timeFor(isPast, period, value);
    return analyzeTime(time, ofPrefixMatch);
  });
}

Bravey.Language.PT.DateEntityRecognizer = function (entityName) {
  var matcher = new Bravey.RegexEntityRecognizer(entityName);
  matcher.addMatch(new RegExp("(?:(0[1-9]|[12][0-9]|3[01])(?:\\/|-)(0[1-9]|1[012])(?:(?:\\/|-)([0-9]{2,4}))?)", "gi"), function (match) {
    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3] || new Date().getFullYear());
    return LocalDate.of(year, month, day);
  });
  var pDay = 'dia';
  var pMonth = 'm[êe]s';
  var pYear = 'ano';
  var ofPrefixes = "(?:(" + [pDay, pMonth, pYear].join('|') + ")(?: |\\t)+(?:d[eoa]))?(?: |\\t)*";
  var prefixMatchIndex = 1;

  var dateFromMatch = function (date) {
    return function (match) {
      var prefixMatch = match[prefixMatchIndex];

      if (!prefixMatch) {
        return date;
      } else if (new RegExp(pYear, "i").test(prefixMatch)) {
        return date.year();
      } else if (new RegExp(pMonth, "i").test(prefixMatch)) {
        return date.monthValue();
      } else if (new RegExp(pDay, "i").test(prefixMatch)) {
        return date.dayOfMonth();
      }

      return date;
    };
  };

  function now() {
    return LocalDate.now(Bravey.Clock.getValue());
  }

  var _s = Bravey.Text.spaceToRegex;
  matcher.addMatch(new RegExp(ofPrefixes + "hoje", "gi"), dateFromMatch(now()));
  matcher.addMatch(new RegExp(ofPrefixes + "amanh[ãa]", "gi"), dateFromMatch(now().plusDays(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("depois de amanh[ãa]"), "gi"), dateFromMatch(now().plusDays(2)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("semana que vem"), "gi"), dateFromMatch(now().plusDays(7)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("m[êe]s que vem"), "gi"), dateFromMatch(now().plusMonths(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("semestre que vem"), "gi"), dateFromMatch(now().plusMonths(6)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("ano que vem"), "gi"), dateFromMatch(now().plusYears(1)));
  matcher.addMatch(new RegExp(ofPrefixes + "ontem", "gi"), dateFromMatch(now().minusDays(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("anteontem|antes de ontem"), "gi"), dateFromMatch(now().minusDays(2)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("semana passada"), "gi"), dateFromMatch(now().minusDays(7)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("m[êe]s passado"), "gi"), dateFromMatch(now().minusMonths(1)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("semestre passado"), "gi"), dateFromMatch(now().minusMonths(6)));
  matcher.addMatch(new RegExp(ofPrefixes + _s("ano passado"), "gi"), dateFromMatch(now().minusYears(1)));
  var pastPrefix = "h[áa]";

  var futurePrefix = _s("daqui|daqui a|em");

  var pastSuffix = "atr[áa]s";

  var futureSuffix = _s("adiante|[àa] frente|no futuro");

  var year = "anos?";
  var month = "m[êe]s|meses";
  var week = "semanas?";
  var day = "dias?";
  addDynamicDateMatchers(matcher, pastPrefix, futurePrefix, pastSuffix, futureSuffix, year, month, week, day, pYear, pMonth, pDay, ofPrefixes);
  matcher.bindTo(this);
};

Bravey.Language.PT.FreeTextEntityRecognizer = function (entityName, priority) {
  var commas = ["obrigado", "por favor"];
  var matcher = new Bravey.FreeTextEntityRecognizer(entityName, priority);
  matcher.addConjunction("é");
  matcher.addConjunction("deve ser");
  matcher.addConjunction("pode ser");
  matcher.addConjunction("talvez seja");
  matcher.addConjunction("o");
  matcher.addConjunction("a");
  matcher.addConjunction("e");

  for (let i = 0; i < commas.length; i++) {
    matcher.addConjunction(commas[i]);
    matcher.addConjunction("," + commas[i]);
    matcher.addConjunction(", " + commas[i]);
  }

  return matcher;
};

Bravey.Language.PT.Numbers = {
  wordsSeparator: /(\w+)/gi,
  sum: {
    'e': 0,
    'zero': 0,
    'um': 1,
    'dois': 2,
    'três': 3,
    'quatro': 4,
    'cinco': 5,
    'seis': 6,
    'sete': 7,
    'oito': 8,
    'nove': 9,
    'dez': 10,
    'onze': 11,
    'doze': 12,
    'treze': 13,
    'catorze': 14,
    'quinze': 15,
    'dezesseis': 16,
    'dezessete': 17,
    'dezoito': 18,
    'dezenove': 19,
    'vinte': 20,
    'trinta': 30,
    'quarenta': 40,
    'cinquenta': 50,
    'sessenta': 60,
    'setenta': 70,
    'oitenta': 80,
    'noventa': 90,
    'cem': 100,
    'duzentos': 200,
    'trezentos': 300,
    'quatrocentos': 400,
    'quinhentos': 500,
    'seiscentos': 600,
    'setecentos': 700,
    'oitocentos': 800,
    'novecentos': 900
  },
  mul: {
    'cento': 100,
    'mil': 1000,
    'milhão': 1000000
  },
  skip: {
    e: 1
  }
};

Bravey.Language.PT.NumberEntityRecognizer = function (entityName, priority) {
  this.getName = function () {
    return entityName;
  };

  this.getEntities = function (string, out) {
    if (!out) out = [];
    var tokens = string.toLowerCase().split(/(\w+)/);
    var mul,
        token,
        temp = 0,
        sum = 0,
        isnumber,
        current,
        valid,
        cursor = 0,
        end;

    for (let i = 0; i < tokens.length + 1; i++) {
      token = tokens[i] == undefined ? "*" : tokens[i];
      isnumber = true;

      if (!current) {
        valid = 0;
        current = {
          value: 0,
          entity: entityName,
          string: "",
          priority: priority || 0
        };
      }

      if (token.trim()) {
        if (token.trim() == 'e' && 0 == sum) {
          cursor += token.length;
          continue;
        }

        if (Bravey.Language.PT.Numbers.sum[token] != null) {
          sum += Bravey.Language.PT.Numbers.sum[token];
        } else if (!isNaN(token * 1)) {
          if (valid) {
            i--;
            token = "";
            isnumber = false;
          } else {
            temp = token * 1;
          }
        } else if (Bravey.Language.PT.Numbers.mul[token]) {
          mul = Bravey.Language.PT.Numbers.mul[token];
          temp += sum * mul;
          sum = 0;
        } else {
          isnumber = false;
        }

        if (isnumber) {
          valid = 1;
          end = cursor + token.length;

          if (current.position == undefined) {
            current.position = cursor;
          }
        } else if (valid) {
          current.value = temp + sum;
          current.string = string.substr(current.position, end - current.position);
          out.push(current);
          temp = sum = current = 0;
        }
      }

      cursor += token.length;
    }

    return out;
  };
};

Bravey.Nlp.Fuzzy = function (nlpName, extensions) {
  extensions = extensions || {};
  var intents = {};
  var documentClassifier = new Bravey.DocumentClassifier(extensions);
  var entities = {};
  var allEntities = [];
  var confidence = 0.75;

  function sortEntities(ent) {
    ent.sort(function (a, b) {
      if (a.position < b.position) return -1;
      if (a.position > b.position) return 1;
      if (a.string.length > b.string.length) return -1;
      if (a.string.length < b.string.length) return 1;
      if (a.priority > b.priority) return -1;
      if (a.priority < b.priority) return 1;
      return 0;
    });
  }

  function extractEntities(text, ent) {
    var out = [],
        done = {};

    for (let i = 0; i < ent.length; i++) if (!done[ent[i].entity]) {
      done[ent[i].entity] = 1;

      if (entities[ent[i].entity]) {
        entities[ent[i].entity].getEntities(text, out);
      }
    }

    sortEntities(out);
    return out;
  }

  function getEntities(text, intent) {
    var out = extractEntities(text, intent.entities);
    var outentities = [],
        outentitiesindex = {},
        sentence = [],
        ent,
        pos = -1,
        nextid,
        outtext = "",
        exceedEntities = false,
        extraEntities = false,
        missingEntities = false,
        counters = {},
        found = 0,
        prevstring;

    for (let i = 0; i < out.length; i++) {
      ent = out[i].entity;

      if (out[i].position >= pos) {
        if (intent.index[ent]) {
          if (counters[ent] == undefined) counters[ent] = 0;

          if (nextid = intent.index[ent][counters[ent]]) {
            counters[ent]++;
            found++;
            var match = {
              position: out[i].position,
              entity: ent,
              value: out[i].value,
              string: out[i].string,
              id: nextid
            };
            outentities.push(match);
            outentitiesindex[match.id] = match;
            if (pos == -1) prevstring = text.substr(0, out[i].position);else prevstring = text.substr(pos, out[i].position - pos);
            if (prevstring.length) sentence.push({
              string: prevstring
            });
            sentence.push(match);
            outtext += prevstring;
            outtext += "{" + ent + "}";
            pos = out[i].position + out[i].string.length;
          } else exceedEntities = true;
        } else extraEntities = true;
      }
    }

    prevstring = text.substr(pos == -1 ? 0 : pos);

    if (prevstring.length) {
      if (prevstring.length) sentence.push({
        string: prevstring
      });
      outtext += prevstring;
    }

    return {
      found: found,
      missingEntities: missingEntities,
      exceedEntities: exceedEntities,
      extraEntities: extraEntities,
      text: outtext,
      entities: outentities,
      sentence: sentence,
      entitiesIndex: outentitiesindex
    };
  }

  function expandIntentFromText(text, intent, names) {
    var ent,
        outtext = "",
        cur = -1,
        pos = -1,
        nextid,
        out = extractEntities(text, allEntities),
        counters = {};

    for (let i = 0; i < out.length; i++) {
      ent = out[i].entity;

      if (out[i].position > pos) {
        cur++;
        if (!intent.index[ent]) intent.index[ent] = [];
        if (counters[ent] == undefined) counters[ent] = 0;else counters[ent]++;
        nextid = intent.index[ent][counters[ent]];

        if (!nextid) {
          nextid = intent.index[ent][counters[ent]] = names && names[cur] ? names[cur] : ent + (counters[ent] ? counters[ent] : "");
          intent.entities.push({
            entity: ent,
            id: nextid
          });
        }

        if (pos == -1) outtext += text.substr(0, out[i].position);else outtext += text.substr(pos, out[i].position - pos);
        outtext += "{" + ent + "}";
        pos = out[i].position + out[i].string.length;
      }
    }

    outtext += text.substr(pos == -1 ? 0 : pos);
    return {
      text: outtext
    };
  }

  function expandIntentFromTagged(text, intent, names) {
    var nextid,
        cur = -1,
        counters = {};
    text.replace(/\{([.a-z_-]+)\}/g, function (m, ent) {
      cur++;
      if (!intent.index[ent]) intent.index[ent] = [];
      if (counters[ent] == undefined) counters[ent] = 0;else counters[ent]++;
      nextid = intent.index[ent][counters[ent]];

      if (!nextid) {
        nextid = intent.index[ent][counters[ent]] = names && names[cur] ? names[cur] : ent + (counters[ent] ? counters[ent] : "");
        intent.entities.push({
          entity: ent,
          id: nextid
        });
      }
    });
    return {
      text: text
    };
  }

  function getAnyEntity(text) {
    var prevstring,
        outentities = [],
        outentitiesindex = {},
        sentence = [],
        ent,
        nextid,
        outtext = "",
        counters = {},
        pos = -1,
        found = 0,
        out = extractEntities(text, allEntities);

    for (let i = 0; i < out.length; i++) {
      ent = out[i].entity;

      if (out[i].position > pos) {
        found++;
        if (counters[ent] == undefined) counters[ent] = 0;else counters[ent]++;
        nextid = ent + (counters[ent] ? counters[ent] : "");
        var match = {
          position: out[i].position,
          entity: ent,
          value: out[i].value,
          string: out[i].string,
          id: nextid
        };
        outentities.push(match);
        outentitiesindex[match.id] = match;
        if (pos == -1) prevstring = text.substr(0, out[i].position);else prevstring = text.substr(pos, out[i].position - pos);
        if (prevstring.length) sentence.push({
          string: prevstring
        });
        sentence.push(match);
        outtext += prevstring;
        outtext += "{" + ent + "}";
        pos = out[i].position + out[i].string.length;
      }
    }

    prevstring = text.substr(pos == -1 ? 0 : pos);

    if (prevstring.length) {
      if (prevstring.length) sentence.push({
        string: prevstring
      });
      outtext += prevstring;
    }

    return {
      found: found,
      text: outtext,
      entities: outentities,
      sentence: sentence,
      entitiesIndex: outentitiesindex
    };
  }

  this.addIntent = function (intentName, entities) {
    var index = {};

    for (let i = 0; i < entities.length; i++) {
      if (!index[entities[i].entity]) index[entities[i].entity] = [];
      index[entities[i].entity].push(entities[i].id);
    }

    intents[intentName] = {
      name: intentName,
      entities: entities,
      index: index
    };
    return true;
  };

  this.addEntity = function (entity) {
    var entityName = entity.getName();
    if (!entities[entityName]) allEntities.push({
      entity: entityName,
      id: "none"
    });
    entities[entityName] = entity;
    return true;
  };

  this.hasEntity = function (entityName) {
    return !!entities[entityName];
  };

  this.setConfidence = function (ratio) {
    confidence = ratio;
  };

  this.getConfidence = function (c) {
    return confidence;
  };

  this.addDocument = function (text, intent, guess) {
    if (guess) {
      if (guess.fromFullSentence) {
        text = Bravey.Text.clean(text);

        if (guess.expandIntent) {
          if (!intents[intent]) {

            this.addIntent(intent, []);
          }

          let expanded = expandIntentFromText(text, intents[intent], guess.withNames);
          return documentClassifier.addDocument(expanded.text, intent);
        }
      } else if (guess.fromTaggedSentence) {
        if (guess.expandIntent) {
          if (!intents[intent]) {

            this.addIntent(intent, []);
          }

          let expanded = expandIntentFromTagged(text, intents[intent], guess.withNames);
          return documentClassifier.addDocument(expanded.text, intent);
        }
      }

      return false;
    } else {
      if (intents[intent]) return documentClassifier.addDocument(Bravey.Text.clean(text), intent);else {

        return false;
      }
    }
  };

  this.test = function (text, method) {
    switch (method) {
      case "anyEntity":
        {
          let result = getAnyEntity(text);
          var classification = documentClassifier.classifyDocument(result.text);
          result.score = classification.winner.score;
          result.intent = classification.winner.label;
          return result;
        }

      default:
        {
          let classification,
              entlist,
              resultscore = -1,
              resultfound = -1;
          var result;

          for (var intent in intents) {
            entlist = getEntities(text, intents[intent]);

            if (!entlist.exceedEntities && !entlist.extraEntities && !entlist.missingEntities) {
              classification = documentClassifier.classifyDocument(entlist.text);

              if (classification.scores[intent] > confidence && (classification.scores[intent] > resultscore || classification.scores[intent] == resultscore && entlist.found > resultfound)) {
                result = entlist;
                result.score = resultscore = classification.scores[intent];
                resultfound = result.found;
                result.intent = intent;
              }
            }
          }

          return result;
        }
    }
  };
};

Bravey.Nlp.Sequential = function (nlpName, extensions) {
  extensions = extensions || {};
  var intents = {};
  var documentClassifier = new Bravey.DocumentClassifier(extensions);
  var entities = {};
  var allEntities = [];
  var confidence = 0.75;

  function getIntentRoot(intentName) {
    return intentName.split(/~/)[0];
  }

  function sortEntities(ent) {
    ent.sort(function (a, b) {
      if (a.position < b.position) return -1;
      if (a.position > b.position) return 1;
      if (a.string.length > b.string.length) return -1;
      if (a.string.length < b.string.length) return 1;
      if (a.priority > b.priority) return -1;
      if (a.priority < b.priority) return 1;
      return 0;
    });
  }

  function extractEntities(text, ent) {
    var out = [],
        done = {};

    for (let i = 0; i < ent.length; i++) if (!done[ent[i].entity]) {
      done[ent[i].entity] = 1;

      if (entities[ent[i].entity]) {
        entities[ent[i].entity].getEntities(text, out);
      }
    }

    sortEntities(out);
    return out;
  }

  function guessIntent(text, root, names) {
    let intentname = root || "",
        nextid,
        ent,
        outtext = "",
        entities = [],
        counters = {},
        cur = 0,
        pos = -1;
    let out = extractEntities(text, allEntities);

    for (let i = 0; i < out.length; i++) {
      ent = out[i].entity;

      if (out[i].position >= pos) {
        intentname += "~" + ent;
        if (counters[ent] == undefined) counters[ent] = 0;else counters[ent]++;
        nextid = names && names[cur] ? names[cur] : ent + (counters[ent] ? counters[ent] : "");
        entities.push({
          entity: ent,
          id: nextid
        });
        if (pos == -1) outtext += text.substr(0, out[i].position);else outtext += text.substr(pos, out[i].position - pos);
        outtext += "{" + ent + "}";
        pos = out[i].position + out[i].string.length;
        cur++;
      }
    }

    outtext += text.substr(pos == -1 ? 0 : pos);
    return {
      error: false,
      text: outtext,
      name: intentname,
      entities: entities
    };
  }

  function guessIntentFromTagged(text, root, names) {
    let nextid,
        counters = {};
    let intentname = root || "",
        outentities = [],
        cur = 0,
        error = false;
    text.replace(/\{([.a-z_-]+)\}/g, function (m, ent) {
      if (!entities[ent]) error = ent;else {
        intentname += "~" + ent;
        if (counters[ent] == undefined) counters[ent] = 0;else counters[ent]++;
        nextid = names && names[cur] ? names[cur] : ent + (counters[ent] ? counters[ent] : "");
        outentities.push({
          entity: ent,
          id: nextid
        });
        cur++;
      }
    });
    return {
      error: error,
      text: text,
      name: intentname,
      entities: outentities
    };
  }

  function getEntities(text, intent) {
    var out = extractEntities(text, intent.entities);
    var outentities = [],
        outentitiesindex = {},
        ent,
        pos = -1,
        entitypos = 0;

    function forward() {
      while (intent.entities[entitypos] && entities[intent.entities[entitypos].entity] && entities[intent.entities[entitypos].entity].expand) {
        var match = {
          position: pos < 0 ? 0 : pos,
          entity: intent.entities[entitypos].entity,
          value: "",
          string: text.substr(pos < 0 ? 0 : pos),
          id: intent.entities[entitypos].id
        };
        outentitiesindex[match.id] = match;
        outentities.push(match);
        entitypos++;
      }
    }

    forward();
    if (out.length) for (let i = 0; i < out.length; i++) {
      ent = out[i].entity;

      if (out[i].position >= pos) {
        if (intent.entities[entitypos].entity == ent) {
          var match = {
            position: out[i].position,
            entity: ent,
            value: out[i].value,
            string: out[i].string,
            id: intent.entities[entitypos].id
          };
          outentities.push(match);
          outentitiesindex[match.id] = match;
          pos = out[i].position + out[i].string.length;
          entitypos++;
          forward();
          if (entitypos >= intent.entities.length) break;
        }
      }
    }
    var nextentity,
        outtext = "",
        prevstring = "",
        sentence = [],
        oldposition;
    pos = 0;

    for (let i = 0; i < outentities.length; i++) {
      if (entities[outentities[i].entity].expand) {
        nextentity = outentities[i + 1];
        if (nextentity) outentities[i].string = outentities[i].string.substr(0, nextentity.position - outentities[i].position);
        oldposition = outentities[i].position;
        entities[outentities[i].entity].expand(outentities[i]);

        if (entities[outentities[i].entity].position > oldposition) {
          prevstring = text.substr(pos, entities[outentities[i].entity].position - oldposition);
          sentence.push({
            string: prevstring
          });
          outtext += prevstring;
          pos += entities[outentities[i].entity].position - oldposition;
        }
      }

      prevstring = text.substr(pos, outentities[i].position - pos);

      if (prevstring) {
        sentence.push({
          string: prevstring
        });
        outtext += prevstring;
      }

      sentence.push(outentities[i]);
      outtext += "{" + outentities[i].entity + "}";
      pos = outentities[i].position + outentities[i].string.length;
    }

    if (prevstring = text.substr(pos)) {
      sentence.push({
        string: prevstring
      });
      outtext += prevstring;
    }

    return {
      found: outentities.length,
      exceedEntities: false,
      missingEntities: outentities.length < intent.entities.length,
      extraEntities: outentities.length > intent.entities.length,
      text: outtext,
      entities: outentities,
      sentence: sentence,
      entitiesIndex: outentitiesindex
    };
  }

  this.addIntent = function (intentName, entities) {
    var index = {},
        intentFullName = intentName;

    for (let i = 0; i < entities.length; i++) {
      intentFullName += "~" + entities[i].entity;
      if (!index[entities[i].entity]) index[entities[i].entity] = [];
      index[entities[i].entity].push(entities[i].id);
    }

    intents[intentFullName] = {
      name: intentFullName,
      root: intentName,
      entities: entities,
      index: index
    };
    return true;
  };

  this.addEntity = function (entity) {
    var entityName = entity.getName();
    if (!entities[entityName]) allEntities.push({
      entity: entityName,
      id: "none"
    });
    entities[entityName] = entity;
    return true;
  };

  this.hasEntity = function (entityName) {
    return !!entities[entityName];
  };

  this.setConfidence = function (ratio) {
    confidence = ratio;
  };

  this.getConfidence = function (c) {
    return confidence;
  };

  this.addDocument = function (text, intent, guess) {
    if (guess) {
      if (guess.fromFullSentence) {
        text = Bravey.Text.clean(text);

        if (guess.expandIntent) {
          var found = guessIntent(text, intent, guess.withNames);

          if (!intents[found.name]) {

            this.addIntent(intent, found.entities);
          }

          return documentClassifier.addDocument(found.text, intent);
        }
      } else if (guess.fromTaggedSentence) {
        let found = guessIntentFromTagged(text, intent, guess.withNames);

        if (found.error !== false) {

          return false;
        } else {
          if (!intents[found.name]) {

            this.addIntent(intent, found.entities);
          }

          return documentClassifier.addDocument(found.text, intent);
        }
      }

      return false;
    } else {
      if (intents[intent]) return documentClassifier.addDocument(Bravey.Text.clean(text), getIntentRoot(intent));else {

        return false;
      }
    }
  };

  this.test = function (text, method) {
    text = Bravey.Text.clean(text);

    switch (method) {
      default:
        {
          var score,
              classification,
              entlist,
              resultscore = -1,
              resultfound = -1;
          var result;

          for (var intent in intents) {
            entlist = getEntities(text, intents[intent]);

            if (!entlist.exceedEntities && !entlist.extraEntities && !entlist.missingEntities) {
              classification = documentClassifier.classifyDocument(entlist.text);
              score = classification.scores[intents[intent].root];

              if (score > confidence && (score > resultscore || entlist.found > resultfound)) {
                result = entlist;
                result.score = resultscore = score;
                resultfound = result.found;
                result.intent = intents[intent].root;
              }
            }
          }

          return result;
        }
    }
  };
};

Bravey.ApiAiAdapter = function (packagePath, extensions) {
  extensions = extensions || {};
  var files = [];
  var loadedData = {};
  var intents = [];
  var entities = [];
  var nlp = new Bravey.Nlp[extensions.nlp || "Fuzzy"]("apiai", {
    stemmer: Bravey.Language[extensions.language].Stemmer,
    filter: extensions.filter
  });
  nlp.addEntity(new Bravey.Language[extensions.language].NumberEntityRecognizer("sys_number"));
  nlp.addEntity(new Bravey.Language[extensions.language].TimeEntityRecognizer("sys_time"));
  nlp.addEntity(new Bravey.Language[extensions.language].DateEntityRecognizer("sys_date"));
  nlp.addEntity(new Bravey.Language[extensions.language].TimePeriodEntityRecognizer("sys_time_period"));
  var pos = 0;
  var onready;

  function sanitizeApiAiId(id) {
    return id.replace(/[^a-z0-9:]/g, "_");
  }

  function loadNext() {
    Bravey.File.load(files[pos], function (text) {
      loadedData[files[pos]] = text;
      pos++;
      if (!files[pos]) dataLoaded();else loadNext();
    });
  }

  function dataLoaded() {
    var entity,
        missingEntity = {};

    for (let e = 0; e < entities.length; e++) {
      var data = JSON.parse(loadedData[entities[e].file]);
      var newEntity = new Bravey.StringEntityRecognizer(entities[e].name);

      for (let i = 0; i < data.entries.length; i++) for (let j = 0; j < data.entries[i].synonyms.length; j++) newEntity.addMatch(data.entries[i].value, data.entries[i].synonyms[j]);

      nlp.addEntity(newEntity);
    }

    for (let e = 0; e < intents.length; e++) {
      var data = JSON.parse(loadedData[intents[e].file]);

      for (let i = 0; i < data.userSays.length; i++) {
        var text = "",
            skip = false;

        for (let j = 0; j < data.userSays[i].data.length; j++) {
          if (data.userSays[i].data[j].meta) {
            entity = data.userSays[i].data[j].meta.substr(1);
            text += "{" + entity + ":" + data.userSays[i].data[j].alias + "}";
          } else text += data.userSays[i].data[j].text.replace(/\@([.a-z0-9_-]+):([.a-z0-9_-]+)/g, "{$1:$2}");
        }

        var names = [];
        text = text.replace(/\{([.a-z0-9_-]+):([.a-z0-9_-]+)\}/g, function (a, b, c) {
          b = sanitizeApiAiId(b);
          c = sanitizeApiAiId(c);

          if (!nlp.hasEntity(b)) {
            skip = true;

            if (!missingEntity[b]) {

              missingEntity[b] = 1;
            }
          }

          names.push(c);
          return "{" + b + "}";
        });
        if (!skip) nlp.addDocument(text.trim(), intents[e].name, {
          fromTaggedSentence: true,
          expandIntent: true,
          withNames: names
        });
      }
    }

    onready();
  }

  this.loadIntent = function (name) {
    var filename = packagePath + "/intents/" + name + ".json";
    files.push(filename);
    intents.push({
      file: filename,
      name: name
    });
  };

  this.loadEntity = function (name) {
    var filename = packagePath + "/entities/" + name + ".json";
    files.push(filename);
    entities.push({
      file: filename,
      name: name
    });
  };

  this.prepare = function (cb) {
    onready = cb;
    loadNext();
  };

  this.test = function (text, method) {
    var out = this.nlp.test(text, method);

    if (out) {
      var ret = {
        result: {
          source: "agent",
          resolvedQuery: text,
          action: "",
          actionIncomplete: false,
          parameters: {},
          contexts: [],
          metadata: {
            intentName: ""
          },
          fulfillment: {
            speech: ""
          },
          score: 0
        },
        status: {
          code: 200,
          errorType: "success"
        }
      };
      ret.result.metadata.intentName = out.intent;
      ret.result.score = out.score;

      for (var a in out.entitiesIndex) ret.result.parameters[a] = out.entitiesIndex[a].value;

      return ret;
    } else return {
      result: {
        resolvedQuery: text,
        contexts: [],
        metadata: {},
        fulfillment: {
          speech: ""
        },
        score: 0
      },
      status: {
        code: 200,
        errorType: "success"
      }
    };
  };

  this.nlp = nlp;
};

Bravey.ContextManager = function (extensions) {
  extensions = extensions || {};
  var defaultContexts = ["default"];
  var contexts = {};
  var parameters = {};
  var sessionManager = extensions.sessionManager || new Bravey.SessionManager.InMemorySessionManager(extensions);

  this.addNlp = function (nlp, contexttags, method) {
    if (!contexttags) contexttags = defaultContexts;

    for (let i = 0; i < contexttags.length; i++) {
      if (!contexts[contexttags[i]]) {
        contexts[contexttags[i]] = [];
        parameters[contexttags[i]] = [];
      }

      if (contexts[contexttags[i]].indexOf(nlp) == -1) {
        contexts[contexttags[i]].push(nlp);
        parameters[contexttags[i]].push({
          method: method
        });
      }
    }
  };

  this.removeNlp = function (nlp, contexttags) {
    var found;

    if (contexttags) {
      for (let i = 0; i < contexttags.length; i++) if ((found = contexts[contexttags[i]].indexOf(nlp)) != -1) {
        contexts[contexttags[i]].splice(found, 1);
        parameters[contexttags[i]].splice(found, 1);
      }
    } else {
      for (let i in contexts) {
        if ((found = contexts[i].indexOf(nlp)) != -1) {
          contexts[i].splice(found, 1);
          parameters[i].splice(found, 1);
        }
      }
    }
  };

  this.removeContext = function (contexttag) {
    if (contexts[contexttag]) delete contexts[contexttag];
  };

  this.setSessionIdContext = function (sessionid, contexttag) {
    return sessionManager.setContext(sessionid, contexttag);
  };

  this.setSessionIdData = function (sessionid, data) {
    return sessionManager.setData(sessionid, data);
  };

  this.clearSessionIdData = function (sessionid) {
    return sessionManager.clearData(sessionid);
  };

  this.getSessionIdData = function (sessionid) {
    return sessionManager.getData(sessionid);
  };

  this.reserveSessionId = function (id) {
    return sessionManager.reserveSessionId(id);
  };

  this.testByContext = function (text, contexttags) {
    var ret = {
      result: false
    },
        found;
    if (!contexttags) contexttags = defaultContexts;

    for (let i = 0; i < contexttags.length; i++) if (contexts[contexttags[i]]) for (let j = 0; j < contexts[contexttags[i]].length; j++) {
      found = contexts[contexttags[i]][j].test(text, parameters[contexttags[i]][j].method);

      if (!ret.result || found.score && found.score > ret.result.score || found.score == ret.result.score || found.found > ret.result.found) {
        ret.result = found;
        ret.context = contexttags[i];
      }
    }

    return ret;
  };

  this.testBySessionId = function (text, sessionid) {
    var ok;
    var found = {
      result: false
    };
    if (sessionid === undefined) ok = sessionid = sessionManager.reserveSessionId();else ok = sessionManager.keepAlive(sessionid);

    if (ok) {
      var contexttags = sessionManager.getContext(sessionid);
      found = this.testByContext(text, contexttags);
      found.sessionId = sessionid;
      found.sessionContext = contexttags;
      found.sessionData = sessionManager.getData(sessionid);
    }

    return found;
  };
};

Bravey.SessionManager.InMemorySessionManager = function (extensions) {
  if (!extensions) extensions = {};
  var sessions = {};
  var sessionLength = extensions.sessionLength || 600000;

  function getTimestamp() {
    return new Date().getTime();
  }

  function cleanSessions() {
    var now = getTimestamp();

    for (var a in sessions) if (now - sessions[a].timestamp > sessionLength) delete sessions[a];
  }

  function makeNewSession() {
    return {
      context: ["default"],
      data: {},
      timestamp: getTimestamp()
    };
  }

  this.reserveSessionId = function (id) {
    if (id == undefined) {
      do {
        id = Bravey.Text.generateGUID();
      } while (sessions[id]);
    }

    cleanSessions();
    if (!sessions[id]) sessions[id] = makeNewSession();
    return id;
  };

  this.keepAlive = function (sessionid) {
    if (sessions[sessionid]) {
      sessions[sessionid].timestamp = getTimestamp();
      return true;
    } else return false;
  };

  this.setContext = function (sessionid, contexttags) {
    if (sessions[sessionid]) {
      sessions[sessionid].context = contexttags;
      this.keepAlive(sessionid);
      return true;
    } else return false;
  };

  this.setData = function (sessionid, data) {
    if (sessions[sessionid]) {
      for (var a in data) sessions[sessionid].data[a] = data[a];

      this.keepAlive(sessionid);
      return true;
    } else return false;
  };

  this.clearData = function (sessionid, data) {
    if (sessions[sessionid]) {
      sessions[sessionid].data = {};
      this.keepAlive(sessionid);
      return true;
    } else return false;
  };

  this.getContext = function (sessionid) {
    if (sessions[sessionid]) return sessions[sessionid].context;
  };

  this.getData = function (sessionid) {
    if (sessions[sessionid]) return sessions[sessionid].data;
  };
};

Bravey.Filter.BasicFilter = function (tokens) {
  var out = [];

  for (let i = 0; i < tokens.length; i++) if (tokens[i][0] != "{" && tokens[i].length > 3) out.push(tokens[i]);

  if (out.length < 3) return tokens;else return out;
};

function fillWithZero(value, maxLength) {
  let diff = maxLength - ((value == null ? void 0 : value.length) || 0);

  if (diff < 0) {
    diff = 0;
  }

  return '0'.repeat(diff) + value;
}
function isValidDate(value) {
  if (!value) {
    return false;
  }

  const makeDateRegex = function (separator) {
    if (1 === separator.length) {
      separator = '\\' + separator;
    }

    const sep = '(?:' + separator + ')';
    return new RegExp(`^[0-9]{1,4}${sep}(0?[1-9]|1[012])${sep}(0?[1-9]|[12][0-9]|3[01])$`);
  };

  const SLASH_PATTERN = DateTimeFormatter.ofPattern("uuuu/MM/dd").withResolverStyle(ResolverStyle.STRICT);
  const DASH_PATTERN = DateTimeFormatter.ofPattern("uuuu-MM-dd").withResolverStyle(ResolverStyle.STRICT);
  const patterns = [SLASH_PATTERN, DASH_PATTERN];
  const separators = ['/', '-'];

  for (let i = 0, len = separators.length; i < len; ++i) {
    const sep = separators[i];

    if (makeDateRegex(sep).test(value)) {
      let [year, month, day] = value.split(sep);
      year = fillWithZero(year, 4);
      month = fillWithZero(month, 2);
      day = fillWithZero(day, 2);
      const newDate = year + sep + month + sep + day;
      const pattern = patterns[i];

      try {
        LocalDate$1.parse(newDate, pattern);
        return true;
      } catch (_unused) {
        return false;
      }
    }
  }

  return false;
}
function isValidTime(value) {
  if (!value) {
    return false;
  }

  const regex = /^([01]?[0-9]|2[0-3])\:[0-5]?[0-9](\:[0-5]?[0-9])?(\.[0-9]{1,3})?$/;
  return regex.test(value);
}
function isValidDateTime(value) {
  const [date, time] = splitDateAndTime(value);
  return isValidDate(date) && isValidTime(time);
}
function isShortTime(value) {
  if (!value) {
    return false;
  }

  const regex = /^([01]?[0-9]|2[0-3])\:[0-5]?[0-9]$/;
  return regex.test(value);
}
function isShortDateTime(value) {
  if (!value) {
    return false;
  }

  const [date, time] = splitDateAndTime(value);
  return isValidDate(date) && isShortTime(time);
}

function splitDateAndTime(value) {
  const [date, time] = value.split(' ').filter(v => v.trim().length > 0);
  return [date, time];
}

var ValueType;

(function (ValueType) {
  ValueType["STRING"] = "string";
  ValueType["INTEGER"] = "integer";
  ValueType["DOUBLE"] = "double";
  ValueType["DATE"] = "date";
  ValueType["TIME"] = "time";
  ValueType["LONG_TIME"] = "longtime";
  ValueType["DATE_TIME"] = "datetime";
  ValueType["LONG_DATE_TIME"] = "longdatetime";
  ValueType["BOOLEAN"] = "boolean";
})(ValueType || (ValueType = {}));

class ValueTypeDetector {
  isTrue(val) {
    return true === val || 'true' === val.toString().toLowerCase();
  }

  isFalse(val) {
    return false === val || 'false' === val.toString().toLowerCase();
  }

  isBoolean(val) {
    return this.isTrue(val) || this.isFalse(val);
  }

  isNumber(val) {
    return this.isDouble(val);
  }

  isInteger(val) {
    const valueType = typeof val;

    if ('number' === valueType || 'string' === valueType) {
      return new RegExp('^-?[0-9]+$').test(val);
    }

    return false;
  }

  isDouble(val) {
    const valueType = typeof val;

    if ('number' === valueType) {
      return true;
    }

    if ('string' === valueType) {
      return new RegExp('^(-?[0-9]+(?:.[0-9]+)?)$').test(val);
    }

    return false;
  }

  isDate(val) {
    const valueType = typeof val;

    if ('object' === valueType && (val instanceof Date || val instanceof LocalDate$1)) {
      return true;
    }

    if ('string' === valueType) {
      return isValidDate(val);
    }

    return false;
  }

  isTime(val) {
    const valueType = typeof val;

    if ('object' === valueType && (val instanceof Date || val instanceof LocalTime$1)) {
      return true;
    }

    if ('string' === valueType) {
      return isShortTime(val);
    }

    return false;
  }

  isLongTime(val) {
    const valueType = typeof val;

    if ('object' === valueType && (val instanceof Date || val instanceof LocalTime$1)) {
      return true;
    }

    if ('string' === valueType) {
      return isValidTime(val) && !isShortTime(val);
    }

    return false;
  }

  isDateTime(val) {
    const valueType = typeof val;

    if ('object' === valueType && (val instanceof Date || val instanceof LocalDateTime$1)) {
      return true;
    }

    if ('string' === valueType) {
      return isShortDateTime(val);
    }

    return false;
  }

  isLongDateTime(val) {
    const valueType = typeof val;

    if ('object' === valueType && (val instanceof Date || val instanceof LocalDateTime$1)) {
      return true;
    }

    if ('string' === valueType) {
      return isValidDateTime(val) && !isShortDateTime(val);
    }

    return false;
  }

  detect(val) {
    if (this.isBoolean(val)) {
      return ValueType.BOOLEAN;
    }

    if (this.isInteger(val)) {
      return ValueType.INTEGER;
    }

    if (this.isDouble(val)) {
      return ValueType.DOUBLE;
    }

    if (this.isDateTime(val)) {
      return ValueType.DATE_TIME;
    }

    if (this.isLongDateTime(val)) {
      return ValueType.LONG_DATE_TIME;
    }

    if (this.isDate(val)) {
      return ValueType.DATE;
    }

    if (this.isTime(val)) {
      return ValueType.TIME;
    }

    if (this.isLongTime(val)) {
      return ValueType.LONG_TIME;
    }

    if (Array.isArray(val)) {
      if (val.length > 0) {
        return this.detect(val[0]);
      }
    }

    return ValueType.STRING;
  }

  detectAll(values) {
    return values.map(v => this.detect(v));
  }

}
function adjustValueToTheRightType(v, valueType, formatters) {
  const vType = valueType || new ValueTypeDetector().detect(v.toString().trim());
  let valueAfter;

  switch (vType) {
    case ValueType.INTEGER:
    case ValueType.DOUBLE:
      {
        valueAfter = Number(v) || 0;
        break;
      }

    case ValueType.DATE:
      {
        const defaultFormatter = DateTimeFormatter.ofPattern("uuuuu-MM-dd");
        const formattersToUse = [...(formatters || []), defaultFormatter, undefined];
        let success = false;

        for (const fmt of formattersToUse) {
          try {
            valueAfter = LocalDate$1.parse(v, fmt);
            success = true;
            break;
          } catch (_unused) {}
        }

        if (!success) {
          valueAfter = LocalDate$1.now();
        }

        break;
      }

    case ValueType.LONG_TIME:
    case ValueType.TIME:
      {
        try {
          valueAfter = LocalTime$1.parse(v);
        } catch (_unused2) {
          valueAfter = LocalTime$1.now();
        }

        break;
      }

    case ValueType.LONG_DATE_TIME:
    case ValueType.DATE_TIME:
      {
        try {
          valueAfter = LocalDateTime$1.parse(v);
        } catch (_unused3) {
          valueAfter = LocalDateTime$1.now();
        }

        break;
      }

    case ValueType.BOOLEAN:
      {
        valueAfter = ['true', 'yes'].indexOf(v.toLowerCase()) >= 0;
        break;
      }

    default:
      valueAfter = v;
  }

  return valueAfter;
}

const VALUE_REGEX = /"(?:[^"\\]|\\.)*"/g;
const UI_ELEMENT_REF_REGEX = /\{[a-zA-ZÀ-ÖØ-öø-ÿ][^|<\r\n\>\}]*\}/g;
const UI_PROPERTY_REF_REGEX = /\{[ ]*[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*(\:[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*)?\|[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ ]+\}/g;
const UI_LITERAL_REGEX = /(?:\<)([a-zA-ZÀ-ÖØ-öø-ÿ0-9 \#\@\~\.\:\-\*\=\_\/\[\]\'\"]|\\['">])+(?:\>)/g;
const NUMBER_REGEX = /(-?[0-9]+(?:\.[0-9]+)?)/g;
const QUERY_REGEX = /"(?:\t| )*SELECT[^"]+"/gi;
const CONSTANT_REGEX = /\[[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\]/g;
const VALUE_LIST_REGEX = /(?:\[[\t ]*)(("(\\"|[^"])+"|(-?[0-9]+(\.[0-9]+)?))+,?[\t ]?)+[^\]]?(?:\])/g;
const STATE_REGEX = /\~[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\~/g;
const COMMAND_REGEX = /'(?:[^'\\]|\\.)*'/g;
class EntityRecognizerMaker {
  makeValue(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(VALUE_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0] || '';
      return value.substring(1, value.length - 1);
    }, 100);
    return valueRec;
  }

  makeUIElementReference(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(UI_ELEMENT_REF_REGEX);
    valueRec.addMatch(regex, function (match) {
      return match.toString().replace('{', '').replace('}', '');
    }, 100);
    return valueRec;
  }

  makeUIPropertyReference(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(UI_PROPERTY_REF_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0] || '';
      return value.substring(1, value.length - 1).trim();
    }, 100);
    return valueRec;
  }

  makeUILiteral(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(UI_LITERAL_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0].toString();
      return value.trim().substring(1, value.length - 1).trim().replace(/\\>/g, '>');
    }, 100);
    return valueRec;
  }

  makeNumber(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(NUMBER_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0].toString().trim();
      return Number(value);
    }, 10);
    return valueRec;
  }

  makeQuery(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(QUERY_REGEX);
    valueRec.addMatch(regex, function (match) {
      const content = match.toString();
      return content.substring(1, content.length - 1).trim();
    }, 200);
    return valueRec;
  }

  makeConstant(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(CONSTANT_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0].toString();
      return value.substring(1, value.length - 1);
    }, 10);
    return valueRec;
  }

  makeValueList(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(VALUE_LIST_REGEX);
    valueRec.addMatch(regex, function (match) {
      let content = match[0].toString().trim();
      content = content.substring(1, content.length - 1);
      const contentRegex = /(((-?[0-9]+(?:\.[0-9]+)?)|"(\\"|[^"])+"))+/g;
      let values = [];
      let result;

      while ((result = contentRegex.exec(content)) !== undefined) {
        if (null === result) {
          break;
        }

        const v = result[0];

        if (v.startsWith('"')) {
          values.push(v.substring(1, v.length - 1));
        } else {
          values.push(adjustValueToTheRightType(v));
        }
      }

      return values;
    }, 1000);
    return valueRec;
  }

  makeState(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(STATE_REGEX);
    valueRec.addMatch(regex, function (match) {
      const value = match[0].toString();
      return value.substring(1, value.length - 1);
    }, 10);
    return valueRec;
  }

  makeCommand(entityName) {
    let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
    let regex = cloneRegExp(COMMAND_REGEX);
    valueRec.addMatch(regex, function (match) {
      const content = match.toString();
      return content.substring(1, content.length - 1).trim();
    }, 500);
    return valueRec;
  }

  makeDate(language, entityName) {
    const lang = this.braveyLanguage(language);
    return new lang.DateEntityRecognizer(entityName);
  }

  makeTime(language, entityName) {
    const lang = this.braveyLanguage(language);
    return new lang.TimeEntityRecognizer2(entityName);
  }

  makeDateTime(language, entityName) {
    const lang = this.braveyLanguage(language);
    return new lang.DateTimeEntityRecognizer(entityName);
  }

  braveyLanguage(language) {
    const lang = language.substr(0, 2).toUpperCase();
    return Bravey.Language[lang] || Bravey.Language['EN'];
  }

}

class NLP {
  constructor(_useFuzzyProcessor = true) {
    this._useFuzzyProcessor = _useFuzzyProcessor;
    this._nlpMap = {};
    this._additionalEntities = [];
    this._additionalRecognizers = [];
    const erMaker = new EntityRecognizerMaker();

    this._additionalEntities.push(Entities.VALUE);

    this._additionalRecognizers.push(erMaker.makeValue(Entities.VALUE));

    this._additionalEntities.push(Entities.UI_ELEMENT_REF);

    this._additionalRecognizers.push(erMaker.makeUIElementReference(Entities.UI_ELEMENT_REF));

    this._additionalEntities.push(Entities.UI_PROPERTY_REF);

    this._additionalRecognizers.push(erMaker.makeUIPropertyReference(Entities.UI_PROPERTY_REF));

    this._additionalEntities.push(Entities.UI_LITERAL);

    this._additionalRecognizers.push(erMaker.makeUILiteral(Entities.UI_LITERAL));

    this._additionalEntities.push(Entities.NUMBER);

    this._additionalRecognizers.push(erMaker.makeNumber(Entities.NUMBER));

    this._additionalEntities.push(Entities.QUERY);

    this._additionalRecognizers.push(erMaker.makeQuery(Entities.QUERY));

    this._additionalEntities.push(Entities.CONSTANT);

    this._additionalRecognizers.push(erMaker.makeConstant(Entities.CONSTANT));

    this._additionalEntities.push(Entities.VALUE_LIST);

    this._additionalRecognizers.push(erMaker.makeValueList(Entities.VALUE_LIST));

    this._additionalEntities.push(Entities.STATE);

    this._additionalRecognizers.push(erMaker.makeState(Entities.STATE));

    this._additionalEntities.push(Entities.COMMAND);

    this._additionalRecognizers.push(erMaker.makeCommand(Entities.COMMAND));

    this._additionalEntities.push(Entities.DATE);

    this._additionalEntities.push(Entities.TIME);

    this._additionalEntities.push(Entities.DATE_TIME);
  }

  train(language, data, intentNameFilter = undefined) {
    if (!this._nlpMap[language]) {
      this._nlpMap[language] = {
        nlp: this.createNLP(),
        isTrained: true
      };
    } else {
      this._nlpMap[language].isTrained = true;
    }

    let nlp = this._nlpMap[language].nlp;

    for (let intent of data.intents) {
      if (intentNameFilter && intentNameFilter != intent.name) {
        continue;
      }

      let entities = intent.entities.map(e => {
        return {
          id: e.name,
          entity: e.name
        };
      });
      this.addDefaultEntitiesTo(entities);
      nlp.addIntent(intent.name, entities);

      for (let e of intent.entities) {
        let priority = undefined;

        if (data.priorities && data.priorities[intent.name] && data.priorities[intent.name][e.name]) {
          priority = data.priorities[intent.name][e.name];
        }

        let entityRec = new Bravey.StringEntityRecognizer(e.name, priority);

        for (let m of e.matches) {
          for (let sample of m.samples) {
            entityRec.addMatch(m.id, sample);
          }
        }

        nlp.addEntity(entityRec);
      }
    }

    this.addDefaultRecognizersTo(nlp);
    const erMaker = new EntityRecognizerMaker();
    nlp.addEntity(erMaker.makeDate(language, Entities.DATE));
    nlp.addEntity(erMaker.makeTime(language, Entities.TIME));
    nlp.addEntity(erMaker.makeDateTime(language, Entities.DATE_TIME));
    const opt = this.documentTrainingOptions();

    for (const ex of data.examples) {
      for (const sentence of ex.sentences) {
        nlp.addDocument(sentence, ex.intent, opt);
      }
    }
  }

  isTrained(language) {
    if (!this._nlpMap[language]) {
      return false;
    }

    return this._nlpMap[language].isTrained;
  }

  recognize(language, sentence, entityFilter = '*') {
    let nlp;

    if (!this._nlpMap[language]) {
      this._nlpMap[language] = {
        nlp: this.createNLP(),
        isTrained: false
      };
    }

    nlp = this._nlpMap[language].nlp;
    let method = '*' == entityFilter || !entityFilter ? 'anyEntity' : entityFilter;
    let r = nlp.test(sentence, method);
    return r;
  }

  getInternalClock() {
    return Bravey.Clock.getValue();
  }

  setInternalClock(clockOrZone) {
    Bravey.Clock.setValue(clockOrZone);
  }

  resetInternalClock() {
    Bravey.Clock.resetValue();
  }

  createFixedClockFromNow() {
    return Clock.fixed(Instant.now(), ZoneId.systemDefault());
  }

  createNLP() {
    return this._useFuzzyProcessor ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential();
  }

  documentTrainingOptions() {
    return {
      fromTaggedSentence: true,
      expandIntent: true
    };
  }

  addDefaultEntitiesTo(entities) {
    for (let entityName of this._additionalEntities) {
      entities.push({
        id: entityName,
        entity: entityName
      });
    }
  }

  addDefaultRecognizersTo(nlp) {
    for (let rec of this._additionalRecognizers) {
      nlp.addEntity(rec);
    }
  }

}

const UIP_RULES = {
  minTargets: 1,
  maxTargets: 1,
  targets: [Entities.VALUE]
};
UIP_RULES[Entities.VALUE] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.VALUE_LIST] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.NUMBER] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.CONSTANT] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.QUERY] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.UI_PROPERTY] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.UI_DATA_TYPE] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.BOOL_VALUE] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.COMMAND] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.DATE] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.TIME] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.DATE_TIME] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.LONG_TIME] = {
  min: 1,
  max: 1
};
UIP_RULES[Entities.LONG_DATE_TIME] = {
  min: 1,
  max: 1
};
const DEFAULT_UI_PROPERTY_SYNTAX_RULE = UIP_RULES;
const UI_PROPERTY_SYNTAX_RULES = [{
  name: UIPropertyTypes.ID,
  targets: [Entities.VALUE, Entities.COMMAND]
}, {
  name: UIPropertyTypes.TYPE,
  targets: [Entities.UI_PROPERTY]
}, {
  name: UIPropertyTypes.EDITABLE,
  targets: [Entities.BOOL_VALUE, Entities.NUMBER],
  minTargets: 0
}, {
  name: UIPropertyTypes.DATA_TYPE,
  targets: [Entities.UI_DATA_TYPE]
}, {
  name: UIPropertyTypes.VALUE,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.QUERY, Entities.VALUE_LIST, Entities.TIME, Entities.DATE_TIME, Entities.LONG_TIME, Entities.LONG_DATE_TIME]
}, {
  name: UIPropertyTypes.MIN_LENGTH,
  targets: [Entities.NUMBER, Entities.CONSTANT, Entities.QUERY]
}, {
  name: UIPropertyTypes.MAX_LENGTH,
  targets: [Entities.NUMBER, Entities.CONSTANT, Entities.QUERY]
}, {
  name: UIPropertyTypes.MIN_VALUE,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.QUERY, Entities.DATE, Entities.TIME, Entities.DATE_TIME, Entities.LONG_TIME, Entities.LONG_DATE_TIME]
}, {
  name: UIPropertyTypes.MAX_VALUE,
  targets: [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.QUERY, Entities.DATE, Entities.TIME, Entities.DATE_TIME, Entities.LONG_TIME, Entities.LONG_DATE_TIME]
}, {
  name: UIPropertyTypes.FORMAT,
  targets: [Entities.VALUE, Entities.CONSTANT]
}, {
  name: UIPropertyTypes.REQUIRED,
  targets: [Entities.BOOL_VALUE, Entities.NUMBER],
  minTargets: 0
}, {
  name: UIPropertyTypes.LOCALE,
  targets: [Entities.VALUE, Entities.CONSTANT]
}, {
  name: UIPropertyTypes.LOCALE_FORMAT,
  targets: [Entities.VALUE, Entities.CONSTANT]
}];

class UIPropertyRecognizer {
  constructor(_nlp) {
    this._nlp = _nlp;
    this._syntaxRules = this.buildSyntaxRules();
  }

  nlp() {
    return this._nlp;
  }

  isTrained(language) {
    return this._nlp.isTrained(language);
  }

  trainMe(trainer, language) {
    return trainer.trainNLP(this._nlp, language, Intents.UI);
  }

  recognizeSentences(language, nodes, errors, warnings) {
    const recognizer = new NodeSentenceRecognizer(this._nlp);
    const syntaxRules = this._syntaxRules;

    const _this = this;

    let processor = function (node, r, errors, warnings) {
      const recognizedEntityNames = r.entities.map(e => e.entity);
      const propertyIndex = recognizedEntityNames.indexOf(Entities.UI_PROPERTY);

      if (propertyIndex < 0) {
        const msg = 'Unrecognized (' + language + '): ' + node.content;
        warnings.push(new NLPException(msg, node.location));
        return;
      }

      const property = r.entities[propertyIndex].value;
      recognizer.validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings);
      let item = node;
      item.property = property;

      for (let e of r.entities) {
        let entityValue;

        switch (e.entity) {
          case Entities.VALUE:
          case Entities.NUMBER:
            entityValue = new EntityValue(e.entity, adjustValueToTheRightType(e.value));
            break;

          case Entities.DATE:
            entityValue = new EntityValue(e.entity, _this.convertToDateIfNeeded(e.value, language));
            break;

          case Entities.LONG_TIME:
          case Entities.TIME:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.LONG_DATE_TIME:
          case Entities.DATE_TIME:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.VALUE_LIST:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.QUERY:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.UI_ELEMENT_REF:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.UI_LITERAL:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.UI_PROPERTY_REF:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.CONSTANT:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.UI_DATA_TYPE:
            entityValue = new EntityValue(e.entity, e.value);
            break;

          case Entities.BOOL_VALUE:
            entityValue = new EntityValue(e.entity, 'true' === e.value);
            break;

          default:
            entityValue = null;
        }

        if (isDefined(entityValue)) {
          item.value = entityValue;
          break;
        }
      }

      const booleanProperties = [UIPropertyTypes.REQUIRED, UIPropertyTypes.EDITABLE];

      if (booleanProperties.indexOf(property) >= 0 && !r.entities.find(e => e.entity === Entities.BOOL_VALUE)) {
        item.value = new EntityValue(Entities.BOOL_VALUE, true);
      }

      return item;
    };

    recognizer.recognize(language, nodes, [Intents.UI], 'UI Element', errors, warnings, processor);
  }

  convertToDateIfNeeded(value, language) {
    if (typeof value != 'string') {
      return value;
    }

    const f = DateTimeFormatter.ofPattern("uuuu-MM-dd");

    try {
      return LocalDate$1.parse(value, f);
    } catch (_unused) {
      try {
        return LocalDate$1.parse(value);
      } catch (_unused2) {}
    }

    return value;
  }

  buildSyntaxRules() {
    return new SyntaxRuleBuilder().build(UI_PROPERTY_SYNTAX_RULES, DEFAULT_UI_PROPERTY_SYNTAX_RULE);
  }

}

class NLPBasedSentenceRecognizer {
  constructor(_nlpTrainer, _useFuzzyProcessor) {
    this._nlpTrainer = _nlpTrainer;
    this._useFuzzyProcessor = _useFuzzyProcessor;
    this._uiPropertyRec = new UIPropertyRecognizer(new NLP(_useFuzzyProcessor));
    this._variantSentenceRec = new GivenWhenThenSentenceRecognizer(new NLP(_useFuzzyProcessor));
    this._dbPropertyRec = new DatabasePropertyRecognizer(new NLP(_useFuzzyProcessor));
  }

  get uiPropertyRec() {
    return this._uiPropertyRec;
  }

  get variantSentenceRec() {
    return this._variantSentenceRec;
  }

  get dbPropertyRec() {
    return this._dbPropertyRec;
  }

  isTrained(language) {
    const t1 = this._uiPropertyRec.isTrained(language);

    const t2 = this._variantSentenceRec.isTrained(language);

    const t3 = this._dbPropertyRec.isTrained(language);

    return t1 && t2 && t3;
  }

  canBeTrained(language) {
    return this._nlpTrainer.canBeTrained(language);
  }

  train(language) {
    const t1 = this._uiPropertyRec.trainMe(this._nlpTrainer, language);

    const t2 = this._variantSentenceRec.trainMe(this._nlpTrainer, language);

    const t3 = this._dbPropertyRec.trainMe(this._nlpTrainer, language);

    return t1 && t2 && t3;
  }

  recognizeSentencesInDocument(doc, language, errors, warnings) {
    for (let uiElement of doc.uiElements || []) {
      this._uiPropertyRec.recognizeSentences(language, uiElement.items || [], errors, warnings);

      for (let item of uiElement.items || []) {
        this._variantSentenceRec.recognizeSentences(language, item.otherwiseSentences, errors, warnings, 'Otherwise sentences');
      }
    }

    for (let db of doc.databases || []) {
      this._dbPropertyRec.recognizeSentences(language, db.items, errors, warnings);
    }

    if (isDefined(doc.beforeAll)) {
      this._variantSentenceRec.recognizeSentences(language, doc.beforeAll.sentences, errors, warnings, 'Before All');
    }

    if (isDefined(doc.afterAll)) {
      this._variantSentenceRec.recognizeSentences(language, doc.afterAll.sentences, errors, warnings, 'After All');
    }

    for (let tc of doc.testCases || []) {
      this._variantSentenceRec.recognizeSentences(language, tc.sentences, errors, warnings, 'Test Case');
    }

    if (!doc.feature) {
      return;
    }

    if (isDefined(doc.feature.variantBackground)) {
      let vb = doc.feature.variantBackground;

      this._variantSentenceRec.recognizeSentences(language, vb.sentences, errors, warnings);
    }

    for (let uiElement of doc.feature.uiElements || []) {
      this._uiPropertyRec.recognizeSentences(language, uiElement.items, errors, warnings);

      for (let item of uiElement.items || []) {
        if (!item) {
          continue;
        }

        this._variantSentenceRec.recognizeSentences(language, item.otherwiseSentences || [], errors, warnings);
      }
    }

    for (let scenario of doc.feature.scenarios || []) {
      if (isDefined(scenario.variantBackground)) {
        let vb = scenario.variantBackground;

        this._variantSentenceRec.recognizeSentences(language, vb.sentences, errors, warnings, 'Variant Background');
      }

      for (let variant of scenario.variants || []) {
        this._variantSentenceRec.recognizeSentences(language, variant.sentences, errors, warnings);
      }
    }

    if (isDefined(doc.beforeFeature)) {
      this._variantSentenceRec.recognizeSentences(language, doc.beforeFeature.sentences, errors, warnings, 'Before Feature');
    }

    if (isDefined(doc.afterFeature)) {
      this._variantSentenceRec.recognizeSentences(language, doc.afterFeature.sentences, errors, warnings, 'After Feature');
    }

    if (isDefined(doc.beforeEachScenario)) {
      this._variantSentenceRec.recognizeSentences(language, doc.beforeEachScenario.sentences, errors, warnings, 'Before Each Scenario');
    }

    if (isDefined(doc.afterEachScenario)) {
      this._variantSentenceRec.recognizeSentences(language, doc.afterEachScenario.sentences, errors, warnings, 'After Feature');
    }
  }

}

const BASE_TRAINING_EXAMPLES = [{
  "intent": "testcase",
  "sentences": ["{ui_action} {ui_element}", "{ui_action} {ui_literal}", "{ui_action} {value}", "{ui_action} {number}", "{ui_action} {constant}", "{ui_action} {ui_property_ref}", "{ui_action} {state}", "{ui_action} {ui_element} {value}", "{ui_action} {ui_element} {number}", "{ui_action} {ui_element} {constant}", "{ui_action} {ui_element} {ui_property_ref}", "{ui_action} {ui_element} {ui_action_option}", "{ui_action} {ui_element} {ui_action_option} {value}", "{ui_action} {ui_element} {ui_action_option} {value} {value}", "{ui_action} {ui_element} {ui_action_option} {value} {number}", "{ui_action} {ui_element} {ui_action_option} {value} {constant}", "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {value}", "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {number}", "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {constant}", "{ui_action} {ui_element} {ui_action_option} {ui_element}", "{ui_action} {ui_element} {ui_action_option} {ui_literal}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {value}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {number}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {constant}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {value}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {number}", "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {constant}", "{ui_action} {ui_action_option} {value} {ui_element}", "{ui_action} {ui_action_option} {value} {ui_element} {value}", "{ui_action} {ui_action_option} {value} {ui_element} {number}", "{ui_action} {ui_action_option} {value} {ui_element} {constant}", "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {value}", "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {number}", "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {constant}", "{ui_action} {ui_action_option} {number} {ui_element}", "{ui_action} {ui_action_option} {number} {ui_element} {value}", "{ui_action} {ui_action_option} {number} {ui_element} {number}", "{ui_action} {ui_action_option} {number} {ui_element} {constant}", "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {value}", "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {number}", "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {constant}", "{ui_action} {ui_action_option} {constant} {ui_element}", "{ui_action} {ui_action_option} {constant} {ui_element} {value}", "{ui_action} {ui_action_option} {constant} {ui_element} {number}", "{ui_action} {ui_action_option} {constant} {ui_element} {constant}", "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {value}", "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {number}", "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {constant}", "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element}", "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element} {ui_action_option} {ui_element}", "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element} {ui_action_option} {ui_literal}", "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}", "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_literal}", "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}", "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}", "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal} {ui_action_option} {ui_element}", "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_element} {ui_action_option} {ui_element}", "{ui_action} {value} {ui_element}", "{ui_action} {number} {ui_element}", "{ui_action} {constant} {ui_element}", "{ui_action} {ui_property_ref} {ui_element}", "{ui_action} {ui_literal} {value}", "{ui_action} {ui_literal} {number}", "{ui_action} {ui_literal} {constant}", "{ui_action} {ui_literal} {ui_property_ref}", "{ui_action} {ui_literal} {ui_action_option}", "{ui_action} {ui_literal} {ui_action_option} {ui_element}", "{ui_action} {ui_literal} {ui_action_option} {ui_literal}", "{ui_action} {value} {ui_literal}", "{ui_action} {number} {ui_literal}", "{ui_action} {constant} {ui_literal}", "{ui_action} {ui_property_ref} {ui_literal}", "{ui_action} {value} {ui_literal} {ui_action_option}", "{ui_action} {number} {ui_literal} {ui_action_option}", "{ui_action} {constant} {ui_literal} {ui_action_option}", "{ui_action} {ui_property_ref} {ui_literal} {ui_action_option}", "{ui_action} {ui_element_type} {value}", "{ui_action} {ui_element_type} {number}", "{ui_action} {ui_element_type} {constant}", "{ui_action} {ui_element_type} {ui_property_ref}", "{ui_action} {ui_element_type} {ui_property} {value}", "{ui_action} {ui_element_type} {ui_property} {number}", "{ui_action} {ui_element_type} {ui_property} {constant}", "{ui_action} {ui_element_type} {ui_property} {ui_property_ref}", "{ui_action} {value} {ui_element_type}", "{ui_action} {number} {ui_element_type}", "{ui_action} {constant} {ui_element_type}", "{ui_action} {ui_property_ref} {ui_element_type}", "{ui_action} {ui_element_type} {ui_element}", "{ui_action} {ui_element_type} {ui_element} {value}", "{ui_action} {ui_element_type} {ui_element} {number}", "{ui_action} {ui_element_type} {ui_element} {constant}", "{ui_action} {ui_element_type} {ui_element} {ui_property_ref}", "{ui_action} {value} {ui_element_type} {ui_element}", "{ui_action} {number} {ui_element_type} {ui_element}", "{ui_action} {constant} {ui_element_type} {ui_element}", "{ui_action} {ui_property_ref} {ui_element_type} {ui_element}", "{ui_action} {ui_element_type} {ui_literal}", "{ui_action} {ui_element_type} {ui_literal} {value}", "{ui_action} {ui_element_type} {ui_literal} {number}", "{ui_action} {ui_element_type} {ui_literal} {constant}", "{ui_action} {ui_element_type} {ui_literal} {ui_property_ref}", "{ui_action} {value} {ui_element_type} {ui_literal}", "{ui_action} {number} {ui_element_type} {ui_literal}", "{ui_action} {constant} {ui_element_type} {ui_literal}", "{ui_action} {ui_property_ref} {ui_element_type} {ui_literal}", "{ui_action_modifier} {ui_action} {ui_element}", "{ui_action_modifier} {ui_action} {ui_element} {value}", "{ui_action_modifier} {ui_action} {ui_element} {number}", "{ui_action_modifier} {ui_action} {ui_element} {constant}", "{ui_action_modifier} {ui_action} {ui_element} {ui_property_ref}", "{ui_action_modifier} {ui_action} {value} {ui_element}", "{ui_action_modifier} {ui_action} {number} {ui_element}", "{ui_action_modifier} {ui_action} {constant} {ui_element}", "{ui_action_modifier} {ui_property_ref} {constant} {ui_element}", "{ui_action_modifier} {ui_action} {ui_literal}", "{ui_action_modifier} {ui_action} {ui_literal} {value}", "{ui_action_modifier} {ui_action} {ui_literal} {number}", "{ui_action_modifier} {ui_action} {ui_literal} {constant}", "{ui_action_modifier} {ui_action} {ui_literal} {ui_property_ref}", "{ui_action_modifier} {ui_action} {value} {ui_literal}", "{ui_action_modifier} {ui_action} {number} {ui_literal}", "{ui_action_modifier} {ui_action} {constant} {ui_literal}", "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_literal}", "{ui_action_modifier} {ui_action} {ui_element_type}", "{ui_action_modifier} {ui_action} {ui_element_type} {value}", "{ui_action_modifier} {ui_action} {ui_element_type} {number}", "{ui_action_modifier} {ui_action} {ui_element_type} {constant}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property_ref}", "{ui_action_modifier} {ui_action} {value} {ui_element_type}", "{ui_action_modifier} {ui_action} {number} {ui_element_type}", "{ui_action_modifier} {ui_action} {constant} {ui_element_type}", "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_element_type}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {value}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {number}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {constant}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {ui_property_ref}", "{ui_action_modifier} {ui_action} {ui_action_option} {value}", "{ui_action_modifier} {ui_action} {ui_action_option} {number}", "{ui_action_modifier} {ui_action} {ui_action_option} {constant}", "{ui_action_modifier} {ui_action} {ui_action_option} {ui_property_ref}", "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {value}", "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {number}", "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {constant}", "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {ui_property_ref}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {value}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {number}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {constant}", "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {ui_property_ref}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {value}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {number}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {constant}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {value}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {number}", "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {constant}", "{ui_action_modifier} {ui_action} {value} {ui_action_option}", "{ui_action_modifier} {ui_action} {number} {ui_action_option}", "{ui_action_modifier} {ui_action} {constant} {ui_action_option}", "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_action_option}", "{exec_action} {state}", "{ui_action} {ui_action_option} {command}"]
}, {
  "intent": "ui",
  "sentences": ["{ui_property} {ui_connector} {value}", "{ui_property} {ui_connector} {number}", "{ui_property} {ui_connector} {constant}", "{ui_property} {ui_connector} {value_list}", "{ui_property} {ui_connector} {ui_data_type}", "{ui_property} {ui_connector} {ui_element_type}", "{ui_property} {ui_connector} {query}", "{ui_property} {ui_connector} {date}", "{ui_property} {ui_connector} {time}", "{ui_property} {ui_connector} {longtime}", "{ui_property} {ui_connector} {datetime}", "{ui_property} {ui_connector} {longdatetime}"]
}, {
  "intent": "database",
  "sentences": ["{db_property} {ui_connector} {value}", "{db_property} {ui_connector} {number}"]
}];

const NLP_PRIORITIES = {
  "testcase": {
    "ui_action_modifier": 2,
    "ui_action": 2,
    "ui_element_type": 2,
    "ui_property": 1,
    "ui_action_option": 1,
    "exec_action": 1
  },
  "ui": {
    "ui_property": 1,
    "ui_connector": 1,
    "ui_connector_modifier": 1,
    "ui_data_type": 1,
    "bool_value": 1
  },
  "database": {
    "db_property": 1
  }
};
class NLPTrainingData {
  constructor(intents = [], examples = [], priorities) {
    this.intents = intents;
    this.examples = examples;
    this.priorities = priorities;
  }

}
class NLPTrainingIntent {
  constructor(name, entities = []) {
    this.name = name;
    this.entities = entities;
  }

}
class NLPTrainingEntity {
  constructor(name, matches = []) {
    this.name = name;
    this.matches = matches;
  }

}
class NLPTrainingMatch {
  constructor(id, samples = []) {
    this.id = id;
    this.samples = samples;
  }

}

class NLPTrainingDataConversor {
  convert(translationMap4NLP, examples) {
    let data = new NLPTrainingData();

    for (let intentName in translationMap4NLP) {
      let intent = new NLPTrainingIntent(intentName);

      for (let entityName in translationMap4NLP[intentName]) {
        let entity = new NLPTrainingEntity(entityName);

        for (let matchName in translationMap4NLP[intentName][entityName]) {
          let match = new NLPTrainingMatch(matchName);
          match.samples = translationMap4NLP[intentName][entityName][matchName];
          entity.matches.push(match);
        }

        intent.entities.push(entity);
      }

      data.intents.push(intent);
    }

    data.examples = examples;
    return data;
  }

}

class NLPTrainer {
  constructor(_languageMap) {
    this._languageMap = _languageMap;
    this.LANGUAGE_INTENT_SEPARATOR = ':';
    this.ALL_INTENTS = '*';
    this._trainedIntents = [];
  }

  canBeTrained(language) {
    return !!this._languageMap[language];
  }

  isIntentTrained(language, intent) {
    return this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, intent)) >= 0 || this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, this.ALL_INTENTS)) >= 0;
  }

  joinLanguageAndIntent(language, intent) {
    return (language + this.LANGUAGE_INTENT_SEPARATOR + (intent || this.ALL_INTENTS)).toLowerCase();
  }

  trainNLP(nlp, language, intentNameFilter) {
    if (!this.canBeTrained(language)) {
      return false;
    }

    if (this.isIntentTrained(language, intentNameFilter)) {
      return true;
    }

    let languageDictionary = deepcopy(dictionaryForLanguage(language));

    if (isDefined(intentNameFilter)) {
      let example = languageDictionary.training.find(ex => ex.intent === intentNameFilter);
      const baseIntentExample = BASE_TRAINING_EXAMPLES.find(ex => ex.intent === intentNameFilter);

      if (isDefined(example) && isDefined(baseIntentExample)) {
        example.sentences = baseIntentExample.sentences.concat(example.sentences);
      }
    } else {
      for (const baseEx of BASE_TRAINING_EXAMPLES) {
        if (this.isIntentTrained(language, baseEx.intent)) {
          continue;
        }

        let example = languageDictionary.training.find(ex => ex.intent === baseEx.intent);

        if (!example) {
          continue;
        }

        example.sentences = baseEx.sentences.concat(example.sentences);

        this._trainedIntents.push(this.joinLanguageAndIntent(language, baseEx.intent));
      }
    }

    if (isDefined(languageDictionary.nlp["testcase"]) && isDefined(languageDictionary.nlp["ui"])) {
      if (isDefined(languageDictionary.nlp["testcase"]["ui_element_type"]) && !isDefined(languageDictionary.nlp["ui"]["ui_element_type"])) {
        languageDictionary.nlp["ui"]["ui_element_type"] = languageDictionary.nlp["testcase"]["ui_element_type"];
      }

      if (isDefined(languageDictionary.nlp["testcase"]["ui_property"]) && !isDefined(languageDictionary.nlp["ui"]["ui_property"])) {
        const uiProperties = languageDictionary.nlp["ui"]["ui_property"];

        for (const p in uiProperties) {
          languageDictionary.nlp["testcase"]["ui_property"][p] = languageDictionary.nlp["ui"]["ui_property"][p];
        }
      }
    }

    let conversor = new NLPTrainingDataConversor();
    let converted = conversor.convert(languageDictionary.nlp || {}, languageDictionary.training || []);
    converted.priorities = NLP_PRIORITIES;
    nlp.train(language, converted, intentNameFilter);
    return true;
  }

}

class SyntacticException extends LocatedException {
  constructor() {
    super(...arguments);
    this.name = 'SyntacticError';
  }

}

class AfterAllParser {
  analyze(node, context, it, errors) {
    if (isDefined(context.doc.afterAll)) {
      let e = new SyntacticException('Event already declared: After All', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inAfterAll = true;
    context.doc.afterAll = node;
    return true;
  }

}

class AfterEachScenarioParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('The event After Each Scenario must be declared after a Feature', node.location);
      errors.push(e);
      return false;
    }

    if (isDefined(context.doc.afterEachScenario)) {
      let e = new SyntacticException('Event already declared: After Each Scenario', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inAfterEachScenario = true;
    context.doc.afterEachScenario = node;
    return true;
  }

}

class AfterFeatureParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('The event After Feature must be declared after a Feature', node.location);
      errors.push(e);
      return false;
    }

    if (isDefined(context.doc.afterFeature)) {
      let e = new SyntacticException('Event already declared: After Feature', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inAfterFeature = true;
    context.doc.afterFeature = node;
    return true;
  }

}

class BackgroundParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('A background must be declared after a feature.', node.location);
      errors.push(e);
      return false;
    }

    let feature = context.doc.feature;

    if (feature.background) {
      let e = new SyntacticException('A feature cannot have more than one background.', node.location);
      errors.push(e);
      return false;
    }

    if (isDefined(feature.scenarios) && feature.scenarios.length > 0) {
      let e = new SyntacticException('A background must be declared before a scenario.', node.location);
      errors.push(e);
      return false;
    }

    feature.background = node;
    context.resetInValues();
    context.inBackground = true;
    context.currentBackground = node;
    return true;
  }

}

class BeforeAllParser {
  analyze(node, context, it, errors) {
    if (isDefined(context.doc.beforeAll)) {
      let e = new SyntacticException('Event already declared: Before All', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inBeforeAll = true;
    context.doc.beforeAll = node;
    return true;
  }

}

class BeforeEachScenarioParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('The event Before Each Scenario must be declared after a Feature', node.location);
      errors.push(e);
      return false;
    }

    if (isDefined(context.doc.beforeEachScenario)) {
      let e = new SyntacticException('Event already declared: Before Each Scenario', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inBeforeEachScenario = true;
    context.doc.beforeEachScenario = node;
    return true;
  }

}

class BeforeFeatureParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('The event Before Feature must be declared after a Feature', node.location);
      errors.push(e);
      return false;
    }

    if (isDefined(context.doc.beforeFeature)) {
      let e = new SyntacticException('Event already declared: Before Feature', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inBeforeFeature = true;
    context.doc.beforeFeature = node;
    return true;
  }

}

class ConstantBlockParser {
  analyze(node, context, it, errors) {
    if (context.doc.constantBlock) {
      let e = new SyntacticException('Just one constant block declaration is allowed.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inConstantBlock = true;
    context.currentConstantBlock = node;
    context.doc.constantBlock = node;
    return true;
  }

}

class DatabaseParser {
  analyze(node, context, it, errors) {
    context.resetInValues();
    context.currentDatabase = node;

    if (!context.doc.databases) {
      context.doc.databases = [];
    }

    context.doc.databases.push(node);
    return true;
  }

}

class TagCollector {
  addBackwardTags(it, targetTags) {
    let itClone = it.clone();

    while (itClone.hasPrior() && itClone.spyPrior().nodeType === NodeTypes.TAG) {
      let tag = itClone.prior();
      targetTags.unshift(tag);
    }
  }

}

class TextCollector {
  addForwardTextNodes(it, target, changeIterator = false) {
    let nodeIt = changeIterator ? it : it.clone();

    while (nodeIt.hasNext() && nodeIt.spyNext().nodeType === NodeTypes.TEXT) {
      let text = nodeIt.next();
      target.push(text);
    }
  }

}

class FeatureParser {
  analyze(node, context, it, errors) {
    if (context.doc.feature) {
      let e = new SyntacticException('Just one feature declaration is allowed.', node.location);
      errors.push(e);
      return false;
    }

    context.doc.feature = node;
    node.tags = node.tags || [];
    node.sentences = node.sentences || [];
    node.scenarios = node.scenarios || [];
    node.uiElements = node.uiElements || [];
    context.resetInValues();
    context.inFeature = true;
    new TagCollector().addBackwardTags(it, node.tags);
    new TextCollector().addForwardTextNodes(it, node.sentences, true);
    return true;
  }

}

class ImportParser {
  analyze(node, context, it, errors) {
    if (!context.doc.imports) {
      context.doc.imports = [];
    }

    if (context.doc.feature) {
      let e = new SyntacticException('An import must be declared before a feature.', node.location);
      errors.push(e);
      return false;
    }

    context.doc.imports.push(node);
    return true;
  }

}

class LanguageParser {
  analyze(node, context, it, errors) {
    if (!context) {
      return false;
    }

    if (context.doc.language) {
      let e = new SyntacticException('Just one language declaration is allowed.', node.location);
      errors.push(e);
      return false;
    }

    if (context.doc.imports && context.doc.imports.length > 0) {
      let e = new SyntacticException('The language must be declared before an import.', node.location);
      errors.push(e);
      return false;
    }

    if (context.doc.feature) {
      let e = new SyntacticException('The language must be declared before a feature.', node.location);
      errors.push(e);
      return false;
    }

    context.doc.language = node;
    return true;
  }

}

class ConstantParser {
  isAccepted(node, it) {
    const allowedPriorNodes = [NodeTypes.CONSTANT_BLOCK, NodeTypes.CONSTANT];
    return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
  }

  handle(node, context, it, errors) {
    node.nodeType = NodeTypes.CONSTANT;

    if (!context.currentConstantBlock || !context.inConstantBlock && !context.inConstant) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared inside a Constants block.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inConstant = true;

    if (!context.currentConstantBlock.items) {
      context.currentConstantBlock.items = [];
    }

    context.currentConstantBlock.items.push(node);
    return true;
  }

}

class DatabasePropertyParser {
  isAccepted(node, it) {
    const allowedPriorNodes = [NodeTypes.DATABASE, NodeTypes.DATABASE_PROPERTY];
    return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
  }

  handle(node, context, it, errors) {
    node.nodeType = NodeTypes.DATABASE_PROPERTY;

    if (!context.currentDatabase) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared for a Database.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();

    if (!context.currentDatabase.items) {
      context.currentDatabase.items = [];
    }

    context.currentDatabase.items.push(node);
    return true;
  }

}

class RegexParser {
  isAccepted(node, it) {
    const allowedPriorNodes = [NodeTypes.REGEX_BLOCK, NodeTypes.REGEX];
    return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
  }

  handle(node, context, it, errors) {
    node.nodeType = NodeTypes.REGEX;

    if (!context.currentRegexBlock || !context.inRegexBlock && !context.inRegex) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared inside a Regular Expressions block.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inRegex = true;

    if (!context.currentRegexBlock.items) {
      context.currentRegexBlock.items = [];
    }

    context.currentRegexBlock.items.push(node);
    return true;
  }

}

class UIPropertyParser {
  isAccepted(node, it) {
    const allowedPriorNodes = [NodeTypes.TAG, NodeTypes.UI_ELEMENT, NodeTypes.UI_PROPERTY, NodeTypes.STEP_OTHERWISE, NodeTypes.STEP_AND];
    return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
  }

  handle(node, context, it, errors) {
    node.nodeType = NodeTypes.UI_PROPERTY;

    if (!context.currentUIElement) {
      const e = new SyntacticException('A "' + node.nodeType + '" is declared without a UI Element.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inUIProperty = true;
    let uiProperty = node;
    context.currentUIProperty = uiProperty;

    if (!context.currentUIElement.items) {
      context.currentUIElement.items = [];
    }

    if (!uiProperty.tags) {
      uiProperty.tags = [];
    }

    new TagCollector().addBackwardTags(it, uiProperty.tags);
    context.currentUIElement.items.push(uiProperty);
    return true;
  }

}

class ListItemParser {
  constructor() {
    this._nodeParsers = [];

    this._nodeParsers.push(new ConstantParser());

    this._nodeParsers.push(new RegexParser());

    this._nodeParsers.push(new UIPropertyParser());

    this._nodeParsers.push(new DatabasePropertyParser());
  }

  analyze(node, context, it, errors) {
    if (!it.hasPrior()) {
      return false;
    }

    for (let p of this._nodeParsers) {
      if (p.isAccepted(node, it)) {
        p.handle(node, context, it, errors);
      }
    }

    return true;
  }

}

class NodeIterator {
  constructor(_nodes, _index = -1) {
    this._nodes = _nodes;
    this._index = _index;
  }

  first() {
    this._index = -1;
  }

  hasCurrent() {
    return this._index >= 0 && this._index < this._nodes.length;
  }

  current() {
    if (!this.hasCurrent()) {
      return null;
    }

    return this._nodes[this._index];
  }

  hasNext() {
    return this._index + 1 < this._nodes.length;
  }

  next() {
    if (!this.hasNext()) {
      return null;
    }

    return this._nodes[++this._index];
  }

  spyNext() {
    if (!this.hasNext()) {
      return null;
    }

    return this._nodes[this._index + 1];
  }

  hasPrior() {
    return this._index > 0;
  }

  prior() {
    if (!this.hasPrior()) {
      return null;
    }

    return this._nodes[--this._index];
  }

  spyPrior() {
    if (!this.hasPrior()) {
      return null;
    }

    return this._nodes[this._index - 1];
  }

  clone() {
    return new NodeIterator(this._nodes, this._index);
  }

  nodes(newNodes) {
    if (newNodes) {
      this._nodes = newNodes;
      this.first();
    }

    return this._nodes;
  }

}

class ParsingContext {
  constructor(doc) {
    this.doc = {};
    this.inFeature = false;
    this.inBackground = false;
    this.inVariantBackground = false;
    this.inScenario = false;
    this.inScenarioVariantBackground = false;
    this.inVariant = false;
    this.inTestCase = false;
    this.inConstantBlock = false;
    this.inConstant = false;
    this.inRegexBlock = false;
    this.inRegex = false;
    this.inUIProperty = false;
    this.inTable = false;
    this.inBeforeAll = false;
    this.inAfterAll = false;
    this.inBeforeFeature = false;
    this.inAfterFeature = false;
    this.inBeforeEachScenario = false;
    this.inAfterEachScenario = false;
    this.currentBackground = null;
    this.currentVariantBackground = null;
    this.currentScenario = null;
    this.currentScenarioVariantBackground = null;
    this.currentVariant = null;
    this.currentTestCase = null;
    this.currentUIElement = null;
    this.currentUIProperty = null;
    this.currentConstantBlock = null;
    this.currentRegexBlock = null;
    this.currentTable = null;
    this.currentDatabase = null;

    if (doc) {
      this.doc = doc;
    }
  }

  resetInValues() {
    this.inFeature = false;
    this.inBackground = false;
    this.inVariantBackground = false;
    this.inScenario = false;
    this.inScenarioVariantBackground = false;
    this.inVariant = false;
    this.inTestCase = false;
    this.inConstantBlock = false;
    this.inConstant = false;
    this.inRegexBlock = false;
    this.inRegex = false;
    this.inUIProperty = false;
    this.inTable = false;
    this.inBeforeAll = false;
    this.inAfterAll = false;
    this.inBeforeFeature = false;
    this.inAfterFeature = false;
    this.inBeforeEachScenario = false;
    this.inAfterEachScenario = false;
  }

}

class RegexBlockParser {
  analyze(node, context, it, errors) {
    if (context.doc.regexBlock) {
      let e = new SyntacticException('Just one regex block declaration is allowed.', node.location);
      errors.push(e);
      return false;
    }

    context.resetInValues();
    context.inRegexBlock = true;
    context.currentRegexBlock = node;
    context.doc.regexBlock = node;
    return true;
  }

}

class ScenarioParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('A scenario must be declared after a feature.', node.location);
      errors.push(e);
      return false;
    }

    let feature = context.doc.feature;

    if (!feature.scenarios) {
      feature.scenarios = [];
    }

    feature.scenarios.push(node);
    context.resetInValues();
    context.inScenario = true;
    context.currentScenario = node;
    return true;
  }

}

class StepAndParser {
  analyze(node, context, it, errors) {
    const allowedPriorNodes = [NodeTypes.STEP_GIVEN, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN, NodeTypes.STEP_AND, NodeTypes.STEP_OTHERWISE];

    if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a Given, When, Then, And, or Otherwise.', node.location);
      errors.push(e);
      return false;
    }

    if (context.inUIProperty) {
      if (!context.currentUIProperty.otherwiseSentences) {
        context.currentUIProperty.otherwiseSentences = [];
      }

      context.currentUIProperty.otherwiseSentences.push(node);
    } else {
      let owner = null;
      if (context.inBackground) owner = context.currentBackground;else if (context.inVariantBackground) owner = context.currentVariantBackground;else if (context.inScenario) owner = context.currentScenario;else if (context.inScenarioVariantBackground) owner = context.currentScenarioVariantBackground;else if (context.inVariant) owner = context.currentVariant;else if (context.inTestCase) owner = context.currentTestCase;else if (context.inBeforeAll) owner = context.doc.beforeAll;else if (context.inAfterAll) owner = context.doc.afterAll;else if (context.inBeforeFeature) owner = context.doc.beforeFeature;else if (context.inAfterFeature) owner = context.doc.afterFeature;else if (context.inBeforeEachScenario) owner = context.doc.beforeEachScenario;else if (context.inAfterEachScenario) owner = context.doc.afterEachScenario;else {
        let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case, Before All, After All, Before Feature, After Feature, Before Each Scenario, AfterEachScenario or UI Element Property.', node.location);
        errors.push(e);
        return false;
      }

      if (!owner) {
        let e = new SyntacticException('Invalid context for the step "' + node.nodeType + '".', node.location);
        errors.push(e);
        return false;
      }

      if (!owner.sentences) {
        owner.sentences = [];
      }

      owner.sentences.push(node);
    }

    return true;
  }

}

class StepGivenParser {
  analyze(node, context, it, errors) {
    let allowedPriorNodes = [NodeTypes.BACKGROUND, NodeTypes.SCENARIO, NodeTypes.VARIANT_BACKGROUND, NodeTypes.VARIANT, NodeTypes.TEST_CASE, NodeTypes.BEFORE_ALL, NodeTypes.BEFORE_FEATURE, NodeTypes.BEFORE_EACH_SCENARIO, NodeTypes.AFTER_ALL, NodeTypes.AFTER_FEATURE, NodeTypes.AFTER_EACH_SCENARIO, NodeTypes.STEP_GIVEN, NodeTypes.STEP_AND];

    if (context.inTestCase) {
      allowedPriorNodes.push(NodeTypes.STEP_WHEN);
      allowedPriorNodes.push(NodeTypes.STEP_THEN);
    }

    if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join(', '), node.location);
      errors.push(e);
      return false;
    }

    let owner = null;
    if (context.inBackground) owner = context.currentBackground;else if (context.inVariantBackground) owner = context.currentVariantBackground;else if (context.inScenario) owner = context.currentScenario;else if (context.inScenarioVariantBackground) owner = context.currentScenarioVariantBackground;else if (context.inVariant) owner = context.currentVariant;else if (context.inTestCase) owner = context.currentTestCase;else if (context.inBeforeAll) owner = context.doc.beforeAll;else if (context.inAfterAll) owner = context.doc.afterAll;else if (context.inBeforeFeature) owner = context.doc.beforeFeature;else if (context.inAfterFeature) owner = context.doc.afterFeature;else if (context.inBeforeEachScenario) owner = context.doc.beforeEachScenario;else if (context.inAfterEachScenario) owner = context.doc.afterEachScenario;else {
      const lastBlock = allowedPriorNodes.indexOf(NodeTypes.STEP_GIVEN);
      const blocks = allowedPriorNodes.filter((v, index) => index < lastBlock);
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after:' + blocks.join(','), node.location);
      errors.push(e);
      return false;
    }

    if (!owner) {
      let e = new SyntacticException('Invalid context for the step "' + node.nodeType + '".', node.location);
      errors.push(e);
      return false;
    }

    if (!owner.sentences) {
      owner.sentences = [];
    }

    owner.sentences.push(node);
    return true;
  }

}

class StepOtherwiseParser {
  analyze(node, context, it, errors) {
    const allowedPriorNodes = [NodeTypes.UI_PROPERTY, NodeTypes.STEP_OTHERWISE, NodeTypes.STEP_AND];

    if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a UI Element Property.', node.location);
      errors.push(e);
      return false;
    }

    let prior = it.spyPrior();

    if (!prior.otherwiseSentences) {
      prior.otherwiseSentences = [];
    }

    prior.otherwiseSentences.push(node);
    return true;
  }

}

class StepThenParser {
  analyze(node, context, it, errors) {
    const allowedPriorNodes = [NodeTypes.STEP_GIVEN, NodeTypes.STEP_WHEN, NodeTypes.STEP_AND, NodeTypes.STEP_THEN];

    if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join(', '), node.location);
      errors.push(e);
      return false;
    }

    if (context.inVariantBackground || context.inScenarioVariantBackground) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause cannot be declared for a Variant Background.', node.location);
      errors.push(e);
      return false;
    }

    let owner = null;
    if (context.inBackground) owner = context.currentBackground;else if (context.inVariantBackground) owner = context.currentVariantBackground;else if (context.inScenario) owner = context.currentScenario;else if (context.inScenarioVariantBackground) owner = context.currentScenarioVariantBackground;else if (context.inVariant) owner = context.currentVariant;else if (context.inTestCase) owner = context.currentTestCase;else if (context.inBeforeAll) owner = context.doc.beforeAll;else if (context.inAfterAll) owner = context.doc.afterAll;else if (context.inBeforeFeature) owner = context.doc.beforeFeature;else if (context.inAfterFeature) owner = context.doc.afterFeature;else if (context.inBeforeEachScenario) owner = context.doc.beforeEachScenario;else if (context.inAfterEachScenario) owner = context.doc.afterEachScenario;else {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case, Before All, After All, Before Feature, After Feature, Before Each Scenario, AfterEachScenario or UI Element Property.', node.location);
      errors.push(e);
      return false;
    }

    if (!owner) {
      let e = new SyntacticException('Invalid context for the step "' + node.nodeType + '".', node.location);
      errors.push(e);
      return false;
    }

    if (!owner.sentences) {
      owner.sentences = [];
    }

    owner.sentences.push(node);
    return true;
  }

}

class StepWhenParser {
  analyze(node, context, it, errors) {
    let allowedPriorNodes = [NodeTypes.BACKGROUND, NodeTypes.SCENARIO, NodeTypes.VARIANT_BACKGROUND, NodeTypes.VARIANT, NodeTypes.TEST_CASE, NodeTypes.BEFORE_ALL, NodeTypes.BEFORE_FEATURE, NodeTypes.BEFORE_EACH_SCENARIO, NodeTypes.AFTER_ALL, NodeTypes.AFTER_FEATURE, NodeTypes.AFTER_EACH_SCENARIO, NodeTypes.STEP_GIVEN, NodeTypes.STEP_WHEN, NodeTypes.STEP_AND];

    if (context.inTestCase) {
      allowedPriorNodes.push(NodeTypes.STEP_THEN);
    }

    if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join(', '), node.location);
      errors.push(e);
      return false;
    }

    let owner = null;
    if (context.inBackground) owner = context.currentBackground;else if (context.inVariantBackground) owner = context.currentVariantBackground;else if (context.inScenario) owner = context.currentScenario;else if (context.inScenarioVariantBackground) owner = context.currentScenarioVariantBackground;else if (context.inVariant) owner = context.currentVariant;else if (context.inTestCase) owner = context.currentTestCase;else if (context.inBeforeAll) owner = context.doc.beforeAll;else if (context.inAfterAll) owner = context.doc.afterAll;else if (context.inBeforeFeature) owner = context.doc.beforeFeature;else if (context.inAfterFeature) owner = context.doc.afterFeature;else if (context.inBeforeEachScenario) owner = context.doc.beforeEachScenario;else if (context.inAfterEachScenario) owner = context.doc.afterEachScenario;else {
      const lastBlock = allowedPriorNodes.indexOf(NodeTypes.STEP_GIVEN);
      const blocks = allowedPriorNodes.filter((v, index) => index < lastBlock);
      let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after:' + blocks.join(','), node.location);
      errors.push(e);
      return false;
    }

    if (!owner) {
      let e = new SyntacticException('Invalid context for the step "' + node.nodeType + '".', node.location);
      errors.push(e);
      return false;
    }

    if (!owner.sentences) {
      owner.sentences = [];
    }

    owner.sentences.push(node);
    return true;
  }

}

var CaseType;

(function (CaseType) {
  CaseType["CAMEL"] = "camel";
  CaseType["PASCAL"] = "pascal";
  CaseType["SNAKE"] = "snake";
  CaseType["KEBAB"] = "kebab";
  CaseType["NONE"] = "none";
})(CaseType || (CaseType = {}));

const {
  camel,
  kebab: kebab$1,
  pascal,
  snake
} = _case;
function convertCase(text, type) {
  switch (type.toString().trim().toLowerCase()) {
    case CaseType.CAMEL:
      return camel(text);

    case CaseType.PASCAL:
      return pascal(text);

    case CaseType.SNAKE:
      return snake(text);

    case CaseType.KEBAB:
      return kebab$1(text);

    default:
      return text;
  }
}
function upperFirst(text) {
  if (!!text[0]) {
    return text[0].toUpperCase() + text.substr(1);
  }

  return text;
}
function removeDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

class TableParser {
  analyze(node, context, it, errors) {
    if (!context.doc.tables) {
      context.doc.tables = [];
    }

    node.internalName = removeDiacritics(convertCase(node.name, CaseType.SNAKE));
    context.resetInValues();
    context.inTable = true;
    context.currentTable = node;
    context.doc.tables.push(node);
    return true;
  }

}

class TableRowParser {
  analyze(node, context, it, errors) {
    if (!context.inTable || !context.currentTable) {
      let e = new SyntacticException('A table row should be declared after a Table declaration.', node.location);
      errors.push(e);
      return false;
    }

    if (!context.currentTable.rows) {
      context.currentTable.rows = [];
    }

    context.currentTable.rows.push(node);
    return true;
  }

}

class TestCaseParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature && (!context.doc.imports || context.doc.imports.length < 1)) {
      let e = new SyntacticException('A Test Case must be declared after a Feature. Please declare or import a Feature and then declare the Test Case.', node.location);
      errors.push(e);
      return false;
    }

    let owner = context.doc;

    if (!owner.testCases) {
      owner.testCases = [];
    }

    owner.testCases.push(node);
    context.resetInValues();
    context.inTestCase = true;
    context.currentTestCase = node;

    if (!node.tags) {
      node.tags = [];
    }

    new TagCollector().addBackwardTags(it, node.tags);
    return true;
  }

}

class UIElementParser {
  analyze(node, context, it, errors) {
    if (!node.tags) {
      node.tags = [];
    }

    new TagCollector().addBackwardTags(it, node.tags);
    const hasGlobalTag = node.tags.length > 0 && node.tags.filter(tag => tag.subType === ReservedTags.GLOBAL).length > 0;
    let owner = hasGlobalTag ? context.doc : context.doc.feature;
    context.resetInValues();
    context.currentUIElement = node;

    if (owner && !owner.uiElements) {
      owner.uiElements = [];
    }

    if (!hasGlobalTag && !context.doc.feature) {
      let e = new SyntacticException('A non-global UI Element must be declared after a Feature.', node.location);
      errors.push(e);
      return false;
    }

    if (owner) {
      owner.uiElements.push(node);
    }

    return true;
  }

}

class VariantBackgroundParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature) {
      let e = new SyntacticException('A background must be declared after a feature.', node.location);
      errors.push(e);
      return false;
    }

    let feature = context.doc.feature;
    const wasDeclaredForTheFeature = !!feature.variantBackground;
    const doesNotHaveScenarios = !feature.scenarios || feature.scenarios.length < 1;

    if (wasDeclaredForTheFeature && doesNotHaveScenarios) {
      let e = new SyntacticException('A feature cannot have more than one variant background.', node.location);
      errors.push(e);
      return false;
    }

    let target = doesNotHaveScenarios ? feature : context.currentScenario;

    if (!target) {
      let e = new SyntacticException('Could not determine the current scenario for the variant background.', node.location);
      errors.push(e);
      return false;
    }

    target.variantBackground = node;
    context.resetInValues();

    if (doesNotHaveScenarios) {
      context.inVariantBackground = true;
      context.currentVariantBackground = node;
    } else {
      context.inScenarioVariantBackground = true;
      context.currentScenarioVariantBackground = node;
    }
  }

}

class VariantParser {
  analyze(node, context, it, errors) {
    if (!context.doc.feature || !context.doc.feature.scenarios || context.doc.feature.scenarios.length < 1) {
      let e = new SyntacticException('A variant must be declared after a scenario.', node.location);
      errors.push(e);
      return false;
    }

    let scenario = context.doc.feature.scenarios[context.doc.feature.scenarios.length - 1];

    if (!scenario.variants) {
      scenario.variants = [];
    }

    scenario.variants.push(node);
    context.resetInValues();
    context.inVariant = true;
    context.currentVariant = node;

    if (!node.tags) {
      node.tags = [];
    }

    new TagCollector().addBackwardTags(it, node.tags);
    return true;
  }

}

class Parser {
  constructor(_stopOnFirstError = false) {
    this._stopOnFirstError = _stopOnFirstError;
    this._errors = [];
    this._parsersMap = {};
    this._parsersMap[NodeTypes.LANGUAGE] = new LanguageParser();
    this._parsersMap[NodeTypes.IMPORT] = new ImportParser();
    this._parsersMap[NodeTypes.FEATURE] = new FeatureParser();
    this._parsersMap[NodeTypes.BACKGROUND] = new BackgroundParser();
    this._parsersMap[NodeTypes.VARIANT_BACKGROUND] = new VariantBackgroundParser();
    this._parsersMap[NodeTypes.SCENARIO] = new ScenarioParser();
    this._parsersMap[NodeTypes.STEP_GIVEN] = new StepGivenParser();
    this._parsersMap[NodeTypes.STEP_WHEN] = new StepWhenParser();
    this._parsersMap[NodeTypes.STEP_THEN] = new StepThenParser();
    this._parsersMap[NodeTypes.STEP_AND] = new StepAndParser();
    this._parsersMap[NodeTypes.STEP_OTHERWISE] = new StepOtherwiseParser();
    this._parsersMap[NodeTypes.CONSTANT_BLOCK] = new ConstantBlockParser();
    this._parsersMap[NodeTypes.CONSTANT] = new ListItemParser();
    this._parsersMap[NodeTypes.REGEX_BLOCK] = new RegexBlockParser();
    this._parsersMap[NodeTypes.REGEX] = new ListItemParser();
    this._parsersMap[NodeTypes.TABLE] = new TableParser();
    this._parsersMap[NodeTypes.TABLE_ROW] = new TableRowParser();
    this._parsersMap[NodeTypes.UI_ELEMENT] = new UIElementParser();
    this._parsersMap[NodeTypes.UI_PROPERTY] = new ListItemParser();
    this._parsersMap[NodeTypes.DATABASE] = new DatabaseParser();
    this._parsersMap[NodeTypes.DATABASE_PROPERTY] = new ListItemParser();
    this._parsersMap[NodeTypes.VARIANT] = new VariantParser();
    this._parsersMap[NodeTypes.TEST_CASE] = new TestCaseParser();
    this._parsersMap[NodeTypes.BEFORE_ALL] = new BeforeAllParser();
    this._parsersMap[NodeTypes.AFTER_ALL] = new AfterAllParser();
    this._parsersMap[NodeTypes.BEFORE_FEATURE] = new BeforeFeatureParser();
    this._parsersMap[NodeTypes.AFTER_FEATURE] = new AfterFeatureParser();
    this._parsersMap[NodeTypes.BEFORE_EACH_SCENARIO] = new BeforeEachScenarioParser();
    this._parsersMap[NodeTypes.AFTER_EACH_SCENARIO] = new AfterEachScenarioParser();
  }

  reset() {
    this._errors = [];
  }

  stopOnFirstError(stop) {
    if (stop !== undefined) {
      this._stopOnFirstError = stop;
    }

    return this._stopOnFirstError;
  }

  hasErrors() {
    return this._errors.length > 0;
  }

  errors() {
    return this._errors;
  }

  analyze(nodes, doc) {
    this.reset();
    let ignoredTokenTypes = [];
    let it = new NodeIterator(nodes);
    let errors = [];
    let node = null;
    let nodeParser = null;
    let context = new ParsingContext(doc);

    while (it.hasNext()) {
      node = it.next();
      nodeParser = this._parsersMap[node.nodeType];

      if (!nodeParser) {
        ignoredTokenTypes.push(node.nodeType);
        continue;
      }

      nodeParser.analyze(node, context, it, errors);

      if (this._stopOnFirstError && errors.length > 0) {
        break;
      }
    }

    this._errors.push.apply(this._errors, errors);

    return ignoredTokenTypes;
  }

}

var VariantSelectionOptions;

(function (VariantSelectionOptions) {
  VariantSelectionOptions["SINGLE_RANDOM"] = "random";
  VariantSelectionOptions["FIRST"] = "first";
  VariantSelectionOptions["FIRST_MOST_IMPORTANT"] = "fmi";
  VariantSelectionOptions["ALL"] = "all";
})(VariantSelectionOptions || (VariantSelectionOptions = {}));

var CombinationOptions;

(function (CombinationOptions) {
  CombinationOptions["SINGLE_RANDOM_OF_EACH"] = "sre";
  CombinationOptions["SHUFFLED_ONE_WISE"] = "sow";
  CombinationOptions["ONE_WISE"] = "ow";
  CombinationOptions["ALL"] = "all";
})(CombinationOptions || (CombinationOptions = {}));

var InvalidSpecialOptions;

(function (InvalidSpecialOptions) {
  InvalidSpecialOptions["ZERO"] = "0";
  InvalidSpecialOptions["ONE"] = "1";
  InvalidSpecialOptions["NONE"] = "none";
  InvalidSpecialOptions["ALL"] = "all";
  InvalidSpecialOptions["RANDOM"] = "random";
  InvalidSpecialOptions["DEFAULT"] = "smart";
})(InvalidSpecialOptions || (InvalidSpecialOptions = {}));

const DEFAULT_DIR_LANGUAGE = 'data/';
const DEFAULT_DIRECTORY = '.';
const DEFAULT_DIR_SCRIPT = '.';
const DEFAULT_DIR_RESULT = '.';
const DEFAULT_CONFIG = '.concordiarc';
const DEFAULT_EXTENSION_FEATURE = '.feature';
const DEFAULT_EXTENSION_TEST_CASE = '.testcase';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_ENCODING = 'utf8';
const DEFAULT_LINE_BREAKER = "\n";
const DEFAULT_CASE_UI = CaseType.CAMEL.toString();
CaseType.SNAKE.toString();
const DEFAULT_TC_INDENTER = '  ';
const DEFAULT_RANDOM_MIN_STRING_SIZE = 0;
const DEFAULT_RANDOM_MAX_STRING_SIZE = 500;
const DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE = 5;
const DEFAULT_IMPORTANCE = 5;
const DEFAULT_VARIANT_SELECTION = VariantSelectionOptions.SINGLE_RANDOM.toString();
const DEFAULT_STATE_COMBINATION = CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();
const DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME = InvalidSpecialOptions.DEFAULT;
const DEFAULT_DATA_TEST_CASE_COMBINATION = CombinationOptions.SHUFFLED_ONE_WISE.toString();

class Random {
  constructor(seed) {
    this._prng = seedrandom.alea(seed || Date.now().toString());
  }

  generate() {
    return this._prng();
  }

}

class LongLimits {}
LongLimits.MIN = Number.MIN_SAFE_INTEGER;
LongLimits.MAX = Number.MAX_SAFE_INTEGER;

class RandomLong {
  constructor(_random) {
    this._random = _random;
  }

  between(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this._random.generate() * (max - min + 1)) + min;
  }

  before(max) {
    return this.between(LongLimits.MIN, max - 1);
  }

  after(min) {
    return this.between(min + 1, LongLimits.MAX);
  }

}

class CartesianProductStrategy {
  combine(map) {
    return cartesian(map);
  }

}
class OneWiseStrategy {
  constructor(seed) {
    this._random = new Random(seed);
  }

  combine(map) {
    const rng = () => this._random.generate();

    return oneWise(map, rng);
  }

}
class ShuffledOneWiseStrategy {
  constructor(seed) {
    this._random = new Random(seed);
  }

  combine(map) {
    const rng = () => this._random.generate();

    const options = {
      copy: true,
      rng: rng
    };
    return oneWise(shuffleObjArrays(map, options), rng);
  }

}
class SingleRandomOfEachStrategy {
  constructor(seed) {
    this._randomLong = new RandomLong(new Random(seed));
  }

  combine(map) {
    let obj = {};

    for (let key in map) {
      let elements = map[key];

      if (Array.isArray(elements)) {
        const size = elements.length;
        const index = size > 1 ? this._randomLong.between(0, size - 1) : 0;
        obj[key] = elements[index];
      }
    }

    return [obj];
  }

}

class TagUtil {
  isNameInKeywords(tag, keywords) {
    return keywords.indexOf(tag.name.toLowerCase()) >= 0;
  }

  tagsWithNameInKeywords(tags, keywords) {
    return tags.filter(t => this.isNameInKeywords(t, keywords));
  }

  contentOfTheFirstTag(tags) {
    return tags.length > 0 ? tags[0].content : null;
  }

  numericContentOfTheFirstTag(tags) {
    const content = this.contentOfTheFirstTag(tags);

    if (content !== null) {
      const num = parseInt(content);
      return isNaN(num) ? null : num;
    }

    return null;
  }

}

class AllVariantsSelectionStrategy {
  select(variants) {
    return variants;
  }

}
class FirstVariantSelectionStrategy {
  select(variants) {
    return variants.length > 0 ? [variants[0]] : [];
  }

}
class SingleRandomVariantSelectionStrategy {
  constructor(_seed) {
    this._seed = _seed;
  }

  select(variants) {
    const max = variants.length;

    if (max < 1) {
      return [];
    }

    const randomLong = new RandomLong(new Random(this._seed));
    const index = randomLong.between(0, max - 1);
    return [variants[index]];
  }

}
class FirstMostImportantVariantSelectionStrategy {
  constructor(_defaultImportance, _importanceKeywords) {
    this._defaultImportance = _defaultImportance;
    this._importanceKeywords = _importanceKeywords;
    this._tagUtil = new TagUtil();
  }

  select(variants) {
    let greaterImportanceValue = 0;
    let greaterImportanceIndex = -1;
    let index = -1;

    for (let v of variants || []) {
      ++index;
      let importance = this.importanceOf(v);

      if (importance > greaterImportanceValue) {
        greaterImportanceValue = importance;
        greaterImportanceIndex = index;
      }
    }

    return greaterImportanceIndex >= 0 ? [variants[greaterImportanceIndex]] : [];
  }

  importanceOf(variant) {
    const importance = this._tagUtil.numericContentOfTheFirstTag(this._tagUtil.tagsWithNameInKeywords(variant.tags, this._importanceKeywords));

    return null === importance ? this._defaultImportance : importance;
  }

}

class NLPUtil {
  entitiesNamed(name, nlpResult) {
    if (!name || !nlpResult) {
      return [];
    }

    return nlpResult.entities.filter(e => name === e.entity);
  }

  hasEntityNamed(name, nlpResult) {
    return this.entitiesNamed(name, nlpResult).length > 0;
  }

  hasEntitiesNamed(names, nlpResult) {
    return names.every(name => this.hasEntityNamed(name, nlpResult));
  }

  entityNamed(name, nlpResult) {
    if (!name || !nlpResult) {
      return null;
    }

    return nlpResult.entities.find(e => name === e.entity) || null;
  }

  valuesOfEntitiesNamed(name, nlpResult) {
    if (!name || !nlpResult) {
      return [];
    }

    return nlpResult.entities.filter(e => name === e.entity).map(e => e.value);
  }

}

class TestPlan {
  constructor() {
    this.dataTestCases = new Map();
  }

  hasAnyInvalidResult() {
    for (let [, uiePlan] of this.dataTestCases) {
      if (uiePlan.isResultInvalid()) {
        return true;
      }
    }

    return false;
  }

}

var DataTestCase;

(function (DataTestCase) {
  DataTestCase["VALUE_LOWEST"] = "VALUE_LOWEST";
  DataTestCase["VALUE_RANDOM_BELOW_MIN"] = "VALUE_RANDOM_BELOW_MIN";
  DataTestCase["VALUE_JUST_BELOW_MIN"] = "VALUE_JUST_BELOW_MIN";
  DataTestCase["VALUE_MIN"] = "VALUE_MIN";
  DataTestCase["VALUE_JUST_ABOVE_MIN"] = "VALUE_JUST_ABOVE_MIN";
  DataTestCase["VALUE_ZERO"] = "VALUE_ZERO";
  DataTestCase["VALUE_MEDIAN"] = "VALUE_MEDIAN";
  DataTestCase["VALUE_RANDOM_BETWEEN_MIN_MAX"] = "VALUE_RANDOM_BETWEEN_MIN_MAX";
  DataTestCase["VALUE_JUST_BELOW_MAX"] = "VALUE_JUST_BELOW_MAX";
  DataTestCase["VALUE_MAX"] = "VALUE_MAX";
  DataTestCase["VALUE_JUST_ABOVE_MAX"] = "VALUE_JUST_ABOVE_MAX";
  DataTestCase["VALUE_RANDOM_ABOVE_MAX"] = "VALUE_RANDOM_ABOVE_MAX";
  DataTestCase["VALUE_GREATEST"] = "VALUE_GREATEST";
  DataTestCase["LENGTH_LOWEST"] = "LENGTH_LOWEST";
  DataTestCase["LENGTH_RANDOM_BELOW_MIN"] = "LENGTH_RANDOM_BELOW_MIN";
  DataTestCase["LENGTH_JUST_BELOW_MIN"] = "LENGTH_JUST_BELOW_MIN";
  DataTestCase["LENGTH_MIN"] = "LENGTH_MIN";
  DataTestCase["LENGTH_JUST_ABOVE_MIN"] = "LENGTH_JUST_ABOVE_MIN";
  DataTestCase["LENGTH_MEDIAN"] = "LENGTH_MEDIAN";
  DataTestCase["LENGTH_RANDOM_BETWEEN_MIN_MAX"] = "LENGTH_RANDOM_BETWEEN_MIN_MAX";
  DataTestCase["LENGTH_JUST_BELOW_MAX"] = "LENGTH_JUST_BELOW_MAX";
  DataTestCase["LENGTH_MAX"] = "LENGTH_MAX";
  DataTestCase["LENGTH_JUST_ABOVE_MAX"] = "LENGTH_JUST_ABOVE_MAX";
  DataTestCase["LENGTH_RANDOM_ABOVE_MAX"] = "LENGTH_RANDOM_ABOVE_MAX";
  DataTestCase["LENGTH_GREATEST"] = "LENGTH_GREATEST";
  DataTestCase["FORMAT_VALID"] = "FORMAT_VALID";
  DataTestCase["FORMAT_INVALID"] = "FORMAT_INVALID";
  DataTestCase["SET_FIRST_ELEMENT"] = "SET_FIRST_ELEMENT";
  DataTestCase["SET_RANDOM_ELEMENT"] = "SET_RANDOM_ELEMENT";
  DataTestCase["SET_LAST_ELEMENT"] = "SET_LAST_ELEMENT";
  DataTestCase["SET_NOT_IN_SET"] = "SET_NOT_IN_SET";
  DataTestCase["REQUIRED_FILLED"] = "REQUIRED_FILLED";
  DataTestCase["REQUIRED_NOT_FILLED"] = "REQUIRED_NOT_FILLED";
  DataTestCase["COMPUTATION_RIGHT"] = "COMPUTATION_RIGHT";
  DataTestCase["COMPUTATION_WRONG"] = "COMPUTATION_WRONG";
})(DataTestCase || (DataTestCase = {}));

var DataTestCaseGroup;

(function (DataTestCaseGroup) {
  DataTestCaseGroup[DataTestCaseGroup["VALUE"] = 0] = "VALUE";
  DataTestCaseGroup[DataTestCaseGroup["LENGTH"] = 1] = "LENGTH";
  DataTestCaseGroup[DataTestCaseGroup["FORMAT"] = 2] = "FORMAT";
  DataTestCaseGroup[DataTestCaseGroup["SET"] = 3] = "SET";
  DataTestCaseGroup[DataTestCaseGroup["REQUIRED"] = 4] = "REQUIRED";
  DataTestCaseGroup[DataTestCaseGroup["COMPUTATION"] = 5] = "COMPUTATION";
})(DataTestCaseGroup || (DataTestCaseGroup = {}));

class DataTestCaseGroupDef {
  constructor() {
    this.value = [DataTestCase.VALUE_LOWEST, DataTestCase.VALUE_RANDOM_BELOW_MIN, DataTestCase.VALUE_JUST_BELOW_MIN, DataTestCase.VALUE_MIN, DataTestCase.VALUE_JUST_ABOVE_MIN, DataTestCase.VALUE_ZERO, DataTestCase.VALUE_MEDIAN, DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX, DataTestCase.VALUE_JUST_BELOW_MAX, DataTestCase.VALUE_MAX, DataTestCase.VALUE_JUST_ABOVE_MAX, DataTestCase.VALUE_RANDOM_ABOVE_MAX, DataTestCase.VALUE_GREATEST];
    this.length = [DataTestCase.LENGTH_LOWEST, DataTestCase.LENGTH_RANDOM_BELOW_MIN, DataTestCase.LENGTH_JUST_BELOW_MIN, DataTestCase.LENGTH_MIN, DataTestCase.LENGTH_JUST_ABOVE_MIN, DataTestCase.LENGTH_MEDIAN, DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX, DataTestCase.LENGTH_JUST_BELOW_MAX, DataTestCase.LENGTH_MAX, DataTestCase.LENGTH_JUST_ABOVE_MAX, DataTestCase.LENGTH_RANDOM_ABOVE_MAX, DataTestCase.LENGTH_GREATEST];
    this.format = [DataTestCase.FORMAT_VALID, DataTestCase.FORMAT_INVALID];
    this.set = [DataTestCase.SET_FIRST_ELEMENT, DataTestCase.SET_RANDOM_ELEMENT, DataTestCase.SET_LAST_ELEMENT, DataTestCase.SET_NOT_IN_SET];
    this.required = [DataTestCase.REQUIRED_FILLED, DataTestCase.REQUIRED_NOT_FILLED];
    this.computation = [DataTestCase.COMPUTATION_RIGHT, DataTestCase.COMPUTATION_WRONG];
  }

  ofGroup(group) {
    switch (group) {
      case DataTestCaseGroup.VALUE:
        return this.value;

      case DataTestCaseGroup.LENGTH:
        return this.length;

      case DataTestCaseGroup.FORMAT:
        return this.format;

      case DataTestCaseGroup.SET:
        return this.set;

      case DataTestCaseGroup.REQUIRED:
        return this.required;

      case DataTestCaseGroup.COMPUTATION:
        return this.computation;

      default:
        throw new Error('Unexpected group');
    }
  }

  groupOf(testCase) {
    if (this.value.indexOf(testCase) >= 0) return DataTestCaseGroup.VALUE;
    if (this.length.indexOf(testCase) >= 0) return DataTestCaseGroup.LENGTH;
    if (this.format.indexOf(testCase) >= 0) return DataTestCaseGroup.FORMAT;
    if (this.set.indexOf(testCase) >= 0) return DataTestCaseGroup.SET;
    if (this.required.indexOf(testCase) >= 0) return DataTestCaseGroup.REQUIRED;
    if (this.computation.indexOf(testCase) >= 0) return DataTestCaseGroup.COMPUTATION;
    return DataTestCaseGroup.REQUIRED;
  }

}

class DataGenConfig {
  constructor(_valueType = ValueType.STRING) {
    this._valueType = _valueType;
    this.required = false;
    this.minValue = null;
    this.maxValue = null;
    this.minLength = null;
    this.maxLength = null;
    this.format = null;
    this.value = null;
    this.invertedLogic = false;
    this.computedBy = null;
  }

  get min() {
    return isDefined(this.minValue) ? this.minValue : this.minLength;
  }

  get max() {
    return isDefined(this.maxValue) ? this.maxValue : this.maxLength;
  }

  set valueType(valType) {
    this._valueType = valType;
  }

  get valueType() {
    if (ValueType.STRING === this._valueType) {
      if (isDefined(this.minValue)) {
        return new ValueTypeDetector().detect(this.minValue);
      }

      if (isDefined(this.maxValue)) {
        return new ValueTypeDetector().detect(this.maxValue);
      }
    }

    if (isDefined(this.value) && Array.isArray(this.value) && this.value.length > 0) {
      const detector = new ValueTypeDetector();
      return detector.detect(this.value[0]);
    }

    return this._valueType;
  }

}
class DataGenerator {
  constructor(_builder) {
    this._builder = _builder;
  }

  async generate(tc, cfg) {
    switch (tc) {
      case DataTestCase.VALUE_LOWEST:
      case DataTestCase.LENGTH_LOWEST:
        return this.rawGeneratorFor(cfg).lowest();

      case DataTestCase.VALUE_RANDOM_BELOW_MIN:
        return this.rawGeneratorFor(cfg).randomBelowMin();

      case DataTestCase.LENGTH_RANDOM_BELOW_MIN:
        {
          if (cfg.required && isDefined(cfg.minValue)) {
            let newCfg = deepcopy(cfg);
            newCfg.minValue = 1;
            newCfg.maxValue = cfg.minValue;
            return this.rawGeneratorFor(newCfg).randomBetweenMinAndMax();
          }

          return this.rawGeneratorFor(cfg).randomBelowMin();
        }

      case DataTestCase.VALUE_JUST_BELOW_MIN:
      case DataTestCase.LENGTH_JUST_BELOW_MIN:
        return this.rawGeneratorFor(cfg).justBelowMin();

      case DataTestCase.VALUE_MIN:
      case DataTestCase.LENGTH_MIN:
        return this.rawGeneratorFor(cfg).min();

      case DataTestCase.VALUE_JUST_ABOVE_MIN:
      case DataTestCase.LENGTH_JUST_ABOVE_MIN:
        return this.rawGeneratorFor(cfg).justAboveMin();

      case DataTestCase.VALUE_ZERO:
        return this.rawGeneratorFor(cfg).zero();

      case DataTestCase.VALUE_MEDIAN:
      case DataTestCase.LENGTH_MEDIAN:
        return this.rawGeneratorFor(cfg).median();

      case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX:
      case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX:
        return this.rawGeneratorFor(cfg).randomBetweenMinAndMax();

      case DataTestCase.VALUE_JUST_BELOW_MAX:
      case DataTestCase.LENGTH_JUST_BELOW_MAX:
        return this.rawGeneratorFor(cfg).justBelowMax();

      case DataTestCase.VALUE_MAX:
      case DataTestCase.LENGTH_MAX:
        return this.rawGeneratorFor(cfg).max();

      case DataTestCase.VALUE_JUST_ABOVE_MAX:
      case DataTestCase.LENGTH_JUST_ABOVE_MAX:
        return this.rawGeneratorFor(cfg).justAboveMax();

      case DataTestCase.VALUE_RANDOM_ABOVE_MAX:
      case DataTestCase.LENGTH_RANDOM_ABOVE_MAX:
        return this.rawGeneratorFor(cfg).randomAboveMax();

      case DataTestCase.VALUE_GREATEST:
      case DataTestCase.LENGTH_GREATEST:
        return this.rawGeneratorFor(cfg).greatest();

      case DataTestCase.FORMAT_VALID:
        return this.regexGeneratorFor(cfg).valid();

      case DataTestCase.FORMAT_INVALID:
        return this.regexGeneratorFor(cfg).invalid();

      case DataTestCase.SET_FIRST_ELEMENT:
        {
          return this.listGeneratorFor(cfg).firstElement();
        }

      case DataTestCase.SET_RANDOM_ELEMENT:
        {
          return this.listGeneratorFor(cfg).randomElement();
        }

      case DataTestCase.SET_LAST_ELEMENT:
        {
          return this.listGeneratorFor(cfg).lastElement();
        }

      case DataTestCase.SET_NOT_IN_SET:
        {
          return this.listGeneratorFor(cfg).notInSet();
        }

      case DataTestCase.REQUIRED_FILLED:
        {
          if (isDefined(cfg.value)) {
            const dtc = Array.isArray(cfg.value) ? DataTestCase.SET_RANDOM_ELEMENT : DataTestCase.SET_FIRST_ELEMENT;
            return await this.generate(dtc, cfg);
          }

          return this.rawGeneratorFor(cfg).randomBetweenMinAndMax();
        }

      case DataTestCase.REQUIRED_NOT_FILLED:
        {
          return '';
        }

      default:
        return null;
    }
  }

  rawGeneratorFor(cfg) {
    return this._builder.raw(cfg.valueType, cfg.min, cfg.max);
  }

  regexGeneratorFor(cfg) {
    return this._builder.regex(cfg.valueType, cfg.format);
  }

  listGeneratorFor(cfg) {
    if (true === cfg.invertedLogic) {
      return this._builder.invertedLogicList(cfg.valueType, Array.isArray(cfg.value) ? cfg.value : [cfg.value]);
    }

    return this._builder.list(cfg.valueType, Array.isArray(cfg.value) ? cfg.value : [cfg.value]);
  }

}

class QueryCache {
  constructor() {
    this._cache = new Map();
  }

  has(query) {
    return this._cache.has(query);
  }

  put(query, values) {
    this._cache.set(query, values);
  }

  get(query) {
    return this._cache.get(query);
  }

  remove(query) {
    return this._cache.delete(query);
  }

  clear() {
    this._cache.clear();
  }

}

class InvertedLogicListBasedDataGenerator {
  constructor(_gen) {
    this._gen = _gen;
  }

  firstElement() {
    return this._gen.notInSet();
  }

  secondElement() {
    return this._gen.notInSet();
  }

  randomElement() {
    return this._gen.notInSet();
  }

  penultimateElement() {
    return this._gen.notInSet();
  }

  lastElement() {
    return this._gen.notInSet();
  }

  notInSet() {
    return this._gen.randomElement();
  }

}

class InvertedLogicQueryBasedDataGenerator {
  constructor(_gen) {
    this._gen = _gen;
  }

  async firstElement() {
    return await this._gen.notInSet();
  }

  async secondElement() {
    return await this._gen.notInSet();
  }

  async randomElement() {
    return await this._gen.notInSet();
  }

  async penultimateElement() {
    return await this._gen.notInSet();
  }

  async lastElement() {
    return await this._gen.notInSet();
  }

  async notInSet() {
    return await this._gen.randomElement();
  }

}

class ListBasedDataGenerator {
  constructor(_random, _rawDataGenerator, _values, _maxTries = 10) {
    this._random = _random;
    this._rawDataGenerator = _rawDataGenerator;
    this._values = _values;
    this._maxTries = _maxTries;
  }

  isEmpty() {
    return 0 === this._values.length;
  }

  firstElement() {
    return this.isEmpty() ? null : this._values[0];
  }

  secondElement() {
    return this._values.length > 1 ? this._values[1] : null;
  }

  randomElement() {
    if (this.isEmpty()) {
      return null;
    }

    const index = this._random.between(0, this._values.length - 1);

    return this._values[index];
  }

  penultimateElement() {
    const len = this._values.length;
    return len > 1 ? this._values[len - 2] : null;
  }

  lastElement() {
    if (this.isEmpty()) {
      return null;
    }

    return this._values[this._values.length - 1];
  }

  notInSet() {
    for (let i = 0; i < this._maxTries; ++i) {
      let val = this._rawDataGenerator.randomBetweenMinAndMax();

      if (this._values.indexOf(val) < 0) {
        return val;
      }
    }

    return null;
  }

}

class QueryBasedDataGenerator {
  constructor(_random, _rawDataGenerator, _queryable, _queryCache, _query, _maxTries = 10) {
    this._random = _random;
    this._rawDataGenerator = _rawDataGenerator;
    this._queryable = _queryable;
    this._queryCache = _queryCache;
    this._query = _query;
    this._maxTries = _maxTries;
  }

  async firstElement() {
    const values = await this.queryValues();
    return values.length > 0 ? this.valueOfTheFirstColumn(values[0]) : null;
  }

  async secondElement() {
    const values = await this.queryValues();
    return values.length > 1 ? this.valueOfTheFirstColumn(values[1]) : null;
  }

  async randomElement() {
    const values = await this.queryValues();

    if (values.length < 1) {
      return null;
    }

    const index = this._random.between(0, values.length - 1);

    return this.valueOfTheFirstColumn(values[index]);
  }

  async penultimateElement() {
    const values = await this.queryValues();
    const len = values.length;
    return len > 1 ? this.valueOfTheFirstColumn(values[len - 2]) : null;
  }

  async lastElement() {
    const values = await this.queryValues();
    const len = values.length;
    return len > 0 ? this.valueOfTheFirstColumn(values[len - 1]) : null;
  }

  async notInSet() {
    for (let i = 0; i < this._maxTries; ++i) {
      const val = this._rawDataGenerator.randomBetweenMinAndMax();

      const found = await this.hasValue(val);

      if (!found) {
        return val;
      }
    }

    return null;
  }

  valueOfTheFirstColumn(row) {
    if (!row) {
      return null;
    }

    for (let key in row) {
      return row[key];
    }

    return null;
  }

  async queryValues() {
    if (this._queryCache.has(this._query)) {
      return this._queryCache.get(this._query);
    }

    const result = await this._queryable.query(this._query);

    this._queryCache.put(this._query, result);

    return result;
  }

  async hasValue(value) {
    const values = await this.queryValues();

    for (let row of values) {
      const val = this.valueOfTheFirstColumn(row);

      if (val == value) {
        return true;
      }
    }

    return false;
  }

}

class DateLimits {}
DateLimits.MIN = LocalDate$1.of(0, 1, 1);
DateLimits.MAX = LocalDate$1.of(9999, 12, 31);

class RandomDate {
  constructor(_randomLong) {
    this._randomLong = _randomLong;
  }

  between(min, max) {
    const daysBetween = min.until(max, ChronoUnit.DAYS);

    if (0 === daysBetween) {
      return min;
    }

    const days = this._randomLong.between(0, daysBetween);

    return min.plusDays(days);
  }

  before(max) {
    return this.between(DateLimits.MIN, max.minusDays(1));
  }

  after(min) {
    return this.between(min.plusDays(1), DateLimits.MAX);
  }

}

class DateTimeLimits {}
DateTimeLimits.MIN = LocalDateTime$1.of(0, 1, 1, 0, 0, 0);
DateTimeLimits.MAX = LocalDateTime$1.of(9999, 12, 31, 23, 59, 59);
class ShortDateTimeLimits {}
ShortDateTimeLimits.MIN = LocalDateTime$1.of(0, 1, 1, 0, 0);
ShortDateTimeLimits.MAX = LocalDateTime$1.of(9999, 12, 31, 23, 59);

class RandomDateTime {
  constructor(_randomLong) {
    this._randomLong = _randomLong;
  }

  between(min, max) {
    const diffInSeconds = min.until(max, ChronoUnit.SECONDS);

    if (0 === diffInSeconds) {
      return min;
    }

    const seconds = this._randomLong.between(0, diffInSeconds);

    return min.plusSeconds(seconds);
  }

  before(max) {
    return this.between(DateTimeLimits.MIN, max.minusSeconds(1));
  }

  after(min) {
    return this.between(min.plusSeconds(1), DateTimeLimits.MAX);
  }

}

class DoubleLimits {}
DoubleLimits.MIN = Number.MIN_SAFE_INTEGER;
DoubleLimits.MAX = Number.MAX_SAFE_INTEGER;

class RandomDouble {
  constructor(_random) {
    this._random = _random;
  }

  between(min, max) {
    let num = this._random.generate();

    return min + num * (max - min);
  }

  before(value, delta) {
    return this.between(DoubleLimits.MIN, value - delta);
  }

  after(value, delta) {
    return this.between(value + delta, DoubleLimits.MAX);
  }

}

class RandomShortDateTime {
  constructor(_randomLong) {
    this._randomLong = _randomLong;
  }

  between(min, max) {
    const diffInMinutes = min.until(max, ChronoUnit.MINUTES);

    if (0 === diffInMinutes) {
      return min;
    }

    const minutes = this._randomLong.between(0, diffInMinutes);

    return min.plusMinutes(minutes);
  }

  before(max) {
    return this.between(ShortDateTimeLimits.MIN, max.minusMinutes(1));
  }

  after(min) {
    return this.between(min.plusMinutes(1), ShortDateTimeLimits.MAX);
  }

}

class TimeLimits {}
TimeLimits.MIN = LocalTime$1.of(0, 0, 0);
TimeLimits.MAX = LocalTime$1.of(23, 59, 59);
class ShortTimeLimits {}
ShortTimeLimits.MIN = LocalTime$1.of(0, 0, 0, 0);
ShortTimeLimits.MAX = LocalTime$1.of(23, 59, 0, 0);

class RandomShortTime {
  constructor(_randomLong) {
    this._randomLong = _randomLong;
  }

  between(min, max) {
    const diffInMinutes = min.until(max, ChronoUnit.MINUTES);

    if (0 === diffInMinutes) {
      return min;
    }

    const minutes = this._randomLong.between(0, diffInMinutes);

    return min.plusMinutes(minutes);
  }

  before(max) {
    return this.between(ShortTimeLimits.MIN, max.minusMinutes(1));
  }

  after(min) {
    return this.between(min.plusMinutes(1), ShortTimeLimits.MAX);
  }

}

function escapeChar(char) {
  switch (char) {
    case '\0':
      return '\\0';

    case '\x08':
      return '\\b';

    case '\x09':
      return '\\t';

    case '\x1a':
      return '\\z';

    case '\n':
      return '\\n';

    case '\r':
      return '\\r';

    case '<':
    case '>':
    case '"':
    case "'":
    case '%':
    case '`':
    case '\\':
      return '\\' + char;
  }

  return char;
}

const DEFAULT_RANDOM_STRING_OPTIONS = {
  escapeChars: true,
  avoidDatabaseChars: false
};

function avoidDatabaseChar(char) {
  const DATABASE_CHARS = "\"'%`";

  if (DATABASE_CHARS.indexOf(char) >= 0) {
    return ' ';
  }

  return escapeChar(char);
}

class RandomString {
  constructor(_random, options = Object.assign({}, DEFAULT_RANDOM_STRING_OPTIONS)) {
    this._random = _random;
    this.options = options;
    this.MIN_PRINTABLE_ASCII_ISO = 32;
    this.MAX_PRINTABLE_ASCII_ISO = 255;
    this._randomLong = new RandomLong(_random);
    this._minCharCode = this.MIN_PRINTABLE_ASCII_ISO;
    this._maxCharCode = this.MAX_PRINTABLE_ASCII_ISO;
  }

  exactly(length) {
    const self = this;

    const fn = () => {
      return self._random.generate();
    };

    let opt = {
      random: fn,
      length: length,
      chars: [this._minCharCode, this._maxCharCode]
    };

    if (this.options.escapeChars) {
      opt.replacer = escapeChar;
    }

    if (this.options.avoidDatabaseChars) {
      opt.replacer = avoidDatabaseChar;
    }

    return randstr(opt);
  }

  between(minimum, maximum) {
    const min = minimum < 0 ? 0 : minimum;
    const max = maximum < 0 ? 0 : maximum;

    if (0 === min && 0 === max) {
      return '';
    }

    return this.exactly(this._randomLong.between(min, max));
  }

  minCharCode(min) {
    if (isDefined(min) && min >= 0) {
      this._minCharCode = min;

      if (this._maxCharCode < this._minCharCode) {
        this._minCharCode = this._maxCharCode;
      }
    }

    return this._minCharCode;
  }

  maxCharCode(max) {
    if (isDefined(max) && max >= 0) {
      this._maxCharCode = max;

      if (this._minCharCode > this._maxCharCode) {
        this._maxCharCode = this._minCharCode;
      }
    }

    return this._maxCharCode;
  }

}

class RandomTime {
  constructor(_randomLong) {
    this._randomLong = _randomLong;
  }

  between(min, max) {
    const diffInSeconds = min.until(max, ChronoUnit.SECONDS);

    if (0 === diffInSeconds) {
      return min;
    }

    const seconds = this._randomLong.between(0, diffInSeconds);

    return min.plusSeconds(seconds);
  }

  before(max) {
    return this.between(TimeLimits.MIN, max.minusSeconds(1));
  }

  after(min) {
    return this.between(min.plusSeconds(1), TimeLimits.MAX);
  }

}

class DateGenerator {
  constructor(_randomDateGen, min, max) {
    this._randomDateGen = _randomDateGen;
    this.ZERO = DateLimits.MIN;

    if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
      throw new Error('min date should not be greater than max');
    }

    this._min = isDefined(min) ? min : DateLimits.MIN;
    this._max = isDefined(max) ? max : DateLimits.MAX;
  }

  diffInDays() {
    return this._min.until(this._max, ChronoUnit.DAYS);
  }

  hasValuesBetweenMinAndMax() {
    return this.diffInDays() > 0;
  }

  hasValuesBelowMin() {
    return this._min.isAfter(DateLimits.MIN);
  }

  hasValuesAboveMax() {
    return this._max.isBefore(DateLimits.MAX);
  }

  isZeroBetweenMinAndMax() {
    return (this._min.isBefore(this.ZERO) || this._min.isEqual(this.ZERO)) && (this._max.isAfter(this.ZERO) || this._max.isEqual(this.ZERO));
  }

  isZeroBelowMin() {
    return this._min.isAfter(this.ZERO);
  }

  isZeroAboveMax() {
    return this._max.isBefore(this.ZERO);
  }

  lowest() {
    return DateLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._randomDateGen.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min.minusDays(1) : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min.plusDays(1) : this._min;
  }

  zero() {
    return this.lowest();
  }

  median() {
    return this._min.plusDays(Math.round((this.diffInDays() - 1) / 2));
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomDateGen.between(this._min.plusDays(1), this._max.minusDays(1)) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max.minusDays(1) : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max.plusDays(1) : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._randomDateGen.after(this._max) : this.greatest();
  }

  greatest() {
    return DateLimits.MAX;
  }

}

class DateTimeGenerator {
  constructor(_randomDateTimeGen, min, max) {
    this._randomDateTimeGen = _randomDateTimeGen;
    this.ZERO = DateTimeLimits.MIN;

    if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
      throw new Error('Minimum value should not be greater than the maximum value.');
    }

    this._min = isDefined(min) ? min : DateTimeLimits.MIN;
    this._max = isDefined(max) ? max : DateTimeLimits.MAX;
  }

  diffInSeconds() {
    return this._min.until(this._max, ChronoUnit.SECONDS);
  }

  hasValuesBetweenMinAndMax() {
    return this.diffInSeconds() > 0;
  }

  hasValuesBelowMin() {
    return this._min.isAfter(DateTimeLimits.MIN);
  }

  hasValuesAboveMax() {
    return this._max.isBefore(DateTimeLimits.MAX);
  }

  isZeroBetweenMinAndMax() {
    return (this._min.isBefore(this.ZERO) || this._min.isEqual(this.ZERO)) && (this._max.isAfter(this.ZERO) || this._max.isEqual(this.ZERO));
  }

  isZeroBelowMin() {
    return this._min.isAfter(this.ZERO);
  }

  isZeroAboveMax() {
    return this._max.isBefore(this.ZERO);
  }

  lowest() {
    return DateTimeLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._randomDateTimeGen.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min.minusSeconds(1) : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min.plusSeconds(1) : this._min;
  }

  zero() {
    return this.lowest();
  }

  median() {
    const diffInDaysOfDates = this._min.toLocalDate().until(this._max.toLocalDate(), ChronoUnit.DAYS);

    const minTime = this._min.toLocalTime();

    const maxTime = this._max.toLocalTime();

    const diffInSecondsFromTime = minTime.until(maxTime, ChronoUnit.SECONDS);
    const days = Math.round((diffInDaysOfDates - 1) / 2);
    const seconds = Math.round((diffInSecondsFromTime - 1) / 2);

    let r = this._min.plusDays(days);

    if (maxTime.compareTo(minTime) > 0) {
      return r.plusSeconds(seconds);
    }

    return r.minusMonths(seconds);
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomDateTimeGen.between(this._min.plusSeconds(1), this._max.minusSeconds(1)) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max.minusSeconds(1) : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max.plusSeconds(1) : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._randomDateTimeGen.after(this._max) : this.greatest();
  }

  greatest() {
    return DateTimeLimits.MAX;
  }

}

class MinMaxChecker {
  check(min, max, delta) {
    if (isDefined(min) && isNaN(min)) {
      throw new Error("min is NaN.");
    }

    if (isDefined(max) && isNaN(max)) {
      throw new Error("max is NaN.");
    }

    if (isDefined(min) && isDefined(max) && Number(min) > Number(max)) {
      throw new Error("The minimum value cannot be greater than the maximum value.");
    }

    if (isDefined(delta) && delta < 0) {
      throw new Error("delta can't be negative.");
    }
  }

  greatestFractionalPart(defaultDelta, min, max) {
    const minFracLength = this.fractionalPartLength(min);
    const maxFracLength = this.fractionalPartLength(max);
    let greatestLength = maxFracLength > minFracLength ? maxFracLength : minFracLength;
    return 1 / Math.pow(10, greatestLength);
  }

  fractionalPartLength(num) {
    if (!isDefined(num) || '' === num) return 0;
    const numStr = num.toString();
    const idx = numStr.lastIndexOf('.');
    if (idx < 0) return 0;
    return numStr.substring(idx + 1).length;
  }

}

class DoubleGenerator {
  constructor(_random, min, max, delta) {
    this._random = _random;
    this.DEFAULT_DELTA = 0.01;
    const checker = new MinMaxChecker();
    checker.check(min, max, delta);
    this._min = min !== null && min !== undefined ? Number(min) : DoubleLimits.MIN;
    this._max = max !== null && max !== undefined ? Number(max) : DoubleLimits.MAX;
    this._delta = delta !== null && delta !== undefined ? delta : checker.greatestFractionalPart(this.DEFAULT_DELTA, min, max);
  }

  delta() {
    return this._delta;
  }

  diff() {
    return this._max - this._min;
  }

  hasValuesBetweenMinAndMax() {
    return this.diff() > this.delta();
  }

  hasValuesBelowMin() {
    return this._min > DoubleLimits.MIN;
  }

  hasValuesAboveMax() {
    return this._max < DoubleLimits.MAX;
  }

  isZeroBetweenMinAndMax() {
    return this._min <= 0 && 0 <= this._max;
  }

  isZeroBelowMin() {
    return 0 < this._min;
  }

  isZeroAboveMax() {
    return 0 > this._max;
  }

  lowest() {
    return DoubleLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._random.before(this._min, this._delta) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min - this._delta : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min + this._delta : this._min;
  }

  zero() {
    return 0;
  }

  median() {
    return this._min + this.diff() / 2;
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._random.between(this._min + 1, this._max - 1) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max - this._delta : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max + this._delta : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._random.after(this._max, this._delta) : this.greatest();
  }

  greatest() {
    return DoubleLimits.MAX;
  }

}

class LongGenerator {
  constructor(_random, min, max) {
    this._random = _random;
    new MinMaxChecker().check(min, max);
    this._min = min !== null && min !== undefined ? min : LongLimits.MIN;
    this._max = max !== null && max !== undefined ? max : LongLimits.MAX;
  }

  diff() {
    return this._max - this._min;
  }

  hasValuesBetweenMinAndMax() {
    return this.diff() > 0;
  }

  hasValuesBelowMin() {
    return this._min > LongLimits.MIN;
  }

  hasValuesAboveMax() {
    return this._max < LongLimits.MAX;
  }

  isZeroBetweenMinAndMax() {
    return this._min <= 0 && 0 <= this._max;
  }

  isZeroBelowMin() {
    return 0 < this._min;
  }

  isZeroAboveMax() {
    return 0 > this._max;
  }

  lowest() {
    return LongLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._random.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min - 1 : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min + 1 : this._min;
  }

  zero() {
    return 0;
  }

  median() {
    return this._min + this.diff() / 2;
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._random.between(this._min + 1, this._max - 1) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max - 1 : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max + 1 : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._random.after(this._max) : this.greatest();
  }

  greatest() {
    return LongLimits.MAX;
  }

}

class ShortDateTimeGenerator {
  constructor(_randomGen, min, max) {
    this._randomGen = _randomGen;
    this.ZERO = ShortDateTimeLimits.MIN;

    if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
      throw new Error('Minimum value should not be greater than the maximum value.');
    }

    this._min = isDefined(min) ? min : ShortDateTimeLimits.MIN;
    this._max = isDefined(max) ? max : ShortDateTimeLimits.MAX;
  }

  diffInMinutes() {
    return this._min.until(this._max, ChronoUnit.MINUTES);
  }

  hasValuesBetweenMinAndMax() {
    return this.diffInMinutes() > 0;
  }

  hasValuesBelowMin() {
    return this._min.isAfter(ShortDateTimeLimits.MIN);
  }

  hasValuesAboveMax() {
    return this._max.isBefore(ShortDateTimeLimits.MAX);
  }

  isZeroBetweenMinAndMax() {
    return (this._min.isBefore(this.ZERO) || this._min.isEqual(this.ZERO)) && (this._max.isAfter(this.ZERO) || this._max.isEqual(this.ZERO));
  }

  isZeroBelowMin() {
    return this._min.isAfter(this.ZERO);
  }

  isZeroAboveMax() {
    return this._max.isBefore(this.ZERO);
  }

  lowest() {
    return ShortDateTimeLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._randomGen.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min.minusMinutes(1) : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min.plusMinutes(1) : this._min;
  }

  zero() {
    return this.lowest();
  }

  median() {
    const diffInDaysOfDates = this._min.toLocalDate().until(this._max.toLocalDate(), ChronoUnit.DAYS);

    const minTime = this._min.toLocalTime();

    const maxTime = this._max.toLocalTime();

    const diffInMinutesFromTime = minTime.until(maxTime, ChronoUnit.MINUTES);
    const days = Math.round((diffInDaysOfDates - 1) / 2);
    const minutes = Math.round((diffInMinutesFromTime - 1) / 2);

    let r = this._min.plusDays(days);

    if (maxTime.compareTo(minTime) > 0) {
      return r.plusMinutes(minutes);
    }

    return r.minusMonths(minutes);
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomGen.between(this._min.plusMinutes(1), this._max.minusMinutes(1)) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max.minusMinutes(1) : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max.plusMinutes(1) : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._randomGen.after(this._max) : this.greatest();
  }

  greatest() {
    return ShortDateTimeLimits.MAX;
  }

}

class ShortTimeGenerator {
  constructor(_randomTimeGen, min, max) {
    this._randomTimeGen = _randomTimeGen;
    this.ZERO = ShortTimeLimits.MIN;

    if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
      throw new Error('min time should not be greater than max');
    }

    this._min = isDefined(min) ? min : ShortTimeLimits.MIN;
    this._max = isDefined(max) ? max : ShortTimeLimits.MAX;
  }

  diffInMinutes() {
    return this._min.until(this._max, ChronoUnit.MINUTES);
  }

  hasValuesBetweenMinAndMax() {
    return this.diffInMinutes() > 0;
  }

  hasValuesBelowMin() {
    return this._min.isAfter(ShortTimeLimits.MIN);
  }

  hasValuesAboveMax() {
    return this._max.isBefore(ShortTimeLimits.MAX);
  }

  isZeroBetweenMinAndMax() {
    return (this._min.isBefore(this.ZERO) || this._min.equals(this.ZERO)) && (this._max.isAfter(this.ZERO) || this._max.equals(this.ZERO));
  }

  isZeroBelowMin() {
    return this._min.isAfter(this.ZERO);
  }

  isZeroAboveMax() {
    return this._max.isBefore(this.ZERO);
  }

  lowest() {
    return ShortTimeLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._randomTimeGen.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min.minusMinutes(1) : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min.plusMinutes(1) : this._min;
  }

  zero() {
    return this.lowest();
  }

  median() {
    return this._min.plusMinutes(Math.round((this.diffInMinutes() - 1) / 2));
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomTimeGen.between(this._min.plusMinutes(1), this._max.minusMinutes(1)) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max.minusMinutes(1) : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max.plusMinutes(1) : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._randomTimeGen.after(this._max) : this.greatest();
  }

  greatest() {
    return ShortTimeLimits.MAX;
  }

}

class StringLimits {}
StringLimits.MIN = 0;
StringLimits.MAX = 32767;
StringLimits.MAX_USUAL = 127;

class StringGenerator {
  constructor(_randomString, minLength, maxLength, maxPossibleLength) {
    this._randomString = _randomString;
    new MinMaxChecker().check(minLength, maxLength);

    if (minLength && minLength < StringLimits.MIN) {
      throw Error('Minimum string length is ' + StringLimits.MIN);
    }

    if (maxLength && maxLength > StringLimits.MAX) {
      throw Error('Maximum string length is ' + StringLimits.MAX);
    }

    if (maxPossibleLength && maxPossibleLength > StringLimits.MAX) {
      throw Error('Maximum possible string length is ' + StringLimits.MAX);
    }

    this._minLength = minLength ? minLength : StringLimits.MIN;
    this._maxLength = maxLength ? maxLength : StringLimits.MAX_USUAL;
    this._maxPossibleLength = maxPossibleLength == undefined || maxPossibleLength === null ? StringLimits.MAX : maxPossibleLength;
  }

  minLength() {
    return this._minLength;
  }

  maxLength() {
    return this._maxLength;
  }

  lengthDiff() {
    return this._maxLength - this._minLength;
  }

  medianLength() {
    return this._minLength + this.lengthDiff() / 2;
  }

  hasValuesBetweenMinAndMax() {
    return this.lengthDiff() > 0;
  }

  hasValuesBelowMin() {
    return this._minLength > StringLimits.MIN;
  }

  hasValuesAboveMax() {
    return this._maxLength < StringLimits.MAX;
  }

  isZeroBetweenMinAndMax() {
    return this._minLength <= 0 && 0 <= this._maxLength;
  }

  isZeroBelowMin() {
    return 0 < this._minLength;
  }

  isZeroAboveMax() {
    return 0 > this._maxLength;
  }

  lowest() {
    return '';
  }

  randomBelowMin() {
    if (!this.hasValuesBelowMin()) {
      return this.lowest();
    }

    return this._randomString.between(StringLimits.MIN, this._minLength - 1);
  }

  justBelowMin() {
    if (!this.hasValuesBelowMin()) {
      return this.lowest();
    }

    return this._randomString.exactly(this._minLength - 1);
  }

  min() {
    return this._randomString.exactly(this._minLength);
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._randomString.exactly(this._minLength + 1) : this.min();
  }

  zero() {
    return '';
  }

  median() {
    return this._randomString.exactly(this.medianLength());
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomString.between(this._minLength + 1, this._maxLength - 1) : this.min();
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomString.exactly(this._maxLength - 1) : this.max();
  }

  max() {
    return this._randomString.exactly(this._maxLength);
  }

  justAboveMax() {
    if (!this.hasValuesAboveMax()) {
      return this.max();
    }

    return this._randomString.exactly(this._maxLength + 1);
  }

  randomAboveMax() {
    if (!this.hasValuesAboveMax()) {
      return this.max();
    }

    return this._randomString.between(this._maxLength + 1, this._maxPossibleLength);
  }

  greatest() {
    return this._randomString.exactly(this._maxPossibleLength);
  }

}

class TimeGenerator {
  constructor(_randomTimeGen, min, max) {
    this._randomTimeGen = _randomTimeGen;
    this.ZERO = TimeLimits.MIN;

    if (isDefined(min) && isDefined(max) && min.isAfter(max)) {
      throw new Error('min time should not be greater than max');
    }

    this._min = isDefined(min) ? min : TimeLimits.MIN;
    this._max = isDefined(max) ? max : TimeLimits.MAX;
  }

  diffInSeconds() {
    return this._min.until(this._max, ChronoUnit.SECONDS);
  }

  hasValuesBetweenMinAndMax() {
    return this.diffInSeconds() > 0;
  }

  hasValuesBelowMin() {
    return this._min.isAfter(TimeLimits.MIN);
  }

  hasValuesAboveMax() {
    return this._max.isBefore(TimeLimits.MAX);
  }

  isZeroBetweenMinAndMax() {
    return (this._min.isBefore(this.ZERO) || this._min.equals(this.ZERO)) && (this._max.isAfter(this.ZERO) || this._max.equals(this.ZERO));
  }

  isZeroBelowMin() {
    return this._min.isAfter(this.ZERO);
  }

  isZeroAboveMax() {
    return this._max.isBefore(this.ZERO);
  }

  lowest() {
    return TimeLimits.MIN;
  }

  randomBelowMin() {
    return this.hasValuesBelowMin() ? this._randomTimeGen.before(this._min) : this.lowest();
  }

  justBelowMin() {
    return this.hasValuesBelowMin() ? this._min.minusSeconds(1) : this.lowest();
  }

  min() {
    return this._min;
  }

  justAboveMin() {
    return this.hasValuesBetweenMinAndMax() ? this._min.plusSeconds(1) : this._min;
  }

  zero() {
    return this.lowest();
  }

  median() {
    return this._min.plusSeconds(Math.round((this.diffInSeconds() - 1) / 2));
  }

  randomBetweenMinAndMax() {
    return this.hasValuesBetweenMinAndMax() ? this._randomTimeGen.between(this._min.plusSeconds(1), this._max.minusSeconds(1)) : this._min;
  }

  justBelowMax() {
    return this.hasValuesBetweenMinAndMax() ? this._max.minusSeconds(1) : this._max;
  }

  max() {
    return this._max;
  }

  justAboveMax() {
    return this.hasValuesAboveMax() ? this._max.plusSeconds(1) : this.greatest();
  }

  randomAboveMax() {
    return this.hasValuesAboveMax() ? this._randomTimeGen.after(this._max) : this.greatest();
  }

  greatest() {
    return TimeLimits.MAX;
  }

}

class RegexBasedDataGenerator {
  constructor(_randomLong, _randomString, _expression, _valueType = ValueType.STRING, _randomTriesToInvalidValues = 10, _maxStringSize) {
    this._randomLong = _randomLong;
    this._randomString = _randomString;
    this._expression = _expression;
    this._valueType = _valueType;
    this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
    this._maxStringSize = _maxStringSize;

    RandExp.prototype.randInt = (from, to) => {
      return _randomLong.between(from, to);
    };

    if (this._randomTriesToInvalidValues < 0) {
      this._randomTriesToInvalidValues = 0;
    }

    if (this._maxStringSize <= 0) {
      this._maxStringSize = StringLimits.MAX;
    }
  }

  valid() {
    return this.generateFor(this._expression, this._valueType);
  }

  invalid() {
    const max = this._maxStringSize || StringLimits.MAX;
    const regex = new RegExp(this._expression);

    for (let i = 0; i < this._randomTriesToInvalidValues; ++i) {
      let val = this._randomString.between(0, max);

      if (!regex.test(val)) {
        return val;
      }
    }

    const negatedExp = this.negateExpression(this._expression);
    const value = this.generateFor(negatedExp, this._valueType);

    if (value.length >= max) {
      return value.substr(0, max);
    }

    return value;
  }

  negateExpression(expression) {
    if (expression.startsWith('[^')) {
      return '[' + expression.substring(2);
    }

    if (expression.startsWith('[')) {
      return '[^' + expression.substring(1);
    }

    return '[^(' + expression + ')]';
  }

  generateFor(expression, valueType = ValueType.STRING) {
    const value = new RandExp(expression).gen();

    if (ValueType.STRING === valueType) {
      return jsesc(value, {
        quotes: 'double'
      });
    }

    return adjustValueToTheRightType(value, valueType);
  }

}

class DataGeneratorBuilder {
  constructor(_seed, _randomTriesToInvalidValues = 10, _maxPossibleStringLength) {
    this._seed = _seed;
    this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
    this._maxPossibleStringLength = _maxPossibleStringLength;
    this._queryCache = new QueryCache();
    this._random = new Random(this._seed);
    this._randomString = new RandomString(this._random, {
      escapeChars: true,
      avoidDatabaseChars: true
    });
    this._randomLong = new RandomLong(this._random);
    this._randomDouble = new RandomDouble(this._random);
    this._randomDate = new RandomDate(this._randomLong);
    this._randomTime = new RandomTime(this._randomLong);
    this._randomShortTime = new RandomShortTime(this._randomLong);
    this._randomDateTime = new RandomDateTime(this._randomLong);
    this._randomShortDateTime = new RandomShortDateTime(this._randomLong);
  }

  raw(valueType, min, max) {
    switch (valueType) {
      case ValueType.STRING:
        return new StringGenerator(this._randomString, min, max, this._maxPossibleStringLength);

      case ValueType.INTEGER:
        return new LongGenerator(this._randomLong, min, max);

      case ValueType.DOUBLE:
        return new DoubleGenerator(this._randomDouble, min, max);

      case ValueType.DATE:
        return new DateGenerator(this._randomDate, min, max);

      case ValueType.TIME:
        return new ShortTimeGenerator(this._randomShortTime, min, max);

      case ValueType.LONG_TIME:
        return new TimeGenerator(this._randomTime, min, max);

      case ValueType.DATE_TIME:
        return new ShortDateTimeGenerator(this._randomShortDateTime, min, max);

      case ValueType.LONG_DATE_TIME:
        return new DateTimeGenerator(this._randomDateTime, min, max);

      default:
        throw Error('Generator not available fot the type ' + valueType);
    }
  }

  rawAnalyzer(valueType, min, max) {
    return this.raw(valueType, min, max);
  }

  regex(valueType, expression) {
    return new RegexBasedDataGenerator(this._randomLong, this._randomString, expression, valueType, this._randomTriesToInvalidValues, this._maxPossibleStringLength);
  }

  list(valueType, listValues) {
    return new ListBasedDataGenerator(this._randomLong, this.raw(valueType), listValues, this._randomTriesToInvalidValues);
  }

  invertedLogicList(valueType, listValues) {
    return new InvertedLogicListBasedDataGenerator(this.list(valueType, listValues));
  }

  query(valueType, query, queryable) {
    return new QueryBasedDataGenerator(this._randomLong, this.raw(valueType), queryable, this.queryCache, query, this._randomTriesToInvalidValues);
  }

  invertedLogicQuery(valueType, query, queryable) {
    return new InvertedLogicQueryBasedDataGenerator(this.query(valueType, query, queryable));
  }

  get queryCache() {
    return this._queryCache;
  }

}

var ActionTargets;

(function (ActionTargets) {
  ActionTargets["NONE"] = "";
  ActionTargets["APP"] = "app";
  ActionTargets["BUTTON"] = "button";
  ActionTargets["CHECKBOX"] = "checkbox";
  ActionTargets["COOKIE"] = "cookie";
  ActionTargets["CURRENT_PAGE"] = "currentPage";
  ActionTargets["CURRENT_TAG"] = "currentTab";
  ActionTargets["CURSOR"] = "cursor";
  ActionTargets["DATABASE"] = "database";
  ActionTargets["DIV"] = "div";
  ActionTargets["FILE_INPUT"] = "fileInput";
  ActionTargets["FRAME"] = "frame";
  ActionTargets["IMAGE"] = "image";
  ActionTargets["KEY"] = "key";
  ActionTargets["KEYBOARD"] = "keyboard";
  ActionTargets["LABEL"] = "label";
  ActionTargets["LI"] = "li";
  ActionTargets["LINK"] = "link";
  ActionTargets["LISTBOX"] = "listbox";
  ActionTargets["OTHER_TABS"] = "otherTabs";
  ActionTargets["PARAGRAPH"] = "paragraph";
  ActionTargets["NATIVE"] = "native";
  ActionTargets["NEW_TAB"] = "newTab";
  ActionTargets["RADIO"] = "radio";
  ActionTargets["SCREEN"] = "screen";
  ActionTargets["SELECT"] = "select";
  ActionTargets["SLIDER"] = "slider";
  ActionTargets["SPAN"] = "span";
  ActionTargets["TABLE"] = "table";
  ActionTargets["TEXT"] = "text";
  ActionTargets["TEXTBOX"] = "textbox";
  ActionTargets["TEXTAREA"] = "textarea";
  ActionTargets["TITLE"] = "title";
  ActionTargets["WEB"] = "web";
  ActionTargets["WINDOW"] = "window";
  ActionTargets["UL"] = "ul";
  ActionTargets["URL"] = "url";
})(ActionTargets || (ActionTargets = {}));

var EditableActionTargets;

(function (EditableActionTargets) {
  EditableActionTargets["CHECKBOX"] = "checkbox";
  EditableActionTargets["FILE_INPUT"] = "fileInput";
  EditableActionTargets["SELECT"] = "select";
  EditableActionTargets["TABLE"] = "table";
  EditableActionTargets["TEXTBOX"] = "textbox";
  EditableActionTargets["TEXTAREA"] = "textarea";
})(EditableActionTargets || (EditableActionTargets = {}));

class UIElementPropertyExtractor {
  constructor() {
    this._incompatiblePropertiesMap = new Map();
  }

  extractId(uie, caseOption = CaseType.CAMEL) {
    const item = this.extractProperty(uie, UIPropertyTypes.ID);

    if (isDefined(item)) {
      let entity = item.nlpResult.entities.find(e => Entities.VALUE === e.entity);

      if (!isDefined(entity)) {
        entity = item.nlpResult.entities.find(e => Entities.COMMAND === e.entity);
      }

      if (isDefined(entity)) {
        return entity.value;
      }
    }

    return convertCase(uie.name, caseOption);
  }

  extractType(uie) {
    const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.TYPE));

    if (!isDefined(nlpEntity)) {
      return ActionTargets.TEXTBOX;
    }

    return nlpEntity.value;
  }

  extractDataType(uie) {
    return this.extractDataTypeFromProperty(this.extractProperty(uie, UIPropertyTypes.DATA_TYPE));
  }

  extractDataTypeFromProperty(property) {
    if (!property) {
      return null;
    }

    const nlpEntity = this.extractPropertyValueAsEntity(property);

    if (!isDefined(nlpEntity)) {
      return null;
    }

    return this.stringToValueType(nlpEntity.value);
  }

  stringToValueType(value) {
    const dataType = value.toString().toLowerCase();

    if (enumUtil.isValue(ValueType, dataType)) {
      return dataType;
    }

    return null;
  }

  guessDataType(map) {
    if (0 == map.size) {
      return ValueType.STRING;
    }

    if (map.has(UIPropertyTypes.DATA_TYPE)) {
      const entityValue = map.get(UIPropertyTypes.DATA_TYPE).value;
      return this.stringToValueType(entityValue.value.toString());
    }

    if (map.has(UIPropertyTypes.MIN_LENGTH) || map.has(UIPropertyTypes.MAX_LENGTH)) {
      return ValueType.STRING;
    }

    const sequence = [UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE, UIPropertyTypes.VALUE];
    const valueTypeDetector = new ValueTypeDetector();

    for (const pType of sequence) {
      if (map.has(pType)) {
        const entityValue = map.get(pType).value;
        return valueTypeDetector.detect((entityValue == null ? void 0 : entityValue.value) || '');
      }
    }

    return ValueType.STRING;
  }

  extractLocale(uie) {
    const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.LOCALE));

    if (!nlpEntity) {
      return null;
    }

    return nlpEntity.value.toString();
  }

  extractLocaleFormat(uie) {
    const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.LOCALE_FORMAT));

    if (!nlpEntity) {
      return null;
    }

    return nlpEntity.value.toString();
  }

  extractIsEditable(uie) {
    if (!uie.items || uie.items.length < 1) {
      return true;
    }

    const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.EDITABLE));

    if (isDefined(nlpEntity)) {
      return this.isEntityConsideredTrue(nlpEntity);
    }

    const typeNlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.TYPE));

    if (isDefined(typeNlpEntity)) {
      return enumUtil.isValue(EditableActionTargets, typeNlpEntity.value);
    }

    return true;
  }

  extractIsRequired(uie) {
    return this.isPropertyConsideredTrue(uie, UIPropertyTypes.REQUIRED);
  }

  isPropertyDefined(uie, prop) {
    return isDefined(this.extractProperty(uie, prop));
  }

  isPropertyConsideredTrue(uie, property) {
    const uip = this.extractProperty(uie, property);
    const nlpEntity = this.extractPropertyValueAsEntity(uip);

    if (uip && !nlpEntity) {
      return true;
    }

    return isDefined(nlpEntity) && this.isEntityConsideredTrue(nlpEntity);
  }

  isEntityConsideredTrue(nlpEntity) {
    return Entities.BOOL_VALUE === nlpEntity.entity && 'true' == nlpEntity.value || Entities.NUMBER === nlpEntity.entity && Number(nlpEntity.value) != 0;
  }

  extractProperty(uie, property) {
    if (!uie || !uie.items || uie.items.length < 1) {
      return null;
    }

    return uie.items.find(item => !!item && property === item.property) || null;
  }

  extractProperties(uie, property) {
    if (!uie || !uie.items) {
      return [];
    }

    return uie.items.filter(item => !!item && property === item.property);
  }

  hasEntities(uip, entities) {
    if (!uip || !uip.nlpResult || !uip.nlpResult.entities) {
      return false;
    }

    const uipEntities = uip.nlpResult.entities.map(e => e.entity);
    return entities.every(e => uipEntities.indexOf(e) >= 0);
  }

  hasEntity(uip, entity) {
    if (!uip || !uip.nlpResult || !uip.nlpResult.entities) {
      return false;
    }

    const e = uip.nlpResult.entities.find(nlpEntity => nlpEntity.entity == entity);
    return !!e;
  }

  extractPropertyValueAsEntity(prop) {
    if (!prop) {
      return null;
    }

    const acceptedValueEntities = [Entities.VALUE, Entities.NUMBER, Entities.CONSTANT, Entities.BOOL_VALUE, Entities.UI_DATA_TYPE, Entities.UI_ELEMENT_TYPE, Entities.VALUE_LIST, Entities.QUERY];

    for (let entity of prop.nlpResult.entities) {
      if (acceptedValueEntities.indexOf(entity.entity) >= 0) {
        return entity;
      }
    }

    return null;
  }

  mapProperties(uie) {
    let map = new Map();
    const allPropertyTypes = enumUtil.getValues(UIPropertyTypes);

    for (let propType of allPropertyTypes) {
      let properties = this.extractProperties(uie, propType);

      if (properties !== null) {
        map.set(propType, properties);
      }
    }

    return map;
  }

  mapPropertiesToPropertyTypes(properties) {
    const map = new Map();

    for (const p of properties) {
      const pType = p.property;

      if (map.has(pType)) {
        map.get(pType).push(p);
      } else {
        map.set(pType, [p]);
      }
    }

    return map;
  }

  mapFirstPropertyOfEachType(uie) {
    let map = new Map();
    const allPropertyTypes = enumUtil.getValues(UIPropertyTypes);

    for (let propType of allPropertyTypes) {
      let property = this.extractProperty(uie, propType);

      if (property !== null) {
        map.set(propType, property);
      }
    }

    return map;
  }

  nonRepeatableProperties(propertiesMap) {
    let nonRepeatable = [];
    const nonRepeatablePropertyTypes = [UIPropertyTypes.ID, UIPropertyTypes.TYPE, UIPropertyTypes.EDITABLE, UIPropertyTypes.DATA_TYPE, UIPropertyTypes.FORMAT, UIPropertyTypes.REQUIRED];

    for (let propType of nonRepeatablePropertyTypes) {
      let properties = propertiesMap.get(propType) || [];

      if (properties.length >= 2) {
        nonRepeatable.push(properties);
      }
    }

    return nonRepeatable;
  }

  nonTriplicatableProperties(propertiesMap) {
    let nonTriplicatable = [];
    const nonTriplicatablePropertyTypes = [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_LENGTH, UIPropertyTypes.MAX_LENGTH, UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE];

    for (let propType of nonTriplicatablePropertyTypes) {
      let properties = propertiesMap.get(propType) || [];

      if (properties.length >= 3) {
        nonTriplicatable.push(properties);
      }
    }

    return nonTriplicatable;
  }

  valueBasedPropertyTypes() {
    return [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_LENGTH, UIPropertyTypes.MAX_LENGTH, UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE, UIPropertyTypes.FORMAT];
  }

  incompatibleProperties(propertiesMap) {
    const valueBasedPropertyTypes = this.valueBasedPropertyTypes();
    let declaredPropertyTypes = [];
    let declaredPropertyMap = new Map();

    for (let propType of valueBasedPropertyTypes) {
      let properties = propertiesMap.get(propType);

      if (!properties || properties.length < 2) {
        continue;
      }

      let uiProperty = properties[0];
      declaredPropertyTypes.push(propType);
      declaredPropertyMap.set(propType, uiProperty);
    }

    const declaredCount = declaredPropertyTypes.length;

    if (declaredCount <= 1) {
      return [];
    }

    let incompatible = [];

    for (let i = 0; i < declaredCount; ++i) {
      let a = declaredPropertyTypes[i];

      for (let j = i + 1; j < declaredCount; ++j) {
        let b = declaredPropertyTypes[j];

        if (!this.areIncompatible(a, b)) {
          incompatible.push([declaredPropertyMap.get(a), declaredPropertyMap.get(b)]);
        }
      }
    }

    return incompatible;
  }

  incompatibleOperators(propertiesMap) {
    let incompatible = [];
    const valueBasedPropertyTypes = this.valueBasedPropertyTypes();
    const nlpUtil = new NLPUtil();

    for (let propType of valueBasedPropertyTypes) {
      let properties = propertiesMap.get(propType);

      if (!properties || properties.length < 2) {
        continue;
      }

      const operatorSet = new Set(properties.map(p => nlpUtil.entityNamed(Entities.UI_CONNECTOR, p.nlpResult)).map(entity => entity.entity));

      if (operatorSet.size > 1) {
        incompatible.push(properties);
        continue;
      }

      const modifiers = properties.map(p => nlpUtil.entityNamed(Entities.UI_CONNECTOR_MODIFIER, p.nlpResult)).map(entity => entity.entity);

      if (modifiers.length != 1) {
        incompatible.push(properties);
      }
    }

    return incompatible;
  }

  areIncompatible(a, b) {
    return (this.incompatiblePropertyTypes().get(a) || []).indexOf(b) >= 0;
  }

  incompatiblePropertyTypes() {
    if (this._incompatiblePropertiesMap.size > 0) {
      return this._incompatiblePropertiesMap;
    }

    let map = this._incompatiblePropertiesMap;
    map.set(UIPropertyTypes.VALUE, [UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE, UIPropertyTypes.MIN_LENGTH, UIPropertyTypes.MAX_LENGTH, UIPropertyTypes.FORMAT]);
    map.set(UIPropertyTypes.MIN_VALUE, [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_LENGTH, UIPropertyTypes.MAX_LENGTH]);
    map.set(UIPropertyTypes.MAX_VALUE, [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_LENGTH, UIPropertyTypes.MAX_LENGTH]);
    map.set(UIPropertyTypes.MIN_LENGTH, [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE]);
    map.set(UIPropertyTypes.MAX_LENGTH, [UIPropertyTypes.VALUE, UIPropertyTypes.MIN_VALUE, UIPropertyTypes.MAX_VALUE]);
    map.set(UIPropertyTypes.FORMAT, [UIPropertyTypes.VALUE]);
    return map;
  }

}

var DTCAnalysisResult;

(function (DTCAnalysisResult) {
  DTCAnalysisResult["INCOMPATIBLE"] = "incompatible";
  DTCAnalysisResult["INVALID"] = "invalid";
  DTCAnalysisResult["VALID"] = "valid";
})(DTCAnalysisResult || (DTCAnalysisResult = {}));

class DTCAnalysisData {
  constructor(result, oracles = [], uieVariableDependencies = []) {
    this.result = result;
    this.oracles = oracles;
    this.uieVariableDependencies = uieVariableDependencies;
  }

}
class DataTestCaseAnalyzer {
  constructor(seed) {
    this._uiePropExtractor = new UIElementPropertyExtractor();
    this._nlpUtil = new NLPUtil();
    this._dataGenBuilder = new DataGeneratorBuilder(seed);
  }

  analyzeUIElement(uie, errors) {
    let map = new Map();

    if (!this._uiePropExtractor.extractIsEditable(uie)) {
      return map;
    }

    let compatibles = enumUtil.getValues(DataTestCase);
    const incompatiblePair = new DTCAnalysisData(DTCAnalysisResult.INCOMPATIBLE, []);

    for (let dtc of compatibles) {
      try {
        const result = this.analyzeProperties(dtc, uie, errors);
        map.set(dtc, result);
      } catch (e) {
        map.set(dtc, incompatiblePair);
      }
    }

    const incompatibles = arrayDiff(compatibles, enumUtil.getValues(DataTestCase));

    for (let dtc of incompatibles) {
      map.set(dtc, incompatiblePair);
    }

    return map;
  }

  analyzeProperties(dtc, uie, errors) {
    const groupDef = new DataTestCaseGroupDef();
    const group = groupDef.groupOf(dtc);

    const propertiesMap = this._uiePropExtractor.mapFirstPropertyOfEachType(uie);

    const pRequired = propertiesMap.get(UIPropertyTypes.REQUIRED) || null;
    const pValue = propertiesMap.get(UIPropertyTypes.VALUE) || null;
    const pMinLength = propertiesMap.get(UIPropertyTypes.MIN_LENGTH) || null;
    const pMaxLength = propertiesMap.get(UIPropertyTypes.MAX_LENGTH) || null;
    const pMinValue = propertiesMap.get(UIPropertyTypes.MIN_VALUE) || null;
    const pMaxValue = propertiesMap.get(UIPropertyTypes.MAX_VALUE) || null;
    const pFormat = propertiesMap.get(UIPropertyTypes.FORMAT) || null;

    const propertyHasTagGenerateOnlyValidValues = p => {
      return p.tags && p.tags.length > 0 && p.tags.findIndex(tag => tag.subType === ReservedTags.GENERATE_ONLY_VALID_VALUES) >= 0;
    };

    const pRequiredHasTagGenerateOnlyValidValues = pRequired && propertyHasTagGenerateOnlyValidValues(pRequired);
    const pValueHasTagGenerateOnlyValidValues = pValue && propertyHasTagGenerateOnlyValidValues(pValue);
    const pMinLengthHasTagGenerateOnlyValidValues = pMinLength && propertyHasTagGenerateOnlyValidValues(pMinLength);
    const pMaxLengthHasTagGenerateOnlyValidValues = pMaxLength && propertyHasTagGenerateOnlyValidValues(pMaxLength);
    const pMinValueHasTagGenerateOnlyValidValues = pMinValue && propertyHasTagGenerateOnlyValidValues(pMinValue);
    const pMaxValueHasTagGenerateOnlyValidValues = pMaxValue && propertyHasTagGenerateOnlyValidValues(pMaxValue);
    const pFormatHasTagGenerateOnlyValidValues = pFormat && propertyHasTagGenerateOnlyValidValues(pFormat);

    let valueType = this._uiePropExtractor.guessDataType(propertiesMap);

    const validPair = new DTCAnalysisData(DTCAnalysisResult.VALID, []);
    const incompatiblePair = new DTCAnalysisData(DTCAnalysisResult.INCOMPATIBLE, []);

    switch (group) {
      case DataTestCaseGroup.FORMAT:
        {
          if (!pFormat) {
            return incompatiblePair;
          }

          switch (dtc) {
            case DataTestCase.FORMAT_VALID:
              {
                const hasAnyValueOrLengthProperty = isDefined(pValue) || isDefined(pMinValue) || isDefined(pMaxValue) || isDefined(pMinLength) || isDefined(pMaxLength);
                return hasAnyValueOrLengthProperty ? incompatiblePair : validPair;
              }

            case DataTestCase.FORMAT_INVALID:
              {
                if (pFormatHasTagGenerateOnlyValidValues) {
                  return incompatiblePair;
                }

                const val = pFormat.value.value.toString();
                const someExpressionsWithoutInvalidValues = ['.', '^.', '(.)', '.*', '^.*'];

                if (someExpressionsWithoutInvalidValues.includes(val)) {
                  return incompatiblePair;
                }

                return new DTCAnalysisData(DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || []);
              }
          }

          return incompatiblePair;
        }

      case DataTestCaseGroup.REQUIRED:
        {
          const isRequired = this._uiePropExtractor.extractIsRequired(uie);

          switch (dtc) {
            case DataTestCase.REQUIRED_FILLED:
              {
                if (isDefined(pValue)) {
                  const hasQuery = this._nlpUtil.hasEntityNamed(Entities.QUERY, pValue.nlpResult);

                  if (hasQuery) {
                    return incompatiblePair;
                  }
                }

                if (pFormat) {
                  return incompatiblePair;
                }

                return validPair;
              }

            case DataTestCase.REQUIRED_NOT_FILLED:
              {
                if (isRequired && pRequiredHasTagGenerateOnlyValidValues) {
                  return incompatiblePair;
                }

                if (isRequired) {
                  return new DTCAnalysisData(DTCAnalysisResult.INVALID, pRequired.otherwiseSentences || []);
                }

                if (pFormat) {
                  try {
                    const val = pFormat.value.value.toString();
                    const r = new RegExp(val);

                    if (!r.test('')) {
                      return new DTCAnalysisData(DTCAnalysisResult.INVALID, pFormat.otherwiseSentences || []);
                    }
                  } catch (_unused) {
                    return incompatiblePair;
                  }
                }

                return validPair;
              }
          }

          return incompatiblePair;
        }

      case DataTestCaseGroup.SET:
        {
          if (!pValue) {
            return incompatiblePair;
          }

          const hasValue = this._nlpUtil.hasEntityNamed(Entities.VALUE, pValue.nlpResult);

          const hasConstant = this._nlpUtil.hasEntityNamed(Entities.CONSTANT, pValue.nlpResult);

          if (!hasValue && !hasConstant && !this._nlpUtil.hasEntityNamed(Entities.QUERY, pValue.nlpResult) && !this._nlpUtil.hasEntityNamed(Entities.VALUE_LIST, pValue.nlpResult)) {
            return incompatiblePair;
          }

          const hasNegation = this.hasNegation(pValue);
          const invalidPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, pValue.otherwiseSentences || []);

          if (hasValue || hasConstant) {
            if (DataTestCase.SET_FIRST_ELEMENT === dtc) {
              if (hasNegation) {
                if (pValueHasTagGenerateOnlyValidValues) {
                  return incompatiblePair;
                }

                return invalidPair;
              }

              return validPair;
            } else if (DataTestCase.SET_NOT_IN_SET === dtc) {
              if (hasNegation) {
                return validPair;
              }

              if (pValueHasTagGenerateOnlyValidValues) {
                return incompatiblePair;
              }

              return invalidPair;
            }

            return incompatiblePair;
          }

          switch (dtc) {
            case DataTestCase.SET_FIRST_ELEMENT:
            case DataTestCase.SET_LAST_ELEMENT:
            case DataTestCase.SET_RANDOM_ELEMENT:
              {
                if (hasNegation) {
                  if (pValueHasTagGenerateOnlyValidValues) {
                    return incompatiblePair;
                  }

                  return invalidPair;
                }

                return validPair;
              }

            case DataTestCase.SET_NOT_IN_SET:
              {
                if (hasNegation) {
                  return validPair;
                }

                if (pValueHasTagGenerateOnlyValidValues) {
                  return incompatiblePair;
                }

                return invalidPair;
              }
          }

          return incompatiblePair;
        }

      case DataTestCaseGroup.VALUE:
        {
          const hasValueProperty = isDefined(pValue);
          const valueHasNegation = hasValueProperty && this.hasNegation(pValue);
          const shouldGenerateValid = !hasValueProperty || hasValueProperty && valueHasNegation;
          const hasMinValue = isDefined(pMinValue);
          const hasMaxValue = isDefined(pMaxValue);

          if (!hasMinValue && !hasMaxValue) {
            return incompatiblePair;
          }

          let [minValue, isToFakeMinValue] = hasMinValue ? this.resolvePropertyValue(UIPropertyTypes.MIN_VALUE, pMinValue, valueType) : [null, false];
          let [maxValue, isToFakeMaxValue] = hasMaxValue ? this.resolvePropertyValue(UIPropertyTypes.MAX_VALUE, pMaxValue, valueType) : [null, false];
          const invalidMinPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMinValue ? pMinValue.otherwiseSentences || [] : []);
          const invalidMaxPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMaxValue ? pMaxValue.otherwiseSentences || [] : []);

          if (isToFakeMinValue) {
            if (isToFakeMaxValue) {
              minValue = this._dataGenBuilder.raw(valueType).randomBetweenMinAndMax();
              maxValue = this._dataGenBuilder.raw(valueType, minValue).randomBetweenMinAndMax();
              isToFakeMaxValue = false;
            } else {
              minValue = this._dataGenBuilder.raw(valueType, null, maxValue).randomBetweenMinAndMax();
            }
          }

          if (isToFakeMaxValue) {
            maxValue = this._dataGenBuilder.raw(valueType, minValue).randomBetweenMinAndMax();
          }

          let analyzer = this._dataGenBuilder.rawAnalyzer(valueType, minValue, maxValue);

          switch (dtc) {
            case DataTestCase.VALUE_LOWEST:
            case DataTestCase.VALUE_RANDOM_BELOW_MIN:
            case DataTestCase.VALUE_JUST_BELOW_MIN:
              {
                if (hasMinValue || isToFakeMinValue) {
                  if (analyzer.hasValuesBelowMin()) {
                    if (pMinValueHasTagGenerateOnlyValidValues) {
                      return incompatiblePair;
                    }

                    return invalidMinPair;
                  } else {
                    return shouldGenerateValid ? validPair : incompatiblePair;
                  }
                }

                return incompatiblePair;
              }

            case DataTestCase.VALUE_JUST_ABOVE_MIN:
            case DataTestCase.VALUE_MIN:
              {
                if (hasMinValue || isToFakeMinValue) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX:
            case DataTestCase.VALUE_MEDIAN:
              {
                if ((hasMinValue || isToFakeMinValue) && (hasMaxValue || isToFakeMaxValue)) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.VALUE_JUST_BELOW_MAX:
            case DataTestCase.VALUE_MAX:
              {
                if (hasMaxValue || isToFakeMaxValue) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.VALUE_ZERO:
              {
                if ((hasMinValue || isToFakeMinValue) && (hasMaxValue || isToFakeMaxValue)) {
                  if (analyzer.isZeroBetweenMinAndMax()) {
                    return shouldGenerateValid ? validPair : incompatiblePair;
                  }

                  if (pMinValueHasTagGenerateOnlyValidValues || pMaxValueHasTagGenerateOnlyValidValues) {
                    return incompatiblePair;
                  }

                  return analyzer.isZeroBelowMin() ? invalidMinPair : invalidMaxPair;
                }

                return incompatiblePair;
              }

            case DataTestCase.VALUE_JUST_ABOVE_MAX:
            case DataTestCase.VALUE_RANDOM_ABOVE_MAX:
            case DataTestCase.VALUE_GREATEST:
              {
                if (hasMaxValue || isToFakeMaxValue) {
                  if (analyzer.hasValuesAboveMax()) {
                    if (pMaxValueHasTagGenerateOnlyValidValues) {
                      return incompatiblePair;
                    }

                    return invalidMaxPair;
                  }

                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }
          }

          return incompatiblePair;
        }

      case DataTestCaseGroup.LENGTH:
        {
          const isRequired = this._uiePropExtractor.extractIsRequired(uie);

          const hasValueProperty = isDefined(pValue);
          const valueHasNegation = hasValueProperty && this.hasNegation(pValue);
          const shouldGenerateValid = !hasValueProperty || hasValueProperty && valueHasNegation;
          const hasMinLength = isDefined(pMinLength);
          const hasMaxLength = isDefined(pMaxLength);

          if (!hasMinLength && !hasMaxLength) {
            return incompatiblePair;
          }

          let [minLength, isToFakeMinLength] = hasMinLength ? this.resolvePropertyValue(UIPropertyTypes.MIN_LENGTH, pMinLength, valueType) : [null, false];
          let [maxLength, isToFakeMaxLength] = hasMaxLength ? this.resolvePropertyValue(UIPropertyTypes.MAX_LENGTH, pMaxLength, valueType) : [null, false];

          if (isToFakeMinLength) {
            minLength = 2;
          }

          if (isToFakeMaxLength) {
            maxLength = 60;
          }

          let analyzer = this._dataGenBuilder.rawAnalyzer(valueType, minLength, maxLength);

          const invalidMinPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMinLength ? pMinLength.otherwiseSentences || [] : []);
          const invalidMaxPair = new DTCAnalysisData(DTCAnalysisResult.INVALID, hasMaxLength ? pMaxLength.otherwiseSentences || [] : []);

          switch (dtc) {
            case DataTestCase.LENGTH_LOWEST:
            case DataTestCase.LENGTH_RANDOM_BELOW_MIN:
            case DataTestCase.LENGTH_JUST_BELOW_MIN:
              {
                if (isRequired) {
                  if (dtc === DataTestCase.LENGTH_LOWEST) {
                    return incompatiblePair;
                  }

                  if (dtc === DataTestCase.LENGTH_RANDOM_BELOW_MIN && 2 === minLength && !isToFakeMinLength) {
                    return incompatiblePair;
                  }

                  if (dtc === DataTestCase.LENGTH_JUST_BELOW_MIN && 1 === minLength && !isToFakeMinLength) {
                    return incompatiblePair;
                  }
                }

                if (hasMinLength || isToFakeMinLength) {
                  if (analyzer.hasValuesBelowMin()) {
                    if (pMinLengthHasTagGenerateOnlyValidValues) {
                      return incompatiblePair;
                    }

                    return invalidMinPair;
                  }

                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.LENGTH_JUST_ABOVE_MIN:
            case DataTestCase.LENGTH_MIN:
              {
                if (hasMinLength || isToFakeMinLength) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX:
            case DataTestCase.LENGTH_MEDIAN:
              {
                if ((hasMinLength || isToFakeMinLength) && (hasMaxLength || isToFakeMaxLength)) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.LENGTH_JUST_BELOW_MAX:
            case DataTestCase.LENGTH_MAX:
              {
                if (hasMaxLength || isToFakeMaxLength) {
                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }

            case DataTestCase.LENGTH_JUST_ABOVE_MAX:
            case DataTestCase.LENGTH_RANDOM_ABOVE_MAX:
            case DataTestCase.LENGTH_GREATEST:
              {
                if (hasMaxLength || isToFakeMaxLength) {
                  if (analyzer.hasValuesAboveMax()) {
                    if (pMaxLengthHasTagGenerateOnlyValidValues) {
                      return incompatiblePair;
                    }

                    return invalidMaxPair;
                  }

                  return shouldGenerateValid ? validPair : incompatiblePair;
                }

                return incompatiblePair;
              }
          }

          return incompatiblePair;
        }

      case DataTestCaseGroup.COMPUTATION:
        {
          return incompatiblePair;
        }

      default:
        return incompatiblePair;
    }
  }

  resolvePropertyValue(propType, uip, valueType) {
    if (!uip) {
      return [null, false];
    }

    switch (uip.value.entity) {
      case Entities.CONSTANT:
        {
          const constant = uip.value.references[0];

          if (isDefined(constant)) {
            return [adjustValueToTheRightType(constant.value), false];
          }

          return [null, false];
        }

      case Entities.QUERY:
      case Entities.UI_ELEMENT_REF:
        {
          return [null, true];
        }

      default:
        return [uip.value.value, false];
    }
  }

  hasNegation(uip) {
    return this._nlpUtil.hasEntityNamed(Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult);
  }

}

const ACTION_TARGET_MAP = new Map([[Actions.ACCEPT, ActionTargets.NONE], [Actions.AM_ON, ActionTargets.URL], [Actions.APPEND, ActionTargets.LISTBOX], [Actions.ATTACH_FILE, ActionTargets.DIV], [Actions.CANCEL, ActionTargets.NONE], [Actions.CHECK, ActionTargets.CHECKBOX], [Actions.CLEAR, ActionTargets.TEXTBOX], [Actions.CLICK, ActionTargets.BUTTON], [Actions.CLOSE, ActionTargets.WINDOW], [Actions.CONNECT, ActionTargets.DATABASE], [Actions.DISCONNECT, ActionTargets.DATABASE], [Actions.DOUBLE_CLICK, ActionTargets.IMAGE], [Actions.DRAG, ActionTargets.IMAGE], [Actions.FILL, ActionTargets.TEXTBOX], [Actions.HIDE, ActionTargets.TEXTBOX], [Actions.INSTALL, ActionTargets.NONE], [Actions.MAXIMIZE, ActionTargets.WINDOW], [Actions.MOVE, ActionTargets.CURSOR], [Actions.MOUSE_OUT, ActionTargets.CURSOR], [Actions.MOUSE_OVER, ActionTargets.CURSOR], [Actions.OPEN, ActionTargets.URL], [Actions.PRESS, ActionTargets.KEY], [Actions.PULL, ActionTargets.TEXT], [Actions.REFRESH, ActionTargets.CURRENT_PAGE], [Actions.REMOVE, ActionTargets.TEXT], [Actions.RESIZE, ActionTargets.WINDOW], [Actions.RIGHT_CLICK, ActionTargets.IMAGE], [Actions.ROTATE, ActionTargets.TEXT], [Actions.RUN, ActionTargets.NONE], [Actions.SAVE_SCREENSHOT, ActionTargets.NONE], [Actions.SCROLL_TO, ActionTargets.CURRENT_PAGE], [Actions.SEE, ActionTargets.TEXT], [Actions.SELECT, ActionTargets.SELECT], [Actions.SHAKE, ActionTargets.NONE], [Actions.SWIPE, ActionTargets.SCREEN], [Actions.SWITCH, ActionTargets.FRAME], [Actions.TAP, ActionTargets.BUTTON], [Actions.UNCHECK, ActionTargets.CHECKBOX], [Actions.UNINSTALL, ActionTargets.NONE], [Actions.WAIT, ActionTargets.TEXT]]);

function bestMatch(text, values, comparingFunction) {
  const matches = sortedMatches(text, values, comparingFunction);
  const [first] = matches;
  return first || null;
}
function sortedMatches(text, values, comparingFunction) {
  if (!text || !values || values.length < 1 || !comparingFunction) {
    return [];
  }

  return values.map((v, i) => ({
    value: v,
    index: i,
    rating: comparingFunction(text, v)
  })).sort((a, b) => b.rating - a.rating);
}

function matches(regex, text, ignoresFullMatch = false) {
  let rx = regex.global ? regex : new RegExp(regex.source, 'g');
  let results = [];
  let match = null;

  while ((match = rx.exec(text)) !== null) {
    results.push.apply(results, ignoresFullMatch ? match.filter((val, idx) => !!val && idx > 0) : match.filter(val => !!val));
    rx.lastIndex = match.index + (match[0].length || 1);
  }

  return results;
}

const pAll = (iterable, options) => pMap(iterable, element => element(), options);
const runAllWithoutThrow = async (iterable, options, errors = []) => {
  try {
    await pAll(iterable, options);
  } catch (err) {
    if (err['_errors']) {
      for (const individualError of err['_errors']) {
        errors.push(individualError.message);
      }
    } else {
      errors.push(err);
    }
  }
};

function packageManagers() {
  return ['npm', 'yarn', 'pnpm'];
}
function makePackageInstallCommand(pkgName, tool = 'npm') {
  switch (tool) {
    case 'yarn':
      return 'yarn add -D --silent ' + pkgName;

    case 'pnpm':
      return 'pnpm add -D ' + pkgName;

    default:
      return 'npm i -D ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
  }
}
function makePackageUninstallCommand(pkgName, tool = 'npm') {
  switch (tool) {
    case 'yarn':
      return 'yarn remove --silent ' + pkgName;

    case 'pnpm':
      return 'pnpm remove ' + pkgName;

    default:
      return 'npm uninstall ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
  }
}
function makePackageInitCommand(tool = 'npm') {
  switch (tool) {
    case 'yarn':
      return 'yarn init --yes';

    case 'pnpm':
      return 'npm init --yes';

    default:
      return 'npm init --yes';
  }
}
function makeLockFileName(tool = 'npm') {
  switch (tool) {
    case 'yarn':
      return 'yarn.lock';

    case 'pnpm':
      return 'pnpm-lock.yaml';

    default:
      return 'package-lock.json';
  }
}
function makeDatabasePackageNameFor(databaseOrPackageName) {
  const prefix = 'database-js-';
  return databaseOrPackageName.startsWith(prefix) ? databaseOrPackageName : prefix + databaseOrPackageName;
}
function joinDatabasePackageNames(databasesOrPackageNames) {
  return databasesOrPackageNames.map(makeDatabasePackageNameFor).join(' ');
}

function removeDuplicated(arr, areEqual = (a, b) => a === b) {
  let removeCount = 0;

  for (let end = arr.length; end >= 0; --end) {
    const down = arr[end];

    if (undefined === down) {
      continue;
    }

    for (let d = end - 1; d >= 0; --d) {
      const prior = arr[d];

      if (prior !== undefined && areEqual(down, prior)) {
        arr.splice(end, 1);
        ++removeCount;
        break;
      }
    }
  }

  return removeCount;
}

async function runCommand(command) {
  const options = {
    shell: true
  };
  let cmds = command.match(/[^"\s]+|"(?:\\"|[^"])+"/g).map(expr => {
    return expr.charAt(0) === '"' && expr.charAt(expr.length - 1) === '"' ? expr.slice(1, -1) : expr;
  });
  const runCMD = cmds[0];
  cmds.shift();
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(runCMD, cmds, options);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      console.log(chunk.toString());
    });
    child.stderr.on('data', chunk => {
      console.warn(chunk.toString());
    });
    child.on('exit', code => {
      resolve(code);
    });
  });
}

function millisToObject(ms) {
  if (ms < 1000) {
    return {
      ms: ms
    };
  }

  var _ms = ms % 1000;

  var factor = Math.floor(ms / 1000);

  var _sec = factor % 60;

  factor = Math.floor(factor / 60);

  var _min = factor % 60;

  if (0 === _min) {
    return {
      sec: _sec,
      ms: _ms
    };
  }

  factor = Math.floor(factor / 60);

  var _hour = factor % 60;

  if (0 === _hour) {
    return {
      min: _min,
      sec: _sec,
      ms: _ms
    };
  }

  factor = Math.floor(factor / 24);

  var _day = factor % 24;

  if (0 === _day) {
    return {
      hour: _hour,
      min: _min,
      sec: _sec,
      ms: _ms
    };
  }

  return {
    day: _day,
    hour: _hour,
    min: _min,
    sec: _sec,
    ms: _ms
  };
}
function millisObjectToString(o, i18n, separator) {
  i18n = i18n || {};
  separator = separator || '';
  var s = [];
  if (o.day) s.push(o.day + (i18n.day !== undefined ? i18n.day : 'd'));
  if (o.hour) s.push(o.hour + (i18n.hour !== undefined ? i18n.hour : 'h'));
  if (o.min) s.push(o.min + (i18n.min !== undefined ? i18n.min : 'm'));
  if (o.sec) s.push(o.sec + (i18n.sec !== undefined ? i18n.sec : 's'));
  if (o.ms) s.push(o.ms + (i18n.ms !== undefined ? i18n.ms : 'ms'));
  return s.join(separator);
}
function millisToString(ms, i18n, separator) {
  return millisObjectToString(millisToObject(ms), i18n, separator);
}

class UIElementNameHandler {
  extractFeatureNameOf(variable) {
    return this.extractNamesOf(variable)[0];
  }

  extractVariableNameOf(variable) {
    return this.extractNamesOf(variable)[1];
  }

  extractNamesOf(variable) {
    const v = variable.replace(Symbols.UI_ELEMENT_PREFIX, '').replace(Symbols.UI_ELEMENT_SUFFIX, '').trim();
    const index = v.indexOf(Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);

    if (index < 0) {
      return [null, v];
    }

    if (1 === v.length) {
      return [null, null];
    }

    return v.split(Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);
  }

  makeVariableName(featureName, uiElementName, surroundVariable = false) {
    const variable = (isDefined(featureName) ? featureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR : '') + uiElementName;

    if (!surroundVariable) {
      return variable;
    }

    return Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX;
  }

}

class SqlHelper {
  constructor() {
    this._valueTypeDetector = new ValueTypeDetector();
  }

  generateUse(name) {
    return 'USE `' + name + '`;';
  }

  generateCreate(name, columns) {
    return 'CREATE TABLE IF NOT EXISTS `' + name + '` ' + '( `' + columns.join('`, `') + '` );';
  }

  generateCreateWithTypes(name, sqlColumns) {
    return 'CREATE TABLE IF NOT EXISTS `' + name + '` ( ' + sqlColumns.join(', ') + ' );';
  }

  generateDrop(name) {
    return 'DROP TABLE `' + name + '`;';
  }

  generateParameterizedInsert(name, columns) {
    return 'INSERT INTO `' + name + '` VALUES ( ' + columns.map(v => '?').join(', ') + ' );';
  }

  generateInsert(name, values) {
    return 'INSERT INTO `' + name + '` VALUES ' + this.linesToSqlInsertValues(values) + ';';
  }

  lineToSqlInsertValues(line) {
    let content = [];

    for (let val of line) {
      if (this._valueTypeDetector.isBoolean(val)) {
        content.push(val);
      } else if (this._valueTypeDetector.isDouble(val)) {
        content.push(parseFloat(val));
      } else if (this._valueTypeDetector.isInteger(val)) {
        content.push(parseInt(val));
      } else {
        content.push('"' + val + '"');
      }
    }

    return '( ' + content.join(', ') + ' )';
  }

  linesToSqlInsertValues(lines) {
    return lines.map(val => this.lineToSqlInsertValues(val)).join(', ');
  }

  convertToSQLType(t) {
    switch (t) {
      case ValueType.BOOLEAN:
        return 'BOOLEAN';

      case ValueType.DOUBLE:
        return 'DOUBLE';

      case ValueType.INTEGER:
        return 'INT';

      case ValueType.DATE:
        return 'DATE';

      case ValueType.LONG_TIME:
      case ValueType.TIME:
        return 'TIME';

      case ValueType.LONG_DATE_TIME:
      case ValueType.DATE_TIME:
        return 'DATETIME';

      default:
        return 'STRING';
    }
  }

  generateSqlColumns(columns, sqlTypes) {
    const typesLen = sqlTypes.length;
    let i = 0,
        sqlColumns = [];

    for (let col of columns) {
      if (i < typesLen) {
        sqlColumns.push('`' + col + '` ' + sqlTypes[i]);
      } else {
        sqlColumns.push('`' + col + '` STRING');
      }

      ++i;
    }

    return sqlColumns;
  }

}

class AlaSqlTableCreator {
  constructor() {
    this._sqlHelper = new SqlHelper();
    this._valueTypeDetector = new ValueTypeDetector();
  }

  async createTableFromNode(dbConnection, table) {
    const rowCount = table.rows.length;

    if (rowCount < 2) {
      const msg = `Table "${table.name}" must have at least two rows: the first one with column names and second one with values.`;
      throw new RuntimeException(msg, table.location);
    }

    const columnRow = table.rows[0];
    const valTypes = this.detectTableColumnTypes(table);
    const sqlTypes = valTypes.map(v => this._sqlHelper.convertToSQLType(v));

    const sqlColumns = this._sqlHelper.generateSqlColumns(columnRow.cells, sqlTypes);

    const createCommand = this._sqlHelper.generateCreateWithTypes(table.internalName, sqlColumns);

    try {
      dbConnection.exec(createCommand);
    } catch (e) {
      const msg = `Error creating the table "${table.name}": ${e.message}`;
      throw new RuntimeException(msg, table.location);
    }

    const insertCommand = this._sqlHelper.generateParameterizedInsert(table.internalName, columnRow.cells);

    let insert = alasql.compile(insertCommand);

    if (!isDefined(insert)) {
      const msg = `Error compiling the insert command at the table "${table.name}".`;
      throw new RuntimeException(msg, table.location);
    }

    for (let i = 1; i < rowCount; ++i) {
      const row = table.rows[i];

      try {
        let params = this.adjustValuesToTheRightTypes(row.cells, valTypes);
        insert(params);
      } catch (e) {
        const msg = `Error inserting values in the table "${table.name}": ${e.message}`;
        throw new RuntimeException(msg, table.location);
      }
    }

    return true;
  }

  detectTableColumnTypes(table) {
    let valTypes = [];
    const rowCount = table.rows.length;

    for (let i = 1; i < rowCount; ++i) {
      let row = table.rows[i];

      let currentTypes = this._valueTypeDetector.detectAll(row.cells);

      if (valTypes.length < 1) {
        valTypes = currentTypes;
        continue;
      }

      for (let j = 0; j < currentTypes.length; ++j) {
        if (currentTypes[j] === valTypes[j]) {
          continue;
        }

        if (currentTypes[j] === ValueType.STRING) {
          valTypes[j] = currentTypes[j];
        }
      }
    }

    return valTypes;
  }

  adjustValuesToTheRightTypes(values, types) {
    const typesLen = types.length;
    let i = 0,
        adjusted = [];

    for (let val of values) {
      if (i < typesLen) {
        adjusted.push(this.adjustValueToTheRightType(val, types[i]));
      } else {
        adjusted.push(val);
      }

      ++i;
    }

    return adjusted;
  }

  adjustValueToTheRightType(value, type) {
    const detectedType = this._valueTypeDetector.detect(value);

    switch (detectedType) {
      case ValueType.BOOLEAN:
        return this._valueTypeDetector.isTrue(value);

      case ValueType.INTEGER:
        return parseInt(value);

      case ValueType.DOUBLE:
        return parseFloat(value);

      default:
        return value;
    }
  }

}

class AlaSqlDatabaseInterface {
  constructor() {
    this._sqlHelper = new SqlHelper();
  }

  hasFileBasedDriver(databaseType) {
    const dbType = databaseType.toLowerCase();
    return 'memory' === dbType || 'alasql' === dbType;
  }

  async isConnected() {
    return true;
  }

  async connect(db, basePath) {
    this._db = db;
    this._basePath = basePath;
    this.dbConnection = new alasql.Database(db.name);
    alasql(this._sqlHelper.generateUse(db.name));
    return true;
  }

  async disconnect() {
    return true;
  }

  async reconnect() {
    if (await this.isConnected()) {
      await this.disconnect();
    }

    if (!this._db) {
      return false;
    }

    return await this.connect(this._db, this._basePath);
  }

  async exec(cmd, params) {
    return new Promise((resolve, reject) => {
      if (!this.dbConnection) {
        let e = new Error('Database is not connected.');
        return reject(e);
      }

      try {
        this.dbConnection.exec(cmd, params, data => resolve(data));
      } catch (e) {
        reject(e);
      }
    });
  }

  async createTable(table) {
    if (!this.dbConnection) {
      throw new Error('Database is not connected.');
    }

    const creator = new AlaSqlTableCreator();
    return await creator.createTableFromNode(this.dbConnection, table);
  }

  async query(cmd, params) {
    const removeProblematicChars = s => s;

    let p = params;

    if (p !== undefined) {
      if (Array.isArray(p)) {
        p = p.map(removeProblematicChars);
      }
    }

    return await this.exec(cmd, params);
  }

}

class ConnectionCheckResult {
  constructor(success = false, resultsMap = {}) {
    this.success = success;
    this.resultsMap = resultsMap;
  }

  succeededResults() {
    let results = [];

    for (let name in this.resultsMap) {
      let r = this.resultsMap[name];

      if (r.success) {
        results.push(r);
      }
    }

    return results;
  }

}

var DatabaseType;

(function (DatabaseType) {
  DatabaseType["MYSQL"] = "mysql";
  DatabaseType["POSTGRESQL"] = "postgres";
  DatabaseType["SQLITE"] = "sqlite";
  DatabaseType["ADO"] = "adodb";
  DatabaseType["FIREBASE"] = "firebase";
  DatabaseType["INI"] = "ini";
  DatabaseType["EXCEL"] = "xlsx";
  DatabaseType["CSV"] = "csv";
  DatabaseType["JSON"] = "json";
  DatabaseType["MSSQL"] = "mssql";
})(DatabaseType || (DatabaseType = {}));

function isPathBasedDatabaseType(dbType) {
  return [DatabaseType.SQLITE.toString(), DatabaseType.ADO.toString(), DatabaseType.INI.toString(), DatabaseType.EXCEL.toString(), DatabaseType.CSV.toString(), DatabaseType.JSON.toString()].indexOf(stringToDatabaseTypeString(dbType)) >= 0;
}
function stringToDatabaseTypeString(dbType) {
  if (!dbType) {
    return 'unknown';
  }

  const lowerCasedType = dbType.toLowerCase();

  if (isValue(DatabaseType, lowerCasedType)) {
    return lowerCasedType;
  }

  switch (lowerCasedType) {
    case 'postgresql':
      return DatabaseType.POSTGRESQL;

    case 'ado':
      return DatabaseType.ADO;

    case 'xls':
      return DatabaseType.EXCEL;

    case 'sqlserver':
    case 'mssqlserver':
      return DatabaseType.MSSQL;

    default:
      return 'unknown';
  }
}
function supportTablesInQueries(dbType) {
  return [DatabaseType.CSV.toString(), DatabaseType.JSON.toString()].indexOf(stringToDatabaseTypeString(dbType)) < 0;
}

class DatabaseToAbstractDatabase {
  convertFromNode(db, basePath) {
    let dbItems = {};

    if (db.items) {
      for (let item of db.items) {
        dbItems[item.property] = item.value;
      }
    }

    if (!dbItems[DatabaseProperties.PATH]) {
      dbItems[DatabaseProperties.PATH] = db.name;
    }

    const driverType = stringToDatabaseTypeString(dbItems[DatabaseProperties.TYPE]);

    if (isPathBasedDatabaseType(driverType)) {
      dbItems[DatabaseProperties.PATH] = resolve(basePath ? basePath : process.cwd(), dbItems[DatabaseProperties.PATH]);
    }

    return this.makeAbstractDatabase(driverType, dbItems);
  }

  makeAbstractDatabase(driverType, dbItems) {
    const adb = {
      driverName: driverType,
      username: dbItems[DatabaseProperties.USERNAME],
      password: dbItems[DatabaseProperties.PASSWORD],
      hostname: dbItems[DatabaseProperties.HOST],
      port: dbItems[DatabaseProperties.PORT],
      database: dbItems[DatabaseProperties.PATH],
      parameters: dbItems[DatabaseProperties.OPTIONS]
    };
    return adb;
  }

}

class DatabaseJSDatabaseInterface {
  constructor() {
    this._dbConnection = null;
    this._db = null;

    this.hasFileBasedDriver = databaseType => {
      return isPathBasedDatabaseType(databaseType);
    };
  }

  async isConnected() {
    return !!this._dbConnection;
  }

  async connect(db, basePath) {
    this._db = db;
    this._basePath = basePath;
    this._dbConnection = this.createConnectionFromNode(db, basePath);
    return true;
  }

  async disconnect() {
    if (!this._dbConnection) {
      throw this.dbiError();
    }

    if (!!this._dbConnection.close) {
      return await this._dbConnection.close();
    }

    return true;
  }

  async reconnect() {
    if (!this._dbConnection) {
      throw this.dbiError();
    }

    if (await this.isConnected()) {
      await this.disconnect();
    }

    return await this.connect(this._db, this._basePath);
  }

  async exec(cmd, params) {
    if (!params) {
      return this._dbConnection.prepareStatement(cmd).execute();
    }

    return this._dbConnection.prepareStatement(cmd).execute(...params);
  }

  async createTable(table) {
    throw new Error('Table creation not supported for the DatabaseJS interface.');
  }

  async query(cmd, params) {
    if (!params) {
      return this._dbConnection.prepareStatement(cmd).query();
    }

    return this._dbConnection.prepareStatement(cmd).query(...params);
  }

  createConnectionFromNode(db, basePath) {
    let conversor = new DatabaseToAbstractDatabase();
    let absDB = conversor.convertFromNode(db, basePath);
    return new dbjs.Connection(absDB);
  }

  dbiError() {
    return new Error('Internal database interface not instantiated.');
  }

}

class DatabaseConnectionChecker {
  constructor() {
    this.createDBI = db => {
      return new DatabaseJSDatabaseInterface();
    };
  }

  async check(spec, problems, disconnectAfterConnecting = false) {
    let r = new ConnectionCheckResult(true);

    for (let doc of spec.docs) {
      if (!doc.databases) {
        continue;
      }

      for (let db of doc.databases) {
        let dbi = this.createDBI(db);
        let cr = {
          success: true,
          errors: [],
          databaseName: db.name,
          dbi: dbi
        };
        r.resultsMap[db.name] = cr;

        try {
          await dbi.connect(db, spec.basePath);
        } catch (err) {
          r.success = false;
          cr.success = false;
          const msg = 'Could not connect to the database "' + db.name + '". Reason: ' + err.message;
          const e = new RuntimeException(msg, db.location);
          cr.errors.push(e);
          problems.addWarning(doc.fileInfo.path, e);
          continue;
        }

        if (!disconnectAfterConnecting) {
          continue;
        }

        try {
          if (await dbi.isConnected()) {
            await dbi.disconnect();
          }
        } catch (err) {
          const msg = 'Error while disconnecting from database "' + db.name + '". Details: ' + err.message + ' at ' + err.stack;
          const e = new RuntimeException(msg, db.location);
          cr.errors.push(e);
          problems.addWarning(doc.fileInfo.path, e);
        }
      }
    }

    return r;
  }

}

class QueryParser {
  parseAnyVariables(command) {
    const regex = /(?:\{)([^}]+)(?:\})/g;
    return matches(regex, command, true);
  }

  parseAnyNames(command) {
    const regex = /(?:\[)([^\$\]]+)(?:\])/g;
    return matches(regex, command, true);
  }

  makeVariableRegex(name) {
    return new RegExp('(?:\\{)(' + name + ')(?:\\})', 'gui');
  }

  makeNameRegex(name, replaceDot = false) {
    let exp = '(?:\\[)(' + name + ')(?:\\])';

    if (replaceDot) {
      exp += '\.?';
    }

    return new RegExp(exp, 'gui');
  }

}

class DocumentUtil {
  constructor() {
    this._uieNameHandler = new UIElementNameHandler();
    this._uiePropExtractor = new UIElementPropertyExtractor();
  }

  mapVariantsOf(doc) {
    let map = new Map();

    if (!isDefined(doc.feature)) {
      return map;
    }

    for (let sc of doc.feature.scenarios) {
      for (let v of sc.variants || []) {
        map.set(v, sc);
      }
    }

    return map;
  }

  findUIElementInTheDocument(variable, doc) {
    const [featureName, uiElementName] = this._uieNameHandler.extractNamesOf(variable);

    if (isDefined(featureName)) {
      if (!isDefined(doc.feature)) {
        return null;
      }

      if (featureName.toLowerCase() !== doc.feature.name.toLowerCase()) {
        return null;
      }
    }

    const lowerCasedUIElementName = uiElementName.toLowerCase();

    if (isDefined(doc.feature)) {
      for (let uie of doc.feature.uiElements || []) {
        if (uie.name.toLowerCase() === lowerCasedUIElementName) {
          if (!uie.info) {
            uie.info = {};
          }

          if (!uie.info.fullVariableName) {
            uie.info.fullVariableName = this._uieNameHandler.makeVariableName(doc.feature.name, uiElementName, false);
          }

          return uie;
        }
      }
    }

    for (let uie of doc.uiElements || []) {
      if (uie.name.toLowerCase() === lowerCasedUIElementName) {
        return uie;
      }
    }

    return null;
  }

  mapUIElementVariables(doc, map, keepItLocal = false, caseOption = CaseType.CAMEL) {
    if (!doc) {
      return;
    }

    for (let uie of doc.uiElements || []) {
      const uiLiteral = this._uiePropExtractor.extractId(uie, caseOption);

      if (!uie.info) {
        uie.info = new UIElementInfo(doc, uiLiteral, null);
      }

      const variableName = this._uieNameHandler.makeVariableName(null, uie.name);

      uie.info.fullVariableName = variableName;
      map.set(variableName, uie);
    }

    if (!doc.feature) {
      return;
    }

    for (let uie of doc.feature.uiElements || []) {
      const uiLiteral = this._uiePropExtractor.extractId(uie, caseOption);

      const featureName = !keepItLocal ? doc.feature.name : null;

      if (!uie.info) {
        uie.info = new UIElementInfo(doc, uiLiteral, doc.feature);
      }

      const variableName = this._uieNameHandler.makeVariableName(featureName, uie.name);

      uie.info.fullVariableName = variableName;
      map.set(variableName, uie);
    }
  }

  extractDocumentVariables(doc, includeGlobals = false) {
    let variables = [];

    if (includeGlobals && (doc.uiElements || []).length > 0) {
      for (let uie of doc.uiElements) {
        variables.push(uie.name);
      }
    }

    const featureName = !doc.feature ? null : doc.feature.name;

    if (null === featureName) {
      return variables;
    }

    for (let uie of doc.feature.uiElements || []) {
      variables.push(this._uieNameHandler.makeVariableName(featureName, uie.name));
    }

    return variables;
  }

  extractUIElements(doc, includeGlobals = false) {
    let elements = [];

    if (includeGlobals && (doc.uiElements || []).length > 0) {
      for (let uie of doc.uiElements) {
        elements.push(uie);
      }
    }

    if (!doc.feature) {
      return elements;
    }

    for (let uie of doc.feature.uiElements || []) {
      elements.push(uie);
    }

    return elements;
  }

}

class MappedContent {
  constructor() {
    this.feature = false;
    this.database = false;
    this.constant = false;
    this.uiElement = false;
    this.table = false;
  }

}

const IN_MEMORY_DATABASE_NAME = '___concordia___';
class AugmentedSpec extends Spec {
  constructor(basePath) {
    super(basePath);
    this._docFullyMapped = new Map();
    this._pathToDocCache = new Map();
    this._databaseCache = null;
    this._constantCache = null;
    this._tableCache = null;
    this._featureCache = null;
    this._uiElementCache = null;
    this._nonFeatureNamesCache = null;
    this._constantNameToValueMap = new Map();
    this._uiElementVariableMap = new Map();
    this._databaseNameToInterfaceMap = new Map();
    this._uiLiteralCaseOption = CaseType.CAMEL;
    this._docToAccessibleUIElementsCache = new Map();

    this.databaseNames = (rebuildCache = false) => {
      return this.databases(rebuildCache).map(db => db.name);
    };
  }

  get uiLiteralCaseOption() {
    return this._uiLiteralCaseOption;
  }

  set uiLiteralCaseOption(option) {
    this._uiLiteralCaseOption = option;
  }

  clearCache(clearPathToDocCache = false) {
    if (clearPathToDocCache) {
      this._pathToDocCache.clear();
    }

    this._databaseCache = null;
    this._constantCache = null;
    this._tableCache = null;
    this._featureCache = null;
    this._uiElementCache = null;
    this._nonFeatureNamesCache = null;

    this._constantNameToValueMap.clear();

    this._uiElementVariableMap.clear();

    this._databaseNameToInterfaceMap.clear();

    this._docFullyMapped.clear();
  }

  mapAllDocuments() {
    for (let doc of this.docs) {
      this.mapEverythingFromDocument(doc);
    }
  }

  addDocument(...docs) {
    for (const doc of docs) {
      if (this.addToDocPath(doc)) {
        this.docs.push(doc);
        this.mapEverythingFromDocument(doc);
      }
    }
  }

  indexOfDocWithPath(path) {
    const formattedPath = this.formatPath(path);
    const doc = this._pathToDocCache.get(formattedPath) || null;
    return doc ? this.docs.indexOf(doc) : -1;
  }

  replaceDocByIndex(index, newDoc) {
    const path = newDoc.fileInfo.path;
    const pathIndex = this.indexOfDocWithPath(path);

    if (pathIndex != index) {
      return false;
    }

    this.docs.splice(index, 1, newDoc);
    const formattedPath = this.formatPath(path);

    this._pathToDocCache.set(formattedPath, newDoc);

    return true;
  }

  formatPath(path) {
    return toUnixPath(resolve(dirname(this.basePath), path)).toLowerCase();
  }

  addToDocPath(doc) {
    var _doc$fileInfo;

    const path = this.formatPath((doc == null ? void 0 : (_doc$fileInfo = doc.fileInfo) == null ? void 0 : _doc$fileInfo.path) || '');

    if (this._pathToDocCache.has(path)) {
      return false;
    }

    this._pathToDocCache.set(path, doc);

    return true;
  }

  rebuildDocPath() {
    this._pathToDocCache.clear();

    for (const doc of this.docs) {
      this.addToDocPath(doc);
    }
  }

  assureDoc(doc) {
    let mc = this._docFullyMapped.get(doc);

    if (!isDefined(mc)) {
      mc = new MappedContent();

      this._docFullyMapped.set(doc, mc);
    }

    return mc;
  }

  databaseNameToInterfaceMap() {
    return this._databaseNameToInterfaceMap;
  }

  mapDocumentDatabases(doc) {
    if (!doc || this.assureDoc(doc).database) {
      return;
    }

    if (!doc.databases) {
      this.assureDoc(doc).database = true;
      return;
    }

    if (!this._databaseCache) {
      this._databaseCache = [];
    }

    for (let db of doc.databases) {
      if (!db.location.filePath && doc.fileInfo) {
        db.location.filePath = doc.fileInfo.path || '';
      }

      this._databaseCache.push(db);
    }

    this.assureDoc(doc).database = true;
  }

  mapDocumentConstants(doc) {
    if (!doc || this.assureDoc(doc).constant) {
      return;
    }

    if (!doc.constantBlock || !doc.constantBlock.items) {
      this.assureDoc(doc).constant = true;
      return;
    }

    if (!this._constantCache) {
      this._constantCache = [];
    }

    for (let ct of doc.constantBlock.items) {
      if (!ct.location.filePath && doc.fileInfo) {
        ct.location.filePath = doc.fileInfo.path || '';
      }

      this._constantCache.push(ct);

      this._constantNameToValueMap.set(ct.name, ct.value);
    }

    this.assureDoc(doc).constant = true;
  }

  mapDocumentTables(doc) {
    if (!doc || this.assureDoc(doc).table) {
      return;
    }

    if (!doc.tables) {
      this.assureDoc(doc).table = true;
      return;
    }

    if (!this._tableCache) {
      this._tableCache = [];
    }

    for (let tbl of doc.tables) {
      if (!tbl.location.filePath && doc.fileInfo) {
        tbl.location.filePath = doc.fileInfo.path || '';
      }

      this._tableCache.push(tbl);
    }

    this.assureDoc(doc).table = true;
  }

  mapDocumentFeatures(doc) {
    if (!doc || this.assureDoc(doc).feature) {
      return;
    }

    if (!doc.feature) {
      this.assureDoc(doc).feature = true;
      return;
    }

    if (!this._featureCache) {
      this._featureCache = [];
    }

    if (isDefined(doc.feature.location) && !isDefined(doc.feature.location.filePath) && isDefined(doc.fileInfo)) {
      doc.feature.location.filePath = doc.fileInfo.path || '';
    }

    this._featureCache.push(doc.feature);

    this.assureDoc(doc).feature = true;
  }

  mapDocumentUIElementVariables(doc) {
    if (!doc || this.assureDoc(doc).uiElement) {
      return;
    }

    new DocumentUtil().mapUIElementVariables(doc, this._uiElementVariableMap, false, this._uiLiteralCaseOption);

    if (!doc.uiElements || doc.uiElements.length < 1) {
      this.assureDoc(doc).uiElement = true;
      return;
    }

    if (!this._uiElementCache) {
      this._uiElementCache = [];
    }

    this._uiElementCache.push.apply(this._uiElementCache, doc.uiElements);

    this.assureDoc(doc).uiElement = true;
  }

  mapEverythingFromDocument(doc) {
    if (!doc) {
      return;
    }

    this.mapDocumentFeatures(doc);
    this.mapDocumentConstants(doc);
    this.mapDocumentDatabases(doc);
    this.mapDocumentTables(doc);
    this.mapDocumentUIElementVariables(doc);
  }

  docWithPath(filePath, referencePath = '.', rebuildCache = false) {
    if (!isDefined(this._pathToDocCache) || rebuildCache) {
      this.rebuildDocPath();
    }

    const path = resolve(dirname(referencePath), filePath);
    const targetFile = this.formatPath(path);

    let doc = this._pathToDocCache.get(targetFile);

    return doc || null;
  }

  constantWithName(name, rebuildCache = false) {
    return this.findByName(name, this.constants(rebuildCache));
  }

  tableWithName(name, rebuildCache = false) {
    return this.findByName(name, this.tables(rebuildCache));
  }

  databaseWithName(name, rebuildCache = false) {
    return this.findByName(name, this.databases(rebuildCache));
  }

  featureWithName(name, rebuildCache = false) {
    return this.findByName(name, this.features(rebuildCache));
  }

  uiElementByVariable(variable, doc = null) {
    if (isDefined(doc)) {
      const docUtil = new DocumentUtil();
      const ui = docUtil.findUIElementInTheDocument(variable, doc);

      if (isDefined(ui)) {
        return ui;
      }

      return this.findUIElementInDocumentImports(variable, doc);
    }

    return this.uiElementsVariableMap(false).get(variable) || null;
  }

  findByName(name, nodes) {
    if (!name) {
      return null;
    }

    const lowerCasedName = name.toLowerCase();
    return valueOrNull(nodes.find(n => n.name ? n.name.toLowerCase() === lowerCasedName : false));
  }

  constantValue(name) {
    return valueOrNull(this.constantNameToValueMap().get(name));
  }

  databases(rebuildCache = false) {
    if (isDefined(this._databaseCache) && !rebuildCache) {
      return this._databaseCache;
    }

    this._databaseCache = [];

    for (let doc of this.docs) {
      this.mapDocumentDatabases(doc);
    }

    return this._databaseCache;
  }

  isConstantCacheFilled() {
    return isDefined(this._constantCache);
  }

  constants(rebuildCache = false) {
    if (this.isConstantCacheFilled() && !rebuildCache) {
      return this._constantCache;
    }

    return this.fillConstantsCache();
  }

  fillConstantsCache() {
    this._constantCache = [];

    for (let doc of this.docs) {
      this.mapDocumentConstants(doc);
    }

    return this._constantCache;
  }

  constantNameToValueMap() {
    if (!this.isConstantCacheFilled()) {
      this.fillConstantsCache();
    }

    return this._constantNameToValueMap;
  }

  constantNames() {
    return [...this.constantNameToValueMap().keys()];
  }

  tables(rebuildCache = false) {
    if (isDefined(this._tableCache) && !rebuildCache) {
      return this._tableCache;
    }

    this._tableCache = [];

    for (let doc of this.docs) {
      this.mapDocumentTables(doc);
    }

    return this._tableCache;
  }

  tableNames() {
    return this.tables().map(c => c.name);
  }

  features(rebuildCache = false) {
    if (isDefined(this._featureCache) && !rebuildCache) {
      return this._featureCache;
    }

    this._featureCache = [];

    for (let doc of this.docs) {
      this.mapDocumentFeatures(doc);
    }

    return this._featureCache;
  }

  featureNames() {
    return this.features().map(v => v.name);
  }

  nonFeatureNames(rebuildCache = false) {
    if (this._nonFeatureNamesCache !== null && !rebuildCache) {
      return this._nonFeatureNamesCache;
    }

    this._nonFeatureNamesCache = [];

    this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.databaseNames());

    this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.tableNames());

    this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.constantNames());

    return this._nonFeatureNamesCache;
  }

  uiElements(rebuildCache = false) {
    if (this._uiElementCache !== null && !rebuildCache) {
      return this._uiElementCache;
    }

    this._uiElementCache = [];

    this._uiElementVariableMap.clear();

    for (let doc of this.docs) {
      this.mapDocumentUIElementVariables(doc);
    }

    return this._uiElementCache;
  }

  uiElementsVariableMap(rebuildCache = false) {
    if (this._uiElementCache !== null && !rebuildCache) {
      return this._uiElementVariableMap;
    }

    this.uiElements(rebuildCache);
    return this._uiElementVariableMap;
  }

  findUIElementInDocumentImports(variable, doc) {
    if (!doc.imports || doc.imports.length < 1) {
      return null;
    }

    const uieNameHandler = new UIElementNameHandler();
    const [featureName] = uieNameHandler.extractNamesOf(variable);

    if (!isDefined(featureName) && doc.imports.length > 1) {
      return null;
    }

    const docUtil = new DocumentUtil();

    for (let impDoc of doc.imports) {
      let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);

      if (!otherDoc) {
        continue;
      }

      let uie = docUtil.findUIElementInTheDocument(variable, otherDoc);

      if (isDefined(uie)) {
        return uie;
      }
    }

    return null;
  }

  importedDocumentsOf(doc) {
    let docs = [];

    for (let impDoc of doc.imports || []) {
      let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);

      if (!otherDoc) {
        continue;
      }

      docs.push(otherDoc);
    }

    return docs;
  }

  extractVariablesFromDocumentAndImports(doc, includeGlobals = false) {
    const docUtil = new DocumentUtil();
    let variables = [];
    variables.push.apply(variables, docUtil.extractDocumentVariables(doc, includeGlobals));

    for (let impDoc of doc.imports || []) {
      let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);

      if (!otherDoc) {
        continue;
      }

      variables.push.apply(variables, docUtil.extractDocumentVariables(otherDoc, includeGlobals));
    }

    return variables;
  }

  extractUIElementsFromDocumentAndImports(doc, includeGlobals = false) {
    let elements = this._docToAccessibleUIElementsCache.get(doc) || null;

    if (isDefined(elements)) {
      return elements;
    }

    const docUtil = new DocumentUtil();
    elements = [];
    elements.push.apply(elements, docUtil.extractUIElements(doc, includeGlobals));

    for (let impDoc of doc.imports || []) {
      let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);

      if (!otherDoc) {
        continue;
      }

      elements.push.apply(elements, docUtil.extractUIElements(otherDoc, includeGlobals));
    }

    return elements;
  }

}

const {
  escape: escape$1
} = sqlstring;
class QueryReferenceReplacer {
  replaceConstantInQuery(query, variable, value) {
    const regex = this.makeNameRegex(variable);
    return query.replace(regex, this.wrapValue(value));
  }

  replaceUIElementInQuery(query, variable, value) {
    const regex = this.makeVarRegex(variable);
    return query.replace(regex, this.wrapValue(value));
  }

  replaceDatabaseInQuery(query, variable, removeFrom) {
    let newQuery = query;

    if (removeFrom) {
      const fromRegex = / from /gi;
      newQuery = query.replace(fromRegex, ' ');
    }

    const dbNameRegex = this.makeNameRegex(variable, true);
    return newQuery.replace(dbNameRegex, '');
  }

  replaceTableInQuery(query, variable, internalName) {
    const regex = this.makeNameRegex(variable);
    return query.replace(regex, internalName);
  }

  wrapValue(content) {
    return escape$1(content);
  }

  makeVarRegex(name) {
    return new QueryParser().makeVariableRegex(name);
  }

  makeNameRegex(name, replaceDot = false) {
    return new QueryParser().makeNameRegex(name, replaceDot);
  }

}

var UIElementOperator;

(function (UIElementOperator) {
  UIElementOperator["EQUAL_TO"] = "equalTo";
  UIElementOperator["IN"] = "in";
  UIElementOperator["COMPUTED_BY"] = "computedBy";
})(UIElementOperator || (UIElementOperator = {}));

var UIElementOperatorModifier;

(function (UIElementOperatorModifier) {
  UIElementOperatorModifier["NOT"] = "not";
})(UIElementOperatorModifier || (UIElementOperatorModifier = {}));

class UIElementOperatorChecker {
  constructor() {
    this.nlpUtil = new NLPUtil();
  }

  isEqualTo(uip) {
    return this.hasOperator(uip, UIElementOperator.EQUAL_TO) && !this.hasNot(uip);
  }

  isNotEqualTo(uip) {
    return this.hasOperator(uip, UIElementOperator.EQUAL_TO) && this.hasNot(uip);
  }

  isIn(uip) {
    return this.hasOperator(uip, UIElementOperator.IN) && !this.hasNot(uip);
  }

  isNotIn(uip) {
    return this.hasOperator(uip, UIElementOperator.IN) && this.hasNot(uip);
  }

  isComputedBy(uip) {
    return this.hasOperator(uip, UIElementOperator.COMPUTED_BY) && !this.hasNot(uip);
  }

  isNotComputedBy(uip) {
    return this.hasOperator(uip, UIElementOperator.COMPUTED_BY) && this.hasNot(uip);
  }

  hasOperator(uip, operator) {
    return this.nlpUtil.valuesOfEntitiesNamed(Entities.UI_CONNECTOR, uip.nlpResult).indexOf(operator) >= 0;
  }

  hasNot(uip) {
    return this.nlpUtil.valuesOfEntitiesNamed(Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult).indexOf(UIElementOperatorModifier.NOT) >= 0;
  }

}

class UIElementValueGenerator {
  constructor(_dataGen) {
    this._dataGen = _dataGen;
    this._queryRefReplacer = new QueryReferenceReplacer();
    this._uiePropExtractor = new UIElementPropertyExtractor();
    this._opChecker = new UIElementOperatorChecker();
    this._dbQueryCache = new Map();
    this._tblQueryCache = new Map();
  }

  async generate(uieName, context, doc, spec, errors) {
    const uieNameHandler = new UIElementNameHandler();
    const featureName = isDefined(doc) && isDefined(doc.feature) ? doc.feature.name : null;
    const fullVariableName = featureName !== null && null === uieNameHandler.extractFeatureNameOf(uieName) ? uieNameHandler.makeVariableName(featureName, uieName) : uieName;
    const cachedValue = valueOrNull(context.uieVariableToValueMap.get(fullVariableName));

    if (isDefined(cachedValue)) {
      return cachedValue;
    }

    let uie = spec.uiElementByVariable(uieName, doc);

    if (!uie) {
      const msg = 'Could not find UI Element: ' + uieName + '. It was referenced in "' + doc.fileInfo.path + '".';
      const err = new RuntimeException(msg);
      errors.push(err);
      return null;
    }

    const isEditable = this._uiePropExtractor.extractIsEditable(uie);

    if (!isEditable) {
      return null;
    }

    const plan = context.uieVariableToPlanMap.get(fullVariableName);

    if (!plan) {
      const msg = 'Could not find Plan for the UI Element: ' + fullVariableName;
      const err = new RuntimeException(msg);
      errors.push(err);
      return null;
    }

    const dtc = plan.dtc;
    const groupDef = new DataTestCaseGroupDef();
    const group = groupDef.groupOf(dtc);

    const propertiesMap = this._uiePropExtractor.mapFirstPropertyOfEachType(uie);

    const msgPropertyValueError = 'Could not resolve the value of the following property: ';
    let cfg = new DataGenConfig();
    cfg.valueType = this._uiePropExtractor.guessDataType(propertiesMap);
    const pFormat = propertiesMap.get(UIPropertyTypes.FORMAT) || null;

    if (isDefined(pFormat)) {
      try {
        cfg.format = (await this.resolvePropertyValue(UIPropertyTypes.FORMAT, pFormat, pFormat.value, context, doc, spec, errors)).toString();
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.FORMAT;
        errors.push(new RuntimeException(msg));
      }
    }

    cfg.required = this._uiePropExtractor.extractIsRequired(uie);
    const pValue = propertiesMap.get(UIPropertyTypes.VALUE) || null;

    if (isDefined(pValue)) {
      try {
        cfg.value = await this.resolvePropertyValue(UIPropertyTypes.VALUE, pValue, pValue.value, context, doc, spec, errors);
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.VALUE;
        errors.push(new RuntimeException(msg));
      }
    }

    const pMinValue = propertiesMap.get(UIPropertyTypes.MIN_VALUE) || null;

    if (isDefined(pMinValue)) {
      try {
        cfg.minValue = await this.resolvePropertyValue(UIPropertyTypes.MIN_VALUE, pMinValue, pMinValue.value, context, doc, spec, errors);
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.MIN_VALUE;
        errors.push(new RuntimeException(msg));
      }
    }

    const pMaxValue = propertiesMap.get(UIPropertyTypes.MAX_VALUE) || null;

    if (isDefined(pMaxValue)) {
      try {
        cfg.maxValue = await this.resolvePropertyValue(UIPropertyTypes.MAX_VALUE, pMaxValue, pMaxValue.value, context, doc, spec, errors);
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.MAX_VALUE;
        errors.push(new RuntimeException(msg));
      }
    }

    const pMinLength = propertiesMap.get(UIPropertyTypes.MIN_LENGTH) || null;

    if (isDefined(pMinLength)) {
      try {
        cfg.minLength = Number(await this.resolvePropertyValue(UIPropertyTypes.MIN_LENGTH, pMinLength, pMinLength.value, context, doc, spec, errors));
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.MIN_LENGTH;
        errors.push(new RuntimeException(msg));
      }
    }

    const pMaxLength = propertiesMap.get(UIPropertyTypes.MAX_LENGTH) || null;

    if (isDefined(pMaxLength)) {
      try {
        cfg.maxLength = Number(await this.resolvePropertyValue(UIPropertyTypes.MAX_LENGTH, pMaxLength, pMaxLength.value, context, doc, spec, errors));
      } catch (e) {
        const msg = msgPropertyValueError + UIPropertyTypes.MAX_LENGTH;
        errors.push(new RuntimeException(msg));
      }
    }

    switch (group) {
      case DataTestCaseGroup.FORMAT:
        {
          if (!pFormat) {
            return null;
          }

          break;
        }

      case DataTestCaseGroup.REQUIRED:
        {
          break;
        }

      case DataTestCaseGroup.SET:
        {
          if (!pValue) {
            return null;
          }

          cfg.invertedLogic = this._opChecker.isNotEqualTo(pValue) || this._opChecker.isNotIn(pValue);
          break;
        }

      case DataTestCaseGroup.VALUE:
        {
          break;
        }

      case DataTestCaseGroup.LENGTH:
        {
          break;
        }

      case DataTestCaseGroup.COMPUTATION:
        {
          return null;
        }

      default:
        return null;
    }

    let value;

    try {
      value = await this._dataGen.generate(dtc, cfg);
    } catch (e) {
      const msg = 'Error generating value for "' + uieName + '": ' + e.message;

      if (!uie.location.filePath) {
        uie.location.filePath = doc.fileInfo.path;
      }

      errors.push(new RuntimeException(msg, uie.location));
    }

    context.uieVariableToValueMap.set(uie.info.fullVariableName, value);
    return value;
  }

  async resolvePropertyValue(propType, owner, propertyValue, context, doc, spec, errors) {
    if (!propertyValue) {
      return null;
    }

    const featureName = isDefined(doc) && isDefined(doc.feature) ? doc.feature.name : null;

    switch (propertyValue.entity) {
      case Entities.CONSTANT:
        {
          const constant = propertyValue.references[0];

          if (isDefined(constant)) {
            return adjustValueToTheRightType(constant.value);
          }

          return null;
        }

      case Entities.UI_ELEMENT_REF:
        {
          const uie = propertyValue.references[0];

          if (isDefined(uie) && isDefined(uie.info) && isDefined(uie.info.fullVariableName)) {
            let value = valueOrNull(context.uieVariableToValueMap.get(uie.info.fullVariableName));

            if (!isDefined(value)) {
              try {
                value = await this.generate(uie.info.fullVariableName, context, doc, spec, errors);
              } catch (e) {}
            }

            return value;
          }

          return null;
        }

      case Entities.QUERY:
        {
          const databases = propertyValue.references.filter(node => node.nodeType === NodeTypes.DATABASE);
          const tables = propertyValue.references.filter(node => node.nodeType === NodeTypes.TABLE);
          const hasDatabase = databases.length > 0;
          const hasTable = tables.length > 0;
          const hasBoth = hasDatabase && hasTable;
          let msg = null;

          if (hasBoth) {
            msg = 'Query cannot have a reference to a Database and a reference to a Table.';
          } else if (hasDatabase) {
            if (databases.length > 1) {
              msg = 'Query cannot have more than one Database reference.';
            } else {
              let query = propertyValue.value.toString();

              try {
                query = this.resolveConstantsInQuery(query, propertyValue.references);
                query = await this.resolveUIElementsInQuery(query, featureName, owner, context, doc, spec, errors);
                return await this.resolveDatabaseReferenceInQuery(propType, query, databases[0], spec, errors);
              } catch (e) {
                return null;
              }
            }
          } else if (hasTable) {
            if (tables.length > 1) {
              msg = 'Query cannot have more than one Table reference.';
            } else {
              let query = propertyValue.value.toString();

              try {
                query = this.resolveConstantsInQuery(query, propertyValue.references);
                query = await this.resolveUIElementsInQuery(query, featureName, owner, context, doc, spec, errors);
                return await this.resolveTableReferenceInQuery(propType, query, tables[0], spec, errors);
              } catch (e) {
                return null;
              }
            }
          }

          if (isDefined(msg)) {
            const err = new RuntimeException(msg, owner.location);

            if (!errors.find(e => e.message === err.message)) {
              errors.push(err);
            }

            return null;
          }

          return propertyValue.value;
        }

      default:
        {
          return propertyValue.value;
        }
    }
  }

  resolveConstantsInQuery(query, nodes) {
    const constants = nodes.filter(node => node.nodeType === NodeTypes.CONSTANT).map(node => node);
    let newQuery = query;

    for (let c of constants) {
      newQuery = this._queryRefReplacer.replaceConstantInQuery(newQuery, c.name, adjustValueToTheRightType(c.value));
    }

    return newQuery;
  }

  async resolveUIElementsInQuery(query, currentFeatureName, owner, context, doc, spec, errors) {
    const variables = new QueryParser().parseAnyVariables(query);

    if (variables.length < 1) {
      return query;
    }

    const uieNameHandler = new UIElementNameHandler();
    let newQuery = query;

    for (let variable of variables) {
      let fullVariableName = variable;

      if (null === uieNameHandler.extractFeatureNameOf(variable)) {
        let uie = spec.uiElementByVariable(variable, doc);

        if (!uie) {
          fullVariableName = uieNameHandler.makeVariableName(currentFeatureName, variable);
        } else {
          fullVariableName = uie.info.fullVariableName;
        }
      }

      let value = valueOrNull(context.uieVariableToValueMap.get(fullVariableName));

      if (null === value) {
        try {
          value = await this.generate(fullVariableName, context, doc, spec, errors);
        } catch (e) {}
      }

      newQuery = this._queryRefReplacer.replaceUIElementInQuery(newQuery, variable, Array.isArray(value) ? value[0] : value);
    }

    return newQuery;
  }

  async resolveDatabaseReferenceInQuery(propType, query, database, spec, errors) {
    const absDB = new DatabaseToAbstractDatabase().convertFromNode(database);
    const supportTables = supportTablesInQueries(absDB.driverName);

    const newQuery = this._queryRefReplacer.replaceDatabaseInQuery(query, database.name, !supportTables);

    if (this._dbQueryCache.has(newQuery)) {
      return this.properDataFor(propType, this._dbQueryCache.get(newQuery));
    }

    let intf = spec.databaseNameToInterfaceMap().get(database.name);

    if (!intf) {
      intf = new DatabaseJSDatabaseInterface();

      try {
        await intf.connect(database, spec.basePath);
      } catch (err) {
        errors.push(err);
        return null;
      }

      spec.databaseNameToInterfaceMap().set(database.name, intf);
    }

    let returnedData;

    try {
      returnedData = await this.queryResult(newQuery, intf, errors);
    } catch (err) {
      errors.push(err);
      return null;
    }

    const firstColumnData = this.firstColumnOf(returnedData);

    if (isDefined(firstColumnData)) {
      this._dbQueryCache.set(newQuery, firstColumnData);
    }

    return this.properDataFor(propType, firstColumnData);
  }

  async resolveTableReferenceInQuery(propType, query, table, spec, errors) {
    const newQuery = this._queryRefReplacer.replaceTableInQuery(query, table.name, table.internalName);

    if (this._tblQueryCache.has(newQuery)) {
      return this.properDataFor(propType, this._tblQueryCache.get(newQuery));
    }

    let intf = spec.databaseNameToInterfaceMap().get(IN_MEMORY_DATABASE_NAME);

    if (!intf) {
      const database = {
        name: IN_MEMORY_DATABASE_NAME,
        nodeType: NodeTypes.DATABASE,
        location: {
          column: 1,
          line: 1
        },
        items: [{
          nodeType: NodeTypes.DATABASE_PROPERTY,
          location: {
            column: 1,
            line: 2
          },
          property: DatabaseProperties.TYPE,
          value: 'alasql',
          content: 'type is alasql'
        }]
      };
      intf = new AlaSqlDatabaseInterface();

      try {
        await intf.connect(database, spec.basePath);
      } catch (err) {
        errors.push(err);
        return null;
      }

      spec.databaseNameToInterfaceMap().set(IN_MEMORY_DATABASE_NAME, intf);
    }

    try {
      await intf.createTable(table);
    } catch (err) {
      errors.push(err);
      return null;
    }

    let returnedData;

    try {
      returnedData = await this.queryResult(newQuery, intf, errors);
    } catch (err) {
      errors.push(err);
      return null;
    }

    const firstColumnData = this.firstColumnOf(returnedData);

    if (isDefined(firstColumnData)) {
      this._tblQueryCache.set(newQuery, firstColumnData);
    }

    return this.properDataFor(propType, firstColumnData);
  }

  async queryResult(query, intf, errors) {
    try {
      return await intf.query(query);
    } catch (err) {
      errors.push(err);
      return null;
    }
  }

  firstColumnOf(data) {
    let values = [];

    for (let obj of data || []) {
      for (let column in obj || {}) {
        values.push(obj[column]);
        break;
      }
    }

    return values;
  }

  properDataFor(propType, data) {
    if (UIPropertyTypes.VALUE === propType) {
      return data;
    }

    return !data ? null : data[0] || null;
  }

}
class ValueGenContext {
  constructor(uieVariableToPlanMap = new Map(), uieVariableToValueMap = new Map()) {
    this.uieVariableToPlanMap = uieVariableToPlanMap;
    this.uieVariableToValueMap = uieVariableToValueMap;
  }

}

const {
  enUS,
  pt,
  ptBR
} = allLocales;
function createDefaultLocaleMap() {
  const map = new Map();
  map.set('en', enUS);
  map.set('en-US', enUS);
  map.set('pt', ptBR);
  map.set('pt-BR', ptBR);
  map.set('pt-PT', pt);
  return map;
}
function isLocaleFormatValid(locale, strict = false) {
  if (strict) {
    return /^[a-z]{2}(?:\-[A-Z]{2})?$/.test(locale);
  }

  return /^[A-Za-z]{2}(?:\-[A-Za-z]{2})?$/.test(locale);
}
function formatLocale(locale) {
  const [lang, country] = locale.split('-');

  if (!country) {
    return lang.toLowerCase();
  }

  return lang.toLowerCase() + '-' + country.toUpperCase();
}
async function isLocaleAvailable(locale, map) {
  if (!isLocaleFormatValid(locale, true)) {
    return false;
  }

  if (map.has(locale)) {
    return true;
  }

  try {
    if (allLocales[locale]) {
      map.set(locale, allLocales[locale]);
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}
async function fallbackToLanguage(locale, map) {
  const loc = formatLocale(locale);

  if (map.has(loc)) {
    return loc;
  }

  const isAvailable = await isLocaleAvailable(loc, map);

  if (isAvailable) {
    return loc;
  }

  const [lang] = loc.split('-');

  if (lang == loc) {
    return null;
  }

  return await fallbackToLanguage(lang, map);
}

async function loadLocale(locale, map) {
  const isAvailable = await isLocaleAvailable(locale, map);
  return isAvailable ? map.get(locale) : map.get('en');
}

async function formatDateByLocale(locale, map, date) {
  const loc = await loadLocale(locale, map);
  return format(date, 'P', {
    locale: loc
  });
}
async function formatTimeByLocale(locale, map, time, includeSeconds) {
  const loc = await loadLocale(locale, map);

  if (includeSeconds) {
    return format(time, 'HH:mm:ss', {
      locale: loc
    });
  }

  return format(time, 'HH:mm', {
    locale: loc
  });
}
async function formatDateTimeByLocale(locale, map, dateTime, includeSeconds) {
  const dateStr = await formatDateByLocale(locale, map, dateTime);
  const timeStr = await formatTimeByLocale(locale, map, dateTime, includeSeconds);
  return dateStr + ' ' + timeStr;
}
async function formatUsingLocale(locale, map, nativeDate, localeFormat) {
  const loc = await loadLocale(locale, map);
  return format(nativeDate, localeFormat, {
    locale: loc
  });
}

class LocaleContext {
  constructor(language, locale, localeMap, localeFormat) {
    this.language = language;
    this.locale = locale;
    this.localeMap = localeMap;
    this.localeFormat = localeFormat;
  }

  clone() {
    return new LocaleContext(this.language, this.locale, this.localeMap, this.localeFormat);
  }

  withLocale(locale) {
    this.locale = locale;
    return this;
  }

  withLocaleFormat(localeFormat) {
    this.localeFormat = localeFormat;
    return this;
  }

  async resolve() {
    let loc;

    if (this.locale) {
      loc = await fallbackToLanguage(this.locale, this.localeMap);
    }

    if (!loc && this.language) {
      loc = await fallbackToLanguage(this.language, this.localeMap);
    }

    return loc || 'en';
  }

}

class PreTestCase {
  constructor(testPlan, steps = [], oracles = [], correspondingOracles = []) {
    this.testPlan = testPlan;
    this.steps = steps;
    this.oracles = oracles;
    this.correspondingOracles = correspondingOracles;
  }

  hasAnyInvalidValue() {
    return this.testPlan.hasAnyInvalidResult();
  }

  lastThenStep() {
    const len = (this.steps || []).length;

    for (let i = len - 1; i >= 0; --i) {
      let step = this.steps[i];

      if (NodeTypes.STEP_THEN === step.nodeType) {
        return step;
      }
    }

    return null;
  }

  hasAnyThenStep() {
    return this.lastThenStep() !== null;
  }

  stepsBeforeTheLastThenStep() {
    let lastThen = this.lastThenStep();

    if (null === lastThen) {
      return this.steps;
    }

    let stepsBeforeThen = [];

    for (let step of this.steps) {
      if (step === lastThen) {
        break;
      }

      stepsBeforeThen.push(step);
    }

    return stepsBeforeThen;
  }

  hasOracles() {
    return (this.oracles || []).length > 0;
  }

  shouldFail() {
    if (!this.hasAnyThenStep) {
      return false;
    }

    for (let step of this.steps) {
      if (step.isInvalidValue && !this.hasCorrespondingOracles(step)) {
        return true;
      }
    }

    return false;
  }

  hasCorrespondingOracles(step) {
    return !!this.correspondingOracles.find(c => c.step === step);
  }

}

class TargetTypeUtil {
  analyzeInputTargetTypes(step, languageDictionary) {
    let targetType = '';
    const INPUT_TARGET_TYPES = [EditableActionTargets.TEXTBOX, EditableActionTargets.TEXTAREA, EditableActionTargets.FILE_INPUT];

    for (let tt of step.targetTypes || []) {
      if (INPUT_TARGET_TYPES.indexOf(tt) >= 0) {
        const values = ((languageDictionary.nlp["testcase"] || {})["ui_action_option"] || {})['field'];

        if (isDefined(values) && values.length > 0) {
          targetType = values[0];
        }

        break;
      }
    }

    return targetType;
  }

  hasInputTargetInTheSentence(sentence, languageDictionary) {
    let terms = ((languageDictionary.nlp["testcase"] || {})["ui_action_option"] || {})['field'] || [];
    terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['textbox'] || []);
    terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['textarea'] || []);
    terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['fileInput'] || []);

    for (let term of terms) {
      if (sentence.indexOf(' ' + term + ' ') >= 0) {
        return true;
      }
    }

    return false;
  }

  extractTargetTypes(step, doc, spec, extractor) {
    if (!step.nlpResult) {
      return [];
    }

    let targetTypes = step.targetTypes.slice(0);

    for (let e of step.nlpResult.entities || []) {
      switch (e.entity) {
        case Entities.UI_ELEMENT_REF:
          {
            const uie = spec.uiElementByVariable(e.value, doc);

            if (isDefined(uie)) {
              const uieType = extractor.extractType(uie);
              targetTypes.push(uieType);
              break;
            }
          }

        case Entities.UI_LITERAL:
          {
            const action = step.action || null;

            if (isDefined(action)) {
              const defaultAction = ACTION_TARGET_MAP.get(action);

              if (defaultAction) {
                targetTypes.push(defaultAction);
              }
            }

            break;
          }
      }
    }

    return targetTypes;
  }

}

const {
  escape,
  escapeId
} = sqlstring;
class ReferenceReplacer {
  replaceConstantsWithTheirValues(sentence, nlpResult, spec) {
    let newSentence = sentence;
    const valueTypeDetector = new ValueTypeDetector();
    let constants = [];

    for (let e of nlpResult.entities || []) {
      if (Entities.CONSTANT === e.entity) {
        let valueContent = spec.constantNameToValueMap().get(e.value);

        if (undefined === valueContent) {
          valueContent = '';
        }

        const value = valueTypeDetector.isNumber(valueContent) ? valueContent.toString() : Symbols.VALUE_WRAPPER + valueContent + Symbols.VALUE_WRAPPER;
        newSentence = this.replaceConstantAtPosition(newSentence, e.position, Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX, value);
        constants.push(Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX);
      }
    }

    return [newSentence, constants.join(', ')];
  }

  replaceUIElementsWithUILiterals(step, hasInputAction, doc, spec, languageDictionary, uiLiteralCaseOption) {
    let sentence = step.content;
    let nlpResult = step.nlpResult;
    let newSentence = sentence;
    let uiElements = [];
    const targetTypeUtil = new TargetTypeUtil();

    for (let e of nlpResult.entities || []) {
      if (Entities.UI_ELEMENT_REF != e.entity) {
        continue;
      }

      const ui = spec.uiElementByVariable(e.value, doc);
      let literalName = isDefined(ui) && isDefined(ui.info) ? ui.info.uiLiteral : convertCase(e.value, uiLiteralCaseOption);
      const uiLiteral = Symbols.UI_LITERAL_PREFIX + literalName + Symbols.UI_LITERAL_SUFFIX;
      let targetType = '';

      if (!hasInputAction && !targetTypeUtil.hasInputTargetInTheSentence(step.content, languageDictionary)) {
        targetType = targetTypeUtil.analyzeInputTargetTypes(step, languageDictionary);
      }

      const prefixedUILiteral = targetType.length > 0 ? targetType + ' ' + uiLiteral : uiLiteral;
      newSentence = newSentence.replace(Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX, prefixedUILiteral);
      uiElements.push(Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX);
    }

    return [newSentence, uiElements.join(', ')];
  }

  replaceConstantAtPosition(sentence, position, from, to) {
    let pos = position;

    if (sentence.charAt(pos) !== Symbols.CONSTANT_PREFIX) {
      if (Symbols.CONSTANT_PREFIX === sentence.charAt(pos + 1)) {
        pos++;
      } else if (Symbols.CONSTANT_PREFIX === sentence.charAt(pos - 1)) {
        pos--;
      }
    }

    if (sentence.charAt(pos) !== Symbols.CONSTANT_PREFIX) {
      pos = sentence.indexOf(Symbols.CONSTANT_PREFIX, pos);
    }

    return this.replaceAtPosition(sentence, pos, from, to);
  }

  replaceAtPosition(sentence, position, from, to) {
    const before = sentence.substring(0, position);
    const after = sentence.substring(position + from.length);
    return before + to + after;
  }

  replaceQuery(query, databaseNameToNameMap, tableNameToNameMap, uiElementNameToValueMap, constantNameToValueMap) {
    let varMap = {};

    for (let [key, value] of uiElementNameToValueMap) {
      varMap[key] = this.wrapValue(value);
    }

    let constMap = {};

    for (let [key, value] of databaseNameToNameMap) {
      constMap[key] = this.wrapName(value);
    }

    for (let [key, value] of tableNameToNameMap) {
      constMap[key] = this.wrapName(value);
    }

    for (let [key, value] of constantNameToValueMap) {
      constMap[key] = this.wrapValue(value);
    }

    return this.replaceAll(query, varMap, constMap);
  }

  replaceAll(sentence, varMap, constMap) {
    let s = sentence;

    for (let varName in varMap) {
      const regex = this.makeVarRegex(varName);
      const value = varMap[varName];
      s = s.replace(regex, value);
    }

    for (let constName in constMap) {
      const regex = this.makeNameRegex(constName);
      const value = constMap[constName];
      s = s.replace(regex, value);
    }

    return s;
  }

  wrapName(content) {
    return escapeId(content);
  }

  wrapValue(content) {
    return escape(content);
  }

  makeVarRegex(name) {
    return new QueryParser().makeVariableRegex(name);
  }

  makeNameRegex(name) {
    return new QueryParser().makeNameRegex(name);
  }

}

class UIPropertyReferenceExtractor {
  extractReferences(entities, line = 1) {
    let references = [];

    for (let e of entities || []) {
      let ref = this.extractFromEntity(e, line);

      if (!ref) {
        continue;
      }

      references.push(ref);
    }

    return references;
  }

  extractFromEntity(nlpEntity, line = 1) {
    if (nlpEntity.entity != Entities.UI_PROPERTY_REF) {
      return null;
    }

    return this.makeReferenceFromString(nlpEntity.value, {
      column: nlpEntity.position,
      line: line
    });
  }

  extractReferencesFromValue(text, line = 1) {
    let regex = cloneRegExp(UI_PROPERTY_REF_REGEX);
    let references = [];
    let result;

    while ((result = regex.exec(text)) !== null) {
      const value = result[0] || '';
      let ref = this.makeReferenceFromString(value, {
        column: result.index,
        line: line
      });
      references.push(ref);
    }

    return references;
  }

  makeReferenceFromString(reference, location) {
    let value = reference;

    if (value.indexOf(Symbols.UI_ELEMENT_PREFIX) >= 0) {
      value = value.substring(1, value.length - 1).trim();
    }

    const [uieName, prop] = value.split(Symbols.UI_PROPERTY_REF_SEPARATOR);
    let ref = new UIPropertyReference();
    ref.uiElementName = uieName.trim();
    ref.property = prop.trim();
    ref.content = ref.uiElementName + Symbols.UI_PROPERTY_REF_SEPARATOR + ref.property;
    ref.location = location;
    return ref;
  }

}

async function formatValueToUseInASentence(valueType, localeContext, value, isAlreadyInsideAString = false) {
  const loc = await localeContext.resolve();
  const isLocaleFormatDefined = !!localeContext.localeFormat;
  let formattedValue = value;

  if (value instanceof LocalTime$1) {
    const nativeTime = new Date();
    nativeTime.setHours(value.hour(), value.minute(), value.second());

    if (isLocaleFormatDefined) {
      formattedValue = await formatUsingLocale(loc, localeContext.localeMap, nativeTime, localeContext.localeFormat);
    } else {
      const includeSeconds = valueType === ValueType.LONG_TIME;
      formattedValue = await formatTimeByLocale(loc, localeContext.localeMap, nativeTime, includeSeconds);
    }
  } else if (value instanceof LocalDate$1) {
    const nativeDate = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth());

    if (isLocaleFormatDefined) {
      formattedValue = await formatUsingLocale(loc, localeContext.localeMap, nativeDate, localeContext.localeFormat);
    } else {
      formattedValue = await formatDateByLocale(loc, localeContext.localeMap, nativeDate);
    }
  } else if (value instanceof LocalDateTime$1) {
    const includeSeconds = valueType === ValueType.LONG_DATE_TIME;
    const nativeDateTime = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth(), value.hour(), value.minute(), value.second());

    if (isLocaleFormatDefined) {
      formattedValue = await formatUsingLocale(loc, localeContext.localeMap, nativeDateTime, localeContext.localeFormat);
    } else {
      formattedValue = await formatDateTimeByLocale(loc, localeContext.localeMap, nativeDateTime, includeSeconds);
    }
  }

  if (isAlreadyInsideAString || 'number' === typeof formattedValue) {
    return formattedValue.toString();
  }

  return Symbols.VALUE_WRAPPER + formattedValue.toString() + Symbols.VALUE_WRAPPER;
}

class UIPropertyReferenceReplacer {
  async replaceUIPropertyReferencesByTheirValue(localeContext, step, content, uiePropertyReferences, uieVariableToValueMap, ctx, isAlreadyInsideAString = false) {
    const uieNameHandler = new UIElementNameHandler();
    const propExtractor = new UIElementPropertyExtractor();
    let newContent = content;

    for (let uipRef of uiePropertyReferences || []) {
      if (uipRef.property != UIPropertyTypes.VALUE) {
        const fileName = basename(ctx.doc.fileInfo.path);
        const locStr = '(' + step.location.line + ',' + step.location.column + ')';
        const msg = 'Could not retrieve a value from ' + Symbols.UI_ELEMENT_PREFIX + uipRef.uiElementName + Symbols.UI_PROPERTY_REF_SEPARATOR + uipRef.property + Symbols.UI_ELEMENT_SUFFIX + ' in ' + fileName + ' ' + locStr + '. Not supported yet.';
        const err = new Warning(msg);
        ctx.warnings.push(err);
        continue;
      }

      const uieName = uipRef.uiElementName;
      const [featureName] = uieNameHandler.extractNamesOf(uieName);
      let variable;
      let uie;

      if (isDefined(featureName)) {
        variable = uieName;
        uie = ctx.spec.uiElementByVariable(uieName);
      } else {
        uie = ctx.spec.uiElementByVariable(uieName, ctx.doc);
        variable = !uie ? uieName : !uie.info ? uieName : uie.info.fullVariableName;
      }

      let value = uieVariableToValueMap.get(variable);

      if (!isDefined(value)) {
        const fileName = ctx.doc.fileInfo ? basename(ctx.doc.fileInfo.path) : 'unknown file';
        const locStr = '(' + step.location.line + ',' + step.location.column + ')';
        const msg = 'Could not retrieve a value from ' + Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX + ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
        const err = new Warning(msg);
        ctx.warnings.push(err);
        value = '';
      }

      const propertyMap = propExtractor.mapFirstPropertyOfEachType(uie);
      const valueType = propExtractor.guessDataType(propertyMap);
      const uieLocale = propExtractor.extractLocale(uie) || localeContext.language;
      const uieLocaleFormat = propExtractor.extractLocaleFormat(uie);
      const uieLocaleContext = localeContext.clone().withLocale(uieLocale).withLocaleFormat(uieLocaleFormat);
      const formattedValue = await formatValueToUseInASentence(valueType, uieLocaleContext, value, isAlreadyInsideAString);
      const refStr = Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols.UI_ELEMENT_SUFFIX;
      newContent = newContent.replace(refStr, formattedValue);
    }

    removeDuplicated(ctx.warnings, (a, b) => a.message == b.message);
    return newContent;
  }

}

class GenContext {
  constructor(spec, doc, errors, warnings) {
    this.spec = spec;
    this.doc = doc;
    this.errors = errors;
    this.warnings = warnings;
  }

}
var UIElementReplacementOption;

(function (UIElementReplacementOption) {
  UIElementReplacementOption[UIElementReplacementOption["ALL"] = 0] = "ALL";
  UIElementReplacementOption[UIElementReplacementOption["JUST_INPUT_ACTIONS"] = 1] = "JUST_INPUT_ACTIONS";
  UIElementReplacementOption[UIElementReplacementOption["NO_INPUT_ACTIONS"] = 2] = "NO_INPUT_ACTIONS";
})(UIElementReplacementOption || (UIElementReplacementOption = {}));

class PreTestCaseGenerator {
  constructor(_variantSentenceRec, languageMap, defaultLanguage, seed, uiLiteralCaseOption = CaseType.CAMEL, minRandomStringSize = 0, maxRandomStringSize = 100, randomTriesToInvalidValues = 5, randomStringOptions = {
    escapeChars: true,
    avoidDatabaseChars: true
  }) {
    this._variantSentenceRec = _variantSentenceRec;
    this.languageMap = languageMap;
    this.defaultLanguage = defaultLanguage;
    this.seed = seed;
    this.uiLiteralCaseOption = uiLiteralCaseOption;
    this.minRandomStringSize = minRandomStringSize;
    this.maxRandomStringSize = maxRandomStringSize;
    this.randomTriesToInvalidValues = randomTriesToInvalidValues;
    this.randomStringOptions = randomStringOptions;
    this._nlpUtil = new NLPUtil();
    this._uiePropExtractor = new UIElementPropertyExtractor();
    this._lineChecker = new LineChecker();
    this._targetTypeUtil = new TargetTypeUtil();
    const random = new Random(seed);
    this._randomString = new RandomString(random, randomStringOptions);
    this._dtcAnalyzer = new DataTestCaseAnalyzer(seed);
    this._uieValueGen = new UIElementValueGenerator(new DataGenerator(new DataGeneratorBuilder(seed, randomTriesToInvalidValues, maxRandomStringSize)));
  }

  async generate(steps, ctx, testPlanMakers) {
    if (!steps || steps.length < 1) {
      return [];
    }

    const language = this.docLanguage(ctx.doc);
    const languageDictionary = dictionaryForLanguage(language);
    const localeContext = new LocaleContext(language, language, createDefaultLocaleMap());
    let clonedSteps = this.cloneSteps(steps);
    this.replaceConstantsWithTheirValues(clonedSteps, language, ctx);
    const referenceExtractor = new UIPropertyReferenceExtractor();

    for (let step of clonedSteps) {
      const references = referenceExtractor.extractReferences(step.nlpResult.entities, step.location.line);
      let languageIndependentReferences = this.checkUIPropertyReferences(references, languageDictionary, ctx);

      if (!step.uiePropertyReferences) {
        step.uiePropertyReferences = languageIndependentReferences;
      }
    }

    let newSteps = this.fillUILiteralsWithoutValueInSteps(clonedSteps, language, languageDictionary.keywords, ctx);

    for (let step of newSteps) {
      const inputDataActionEntity = this.extractDataInputActionEntity(step);

      if (isDefined(inputDataActionEntity) && (this.hasValue(step) || this.hasNumber(step))) {
        this.replaceUIElementsWithUILiterals([step], language, languageDictionary, ctx, UIElementReplacementOption.JUST_INPUT_ACTIONS);
      } else {
        this.replaceUIElementsWithUILiterals([step], language, languageDictionary, ctx, UIElementReplacementOption.NO_INPUT_ACTIONS);
      }
    }

    const stepUIElements = this.extractUIElementsFromSteps(newSteps, ctx);

    if (stepUIElements.length < 1) {
      let preTC = new PreTestCase(new TestPlan(), newSteps, []);
      return [preTC];
    }

    const stepUIEVariables = stepUIElements.map(uie => uie.info ? uie.info.fullVariableName : uie.name);
    const allAvailableUIElements = ctx.spec.extractUIElementsFromDocumentAndImports(ctx.doc);
    const allAvailableVariables = allAvailableUIElements.map(uie => uie.info ? uie.info.fullVariableName : uie.name);
    const alwaysValidUIEVariables = arrayDiff(allAvailableVariables, stepUIEVariables);
    let uieVariableToDTCMap = new Map();

    for (let uie of allAvailableUIElements) {
      let map = this._dtcAnalyzer.analyzeUIElement(uie, ctx.errors);

      uieVariableToDTCMap.set(uie.info.fullVariableName, map);
    }

    let allTestPlans = [];

    for (let maker of testPlanMakers) {
      let testPlans = maker.make(uieVariableToDTCMap, alwaysValidUIEVariables);
      allTestPlans.push.apply(allTestPlans, testPlans);
    }

    let all = [];

    for (let plan of allTestPlans) {
      let uieVariableToValueMap = new Map();
      let context = new ValueGenContext(plan.dataTestCases, uieVariableToValueMap);

      for (let [uieVar] of plan.dataTestCases) {
        let generatedValue;

        try {
          generatedValue = await this._uieValueGen.generate(uieVar, context, ctx.doc, ctx.spec, ctx.errors);
        } catch (e) {
          ctx.doc.fileErrors.push(e);
          continue;
        }

        uieVariableToValueMap.set(uieVar, generatedValue);
      }

      let filledSteps = [];
      let filledOtherwiseSteps = [];
      let filledCorrespondingOtherwiseSteps = [];

      for (let step of newSteps) {
        let [resultingSteps, correspondingOtherwiseSteps] = await this.fillUIElementWithValueAndReplaceByUILiteralInStep(step, languageDictionary, plan.dataTestCases, uieVariableToValueMap, localeContext, ctx);
        filledSteps.push.apply(filledSteps, resultingSteps);

        if (correspondingOtherwiseSteps.length > 0) {
          let allOracles = [];

          for (let c of correspondingOtherwiseSteps) {
            allOracles.push.apply(allOracles, c.otherwiseSteps);
          }

          filledOtherwiseSteps.push.apply(filledOtherwiseSteps, allOracles);
          filledCorrespondingOtherwiseSteps.push.apply(filledCorrespondingOtherwiseSteps, correspondingOtherwiseSteps);
        }
      }

      this.normalizeOracleSentences(filledOtherwiseSteps, languageDictionary.keywords);
      await this.replaceUIPropertyReferencesInsideValues(filledSteps, filledOtherwiseSteps, uieVariableToValueMap, localeContext, languageDictionary, ctx);
      all.push(new PreTestCase(plan, filledSteps, filledOtherwiseSteps, filledCorrespondingOtherwiseSteps));
    }

    return all;
  }

  docLanguage(doc) {
    return !doc.language ? this.defaultLanguage : doc.language.value;
  }

  cloneSteps(steps) {
    let newSteps = [];

    for (let step of steps) {
      newSteps.push(deepcopy(step));
    }

    return newSteps;
  }

  replaceConstantsWithTheirValues(steps, language, ctx) {
    const refReplacer = new ReferenceReplacer();

    for (let step of steps) {
      if (!step.nlpResult) {
        this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
      }

      let before = step.content;
      let [newContent, comment] = refReplacer.replaceConstantsWithTheirValues(step.content, step.nlpResult, ctx.spec);
      step.content = newContent;

      if (comment.length > 0) {
        step.comment = (step.comment || '') + ' ' + comment;
      }

      if (before != newContent) {
        this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
      }
    }
  }

  fillUILiteralsWithoutValueInSteps(steps, language, keywords, ctx) {
    let newSteps = [];

    for (let step of steps || []) {
      let resultingSteps = this.fillUILiteralsWithoutValueInSingleStep(step, keywords);

      if (resultingSteps.length > 1 || resultingSteps[0].content != step.content) {
        this._variantSentenceRec.recognizeSentences(language, resultingSteps, ctx.errors, ctx.warnings);
      }

      newSteps.push.apply(newSteps, resultingSteps);
    }

    return newSteps;
  }

  fillUILiteralsWithoutValueInSingleStep(step, keywords) {
    const inputDataActionEntity = this.extractDataInputActionEntity(step);

    if (null === inputDataActionEntity || this.hasValue(step) || this.hasNumber(step) || this.hasUIPropertyReference(step)) {
      return [step];
    }

    let uiLiterals = this._nlpUtil.entitiesNamed(Entities.UI_LITERAL, step.nlpResult);

    const uiLiteralsCount = uiLiterals.length;

    if (uiLiteralsCount < 1) {
      return [step];
    }

    let uiElements = this._nlpUtil.entitiesNamed(Entities.UI_ELEMENT_REF, step.nlpResult);

    let nodeType = step.nodeType;
    let prefix = this.stepPrefixNodeType(nodeType, keywords);
    const prefixAnd = upperFirst(!keywords.stepAnd ? 'And' : keywords.stepAnd[0] || 'And');
    const keywordI = !keywords.i ? 'I' : keywords.i[0] || 'I';
    const keywordWith = !keywords.with ? 'with' : keywords.with[0] || 'with';
    const keywordValid = !keywords.valid ? 'valid' : keywords.valid[0] || 'valid';
    const keywordRandom = !keywords.random ? 'random' : keywords.random[0] || 'random';
    let entities = [];

    if (uiElements.length > 0) {
      entities.push.apply(entities, uiLiterals);
      entities.push.apply(entities, uiElements);
      entities.sort((a, b) => a.position - b.position);
    } else {
      entities = uiLiterals;
    }

    let steps = [];
    let line = step.location.line;
    let count = 0;

    for (let entity of entities) {
      if (count > 0) {
        nodeType = NodeTypes.STEP_AND;
        prefix = prefixAnd;
      }

      let sentence = prefix + ' ' + keywordI + ' ' + inputDataActionEntity.string + ' ';
      let comment = null;

      if (Entities.UI_LITERAL === entity.entity) {
        sentence += Symbols.UI_LITERAL_PREFIX + entity.value + Symbols.UI_LITERAL_SUFFIX + ' ' + keywordWith + ' ' + Symbols.VALUE_WRAPPER + this.randomString() + Symbols.VALUE_WRAPPER;
        comment = ' ' + keywordValid + Symbols.TITLE_SEPARATOR + ' ' + keywordRandom;
      } else {
        sentence += entity.string;
      }

      let newStep = deepcopy(step);
      newStep.nodeType = nodeType;
      newStep.content = sentence;
      newStep.comment = comment;
      newStep.location = {
        column: this._lineChecker.countLeftSpacesAndTabs(sentence),
        line: line++,
        filePath: step.location.filePath
      };
      newStep.isInvalidValue = false;
      steps.push(newStep);
      ++count;
    }

    return steps;
  }

  extractUIElementsFromSteps(steps, ctx) {
    let all = [];
    const uieNames = this.extractUIElementNamesFromSteps(steps);
    let namesNotFound = [];

    for (let name of uieNames) {
      let uie = ctx.spec.uiElementByVariable(name, ctx.doc);

      if (!uie) {
        namesNotFound.push(name);
        continue;
      }

      all.push(uie);
    }

    if (namesNotFound.length > 0) {
      const msg = 'Referenced UI Elements not found: ' + namesNotFound.join(', ');
      const err = new RuntimeException(msg);
      ctx.errors.push(err);
    }

    return all;
  }

  extractUIElementNamesFromSteps(steps) {
    let uniqueNames = new Set();

    for (let step of steps) {
      let entities = this._nlpUtil.entitiesNamed(Entities.UI_ELEMENT_REF, step.nlpResult);

      for (let e of entities) {
        uniqueNames.add(e.value);
      }
    }

    return Array.from(uniqueNames);
  }

  replaceUIElementsWithUILiterals(steps, language, languageDictionary, ctx, option) {
    const refReplacer = new ReferenceReplacer();

    for (let step of steps) {
      let dataInputActionEntity = this.extractDataInputActionEntity(step);
      let hasInputAction = isDefined(dataInputActionEntity);

      if (UIElementReplacementOption.ALL !== option) {
        if (hasInputAction && UIElementReplacementOption.NO_INPUT_ACTIONS === option || !hasInputAction && UIElementReplacementOption.JUST_INPUT_ACTIONS === option) {
          continue;
        }
      }

      this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);

      let before = step.content;
      step.targetTypes = this._targetTypeUtil.extractTargetTypes(step, ctx.doc, ctx.spec, this._uiePropExtractor);
      let [newContent, comment] = refReplacer.replaceUIElementsWithUILiterals(step, hasInputAction, ctx.doc, ctx.spec, languageDictionary, this.uiLiteralCaseOption);
      step.content = newContent;

      if (comment.length > 0) {
        step.comment = ' ' + comment + (step.comment || '');
      }

      if (before != newContent) {
        this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
      }
    }
  }

  async fillUIElementWithValueAndReplaceByUILiteralInStep(inputStep, languageDictionary, uieVariableToUIETestPlanMap, uieVariableToValueMap, localeContext, ctx) {
    let step = deepcopy(inputStep);

    if (this.hasUIPropertyReference(step)) {
      const uipRefReplacer = new UIPropertyReferenceReplacer();
      step.content = await uipRefReplacer.replaceUIPropertyReferencesByTheirValue(localeContext, step, step.content, step.uiePropertyReferences, uieVariableToValueMap, ctx);

      this._variantSentenceRec.recognizeSentences(localeContext.language, [step], ctx.errors, ctx.warnings);
    }

    const dataInputActionEntity = this.extractDataInputActionEntity(step);

    if (null === dataInputActionEntity || this.hasValue(step) || this.hasNumber(step)) {
      let steps = [step];
      this.replaceUIElementsWithUILiterals(steps, localeContext.language, languageDictionary, ctx, UIElementReplacementOption.ALL);
      return [steps, []];
    }

    step.targetTypes = this._targetTypeUtil.extractTargetTypes(step, ctx.doc, ctx.spec, this._uiePropExtractor);

    let uieEntities = this._nlpUtil.entitiesNamed(Entities.UI_ELEMENT_REF, step.nlpResult);

    if (uieEntities.length < 1) {
      return [[step], []];
    }

    const keywords = languageDictionary.keywords;
    let nodeType = step.nodeType;
    let prefix = this.stepPrefixNodeType(nodeType, keywords);
    const prefixAnd = upperFirst(!keywords ? 'And' : keywords.stepAnd[0] || 'And');
    const keywordI = !keywords.i ? 'I' : keywords.i[0] || 'I';
    const keywordWith = !keywords.with ? 'with' : keywords.with[0] || 'with';
    const keywordValid = !keywords.valid ? 'valid' : keywords.valid[0] || 'valid';
    const keywordInvalid = !keywords.invalid ? 'invalid' : keywords.invalid[0] || 'invalid';
    const keywordFrom = !keywords.from ? 'from' : keywords.from[0] || 'from';
    let steps = [];
    let oracles = [];
    let line = step.location.line;
    let count = 0;
    const uieNameHandler = new UIElementNameHandler();

    for (let entity of uieEntities) {
      if (count > 0) {
        nodeType = NodeTypes.STEP_AND;
        prefix = prefixAnd;
      }

      const uieName = entity.value;
      let [featureName, uieNameWithoutFeature] = uieNameHandler.extractNamesOf(uieName);
      let variable;
      let uie;

      if (isDefined(featureName)) {
        variable = uieName;
        uie = ctx.spec.uiElementByVariable(uieName);
      } else {
        uie = ctx.spec.uiElementByVariable(uieName, ctx.doc);
        variable = !uie ? uieName : !uie.info ? uieName : uie.info.fullVariableName;
      }

      let value = uieVariableToValueMap.get(variable);

      if (!isDefined(value)) {
        const fileName = basename(ctx.doc.fileInfo.path);
        const locStr = '(' + step.location.line + ',' + step.location.column + ')';
        const msg = 'Could not retrieve a value from ' + Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX + ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
        ctx.warnings.push(new Warning(msg));
        value = '';
      }

      let uieLiteral = isDefined(uie) && isDefined(uie.info) ? uie.info.uiLiteral : null;

      if (null === uieLiteral) {
        uieLiteral = convertCase(variable, this.uiLiteralCaseOption);
        const msg = 'Could not retrieve a selector from ' + Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX + ', so I\'m generating "' + uieLiteral + '" for it.';
        ctx.warnings.push(new Warning(msg, step.location));
      }

      let targetType = '';

      if (!dataInputActionEntity) {
        targetType = this._targetTypeUtil.analyzeInputTargetTypes(step, languageDictionary) + ' ';
      }

      const propertyMap = this._uiePropExtractor.mapFirstPropertyOfEachType(uie);

      const valueType = this._uiePropExtractor.guessDataType(propertyMap);

      const uieLocale = this._uiePropExtractor.extractLocale(uie) || localeContext.language;

      const uieLocaleFormat = this._uiePropExtractor.extractLocaleFormat(uie);

      const uieLocaleContext = localeContext.clone().withLocale(uieLocale).withLocaleFormat(uieLocaleFormat);
      const formattedValue = await formatValueToUseInASentence(valueType, uieLocaleContext, value);
      let sentence = prefix + ' ' + keywordI + ' ' + dataInputActionEntity.string + ' ' + targetType + Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols.UI_LITERAL_SUFFIX + ' ' + keywordWith + ' ' + formattedValue;
      const uieTestPlan = uieVariableToUIETestPlanMap.get(variable) || null;
      let expectedResult, dtc;
      let oraclesToAdd = [];

      if (null === uieTestPlan) {
        expectedResult = keywordValid;
        dtc = '??? (no test plan for variable ' + variable + ')';
      } else {
        if (DTCAnalysisResult.INVALID === uieTestPlan.result) {
          expectedResult = keywordInvalid;
          let oraclesClone = this.processOracles(uieTestPlan.otherwiseSteps, localeContext.language, languageDictionary, keywords, ctx);

          for (let o of oraclesClone) {
            o.comment = (o.comment || '') + ' ' + keywordFrom + ' ' + Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols.UI_LITERAL_SUFFIX;
          }

          oraclesToAdd = oraclesClone;
        } else {
          expectedResult = keywordValid;
        }

        if (isDefined(languageDictionary.testCaseNames)) {
          dtc = languageDictionary.testCaseNames[uieTestPlan.dtc] || (uieTestPlan.dtc || '??? (no data test case)').toString();
        } else {
          dtc = (uieTestPlan.dtc || '??? (no translation and data test case)').toString();
        }
      }

      let comment = ' ' + expectedResult + Symbols.TITLE_SEPARATOR + ' ' + dtc;

      if (uieNameWithoutFeature) {
        comment = ' ' + Symbols.UI_ELEMENT_PREFIX + uieNameWithoutFeature + Symbols.UI_ELEMENT_SUFFIX + ',' + comment;
      }

      let newStep = deepcopy(step);
      newStep.nodeType = nodeType;
      newStep.content = sentence;
      newStep.comment = (step.comment || '') + comment;
      newStep.location = {
        column: step.location.column,
        line: line++,
        filePath: step.location.filePath
      };
      newStep.isInvalidValue = isDefined(uieTestPlan) && uieTestPlan.result === DTCAnalysisResult.INVALID;

      this._variantSentenceRec.recognizeSentences(localeContext.language, [newStep], ctx.errors, ctx.warnings);

      steps.push(newStep);

      if (oraclesToAdd.length > 0) {
        oracles.push({
          step: newStep,
          otherwiseSteps: oraclesToAdd
        });
      }

      ++count;
    }

    return [steps, oracles];
  }

  processOracles(steps, language, languageDictionary, keywords, ctx) {
    if (steps.length < 1) {
      return steps;
    }

    let stepsClone = deepcopy(steps);
    this.replaceConstantsWithTheirValues(stepsClone, language, ctx);
    stepsClone = this.fillUILiteralsWithoutValueInSteps(stepsClone, language, keywords, ctx);
    this.replaceUIElementsWithUILiterals(stepsClone, language, languageDictionary, ctx, UIElementReplacementOption.ALL);
    return stepsClone;
  }

  normalizeOracleSentences(steps, keywords) {
    if (steps.length < 1) {
      return;
    }

    const otherwiseKeywords = !keywords.stepOtherwise || keywords.stepOtherwise.length < 1 ? ['otherwise'] : keywords.stepOtherwise;
    const prefixAnd = this.stepPrefixNodeType(NodeTypes.STEP_AND, keywords);
    const prefixThen = this.stepPrefixNodeType(NodeTypes.STEP_THEN, keywords);
    let line = steps[0].location.line;
    let count = 0;

    for (let step of steps) {
      if (isDefined(step.location)) {
        step.location.line = line;
      }

      if (step.nodeType === NodeTypes.STEP_OTHERWISE) {
        let nodeType = NodeTypes.STEP_AND;
        let prefix = prefixAnd;

        if (count <= 0) {
          nodeType = NodeTypes.STEP_THEN;
          prefix = prefixThen;
        }

        step.nodeType = nodeType;
        let index = -1,
            start = -1;

        for (let keyword of otherwiseKeywords) {
          index = step.content.toLowerCase().indexOf(keyword);

          if (index >= 0) {
            start = keyword.length;

            if (start === step.content.indexOf(',')) {
              ++start;
            }

            step.content = prefix + step.content.substr(start);
            break;
          }
        }
      }

      ++line;
      ++count;
    }
  }

  async replaceUIPropertyReferencesInsideValues(steps, oracles, uieVariableToValueMap, localeContext, languageDictionary, ctx) {
    for (let step of steps) {
      await this.replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, localeContext, languageDictionary, ctx);
    }

    for (let step of oracles) {
      await this.replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, localeContext, languageDictionary, ctx);
    }
  }

  async replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, localeContext, languageDictionary, ctx) {
    const extractor = new UIPropertyReferenceExtractor();
    const replacer = new UIPropertyReferenceReplacer();

    const valueEntities = this._nlpUtil.entitiesNamed(Entities.VALUE, step.nlpResult);

    const contentBefore = step.content;

    for (let entity of valueEntities) {
      const before = entity.value;
      const references = extractor.extractReferencesFromValue(before, step.location.line);
      this.checkUIPropertyReferences(references, languageDictionary, ctx);
      const after = await replacer.replaceUIPropertyReferencesByTheirValue(localeContext, step, before, references, uieVariableToValueMap, ctx, true);

      if (after == before) {
        continue;
      }

      step.content = step.content.replace(Symbols.VALUE_WRAPPER + before + Symbols.VALUE_WRAPPER, Symbols.VALUE_WRAPPER + after + Symbols.VALUE_WRAPPER);
    }

    if (contentBefore != step.content) {
      this._variantSentenceRec.recognizeSentences(localeContext.language, [step], ctx.errors, ctx.warnings);
    }
  }

  hasUIPropertyReference(step) {
    if (!step || !step.nlpResult) {
      return false;
    }

    return this._nlpUtil.hasEntityNamed(Entities.UI_PROPERTY_REF, step.nlpResult);
  }

  checkUIPropertyReferences(references, languageDictionary, ctx) {
    let languageIndependentReferences = [];

    for (let uipRef of references) {
      if (uipRef.location && !uipRef.location.filePath) {
        uipRef.location.filePath = ctx.doc.fileInfo.path;
      }

      this.transformLanguageDependentIntoLanguageIndependent(uipRef, languageDictionary);

      if (!this.hasLanguageIndependentProperty(uipRef)) {
        const msg = 'Incorrect reference to a UI Element property: ' + uipRef.content;
        const e = new SyntacticException(msg, uipRef.location);
        ctx.errors.push(e);
        continue;
      } else {
        languageIndependentReferences.push(uipRef);
      }

      if (!this.isUIPropertyReferenceToValue(uipRef, languageDictionary)) {
        const msg = 'Unsupported reference to a UI Element property: ' + uipRef.content;
        const e = new Warning(msg, uipRef.location);
        ctx.warnings.push(e);
      }
    }

    return languageIndependentReferences;
  }

  transformLanguageDependentIntoLanguageIndependent(uipRef, languageDictionary) {
    const langUIProperties = (languageDictionary.nlp["ui"] || {})["ui_property"] || {};
    const uipRefProp = uipRef.property.toLowerCase();

    for (let prop in langUIProperties) {
      const propValues = langUIProperties[prop] || [];

      if (uipRefProp == prop || propValues.indexOf(uipRefProp) >= 0) {
        uipRef.property = prop;
      }
    }
  }

  hasLanguageIndependentProperty(uipRef) {
    const values = enumUtil.getValues(UIPropertyTypes);
    return values.indexOf(uipRef.property.toLowerCase()) >= 0;
  }

  isUIPropertyReferenceToValue(uipRef, languageDictionary) {
    const VALUE = 'value';
    const valuesOfThePropertyValue = ((languageDictionary.nlp["ui"] || {})["ui_property"] || {})[VALUE] || {};
    const uipRefProp = uipRef.property.toLowerCase();
    return VALUE === uipRefProp || valuesOfThePropertyValue.indexOf(uipRefProp) >= 0;
  }

  extractDataInputActionEntity(step) {
    return step.nlpResult.entities.find(e => e.entity === Entities.UI_ACTION && this.isDataInputAction(e.value)) || null;
  }

  isDataInputAction(action) {
    return Actions.FILL === action || Actions.SELECT === action || Actions.APPEND === action || Actions.ATTACH_FILE === action;
  }

  hasValue(step) {
    if (!step || !step.nlpResult) {
      return false;
    }

    return this._nlpUtil.hasEntityNamed(Entities.VALUE, step.nlpResult);
  }

  hasNumber(step) {
    if (!step || !step.nlpResult) {
      return false;
    }

    return this._nlpUtil.hasEntityNamed(Entities.NUMBER, step.nlpResult);
  }

  randomString() {
    return this._randomString.between(this.minRandomStringSize, this.maxRandomStringSize);
  }

  stepPrefixNodeType(nodeType, keywords) {
    let prefix;

    switch (nodeType) {
      case NodeTypes.STEP_GIVEN:
        prefix = !keywords ? 'Given that' : keywords.stepGiven[0] || 'Given that';
        break;

      case NodeTypes.STEP_WHEN:
        prefix = !keywords ? 'When' : keywords.stepWhen[0] || 'When';
        break;

      case NodeTypes.STEP_THEN:
        prefix = !keywords ? 'Then' : keywords.stepThen[0] || 'Then';
        break;

      case NodeTypes.STEP_AND:
        prefix = !keywords ? 'And' : keywords.stepAnd[0] || 'And';
        break;

      case NodeTypes.STEP_OTHERWISE:
        prefix = !keywords ? 'Otherwise' : keywords.stepOtherwise[0] || 'Otherwise';
        break;

      default:
        prefix = !nodeType ? '???' : nodeType.toString();
    }

    return upperFirst(prefix);
  }

}

class UIETestPlan {
  constructor(dtc, result, otherwiseSteps) {
    this.dtc = dtc;
    this.result = result;
    this.otherwiseSteps = otherwiseSteps;
  }

  hasOtherwiseSteps() {
    return (this.otherwiseSteps || []).length > 0;
  }

  isResultInvalid() {
    return DTCAnalysisResult.INVALID === this.result;
  }

  shouldFail() {
    return this.isResultInvalid() && !this.hasOtherwiseSteps();
  }

}

class OnlyValidMix {
  select(map, alwaysValidVariables) {
    let obj = {};

    for (let [uieName, dtcMap] of map) {
      obj[uieName] = [];

      for (let [dtc, data] of dtcMap) {
        if (DTCAnalysisResult.VALID === data.result) {
          obj[uieName].push(new UIETestPlan(dtc, data.result, data.oracles));
        }
      }
    }

    return [obj];
  }

}
class JustOneInvalidMix {
  select(map, alwaysValidVariables) {
    let all = [];

    for (let [uieName] of map) {
      let obj = this.oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(map, uieName, alwaysValidVariables);
      all.push(obj);
    }

    return all;
  }

  oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(map, targetUIEName, alwaysValidVariables) {
    let obj = {};

    for (let [uieName, dtcMap] of map) {
      obj[uieName] = [];
      let isTheTargetUIE = uieName === targetUIEName;
      let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;

      for (let [dtc, data] of dtcMap) {
        if (DTCAnalysisResult.VALID === data.result) {
          if (!isTheTargetUIE || currentMustBeValid) {
            obj[uieName].push(new UIETestPlan(dtc, data.result, data.oracles));
          }
        } else if (DTCAnalysisResult.INVALID === data.result) {
          if (isTheTargetUIE && !currentMustBeValid) {
            obj[uieName].push(new UIETestPlan(dtc, data.result, data.oracles));
          }
        }
      }
    }

    return obj;
  }

}
class OnlyInvalidMix {
  select(map, alwaysValidVariables) {
    let obj = {};

    for (let [uieName, dtcMap] of map) {
      obj[uieName] = [];
      let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;

      for (let [dtc, data] of dtcMap) {
        if (DTCAnalysisResult.INVALID === data.result && !currentMustBeValid || DTCAnalysisResult.VALID === data.result && currentMustBeValid) {
          obj[uieName].push(new UIETestPlan(dtc, data.result, data.oracles));
        }
      }
    }

    return [obj];
  }

}
class UnfilteredMix {
  select(map, alwaysValidVariables) {
    let obj = {};

    for (let [uieName, dtcMap] of map) {
      obj[uieName] = [];
      let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;

      for (let [dtc, data] of dtcMap) {
        if (DTCAnalysisResult.INCOMPATIBLE === data.result || currentMustBeValid && DTCAnalysisResult.INVALID === data.result) {
          continue;
        }

        obj[uieName].push(new UIETestPlan(dtc, data.result, data.oracles));
      }
    }

    return [obj];
  }

}

class TestPlanner {
  constructor(mixingStrategy, combinationStrategy, seed) {
    this.mixingStrategy = mixingStrategy;
    this.combinationStrategy = combinationStrategy;
    this.seed = seed;
  }

  make(map, alwaysValidVariables) {
    let plans = [];

    if (alwaysValidVariables.length > 0) {
      const randomLong = new RandomLong(new Random(this.seed));

      for (let uieVar of alwaysValidVariables) {
        let dtcMap = map.get(uieVar);

        if (!dtcMap) {
          continue;
        }

        for (let [dtc, data] of dtcMap) {
          if (data.result === DTCAnalysisResult.INVALID || data.result === DTCAnalysisResult.INCOMPATIBLE) {
            dtcMap.delete(dtc);
          }
        }

        let count = dtcMap.size;

        if (count > 1) {
          let index = randomLong.between(0, count - 1);
          let arr = Array.from(dtcMap);
          let [dtc, data] = arr[index];
          dtcMap.clear();
          dtcMap.set(dtc, data);
        }
      }
    }

    let objects = this.mixingStrategy.select(map, alwaysValidVariables);

    for (let obj of objects) {
      let combinations = this.combinationStrategy.combine(obj);

      for (let combObj of combinations) {
        let plan = new TestPlan();
        plan.dataTestCases = new Map(objectToArray(combObj));
        plans.push(plan);
      }
    }

    return plans;
  }

}

const hasState = sentence => STATE_REGEX.test(sentence);

const stepHasState = step => step ? hasState(step.content) : false;

class StepHandler {
  constructor(_defaultLanguage) {
    this._defaultLanguage = _defaultLanguage;
    this._keywords = new Map();
  }

  keywordMapForLanguage(docLanguage) {
    const lang = isDefined(docLanguage) ? docLanguage : this._defaultLanguage;

    let dictionary = this._keywords.get(lang);

    if (!dictionary) {
      const languageDictionary = dictionaryForLanguage(lang);
      const keywords = languageDictionary.keywords;
      dictionary = new Map();
      dictionary.set(NodeTypes.STEP_GIVEN, (keywords.stepGiven || ['given'])[0]);
      dictionary.set(NodeTypes.STEP_WHEN, (keywords.stepWhen || ['when'])[0]);
      dictionary.set(NodeTypes.STEP_THEN, (keywords.stepThen || ['then'])[0]);
      dictionary.set(NodeTypes.STEP_AND, (keywords.stepAnd || ['and'])[0]);
      dictionary.set(NodeTypes.STEP_OTHERWISE, (keywords.stepOtherwise || ['otherwise'])[0]);

      this._keywords.set(lang, dictionary);
    }

    return dictionary;
  }

  startsWithKeyword(stepContent, keyword) {
    const searchWithOptionalTabsOrSpaces = new RegExp('^(?: |\t)*' + keyword, 'i');
    return searchWithOptionalTabsOrSpaces.test(stepContent);
  }

  replacePrefix(searchNodeType, replaceNodeType, stepContent, docLanguage) {
    const dictionary = this.keywordMapForLanguage(docLanguage);

    if (!dictionary || !stepContent) {
      return stepContent;
    }

    const searchKeyword = dictionary.get(searchNodeType);
    let replaceKeyword = dictionary.get(replaceNodeType);

    if (!searchKeyword || !replaceKeyword) {
      return stepContent;
    }

    if (replaceNodeType !== NodeTypes.STEP_AND) {
      replaceKeyword = upperFirst(replaceKeyword);
    }

    const searchWithOptionalTabsOrSpaces = new RegExp('^(?: |\t)*' + searchKeyword, 'i');

    if (!searchWithOptionalTabsOrSpaces.test(stepContent)) {
      return stepContent;
    }

    const search = new RegExp(searchKeyword, 'i');
    const r = stepContent.replace(search, replaceKeyword);
    const [, second, third] = r.split(/[ \t]+/g);

    if (second && third && second.toLowerCase() === third.toLowerCase()) {
      return r.replace(new RegExp('[ \t]+' + second, 'i'), '');
    }

    return r;
  }

  adjustPrefixes(steps, docLanguage) {
    let lastStepType;

    for (const step of steps) {
      if (step.nodeType !== NodeTypes.STEP_AND) {
        if (!lastStepType) {
          lastStepType = step.nodeType;
          continue;
        }

        if (step.nodeType === lastStepType) {
          step.content = this.replacePrefix(step.nodeType, NodeTypes.STEP_AND, step.content, docLanguage);
          step.nodeType = NodeTypes.STEP_AND;
        }
      }

      lastStepType = step.nodeType;
    }
  }

  adjustPrefixesToReplaceStates(steps, docLanguage) {
    let priorWasGiven = false,
        priorWasWhen = false,
        priorHasState = false;

    for (let step of steps) {
      if (step.nodeType === NodeTypes.STEP_GIVEN) {
        priorWasGiven = true;
        priorWasWhen = false;
        priorHasState = stepHasState(step);
      } else if (step.nodeType === NodeTypes.STEP_WHEN) {
        priorWasGiven = false;
        priorWasWhen = true;
        priorHasState = stepHasState(step);
      } else if (step.nodeType === NodeTypes.STEP_AND && priorHasState && (priorWasGiven || priorWasWhen) && !stepHasState(step)) {
        if (priorWasGiven) {
          step.content = this.replacePrefix(NodeTypes.STEP_AND, NodeTypes.STEP_GIVEN, step.content, docLanguage);
          step.nodeType = NodeTypes.STEP_GIVEN;
        } else {
          step.content = this.replacePrefix(NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, step.content, docLanguage);
          step.nodeType = NodeTypes.STEP_WHEN;
        }

        priorHasState = false;
      }
    }
  }

  removeStep(steps, index, docLanguage) {
    const len = steps.length;

    if (index < 0 || index >= len) {
      return steps;
    }

    const target = steps[index];

    if (!target) {
      return steps;
    }

    const isTargetAnAndStep = target.nodeType === NodeTypes.STEP_AND;
    const nextStep = index + 1 < len ? steps[index + 1] : null;
    const isNextAnAndStep = nextStep && nextStep.nodeType === NodeTypes.STEP_AND;

    if (!isTargetAnAndStep && isNextAnAndStep) {
      nextStep.content = this.replacePrefix(nextStep.nodeType, target.nodeType, nextStep.content, docLanguage);
      nextStep.nodeType = target.nodeType;
    }

    const arrayCopy = [...steps];
    arrayCopy.splice(index, 1);
    return arrayCopy;
  }

  stepsExceptExternalOrGivenStepsWithState(steps, docLanguage) {
    let lastNonAndWasGiven = false;
    let indexesToRemove = [];
    let index = -1;

    for (const step of steps) {
      ++index;

      if (step.external) {
        indexesToRemove.push(index);
        continue;
      }

      if (step.nodeType === NodeTypes.STEP_GIVEN) {
        lastNonAndWasGiven = true;

        if (stepHasState(step)) {
          indexesToRemove.push(index);
          continue;
        }
      } else if (step.nodeType === NodeTypes.STEP_WHEN || step.nodeType === NodeTypes.STEP_THEN) {
        lastNonAndWasGiven = false;
      }

      if (lastNonAndWasGiven && step.nodeType === NodeTypes.STEP_AND) {
        if (stepHasState(step)) {
          indexesToRemove.push(index);
          continue;
        }
      }
    }

    let newSteps = [...steps];

    for (const index of indexesToRemove.reverse()) {
      newSteps = this.removeStep(newSteps, index, docLanguage);
    }

    return newSteps;
  }

}

class TestScenario {
  constructor() {
    this.ignoreForTestCaseGeneration = false;
    this.steps = [];
  }

  clone() {
    let ts = new TestScenario();
    ts.steps = this.steps.slice(0);
    ts.ignoreForTestCaseGeneration = this.ignoreForTestCaseGeneration;
    return ts;
  }

}

class VariantStateDetector {
  update(variantLike) {
    if (!variantLike) {
      return;
    }

    variantLike.preconditions = [];
    variantLike.stateCalls = [];
    variantLike.postconditions = [];

    if (!variantLike.sentences || variantLike.sentences.length < 1) {
      return;
    }

    const nlpUtil = new NLPUtil();
    let nodeType = null;
    let stepIndex = -1;

    for (let step of variantLike.sentences) {
      ++stepIndex;

      if (!step.nlpResult) {
        continue;
      }

      if (step.nodeType !== NodeTypes.STEP_AND && step.nodeType !== NodeTypes.STEP_OTHERWISE) {
        nodeType = step.nodeType;
      }

      if (null === nodeType) {
        continue;
      }

      let targetRef = null;

      switch (nodeType) {
        case NodeTypes.STEP_GIVEN:
          targetRef = variantLike.preconditions;
          break;

        case NodeTypes.STEP_WHEN:
          targetRef = variantLike.stateCalls;
          break;

        case NodeTypes.STEP_THEN:
          targetRef = variantLike.postconditions;
          break;
      }

      if (null === targetRef) {
        continue;
      }

      const stateNames = nlpUtil.valuesOfEntitiesNamed(Entities.STATE, step.nlpResult);

      for (const name of stateNames) {
        targetRef.push(new State(name, stepIndex));
      }
    }
  }

  removePreconditionsThatRefersToPostconditions(variant) {
    let removed = [];

    for (let postc of variant.postconditions || []) {
      let index = 0;

      for (let prec of variant.preconditions || []) {
        if (prec.equals(postc)) {
          removed.push(prec);
          variant.preconditions.splice(index, 1);
        }

        ++index;
      }
    }

    return removed;
  }

}

class TestScenarioGenerator {
  constructor(_preTestCaseGenerator, _variantSelectionStrategy, _statePairCombinationStrategy, _variantToTestScenarioMap, _postconditionNameToVariantsMap) {
    this._preTestCaseGenerator = _preTestCaseGenerator;
    this._variantSelectionStrategy = _variantSelectionStrategy;
    this._statePairCombinationStrategy = _statePairCombinationStrategy;
    this._variantToTestScenarioMap = _variantToTestScenarioMap;
    this._postconditionNameToVariantsMap = _postconditionNameToVariantsMap;
    this._defaultLanguage = this._preTestCaseGenerator.defaultLanguage;
    this._stepHandler = new StepHandler(this._defaultLanguage);
    this.seed = this._preTestCaseGenerator.seed;
    this._randomLong = new RandomLong(new Random(this.seed));
    this._validValuePlanMaker = new TestPlanner(new OnlyValidMix(), _statePairCombinationStrategy, this.seed);
  }

  async generate(ctx, variant) {
    let testScenarios = [];

    const docLanguage = this._preTestCaseGenerator.docLanguage(ctx.doc);

    let baseScenario = this.makeTestScenarioFromVariant(variant, docLanguage);

    if (!baseScenario.steps || baseScenario.steps.length < 1) {
      return [];
    }

    let pairMap = {};
    const preconditions = (variant.preconditions || []).filter(st => !st.notFound);
    const stateCalls = (variant.stateCalls || []).filter(st => !st.notFound);
    let allStatesToReplace = preconditions.concat(stateCalls);

    if (allStatesToReplace.length > 0) {
      for (let stateToReplace of allStatesToReplace) {
        let state = deepcopy(stateToReplace);

        if (!pairMap[state.name]) {
          pairMap[state.name] = [];
        } else {
          continue;
        }

        let currentMap = pairMap[state.name];
        let producerVariants = this.variantsThatProduce(state.name);

        if (producerVariants.length < 1) {
          continue;
        }

        producerVariants = this.selectVariantsToCombine(producerVariants);

        for (let otherVariant of producerVariants) {
          let testScenario = this.selectSingleValidTestScenarioOf(otherVariant, ctx.errors);

          if (null === testScenario) {
            continue;
          }

          currentMap.push([state, testScenario]);
        }
      }

      let result = this._statePairCombinationStrategy.combine(pairMap);

      let testScenariosToCombineByState = result;

      if (!testScenariosToCombineByState || testScenariosToCombineByState.length < 1) {
        testScenarios.push(baseScenario);
      } else {
        for (let stateObj of testScenariosToCombineByState) {
          let ts = baseScenario.clone();

          for (let stateInTestCase of allStatesToReplace) {
            for (let stateName in stateObj) {
              if (!stateInTestCase.nameEquals(stateName)) {
                continue;
              }

              let statePair = stateObj[stateName];

              if (!statePair) {
                continue;
              }

              let state = statePair[0];
              let tsToReplaceStep = statePair[1];
              let stepsAdded = 0;
              let stepIndex = 0;

              for (let tsStep of ts.steps) {
                let tsState = tsStep.nlpResult.entities.find(e => e.entity === Entities.STATE);

                if (tsState && state.nameEquals(tsState.value)) {
                  state.stepIndex = stepIndex;
                  break;
                }

                ++stepIndex;
              }

              const isPrecondition = preconditions.findIndex(st => st.nameEquals(state.name)) >= 0;
              let tsToUse = tsToReplaceStep.clone();
              let all = await this._preTestCaseGenerator.generate(tsToReplaceStep.steps, ctx, [this._validValuePlanMaker]);
              const preTestCase = all[0];
              tsToUse.steps = preTestCase.steps;
              state.stepIndex += stepsAdded > 0 ? stepsAdded - 1 : 0;
              stepsAdded += this.replaceStepWithTestScenario(ts, state, tsToUse, isPrecondition, docLanguage);
            }
          }

          testScenarios.push(ts);
        }
      }
    } else {
      testScenarios.push(baseScenario);
    }

    if (variant.postconditions && variant.postconditions.length > 0) {
      let newTestScenarios = [];

      for (let ts of testScenarios) {
        let all = await this._preTestCaseGenerator.generate(ts.steps, ctx, [this._validValuePlanMaker]);
        const preTestCase = all[0];
        let newTS = ts.clone();
        newTS.steps = preTestCase.steps;
        newTestScenarios.push(newTS);
      }

      this._variantToTestScenarioMap.set(variant, newTestScenarios);
    }

    this.mapPostconditionsOf(variant);
    return testScenarios;
  }

  mapPostconditionsOf(variant) {
    for (let postc of variant.postconditions) {
      if (this._postconditionNameToVariantsMap.has(postc.name)) {
        let variants = this._postconditionNameToVariantsMap.get(postc.name);

        if (variants.indexOf(variant) < 0) {
          variants.push(variant);
        }
      } else {
        this._postconditionNameToVariantsMap.set(postc.name, [variant]);
      }
    }
  }

  detectVariantStates(variant, errors) {
    const detector = new VariantStateDetector();
    detector.update(variant);
    let removed = detector.removePreconditionsThatRefersToPostconditions(variant);

    if (removed.length > 0) {
      let wrongPreconditions = removed.map(s => s.name);
      const msg = 'These variant preconditions refers to postconditions: ' + wrongPreconditions.join(', ');
      const err = new RuntimeException(msg, variant.location);
      errors.push(err);
    }
  }

  variantsThatProduce(stateName) {
    return this._postconditionNameToVariantsMap.get(stateName) || [];
  }

  selectVariantsToCombine(variants) {
    return this._variantSelectionStrategy.select(variants);
  }

  selectSingleValidTestScenarioOf(variant, errors) {
    const testScenarios = this._variantToTestScenarioMap.get(variant);

    if (!testScenarios || testScenarios.length < 1) {
      const msg = 'Error retrieving Test Scenarios from the Variant' + variant.name;
      const err = new RuntimeException(msg, variant.location);
      errors.push(err);
      return null;
    }

    const index = this._randomLong.between(0, testScenarios.length - 1);

    return testScenarios[index];
  }

  makeTestScenarioFromVariant(variant, docLanguage) {
    const ts = new TestScenario();

    if (!variant || !variant.sentences || variant.sentences.length < 1) {
      return ts;
    }

    ts.steps = deepcopy(variant.sentences);
    const preconditionsToRemove = variant.preconditions ? variant.preconditions.filter(st => st.notFound).reverse() : [];

    for (const state of preconditionsToRemove) {
      const producerVariants = this.variantsThatProduce(state.name);

      if (producerVariants.length > 0) {
        continue;
      }

      if (!ts.steps[state.stepIndex]) {
        continue;
      }

      ts.steps = this._stepHandler.removeStep(ts.steps, state.stepIndex, docLanguage);
    }

    for (const state of variant.postconditions.reverse()) {
      if (!ts.steps[state.stepIndex]) {
        continue;
      }

      ts.steps = this._stepHandler.removeStep(ts.steps, state.stepIndex, docLanguage);
    }

    const languageDictionary = dictionaryForLanguage(isDefined(docLanguage) ? docLanguage : this._defaultLanguage);
    const keywords = languageDictionary.keywords;
    ts.ignoreForTestCaseGeneration = this.containsIgnoreTag(variant.tags, keywords.tagIgnore || ['ignore']);

    this._stepHandler.adjustPrefixesToReplaceStates(ts.steps, docLanguage);

    return ts;
  }

  containsIgnoreTag(tags, ignoreKeywords) {
    return tagsWithAnyOfTheNames(tags, ignoreKeywords).length > 0;
  }

  replaceStepWithTestScenario(ts, state, tsToReplaceStep, isPrecondition, docLanguage) {
    const stepsToCopy = isPrecondition ? tsToReplaceStep.steps : this._stepHandler.stepsExceptExternalOrGivenStepsWithState(tsToReplaceStep.steps, docLanguage);
    let stepsToReplace = deepcopy(stepsToCopy);

    for (let step of stepsToReplace) {
      step.external = true;
    }

    ts.steps.splice(state.stepIndex, 1, ...stepsToReplace);
    const stepsAdded = stepsToReplace.length;
    state.stepIndex += stepsAdded;
    return stepsAdded;
  }

}

class TestCaseDocumentGenerator {
  constructor(_extensionFeature, _extensionTestCase, _basePath) {
    this._extensionFeature = _extensionFeature;
    this._extensionTestCase = _extensionTestCase;
    this._basePath = _basePath;
  }

  generate(fromDoc, testCases) {
    var _fromDoc$fileInfo;

    let line = 1;
    const fromDocPath = fromDoc == null ? void 0 : (_fromDoc$fileInfo = fromDoc.fileInfo) == null ? void 0 : _fromDoc$fileInfo.path;
    let newDoc = {
      fileInfo: {
        hash: null,
        path: this.createTestCaseFilePath(fromDocPath)
      },
      imports: [],
      testCases: []
    };
    newDoc.language = this.createLanguage(fromDoc, ++line);
    newDoc.imports = this.createImports(fromDocPath, ++line);
    line += newDoc.imports.length;
    line = this.updateLinesFromTestCases(testCases, ++line);
    newDoc.testCases = testCases;
    return newDoc;
  }

  createTestCaseFilePath(featurePath) {
    const testCaseFile = basename(featurePath, this._extensionFeature) + this._extensionTestCase;

    const testCasePath = join(dirname(featurePath), testCaseFile);
    return testCasePath;
  }

  createLanguage(fromDoc, startLine) {
    if (!fromDoc.language) {
      return;
    }

    let lang = deepcopy(fromDoc.language);
    lang.location.line = startLine;
    return lang;
  }

  createImports(fromDocPath, startLine) {
    let imports = [];
    const dir = dirname(fromDocPath);
    const filePath = relative(dir, join(dir, basename(fromDocPath)));
    let docImport = {
      nodeType: NodeTypes.IMPORT,
      location: {
        column: 1,
        line: startLine
      },
      value: filePath
    };
    imports.push(docImport);
    return imports;
  }

  updateLinesFromTestCases(testCases, startLine) {
    let line = startLine;

    for (let tc of testCases) {
      line = this.updateLinesOfTestCase(tc, line);
    }

    return line;
  }

  updateLinesOfTestCase(tc, startLine) {
    let line = 1 + startLine;

    for (let tag of tc.tags || []) {
      tag.location.line = line++;
    }

    tc.location.line = line++;
    tc.sentences = deepcopy(tc.sentences);

    for (let sentence of tc.sentences || []) {
      sentence.location.line = line++;
    }

    return line;
  }

}

class TestCaseFileGenerator {
  constructor(language) {
    this.fileHeader = ['# Generated with ❤ by Concordia', '#', '# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !', ''];
    this._dict = dictionaryForLanguage(language).keywords;
  }

  createLinesFromDoc(doc, errors, ignoreHeader = false, indentation = '  ') {
    let dict = this._dict;
    let lines = [];

    if (!ignoreHeader) {
      lines.push.apply(lines, this.fileHeader);
    }

    if (doc.language) {
      dict = dictionaryForLanguage(doc.language.value).keywords;
      let line = this.generateLanguageLine(doc.language.value, dict);
      doc.language.location = {
        line: lines.length + 1,
        column: 1 + line.length - line.trimLeft().length
      };
      lines.push(line);
      lines.push('');
    }

    for (let imp of doc.imports || []) {
      let line = this.generateImportLine(imp.value, dict);
      imp.location = {
        line: lines.length + 1,
        column: 1 + line.length - line.trimLeft().length
      };
      lines.push(line);
    }

    let lastTagsContent = '';

    for (let testCase of doc.testCases || []) {
      lines.push('');
      let newTagsContent = testCase.tags.map(t => t.content || '').join('');

      if (lastTagsContent != newTagsContent) {
        if (lastTagsContent !== '') {
          lines.push(Symbols.COMMENT_PREFIX + ' ' + '-'.repeat(80 - 2));
          lines.push('');
        }

        lastTagsContent = newTagsContent;
      }

      for (let tag of testCase.tags || []) {
        let line = this.generateTagLine(tag.name, tag.content);
        tag.location = {
          line: lines.length + 1,
          column: 1 + line.length - line.trimLeft().length
        };
        lines.push(line);
      }

      let line = this.generateTestCaseHeader(testCase.name, dict);
      lines.push(line);

      if (!testCase.location) {
        testCase.location = {};
      }

      testCase.location.column = line.length - line.trimLeft.length;
      testCase.location.line = lines.length;
      const baseLineNumber = testCase.location.line;
      let lineNumber = 1 + baseLineNumber;

      for (let sentence of testCase.sentences || []) {
        if (!sentence) {
          continue;
        }

        let ind = indentation;

        if (NodeTypes.STEP_AND === sentence.nodeType) {
          ind += indentation;
        }

        let line = ind + sentence.content + (!sentence.comment ? '' : '  ' + Symbols.COMMENT_PREFIX + sentence.comment);
        sentence.location = {
          line: lineNumber++,
          column: line.length - line.trimLeft().length
        };
        lines.push(line);
      }
    }

    return lines;
  }

  generateLanguageLine(language, dict) {
    return Symbols.COMMENT_PREFIX + (!dict.language ? 'language' : dict.language[0] || 'language') + Symbols.LANGUAGE_SEPARATOR + language;
  }

  generateImportLine(path, dict) {
    return (!dict.import ? 'import' : dict.import[0] || 'import') + ' ' + Symbols.IMPORT_PREFIX + path + Symbols.IMPORT_SUFFIX;
  }

  generateTagLine(name, content) {
    return Symbols.TAG_PREFIX + name + (!content ? '' : '(' + content + ')');
  }

  generateTestCaseHeader(name, dict) {
    return upperFirst(!dict ? 'Test Case' : dict.testCase[0] || 'Test Case') + Symbols.TITLE_SEPARATOR + ' ' + name;
  }

}

class TestCaseGenerator {
  constructor(_preTestCaseGenerator) {
    this._preTestCaseGenerator = _preTestCaseGenerator;
  }

  async generate(ts, ctx, testPlanMakers) {
    if (true === ts.ignoreForTestCaseGeneration) {
      return [];
    }

    let all = await this._preTestCaseGenerator.generate(ts.steps, ctx, testPlanMakers);
    let testCases = [];

    for (let preTestCase of all) {
      let tc = this.produceTestCase(preTestCase);
      testCases.push(tc);
    }

    return testCases;
  }

  addReferenceTagsTo(tc, scenarioIndex, variantIndex) {
    tc.declaredScenarioIndex = scenarioIndex;
    tc.declaredVariantIndex = variantIndex;

    if (!tc.tags) {
      tc.tags = [];
    }

    let hasScenarioTag = false,
        hasVariantTag = false;

    for (let tag of tc.tags) {
      if (ReservedTags.SCENARIO === tag.name) hasScenarioTag = true;else if (ReservedTags.VARIANT === tag.name) hasVariantTag = true;
    }

    if (!hasScenarioTag) {
      tc.tags.push(this.makeTag(ReservedTags.SCENARIO, scenarioIndex));
    }

    if (!hasVariantTag) {
      tc.tags.push(this.makeTag(ReservedTags.VARIANT, variantIndex));
    }
  }

  produceTestCase(preTestCase) {
    let tc = {
      nodeType: NodeTypes.TEST_CASE,
      location: {
        column: 0,
        line: 0
      },
      generated: true,
      notRead: true
    };
    tc.shouldFail = preTestCase.shouldFail();
    tc.tags = this.makeTags(tc);

    if (preTestCase.hasOracles()) {
      tc.sentences = preTestCase.stepsBeforeTheLastThenStep().concat(preTestCase.oracles);
    } else {
      tc.sentences = preTestCase.steps.slice(0);
    }

    return tc;
  }

  makeTags(tc) {
    let tags = [];

    if (tc.generated) {
      tags.push(this.makeTag(ReservedTags.GENERATED));
    }

    if (tc.shouldFail) {
      tags.push(this.makeTag(ReservedTags.FAIL));
    }

    return tags;
  }

  makeTag(name, content, line = 0) {
    return {
      nodeType: NodeTypes.TAG,
      location: {
        column: 0,
        line: line
      },
      name: name,
      content: content
    };
  }

}

function toCaseType(caseUi) {
  if (enumUtil.isValue(CaseType, caseUi)) {
    return caseUi;
  }

  if (enumUtil.isValue(CaseType, DEFAULT_CASE_UI)) {
    return DEFAULT_CASE_UI;
  }

  return CaseType.CAMEL;
}

function toVariantSelectionOptions(combVariant) {
  if (enumUtil.isValue(VariantSelectionOptions, combVariant)) {
    return combVariant;
  }

  if (enumUtil.isValue(VariantSelectionOptions, DEFAULT_VARIANT_SELECTION)) {
    return DEFAULT_VARIANT_SELECTION;
  }

  return VariantSelectionOptions.SINGLE_RANDOM;
}

function typedStateCombination(combState) {
  return typedCombinationFor(combState, DEFAULT_STATE_COMBINATION);
}

function typedDataCombination(combData) {
  return typedCombinationFor(combData, DEFAULT_DATA_TEST_CASE_COMBINATION);
}

function typedCombinationFor(value, defaultValue) {
  if (enumUtil.isValue(CombinationOptions, value)) {
    return value;
  }

  if (enumUtil.isValue(CombinationOptions, defaultValue)) {
    return defaultValue;
  }

  return CombinationOptions.SHUFFLED_ONE_WISE;
}

class TestCaseGeneratorFacade {
  constructor(_variantSentenceRec, _languageMap, _listener, _fileHandler) {
    this._variantSentenceRec = _variantSentenceRec;
    this._languageMap = _languageMap;
    this._listener = _listener;
    this._fileHandler = _fileHandler;
  }

  async execute(options, spec, graph) {
    const startTime = Date.now();
    const preTCGen = new PreTestCaseGenerator(this._variantSentenceRec, this._languageMap, options.language, options.realSeed, toCaseType(options.caseUi), options.randomMinStringSize, options.randomMaxStringSize, options.randomTriesToInvalidValue);
    let strategyWarnings = [];
    const variantSelectionStrategy = this.variantSelectionStrategyFromOptions(options, strategyWarnings);
    const stateCombinationStrategy = this.stateCombinationStrategyFromOptions(options, strategyWarnings);
    let variantToTestScenariosMap = new Map();
    let postconditionNameToVariantsMap = new Map();
    let tsGen = new TestScenarioGenerator(preTCGen, variantSelectionStrategy, stateCombinationStrategy, variantToTestScenariosMap, postconditionNameToVariantsMap);
    const tcGen = new TestCaseGenerator(preTCGen);
    const testPlanMakers = this.testPlanMakersFromOptions(options, strategyWarnings);
    const tcDocGen = new TestCaseDocumentGenerator(options.extensionFeature, options.extensionTestCase, options.directory);
    const tcDocFileGen = new TestCaseFileGenerator(options.language);

    this._listener.testCaseGenerationStarted(strategyWarnings);

    let vertices = graph.vertices_topologically();
    let newTestCaseDocuments = [];
    let totalTestCasesCount = 0;

    for (let [, value] of vertices) {
      let doc = value;

      if (!doc || !doc.feature || !doc.feature.scenarios) {
        var _doc$testCases;

        totalTestCasesCount += ((_doc$testCases = doc.testCases) == null ? void 0 : _doc$testCases.length) || 0;
        continue;
      }

      let errors = [];
      let warnings = [];
      let ctx = new GenContext(spec, doc, errors, warnings);
      let testCases = [];
      let scenarioIndex = 0;

      for (let scenario of doc.feature.scenarios || []) {
        let variantIndex = 0;

        for (let variant of scenario.variants || []) {
          let testScenarios = [];

          try {
            testScenarios = await tsGen.generate(ctx, variant);
          } catch (err) {
            errors.push(err);
            continue;
          }

          let tsIndex = 0;

          for (let ts of testScenarios) {
            let generatedTC = [];

            try {
              generatedTC = await tcGen.generate(ts, ctx, testPlanMakers);
            } catch (err) {
              errors.push(err);
              continue;
            }

            if (generatedTC.length < 1) {
              continue;
            }

            let tcIndex = 1;

            for (let tc of generatedTC) {
              tcGen.addReferenceTagsTo(tc, scenarioIndex + 1, variantIndex + 1);
              tc.name = (variant.name || scenario.name) + ' - ' + (tcIndex + tsIndex);
              ++tcIndex;
            }

            ++tsIndex;
            testCases.push.apply(testCases, generatedTC);
          }

          ++variantIndex;
        }

        ++scenarioIndex;
      }

      const newDoc = tcDocGen.generate(doc, testCases);

      if (testCases.length < 1) {
        try {
          await this._fileHandler.erase(newDoc.fileInfo.path, true);
          continue;
        } catch (err) {
          errors.push(err);
        }
      }

      newTestCaseDocuments.push(newDoc);
      const from = toUnixPath(newDoc.fileInfo.path);
      const to = toUnixPath(doc.fileInfo.path);
      graph.addVertex(from, newDoc);
      graph.addEdge(to, from);
      const lines = tcDocFileGen.createLinesFromDoc(newDoc, errors, options.tcSuppressHeader, options.tcIndenter);

      this._listener.testCaseProduced(options.directory, newDoc.fileInfo.path, newDoc.testCases.length, errors, warnings);

      try {
        await this._fileHandler.write(newDoc.fileInfo.path, lines.join(options.lineBreaker));
      } catch (err) {
        const msg = 'Error generating the file "' + newDoc.fileInfo.path + '": ' + err.message;
        errors.push(new RuntimeException(msg));
      }
    }

    for (let newDoc of newTestCaseDocuments) {
      const index = spec.indexOfDocWithPath(newDoc.fileInfo.path);

      if (index < 0) {
        spec.addDocument(newDoc);
      } else {
        spec.replaceDocByIndex(index, newDoc);
      }
    }

    const durationMs = Date.now() - startTime;

    this._listener.testCaseGenerationFinished(newTestCaseDocuments.length, totalTestCasesCount, durationMs);

    return [spec, graph];
  }

  variantSelectionStrategyFromOptions(options, warnings) {
    const desired = toVariantSelectionOptions(options.combVariant);

    switch (desired) {
      case VariantSelectionOptions.SINGLE_RANDOM:
        return new SingleRandomVariantSelectionStrategy(options.realSeed);

      case VariantSelectionOptions.FIRST:
        return new FirstVariantSelectionStrategy();

      case VariantSelectionOptions.FIRST_MOST_IMPORTANT:
        return new FirstMostImportantVariantSelectionStrategy(options.importance, [ReservedTags.IMPORTANCE]);

      case VariantSelectionOptions.ALL:
        return new AllVariantsSelectionStrategy();

      default:
        {
          const used = VariantSelectionOptions.SINGLE_RANDOM.toString();
          const msg = 'Variant selection strategy not supported: ' + desired + '. It will be used "' + used + '" instead.';
          warnings.push(new Warning(msg));
          return new SingleRandomVariantSelectionStrategy(options.realSeed);
        }
    }
  }

  stateCombinationStrategyFromOptions(options, warnings) {
    return this.combinationStrategyFrom(typedStateCombination(options.combState), 'State', options, warnings);
  }

  combinationStrategyFrom(desired, name, options, warnings) {
    switch (desired) {
      case CombinationOptions.SHUFFLED_ONE_WISE:
        return new ShuffledOneWiseStrategy(options.realSeed);

      case CombinationOptions.ONE_WISE:
        return new OneWiseStrategy(options.realSeed);

      case CombinationOptions.SINGLE_RANDOM_OF_EACH:
        return new SingleRandomOfEachStrategy(options.realSeed);

      case CombinationOptions.ALL:
        return new CartesianProductStrategy();

      default:
        {
          const used = CombinationOptions.SHUFFLED_ONE_WISE.toString();
          const msg = name + ' combination strategy not supported: ' + desired + '. It will be used "' + used + '" instead.';
          warnings.push(new Warning(msg));
          return new ShuffledOneWiseStrategy(options.realSeed);
        }
    }
  }

  testPlanMakersFromOptions(options, warnings) {
    const none = InvalidSpecialOptions.NONE.toString();
    const all = InvalidSpecialOptions.ALL.toString();
    const random = InvalidSpecialOptions.RANDOM.toString();
    const default_ = InvalidSpecialOptions.DEFAULT.toString();
    let mixStrategy;
    const desired = String(options.combInvalid);

    switch (desired) {
      case '0':
      case none:
        mixStrategy = new OnlyValidMix();
        break;

      case '1':
        mixStrategy = new JustOneInvalidMix();
        break;

      case all:
        mixStrategy = new OnlyInvalidMix();
        break;

      case random:
      case default_:
        mixStrategy = new UnfilteredMix();
        break;

      default:
        {
          const used = random;
          const msg = 'Invalid data test case selection strategy not supported: ' + desired + '. It will be used "' + used + '" instead.';
          warnings.push(new Warning(msg));
          mixStrategy = new UnfilteredMix();
        }
    }

    const dataCombinationOption = desired === random ? CombinationOptions.SHUFFLED_ONE_WISE : typedDataCombination(options.combData);
    let combinationStrategy = this.combinationStrategyFrom(dataCombinationOption, 'Data', options, warnings);
    return [new TestPlanner(mixStrategy, combinationStrategy, options.realSeed)];
  }

}

function changeFileExtension(file, extension) {
  const {
    dir,
    name
  } = parse(file);
  return join(dir, name + extension);
}
function addTimeStampToFilename(file, dateTime) {
  const {
    dir,
    name,
    ext
  } = parse(file);
  return join(dir, name + '-' + format(dateTime, 'yyyy-MM-dd_HH-mm-ss') + ext);
}

class FSFileHandler {
  constructor(_fs, _promisify, _encoding = 'utf8') {
    this._fs = _fs;
    this._promisify = _promisify;
    this._encoding = _encoding;
  }

  async read(filePath) {
    const readFile = this._promisify(this._fs.readFile);

    const options = {
      encoding: this._encoding,
      flag: 'r'
    };
    return await readFile(filePath, options);
  }

  readSync(filePath) {
    const options = {
      encoding: this._encoding,
      flag: 'r'
    };
    return this._fs.readFileSync(filePath, options);
  }

  async exists(filePath) {
    const pAccess = this._promisify(this._fs.access);

    try {
      await pAccess(filePath, this._fs.constants.R_OK);
      return true;
    } catch (_unused) {
      return false;
    }
  }

  existsSync(filePath) {
    try {
      this._fs.accessSync(filePath, this._fs.constants.R_OK);

      return true;
    } catch (_unused2) {
      return false;
    }
  }

  async write(filePath, content) {
    const writeFile = this._promisify(this._fs.writeFile);

    return await writeFile(filePath, content);
  }

  async erase(filePath, checkIfExists) {
    if (checkIfExists) {
      const ok = await this.exists(filePath);

      if (!ok) {
        return false;
      }
    }

    const unlinkFile = this._promisify(this._fs.unlink);

    await unlinkFile(filePath);
    return true;
  }

}

class FSFileSearcher {
  constructor(_fs) {
    this._fs = _fs;
  }

  async searchFrom(options) {
    const pStat = promisify(this._fs.stat);

    if (options.directory) {
      const msgNotADirectory = `Directory not found: ${options.directory}`;
      let st;

      try {
        st = await pStat(options.directory);
      } catch (err) {
        throw new Error(msgNotADirectory);
      }

      if (!st.isDirectory()) {
        throw new Error(msgNotADirectory);
      }
    }

    const makeFilePath = file => {
      return normalize(join(options.directory, file));
    };

    const fileHasValidExtension = path => {
      for (const ext of options.extensions) {
        if (path.endsWith(ext)) {
          return true;
        }
      }

      return false;
    };

    const hasFilesToSearch = options.file.length > 0;
    const hasFilesToIgnore = options.ignore.length > 0;
    const ignoredFullPath = hasFilesToIgnore ? options.ignore.map(f => makeFilePath(f)) : [];
    let files = [];
    let warnings = [];

    if (hasFilesToSearch) {
      const pAccess = promisify(this._fs.access);

      for (const file of options.file) {
        const f = makeFilePath(file);

        if (hasFilesToIgnore && (options.ignore.includes(file) || options.ignore.includes(f))) {
          continue;
        }

        if (!fileHasValidExtension(file)) {
          warnings.push(`Ignored file "${file}".`);
          continue;
        }

        try {
          await pAccess(f, this._fs.constants.R_OK);
        } catch (err) {
          warnings.push(`Could not access file "${file}".`);
          continue;
        }

        files.push(f);
      }
    } else {
      const pWalk = promisify(fsWalk.walk);

      const entryFilter = entry => {
        if (!fileHasValidExtension(entry.path)) {
          return false;
        }

        const shouldBeIgnored = hasFilesToIgnore && ignoredFullPath.includes(entry.path);

        if (shouldBeIgnored) {
          return false;
        }

        return true;
      };

      const walkOptions = {
        fs: this._fs,
        entryFilter: entryFilter,
        errorFilter: error => 'ENOENT' == error.code,
        deepFilter: options.recursive ? undefined : entry => options.directory == entry.path
      };
      const entries = await pWalk(options.directory, walkOptions);
      files = entries.map(e => e.path);
    }

    return {
      files: files,
      warnings: warnings
    };
  }

}

class DuplicationChecker {
  hasDuplication(items, propertyToCompare) {
    let size = new Set(items.map(item => {
      return item[propertyToCompare];
    })).size;
    return items.length > size;
  }

  duplicates(items) {
    let flags = {};
    let dup = [];

    for (let e of items) {
      if (!flags[e]) {
        flags[e] = true;
      } else {
        dup.push(e);
      }
    }

    return dup;
  }

  withDuplicatedProperty(items, propertyToCompare) {
    let flags = {};
    let dup = [];

    for (let item of items) {
      if (!item[propertyToCompare]) {
        continue;
      }

      let prop = item[propertyToCompare];

      if (!flags[prop]) {
        flags[prop] = true;
      } else {
        dup.push(item);
      }
    }

    return dup;
  }

  mapDuplicates(items, propertyOrExtractFn) {
    let map = {};
    const isString = typeof propertyOrExtractFn === 'string';
    const prop = typeof propertyOrExtractFn === 'string' ? propertyOrExtractFn : '';
    const fn = typeof propertyOrExtractFn === 'function' ? propertyOrExtractFn : () => {
      return '';
    };

    for (let item of items) {
      let value;

      if (isString) {
        if (!item[prop]) {
          continue;
        }

        value = item[prop];
      } else {
        value = fn(item);
      }

      if (!map[value]) {
        map[value] = [item];
      } else {
        map[value].push(item);
      }
    }

    for (let prop in map) {
      if (map[prop].length < 2) {
        delete map[prop];
      }
    }

    return map;
  }

  checkDuplicatedNamedNodes(nodes, errors, nodeName, propertyOrExtractFn = 'name') {
    if (nodes.length < 1) {
      return;
    }

    const map = this.mapDuplicates(nodes, propertyOrExtractFn);

    for (let prop in map) {
      let duplicatedNodes = map[prop];
      let locations = duplicatedNodes.map(node => node.location);
      let msg = 'Duplicated ' + nodeName + ' "' + prop + '" in: ' + this.jointLocations(locations);
      errors.push(new SemanticException(msg));
    }

    return map;
  }

  jointLocations(locations) {
    return colors.white(locations.map(this.makeLocationString).join(', '));
  }

  makeLocationString(loc) {
    return "\n  " + logSymbols.error + " (" + loc.line + ',' + loc.column + ')' + (!loc.filePath ? '' : ' ' + loc.filePath);
  }

}

class SpecificationAnalyzer {
  constructor() {
    this._checker = new DuplicationChecker();
  }

}

class AfterAllSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    const errors = [];
    this.checkForMoreThanOneDeclaration(spec, errors);
    const ok1 = 0 === errors.length;

    if (!ok1) {
      problems.addGenericError(...errors);
    }

    return ok1;
  }

  checkForMoreThanOneDeclaration(spec, errors) {
    let found = [];

    for (let doc of spec.docs) {
      if (!doc.afterAll) {
        continue;
      }

      found.push(doc.afterAll.location);
    }

    const foundCount = found.length;

    if (foundCount > 1) {
      const msg = 'Only one event After All is allowed in the specification. Found ' + foundCount + ": \n" + this._checker.jointLocations(found);

      errors.push(new SemanticException(msg));
    }
  }

}

class BeforeAllSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    const errors = [];
    this.checkForMoreThanOneDeclaration(spec, errors);
    const ok1 = 0 === errors.length;

    if (!ok1) {
      problems.addGenericError(...errors);
    }

    return ok1;
  }

  checkForMoreThanOneDeclaration(spec, errors) {
    const found = [];

    for (const doc of spec.docs) {
      if (!doc.beforeAll) {
        continue;
      }

      found.push(doc.beforeAll.location);
    }

    const foundCount = found.length;

    if (foundCount > 1) {
      const msg = 'Only one event Before All is allowed in the specification. Found ' + foundCount + ": \n" + this._checker.jointLocations(found);

      errors.push(new SemanticException(msg));
    }
  }

}

class ConstantSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    let errors = [];

    this._checker.checkDuplicatedNamedNodes(spec.constants(), errors, 'constant');

    const ok1 = 0 === errors.length;

    if (!ok1) {
      problems.addGenericError(...errors);
    }

    return ok1;
  }

}

class DatabaseSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    let errors = [];

    this._checker.checkDuplicatedNamedNodes(spec.databases(), errors, 'database');

    const ok1 = 0 === errors.length;

    if (!ok1) {
      problems.addGenericError(...errors);
    }

    const ok2 = await this.checkConnections(problems, spec);
    return ok1 && ok2;
  }

  async checkConnections(problems, spec) {
    let checker = new DatabaseConnectionChecker();
    let r = await checker.check(spec, problems);
    return r ? r.success : false;
  }

}

class FeatureSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    const errors1 = [];

    this._checker.checkDuplicatedNamedNodes(spec.features(), errors1, 'feature');

    const ok1 = 0 === errors1.length;

    if (!ok1) {
      problems.addGenericError(...errors1);
    }

    const errors2 = [];

    this._checker.checkDuplicatedNamedNodes(spec.uiElements(), errors2, 'global UI Element');

    const ok2 = 0 === errors2.length;

    if (!ok2) {
      problems.addGenericError(...errors2);
    }

    const ok3 = this.analyzeReferences(problems, spec, graph);
    return ok1 && ok2 && ok3;
  }

  analyzeReferences(problems, spec, graph) {
    let hasError = false;
    const availableStates = new Map();

    for (let [, value] of graph.vertices_topologically()) {
      let doc = value;

      if (!doc) {
        continue;
      }

      const ok1 = this.detectPreconditionsWithoutProducers(problems, spec, doc, availableStates);
      const ok2 = this.analyzePropertiesReferences(doc, spec, problems);

      if (!ok1 || !ok2) {
        hasError = true;
      }
    }

    return !hasError;
  }

  detectPreconditionsWithoutProducers(problems, spec, doc, availableStates) {
    if (!doc.feature || !doc.feature.scenarios || doc.feature.scenarios.length < 1) {
      return true;
    }

    const path = doc.fileInfo.path;
    let states = availableStates.get(path);

    if (!states) {
      states = new Set();
      availableStates.set(path, states);
    }

    const checkStates = (v, variantStates, stateName, errors) => {
      if (!variantStates || variantStates.length < 1) {
        return;
      }

      for (const st of variantStates) {
        if (states.has(st.name)) {
          continue;
        }

        const importedDocs = spec.importedDocumentsOf(doc);
        let found = false;

        for (const d of importedDocs) {
          const importedStates = availableStates.get(d.fileInfo.path);

          if (importedStates && importedStates.has(st.name)) {
            found = true;
            break;
          }
        }

        if (!found) {
          st.notFound = true;
          const msg = `${stateName} not found: ${st.name}`;
          const step = v.sentences[st.stepIndex];
          const err = new RuntimeException(msg, step.location);
          errors.push(err);
        }
      }
    };

    const detector = new VariantStateDetector();
    const errors = [];

    for (const sc of doc.feature.scenarios) {
      if (!sc.variants || sc.variants.length < 1) {
        continue;
      }

      for (const v of sc.variants) {
        detector.update(v);

        if (v.postconditions && v.postconditions.length > 0) {
          v.postconditions.forEach(s => states.add(s.name));
        }

        checkStates(v, v.preconditions, 'Precondition', errors);
        checkStates(v, v.stateCalls, 'State', errors);
      }
    }

    if (errors.length > 0) {
      problems.addError(path, ...errors);
      return false;
    }

    return true;
  }

  analyzePropertiesReferences(doc, spec, problems) {
    let errors = [];

    if (isDefined(doc.feature)) {
      for (let uie of doc.feature.uiElements || []) {
        this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
      }
    }

    for (let uie of doc.uiElements || []) {
      this.analyzePropertiesReferencesOf(uie, doc, spec, errors);
    }

    if (errors.length > 0) {
      problems.addError(doc.fileInfo.path, ...errors);
      return false;
    }

    return true;
  }

  analyzePropertiesReferencesOf(uie, doc, spec, errors) {
    for (let uiProperty of uie.items || []) {
      if (!uiProperty) {
        continue;
      }

      const propValue = uiProperty.value;

      if (!propValue) {
        continue;
      }

      const content = propValue.value.toString();

      switch (propValue.entity) {
        case Entities.CONSTANT:
          {
            this.analyzeConstant(content, uiProperty, doc, spec, propValue.references, errors);
            break;
          }

        case Entities.UI_ELEMENT_REF:
          {
            this.analyzeUIElement(content, uiProperty, doc, spec, propValue.references, errors);
            break;
          }

        case Entities.QUERY:
          {
            this.analyzeQuery(content, uiProperty, doc, spec, propValue.references, errors);
            break;
          }
      }
    }
  }

  analyzeConstant(variable, uiProperty, doc, spec, references, errors) {
    const node = spec.constantWithName(variable);

    if (isDefined(node)) {
      references.push(node);
    } else {
      const msg = 'Referenced constant not found: ' + variable;
      errors.push(this.makeError(msg, uiProperty.location, doc));
    }
  }

  analyzeUIElement(variable, uiProperty, doc, spec, references, errors) {
    const node = spec.uiElementByVariable(variable, doc);

    if (isDefined(node)) {
      references.push(node);
    } else {
      const msg = 'Referenced UI Element not found: ' + variable;
      errors.push(this.makeError(msg, uiProperty.location, doc));
    }
  }

  analyzeQuery(query, uiProperty, doc, spec, references, errors) {
    const queryParser = new QueryParser();
    const names = Array.from(new Set(queryParser.parseAnyNames(query)));
    this.analyzeNames(names, uiProperty, doc, spec, references, errors);
    const variables = Array.from(new Set(queryParser.parseAnyVariables(query)));

    for (let v of variables) {
      this.analyzeUIElement(v, uiProperty, doc, spec, references, errors);
    }
  }

  analyzeNames(names, uiProperty, doc, spec, references, errors) {
    for (let name of names || []) {
      let node = null;
      node = spec.constantWithName(name);

      if (!node) {
        node = spec.tableWithName(name);
      }

      if (!node) {
        node = spec.databaseWithName(name);
      }

      if (!node) {
        const msg = 'Referenced name not found: ' + name;
        errors.push(this.makeError(msg, uiProperty.location, doc));
      } else {
        references.push(node);
      }
    }
  }

  makeError(msg, location, doc) {
    let loc = deepcopy(location);

    if (!loc.filePath) {
      loc.filePath = doc.fileInfo.path;
    }

    return new SemanticException(msg, loc);
  }

}

class ImportSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    return this.findCyclicReferences(problems, graph);
  }

  findCyclicReferences(problems, graph) {
    let hasError = false;

    for (let it = graph.cycles(), kv; !(kv = it.next()).done;) {
      hasError = true;
      const cycle = kv.value;
      const filePath = cycle[0];
      const fullCycle = cycle.join('" => "') + '" => "' + filePath;
      const doc = graph.vertexValue(filePath);
      let loc = {
        line: 1,
        column: 1
      };

      if (doc) {
        loc = this.locationOfTheImport(doc, cycle[1]);
      }

      const msg = 'Cyclic reference: "' + fullCycle + '".';
      const err = new SemanticException(msg, loc);
      problems.addError(filePath, err);
    }

    return hasError;
  }

  locationOfTheImport(doc, importFile) {
    if (doc.imports) {
      let fileName = basename(importFile);

      for (let imp of doc.imports) {
        let currentFileName = basename(imp.value);

        if (fileName == currentFileName) {
          return imp.location;
        }
      }
    }

    return {
      line: 1,
      column: 1
    };
  }

}

class TableSSA extends SpecificationAnalyzer {
  async analyze(problems, spec, graph) {
    let errors = [];

    this._checker.checkDuplicatedNamedNodes(spec.tables(), errors, 'table');

    const ok1 = 0 === errors.length;

    if (!ok1) {
      problems.addGenericError(...errors);
    }

    return ok1;
  }

}

class TestCaseSSA extends SpecificationAnalyzer {
  constructor(_keywords) {
    super();
    this._keywords = _keywords;

    if (!this._keywords) {
      this._keywords = englishKeywords;
    }
  }

  async analyze(problems, spec, graph) {
    let specOK = true;

    for (let doc of spec.docs) {
      let errors = [];
      this.analyzeDocument(spec, doc, errors);

      if (errors.length > 0) {
        specOK = false;
        problems.addError(doc.fileInfo.path, ...errors);
      }
    }

    return specOK;
  }

  analyzeDocument(spec, doc, errors) {
    if (!doc.testCases || doc.testCases.length < 1) {
      return;
    }

    const hasFeature = isDefined(doc.feature);
    const hasImport = isDefined(doc.imports) && doc.imports.length > 0;

    if (!hasFeature && !hasImport) {
      let firstTestCase = doc.testCases[0];
      const msg = 'No imports or feature declared before the test case.';
      const err = new SemanticException(msg, this.makeLocationWithPath(firstTestCase.location, doc.fileInfo.path));
      errors.push(err);
      return;
    } else if (hasFeature) {
      let availableFeatures = [doc.feature];
      let availableFeatureNames = [doc.feature.name.toLowerCase()];
      let availableFeaturePaths = doc.fileInfo ? [doc.fileInfo.path || ''] : [''];

      for (let testCase of doc.testCases) {
        this.checkFeatureTags(spec, doc, testCase, availableFeatures, availableFeatureNames, availableFeaturePaths, errors);
      }
    } else if (hasImport) {
      if (1 == doc.imports.length) {
        const singleImport = doc.imports[0];
        this.processSingleImport(spec, doc, singleImport, errors);
      } else {
        this.processMultipleImports(spec, doc, errors);
      }
    }

    this.checkOtherTags(doc.testCases, spec, doc, errors);

    for (let testCase of doc.testCases) {
      if (!testCase.location.filePath) {
        testCase.location.filePath = doc.fileInfo.path;
      }
    }

    const fn = node => {
      return '@scenario(' + (node.declaredScenarioIndex || '0') + ') ' + '@variant(' + (node.declaredVariantIndex || '0') + ') ' + node.name;
    };

    this._checker.checkDuplicatedNamedNodes(doc.testCases, errors, 'Test Case', fn);
  }

  processSingleImport(spec, doc, docImport, errors) {
    let feature = this.featureFromImport(spec, doc, docImport, errors);

    if (!feature) {
      const msg = 'Imported document does not have a feature.';
      const err = new SemanticException(msg, this.makeLocationWithPath(docImport.location, doc.fileInfo.path));
      errors.push(err);
      return false;
    }

    return true;
  }

  featureFromImport(spec, doc, docImport, errors) {
    const filePath = docImport.value;
    const importedDoc = spec.docWithPath(filePath, doc.fileInfo.path);

    if (!importedDoc) {
      const msg = 'Imported document path not resolved: "' + filePath + '".';
      const err = new SemanticException(msg, this.makeLocationWithPath(docImport.location, doc.fileInfo.path));
      errors.push(err);
      return null;
    }

    return importedDoc.feature;
  }

  processMultipleImports(spec, doc, errors) {
    if (0 === doc.imports.length) {
      return false;
    }

    let availableFeatures = [];
    let availableFeatureNames = [];
    let availableFeaturePaths = [];

    for (let docImport of doc.imports) {
      let feature = this.featureFromImport(spec, doc, docImport, errors);

      if (feature) {
        availableFeatures.push(feature);
        availableFeatureNames.push(feature.name.toLowerCase());
        availableFeaturePaths.push(docImport.value);
      }
    }

    if (0 === availableFeatures.length) {
      const msg = 'None of the imported files has features.';
      const err = new SemanticException(msg, this.makeLocationWithPath(doc.imports[0].location, doc.fileInfo.path));
      errors.push(err);
      return false;
    }

    for (let variant of doc.testCases) {
      this.checkFeatureTags(spec, doc, variant, availableFeatures, availableFeatureNames, availableFeaturePaths, errors);
    }

    return true;
  }

  checkFeatureTags(spec, doc, testCases, availableFeatures, availableFeatureNames, availableFeaturePaths, errors) {
    if (!testCases.tags) {
      testCases.tags = [];
    }

    const singleFeature = 1 === availableFeatures.length;
    let featureName = null;
    let featureTag = null;

    for (let tag of testCases.tags) {
      if (this.isFeatureTag(tag.name)) {
        featureTag = tag;
        featureName = tag.content;
        break;
      }
    }

    if (singleFeature) {
      if (!featureName) {
        featureName = availableFeatureNames[0];
      }
    } else {
      if (!featureName) {
        const msg = 'Test case has no tag that refers to its feature.';
        const err = new SemanticException(msg, this.makeLocationWithPath(testCases.location, doc.fileInfo.path));
        errors.push(err);
        return false;
      }
    }

    featureName = featureName.toLowerCase();
    const featureIndex = availableFeatureNames.indexOf(featureName);

    if (featureIndex < 0) {
      const msg = 'Tag refers to a non existing feature.';
      const err = new SemanticException(msg, this.makeLocationWithPath(featureTag.location, doc.fileInfo.path));
      errors.push(err);
      return false;
    }

    return true;
  }

  makeLocationWithPath(location, path) {
    let loc = !location ? {} : deepcopy(location);
    loc.filePath = path;
    return loc;
  }

  checkOtherTags(testCases, spec, doc, errors) {
    const msgNoFeature = 'Feature found.';
    const msgNoScenarios = 'The referenced Feature does not have Scenarios';
    const msgNoScenarioTag = 'Test Case has tag @variant but it does not have a tag @scenario. Please declare it.';
    const msgMinScenarioIndex = 'The index informed in @scenario is less than 1.';
    const msgMaxScenarioIndex = 'The index informed in @scenario is greater than the number of scenarios.';
    const msgNoScenario = 'No Scenario with the informed index.';
    const msgNoVariants = 'No Variants in the referenced Scenario.';
    const msgMinVariantIndex = 'The index informed in @variant is less than 1.';
    const msgMaxVariantIndex = 'The index informed in @variant is greater than the number of variants in the scenario.';

    for (let tc of testCases || []) {
      let hasFeatureTag = false;
      let hasScenarioTag = false;
      let hasVariantTag = false;

      for (let tag of tc.tags || []) {
        if (!hasFeatureTag && this.isFeatureTag(tag.name)) {
          hasFeatureTag = true;
          tc.declaredFeatureName = tag.content;
        }

        if (!hasScenarioTag && this.isScenarioTag(tag.name)) {
          hasScenarioTag = true;
          tc.declaredScenarioIndex = this.detectTagContentAsIndex(tag, errors);
        }

        if (!hasVariantTag && this.isVariantTag(tag.name)) {
          hasVariantTag = true;
          tc.declaredVariantIndex = this.detectTagContentAsIndex(tag, errors);
        }

        if (this.isGeneratedTag(tag.name)) {
          tc.generated = true;
        }
      }

      let feature = doc.feature;

      if (!feature) {
        let docs;

        if (hasFeatureTag) {
          docs = spec.importedDocumentsOf(doc).filter(impDoc => isDefined(impDoc.feature) && impDoc.feature.name.toLowerCase() == tc.declaredFeatureName.toLowerCase());
        } else {
          docs = spec.importedDocumentsOf(doc).filter(impDoc => isDefined(impDoc.feature));
        }

        if (docs.length < 1) {
          errors.push(new SemanticException(msgNoFeature, tc.location));
          continue;
        }

        feature = docs[0].feature;
      }

      if (hasScenarioTag) {
        const size = (feature.scenarios || []).length;

        if (size < 1) {
          errors.push(new SemanticException(msgNoScenarios, tc.location));
          continue;
        }

        if (tc.declaredScenarioIndex > size) {
          errors.push(new SemanticException(msgMaxScenarioIndex, tc.location));
          continue;
        }

        if (tc.declaredScenarioIndex < 1) {
          errors.push(new SemanticException(msgMinScenarioIndex, tc.location));
          continue;
        }
      }

      if (hasVariantTag && !hasScenarioTag) {
        errors.push(new SemanticException(msgNoScenarioTag, tc.location));
        continue;
      }

      if (hasVariantTag) {
        const scenario = feature.scenarios[tc.declaredScenarioIndex - 1];

        if (!scenario) {
          errors.push(new SemanticException(msgNoScenario, tc.location));
          continue;
        }

        const size = (scenario.variants || []).length;

        if (size < 1) {
          errors.push(new SemanticException(msgNoVariants, tc.location));
          continue;
        }

        if (tc.declaredVariantIndex > size) {
          errors.push(new SemanticException(msgMaxVariantIndex, tc.location));
          continue;
        }

        if (tc.declaredVariantIndex < 1) {
          errors.push(new SemanticException(msgMinVariantIndex, tc.location));
          continue;
        }
      }
    }
  }

  isFeatureTag(name) {
    return (this._keywords.tagFeature || ['feature']).indexOf(name.toLowerCase().trim()) >= 0;
  }

  isScenarioTag(name) {
    return (this._keywords.tagScenario || ['scenario']).indexOf(name.toLowerCase().trim()) >= 0;
  }

  isVariantTag(name) {
    return (this._keywords.tagVariant || ['variant']).indexOf(name.toLowerCase().trim()) >= 0;
  }

  isGeneratedTag(name) {
    return (this._keywords.tagGenerated || ['generated']).indexOf(name.toLowerCase().trim()) >= 0;
  }

  detectTagContentAsIndex(tag, errors) {
    let value = Array.isArray(tag.content) ? tag.content[0] : tag.content;

    if (!isDefined(value)) {
      return value;
    }

    value = parseInt(value.trim());

    if (isNaN(value)) {
      const msg = 'This tag must have a number.';
      errors.push(new SemanticException(msg, tag.location));
    } else if (value <= 0) {
      const msg = 'The tag content must be a number greater than zero.';
      errors.push(new SemanticException(msg, tag.location));
    }

    return value;
  }

}

class BatchSpecificationAnalyzer extends SpecificationAnalyzer {
  constructor() {
    super();
    this._analyzers = [new ImportSSA(), new FeatureSSA(), new ConstantSSA(), new DatabaseSSA(), new TableSSA(), new TestCaseSSA(), new BeforeAllSSA(), new AfterAllSSA()];
  }

  async analyze(problems, spec, graph) {
    let anyError = false;

    for (let analyzer of this._analyzers) {
      const ok = await analyzer.analyze(problems, spec, graph);

      if (!ok) {
        anyError = true;
      }
    }

    return anyError;
  }

}

class ImportBasedGraphBuilder {
  buildFrom(spec) {
    let graph = new Graph();

    for (let doc of spec.docs) {
      let fromKey = toUnixPath(!doc.fileInfo ? '' : doc.fileInfo.path || '');
      graph.addVertex(fromKey, doc);

      for (let imp of doc.imports || []) {
        let toKey = toUnixPath(imp.resolvedPath);
        graph.ensureVertex(toKey);
        graph.ensureEdge(toKey, fromKey);
      }
    }

    return graph;
  }

}

var FileStatus;

(function (FileStatus) {
  FileStatus[FileStatus["PENDING"] = 0] = "PENDING";
  FileStatus[FileStatus["COMPILED"] = 1] = "COMPILED";
  FileStatus[FileStatus["DONE"] = 2] = "DONE";
})(FileStatus || (FileStatus = {}));

const DEFAULT_COMPILER_OPTIONS = {
  concurrency: 10,
  stopOnTheFirstError: false
};
class CompilerOutput {
  constructor(problems, spec, graph) {
    this.problems = problems;
    this.spec = spec;
    this.graph = graph;
  }

}
class Compiler {
  constructor(_fileReader, _singleFileCompiler, _lineBreaker = "\n") {
    this._fileReader = _fileReader;
    this._singleFileCompiler = _singleFileCompiler;
    this._lineBreaker = _lineBreaker;
  }

  makeOptions(compilerOptions = {}) {
    const options = Object.assign(DEFAULT_COMPILER_OPTIONS, compilerOptions);
    return options;
  }

  async compile(files, basePath = '.', options = DEFAULT_COMPILER_OPTIONS) {
    const problems = new FileProblemMapper();
    const spec = new AugmentedSpec(basePath || '.');

    if (files.length < 1) {
      return new CompilerOutput(problems, spec);
    }

    const cOptions = this.makeOptions(options);
    const status = {};
    const filePromises = [];

    for (const path of files) {
      const promise = this.compileFile(problems, path, status, spec, cOptions);
      filePromises.push(promise);
    }

    const tasks = filePromises.map(p => () => p);
    await runAllWithoutThrow(tasks, {
      concurrency: cOptions.concurrency || Infinity,
      stopOnError: cOptions.stopOnTheFirstError
    });
    const graph = new ImportBasedGraphBuilder().buildFrom(spec);

    if (spec.docs.length > 0) {
      new BatchSpecificationAnalyzer().analyze(problems, spec, graph);
    }

    return new CompilerOutput(problems, spec, graph);
  }

  async compileFile(problems, filePath, statusMap, spec, options) {
    if (!statusMap[filePath]) {
      statusMap[filePath] = FileStatus.PENDING;
    }

    if (statusMap[filePath] !== FileStatus.PENDING) {
      return true;
    }

    let content;

    try {
      content = await this._fileReader.read(filePath);
    } catch (_unused) {
      const msg = `Could not read "${filePath}"`;
      const err = new RuntimeException(msg, {
        filePath: filePath,
        line: 0,
        column: 0
      });
      problems.addGenericError(err);
      return false;
    }

    if (content && content.charAt(0) == '\uFEFF') {
      content = content.slice(1);
    }

    const doc = await this.compileContent(problems, spec.basePath, filePath, content);
    statusMap[filePath] = FileStatus.COMPILED;
    spec.addDocument(doc);
    await this.compileImports(problems, doc, filePath, statusMap, spec, options);
  }

  async compileImports(problems, doc, filePath, statusMap, spec, options) {
    if (statusMap[filePath] !== FileStatus.COMPILED) {
      return;
    }

    if (!doc.imports) {
      doc.imports = [];
    }

    if (doc.imports.length < 1) {
      statusMap[filePath] = FileStatus.DONE;
      return;
    }

    const promises = [];

    for (const imp of doc.imports) {
      const promise = this.compileFile(problems, imp.resolvedPath, statusMap, spec, options);
      promises.push(promise);
    }

    const tasks = promises.map(p => () => p);
    await runAllWithoutThrow(tasks, {
      concurrency: options.concurrency || Infinity,
      stopOnError: options.stopOnTheFirstError
    });
    statusMap[filePath] = FileStatus.DONE;
  }

  async compileContent(problems, basePath, filePath, content) {
    const fullPath = toUnixPath(resolve(dirname(basePath), filePath));
    return await this._singleFileCompiler.process(problems, fullPath, content, this._lineBreaker);
  }

}

class DatabaseDA {
  analyze(doc, errors) {
    if (!doc.databases || doc.databases.length < 1) {
      doc.databases = [];
      return;
    }

    for (let db of doc.databases) {
      this.validateDatabaseProperties(db, errors);
    }
  }

  validateDatabaseProperties(db, errors) {
    if (!db.items || db.items.length < 1) {
      let msg = 'Database "' + db.name + '" has no properties.';
      let err = new SemanticException(msg, db.location);
      errors.push(err);
      return;
    }

    const properties = db.items.map(item => item.property);

    if (properties.indexOf(DatabaseProperties.TYPE) < 0) {
      let msg = 'Database "' + db.name + '" should have a type.';
      let err = new SemanticException(msg, db.location);
      errors.push(err);
    }

    if (!db.name && properties.indexOf(DatabaseProperties.PATH) < 0) {
      let msg = 'Database should have a name or a path.';
      let err = new SemanticException(msg, db.location);
      errors.push(err);
    }
  }

}

class ImportDA {
  constructor(_fs = fs) {
    this._fs = _fs;
  }

  analyze(doc, errors) {
    if (!doc.imports) {
      doc.imports = [];
      return;
    }

    let duplicated = new DuplicationChecker().withDuplicatedProperty(doc.imports, 'content');

    for (let dup of duplicated) {
      let msg = 'Duplicated imported to file "' + dup.value + '".';
      let err = new SemanticException(msg, dup.location);
      errors.push(err);
    }

    for (let imp of doc.imports) {
      let importPath = imp.value;
      let resolvedPath = join(dirname(doc.fileInfo.path), importPath);
      imp.resolvedPath = resolvedPath;

      if (doc.fileInfo.path === resolvedPath) {
        let msg = 'Imported file is a self reference: "' + importPath + '".';
        let err = new SemanticException(msg, imp.location);
        errors.push(err);
      }

      const exists = this._fs.existsSync(resolvedPath);

      if (!exists) {
        let msg = 'Imported file not found: "' + importPath + '".';
        let err = new SemanticException(msg, imp.location);
        errors.push(err);
      }
    }
  }

}

class ScenarioDA {
  analyze(doc, errors) {
    if (!doc.feature) {
      return;
    }

    if (!doc.feature.scenarios) {
      doc.feature.scenarios = [];
      return;
    }

    this.checkForDuplicatedScenarios(doc, errors);
  }

  checkForDuplicatedScenarios(doc, errors) {
    let duplicated = new DuplicationChecker().withDuplicatedProperty(doc.feature.scenarios, 'name');

    for (let dup of duplicated) {
      let msg = 'Duplicated scenario "' + dup.name + '".';
      let err = new SemanticException(msg, dup.location);
      errors.push(err);
    }
  }

}

class UIElementDA {
  analyze(doc, errors) {
    const checker = new DuplicationChecker();
    const globalOnes = doc.uiElements || [];
    checker.checkDuplicatedNamedNodes(globalOnes, errors, 'global UI Element');
    const localOnes = isDefined(doc.feature) ? doc.feature.uiElements || [] : [];
    checker.checkDuplicatedNamedNodes(localOnes, errors, 'UI Element');
    this.analyzeUIPropertiesOfEvery(globalOnes, doc, errors);
    this.analyzeUIPropertiesOfEvery(localOnes, doc, errors);
  }

  analyzeUIPropertiesOfEvery(uiElements, doc, errors) {
    const uipExtractor = new UIElementPropertyExtractor();
    const baseNonRepeatableMsg = 'Non-repeatable properties found:';
    const baseNonTriplicableMsg = 'Three instances of the same property found:';
    const baseIncompatiblePropertiesMsg = 'Incompatible properties found:';
    const baseIncompatibleOperatorsMsg = 'Incompatible operators found:';

    let makeMsg = (msg, properties) => {
      let fullMsg = msg;

      for (let p of properties) {
        fullMsg += "\n  (" + p.location.line + ',' + p.location.column + ') ' + p.content;
      }

      return fullMsg;
    };

    for (let uie of uiElements) {
      const propertiesMap = uipExtractor.mapProperties(uie);
      const nonRepeatable = uipExtractor.nonRepeatableProperties(propertiesMap);

      for (let nr of nonRepeatable) {
        const msg = makeMsg(baseNonRepeatableMsg, nr);
        const err = new SemanticException(msg, uie.location);
        errors.push(err);
      }

      const nonTriplicable = uipExtractor.nonTriplicatableProperties(propertiesMap);

      for (let nt of nonTriplicable) {
        const msg = makeMsg(baseNonTriplicableMsg, nt);
        const err = new SemanticException(msg, uie.location);
        errors.push(err);
      }

      const incompatiblesProperties = uipExtractor.incompatibleProperties(propertiesMap);

      for (let inc of incompatiblesProperties) {
        const msg = makeMsg(baseIncompatiblePropertiesMsg, inc);
        const err = new SemanticException(msg, uie.location);
        errors.push(err);
      }

      const incompatibleOperators = uipExtractor.incompatibleOperators(propertiesMap);

      for (let inc of incompatibleOperators) {
        const msg = makeMsg(baseIncompatibleOperatorsMsg, inc);
        const err = new SemanticException(msg, uie.location);
        errors.push(err);
      }
    }
  }

}

class VariantGivenStepDA {
  constructor() {
    this._nlpUtil = new NLPUtil();
  }

  analyze(doc, errors) {
    if (!doc.feature) {
      return;
    }

    if (isDefined(doc.feature.variantBackground)) {
      this.analyzeGivenSteps(doc.feature.variantBackground.sentences, errors);
    }

    for (let scenario of doc.feature.scenarios || []) {
      if (isDefined(scenario.variantBackground)) {
        this.analyzeGivenSteps(scenario.variantBackground.sentences, errors);
      }

      for (let variant of scenario.variants || []) {
        this.analyzeGivenSteps(variant.sentences, errors);
      }
    }
  }

  analyzeGivenSteps(steps, errors) {
    let lastWasGiven = null;
    let index = 0,
        preconditionsCount = 0;

    for (let step of steps || []) {
      if (NodeTypes.STEP_GIVEN === step.nodeType) {
        if (false === lastWasGiven) {
          const msg = 'A Given step cannot be declared after other step than Given.';
          const err = new SemanticException(msg, step.location);
          errors.push(err);
        }

        lastWasGiven = true;

        if (this.hasState(step)) {
          if (preconditionsCount < index) {
            errors.push(this.makeStateError(step));
          }

          preconditionsCount++;
        }
      } else if (NodeTypes.STEP_AND === step.nodeType) {
        if (lastWasGiven && this.hasState(step)) {
          if (preconditionsCount < index) {
            errors.push(this.makeStateError(step));
          }

          preconditionsCount++;
        }
      } else {
        lastWasGiven = false;
      }

      ++index;
    }
  }

  hasState(step) {
    return this._nlpUtil.hasEntityNamed(Entities.STATE, step.nlpResult);
  }

  makeStateError(step) {
    const msg = 'Given steps with state must be declared before other Given steps.';
    return new SemanticException(msg, step.location);
  }

}

class BatchDocumentAnalyzer {
  constructor() {
    this._analyzers = [new ImportDA(), new ScenarioDA(), new DatabaseDA(), new UIElementDA(), new VariantGivenStepDA()];
  }

  analyze(doc, errorMapper) {
    for (let analyzer of this._analyzers) {
      const errors = [];
      analyzer.analyze(doc, errors);

      if (errors.length > 0) {
        errorMapper.addError(doc.fileInfo.path, ...errors);
      }
    }
  }

}

class SingleFileCompiler {
  constructor(_lexer, _parser, _nlpRec, _defaultLanguage, _ignoreSemanticAnalysis = false) {
    this._lexer = _lexer;
    this._parser = _parser;
    this._nlpRec = _nlpRec;
    this._defaultLanguage = _defaultLanguage;
    this._ignoreSemanticAnalysis = _ignoreSemanticAnalysis;
    this._documentAnalyzer = new BatchDocumentAnalyzer();
  }

  async process(problems, filePath, content, lineBreaker = "\n") {
    const lines = content.split(lineBreaker);
    return this.processLines(problems, filePath, lines);
  }

  async processLines(problems, filePath, lines) {
    lines.forEach((line, index) => this._lexer.addNodeFromLine(line, index + 1));
    let doc = {
      fileInfo: {
        hash: null,
        path: filePath
      }
    };
    this.analyzeNodes(problems, doc);
    return doc;
  }

  analyzeNodes(problems, doc) {
    let nodes = this._lexer.nodes();

    this.addErrors(problems, this._lexer.errors(), doc);

    this._lexer.reset();

    this._parser.analyze(nodes, doc);

    this.addErrors(problems, this._parser.errors(), doc);
    let language = doc.language ? doc.language.value : this._defaultLanguage;

    const isTrained = this._nlpRec.isTrained(language);

    if (!isTrained) {
      if (this._nlpRec.canBeTrained(language)) {
        this._nlpRec.train(language);
      } else {
        let errors = [new RuntimeException('The NLP cannot be trained in the language "' + language + '".')];
        this.addErrors(problems, errors, doc);
      }
    }

    const errors = [];
    const warnings = [];

    this._nlpRec.recognizeSentencesInDocument(doc, language, errors, warnings);

    this.addErrors(problems, errors, doc);
    this.addWarnings(problems, warnings, doc);

    if (!this._ignoreSemanticAnalysis) {
      this._documentAnalyzer.analyze(doc, problems);
    }

    return problems.isEmpty();
  }

  addErrors(mapper, errors, doc) {
    for (const e of errors) {
      let re;

      if (e.name === Error.name) {
        re = RuntimeException.createFrom(e);
      } else {
        re = e;
      }

      mapper.addError(doc.fileInfo.path, re);
    }
  }

  addWarnings(mapper, warnings, doc) {
    if (warnings.length > 0) {
      mapper.addWarning(doc.fileInfo.path, ...warnings);
    }
  }

}

function filterFilesToCompile(files, extensionFeature, extensionTestCase) {
  const featureFiles = files.filter(f => f.endsWith(extensionFeature)).map(f => toUnixPath(f));
  const onlyTestCases = files.filter(f => f.endsWith(extensionTestCase)).map(f => toUnixPath(f));
  const testCasesWithoutFeature = onlyTestCases.filter(tc => !featureFiles.includes(toUnixPath(changeFileExtension(tc, extensionFeature))));
  return featureFiles.concat(testCasesWithoutFeature);
}
class CompilerFacade {
  constructor(_fs, _promisify, _compilerListener, _tcGenListener) {
    this._fs = _fs;
    this._promisify = _promisify;
    this._compilerListener = _compilerListener;
    this._tcGenListener = _tcGenListener;
  }

  async compile(options) {
    var _output$spec, _output$spec$docs;

    const startTime = Date.now();
    const fileSearcher = new FSFileSearcher(this._fs);

    if (this._compilerListener) {
      this._compilerListener.announceFileSearchStarted();
    }

    const searchResults = await fileSearcher.searchFrom({
      directory: options.directory,
      extensions: [options.extensionFeature, options.extensionTestCase],
      file: options.file,
      ignore: options.ignore,
      recursive: options.recursive
    });

    if (this._compilerListener && searchResults.warnings.length > 0) {
      this._compilerListener.announceFileSearchWarnings(searchResults.warnings);
    }

    const files = searchResults.files;
    const isJustGenerateScript = options.script && !options.run && !options.result;
    const filesToCompile = isJustGenerateScript ? files : filterFilesToCompile(files, options.extensionFeature, options.extensionTestCase);
    const filesToCompileCount = filesToCompile.length;

    if (this._compilerListener) {
      const filesCount = files.length;
      const ignoredCount = files.length - filesToCompileCount;
      const durationMS = Date.now() - startTime;

      this._compilerListener.announceFileSearchFinished(durationMS, filesCount, ignoredCount);
    }

    if (filesToCompileCount < 1) {
      return [null, null];
    }

    if (availableLanguages.indexOf(options.language) < 0) {
      throw new RuntimeException('Informed language is not available: ' + options.language);
    }

    const fileHandler = new FSFileHandler(this._fs, this._promisify, options.encoding);
    const lexer = new Lexer(options.language, map);
    const parser = new Parser();
    const nlpTrainer = new NLPTrainer(map);
    const nlpBasedSentenceRecognizer = new NLPBasedSentenceRecognizer(nlpTrainer);
    const singleFileCompiler = new SingleFileCompiler(lexer, parser, nlpBasedSentenceRecognizer, options.language);

    if (this._compilerListener) {
      this._compilerListener.announceCompilerStarted(options);
    }

    const compiler = new Compiler(fileHandler, singleFileCompiler, options.lineBreaker);
    const output = await compiler.compile(filesToCompile, options.directory, {
      stopOnTheFirstError: options.stopOnTheFirstError
    });
    const compiledFilesCount = (_output$spec = output.spec) == null ? void 0 : (_output$spec$docs = _output$spec.docs) == null ? void 0 : _output$spec$docs.length;

    if (this._compilerListener && compiledFilesCount) {
      var _output$spec2, _output$spec2$docs;

      const durationMS = Date.now() - startTime;
      const testCasesCount = (_output$spec2 = output.spec) == null ? void 0 : (_output$spec2$docs = _output$spec2.docs) == null ? void 0 : _output$spec2$docs.filter(doc => {
        var _doc$fileInfo, _doc$fileInfo$path;

        return (_doc$fileInfo = doc.fileInfo) == null ? void 0 : (_doc$fileInfo$path = _doc$fileInfo.path) == null ? void 0 : _doc$fileInfo$path.endsWith(options.extensionTestCase);
      }).length;
      const featuresCount = compiledFilesCount - testCasesCount;

      this._compilerListener.announceCompilerFinished(compiledFilesCount, featuresCount, testCasesCount, durationMS);

      this._compilerListener.reportProblems(output.problems, options.directory);
    }

    if (!options.testCase || !output.spec.docs || compiledFilesCount < 1) {
      return [output.spec, output.graph];
    }

    this.updateSeed(options, this._compilerListener);
    const tcGen = new TestCaseGeneratorFacade(nlpBasedSentenceRecognizer.variantSentenceRec, map, this._tcGenListener, fileHandler);
    return await tcGen.execute(options, output.spec, output.graph);
  }

  updateSeed(options, ui) {
    if (!options.seed) {
      options.isGeneratedSeed = true;
      options.seed = LocalDateTime$1.now().format(DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss')).toString();
    }

    ui.announceSeed(options.seed, options.isGeneratedSeed);
    const BYTES_OF_SHA_512 = 64;

    if (options.seed.length < BYTES_OF_SHA_512) {
      options.realSeed = createHash('sha512').update(options.seed).digest('hex');
    } else {
      options.realSeed = options.seed;
    }

    ui.announceRealSeed(options.realSeed);
  }

}

const PACKAGE_FILE = 'package.json';
const PLUGIN_PROPERTY = 'concordiaPlugin';
const PLUGIN_PREFIX = 'concordialang-';
function sortPluginsByName(plugins) {
  return plugins.sort((a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
  });
}
async function filterPluginsByName(all, name, partialComparison = false) {
  const usualComparison = (from, to) => {
    return from === to || from === PLUGIN_PREFIX + to || PLUGIN_PREFIX + from === to;
  };

  const removeVersionFromName = name => {
    const index = name.lastIndexOf('@');

    if (index < 0) {
      return name;
    }

    return name.substring(0, index);
  };

  const compareNames = (from, to, partialComparison) => {
    if (partialComparison) {
      return from.includes(to);
    }

    if (usualComparison(from, to)) {
      return true;
    }

    return usualComparison(removeVersionFromName(from), removeVersionFromName(to));
  };

  const lowerCasedName = name.toLowerCase();
  const withName = all.filter(v => compareNames(v.name.toLowerCase(), lowerCasedName, partialComparison));
  return withName.length > 0 ? withName[0] : undefined;
}
function authorsAsStringArray(author) {
  switch (typeof author) {
    case 'string':
      return [author];

    case 'object':
      {
        const authorObjectToString = obj => {
          if (!obj || typeof obj != 'object') {
            return;
          }

          const emailOrSite = obj.email || obj.url || obj.site ? ` <${obj.email || obj.url || obj.site}>` : '';
          return obj.name + emailOrSite;
        };

        if (Array.isArray(author)) {
          if (author.length < 1) {
            return [];
          }

          if (typeof author[0] === 'string') {
            return author;
          }

          return author.map(authorObjectToString).filter(a => !!a);
        }

        return [authorObjectToString(author)];
      }

    default:
      return [];
  }
}
function isPlugin(pkg) {
  var _pkg$name;

  return !!pkg && (pkg == null ? void 0 : (_pkg$name = pkg.name) == null ? void 0 : _pkg$name.startsWith(PLUGIN_PREFIX)) && !!pkg[PLUGIN_PROPERTY];
}
function pluginDataFromPackage(pkg) {
  if (!pkg) {
    return;
  }

  const data = {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    authors: authorsAsStringArray(pkg.author || pkg.authors),
    main: pkg.main
  };

  if (!isOldPluginForVersion2(pkg)) {
    return data;
  }

  const obj = concordiaPluginPropertyValue(pkg);
  return _extends({}, data, obj);
}
function isOldPluginForVersion2(pkg) {
  if (!isPlugin(pkg)) {
    return false;
  }

  const prop = concordiaPluginPropertyValue(pkg);
  return typeof prop === 'object';
}

function concordiaPluginPropertyValue(pkg) {
  return pkg && pkg[PLUGIN_PROPERTY] ? pkg[PLUGIN_PROPERTY] : undefined;
}

class PackageBasedPluginFinder {
  constructor(_processPath, _fileReader, _dirSearcher, _listener) {
    this._processPath = _processPath;
    this._fileReader = _fileReader;
    this._dirSearcher = _dirSearcher;
    this._listener = _listener;
    this.NODE_MODULES = 'node_modules';
  }

  async find() {
    const localPackagesDir = resolve(this._processPath, this.NODE_MODULES);
    const globalPackagesDir = globalDirs.npm.packages;
    const [localPluginData, globalPluginData] = await Promise.all([this.findOnDir(localPackagesDir), this.findOnDir(globalPackagesDir)]);
    const globalNotInLocal = globalPluginData.filter(globalData => !localPluginData.find(localData => localData.name == globalData.name));
    return localPluginData.concat(globalNotInLocal);
  }

  async findOnDir(dir) {
    let packageDirectories = [];

    try {
      packageDirectories = await this.detectPluginPackageDirectoriesOnDir(dir);
    } catch (err) {
      return [];
    }

    let allPluginData = [];

    for (const pkgDir of packageDirectories) {
      const pkgFile = join(pkgDir, PACKAGE_FILE);
      let content;

      try {
        content = await this._fileReader.read(pkgFile);
      } catch (err) {
        if (this._listener) {
          const msg = `Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ${err.message}`;

          this._listener.warn(msg);
        }

        continue;
      }

      if (!content) {
        continue;
      }

      let pkg;

      try {
        pkg = JSON.parse(content);
      } catch (err) {
        if (this._listener) {
          this._listener.warn(`Plugin ${pkgDir} cannot be parsed.`);
        }

        continue;
      }

      if (pkg && !isPlugin(pkg)) {
        continue;
      }

      const pluginData = pluginDataFromPackage(pkg);

      if (!pluginData) {
        if (this._listener) {
          this._listener.warn(`Plugin ${pkgDir} does not have the data required by Concordia Compiler.`);
        }

        continue;
      }

      const old = pluginData;
      const isOldPlugin = !!old.file;

      if (isOldPlugin) {
        if (old.file.indexOf(pluginData.name) < 0) {
          old.file = join(dir, pluginData.name, old.file);
        } else {
          old.file = join(dir, old.file);
        }
      } else {
        pluginData.main = join(dir, pluginData.name, pluginData.main || '');
      }

      allPluginData.push(pluginData);
    }

    return allPluginData;
  }

  async detectPluginPackageDirectoriesOnDir(dir) {
    const o = {
      directory: dir,
      recursive: false,
      regexp: new RegExp(PLUGIN_PREFIX)
    };
    return this._dirSearcher.search(o);
  }

}

async function loadPlugin(pluginData) {
  const old = pluginData;
  const isOldPlugin = !!old.file;

  if (isOldPlugin) {
    if (old.file.includes(':')) {
      old.file = 'file:///' + old.file;
    }

    const pluginClassFileContext = await import(old.file);
    const obj = createInstance(pluginClassFileContext, old.class, []);
    return obj;
  }

  let file = pluginData.main;

  if (file.includes(':')) {
    file = 'file:///' + toUnixPath(file);
  }

  let plugin = await import(file);

  if (plugin.default) {
    plugin = plugin.default;
  }

  return plugin;
}

function createInstance(context, className, args) {
  return new context[className](...args);
}

const DEFAULT_FILENAME = 'concordia-report';
class FileBasedTestReporter {
  constructor(_fileWriter) {
    this._fileWriter = _fileWriter;
  }

  makeFilename(options) {
    let fileName = (options == null ? void 0 : options.file) || DEFAULT_FILENAME;

    if (options != null && options.directory) {
      fileName = join(options.directory, fileName);
    }

    fileName = changeFileExtension(fileName, this.fileExtension());

    if (options != null && options.useTimestamp) {
      fileName = addTimeStampToFilename(fileName, new Date());
    }

    return fileName;
  }

}

class JSONTestReporter extends FileBasedTestReporter {
  async report(result, options) {
    const fileName = this.makeFilename(options);
    await this._fileWriter.write(fileName, JSON.stringify(result, undefined, "\t"));
  }

  fileExtension() {
    return '.json';
  }

}

class AbstractTestScriptGenerator {
  generate(docs, spec) {
    const all = [];

    for (const doc of docs || []) {
      if (!doc.testCases || doc.testCases.length < 1) {
        continue;
      }

      const ats = this.generateFromDocument(doc, spec);

      if (isDefined(ats)) {
        all.push(ats);
      }
    }

    return all;
  }

  generateFromDocument(doc, spec) {
    if (isDefined(doc.feature)) {
      return null;
    }

    let beforeAll = doc.beforeAll;
    let afterAll = doc.afterAll;
    let beforeFeature = doc.beforeFeature;
    let afterFeature = doc.afterFeature;
    let beforeEachScenario = doc.beforeEachScenario;
    let afterEachScenario = doc.afterEachScenario;
    let feature = !doc.feature ? null : doc.feature;

    if (!feature) {
      const docsWithFeature = spec.importedDocumentsOf(doc).filter(impDoc => isDefined(impDoc.feature));

      if (docsWithFeature.length > 0) {
        const firstDoc = docsWithFeature[0];
        feature = firstDoc.feature;

        if (!beforeAll && isDefined(firstDoc.beforeAll)) {
          beforeAll = firstDoc.beforeAll;
        }

        if (!afterAll && isDefined(firstDoc.afterAll)) {
          afterAll = firstDoc.afterAll;
        }

        if (!beforeFeature && isDefined(firstDoc.beforeFeature)) {
          beforeFeature = firstDoc.beforeFeature;
        }

        if (!afterFeature && isDefined(firstDoc.afterFeature)) {
          afterFeature = firstDoc.afterFeature;
        }

        if (!beforeEachScenario && isDefined(firstDoc.beforeEachScenario)) {
          beforeEachScenario = firstDoc.beforeEachScenario;
        }

        if (!afterEachScenario && isDefined(firstDoc.afterEachScenario)) {
          afterEachScenario = firstDoc.afterEachScenario;
        }
      }
    }

    const location = !feature ? {
      column: 1,
      line: 1,
      filePath: doc.fileInfo.path
    } : feature.location;
    const featureName = !feature ? 'Unknown feature' : feature.name;
    let ats = new AbstractTestScript();
    ats.sourceFile = doc.fileInfo.path;
    ats.feature = new NamedATSElement(location, featureName);
    let scenarioNames = [];

    if (isDefined(feature)) {
      for (let s of feature.scenarios || []) {
        ats.scenarios.push(new NamedATSElement(s.location, s.name));
        scenarioNames.push(s.name);
      }
    }

    for (let tc of doc.testCases || []) {
      let absTC = new ATSTestCase(tc.location, tc.name);
      absTC.scenario = scenarioNames[(tc.declaredScenarioIndex || 1) - 1] || 'Unknown scenario';
      absTC.invalid = tc.shouldFail;

      for (let sentence of tc.sentences) {
        let cmd = this.sentenceToCommand(sentence);
        absTC.commands.push(cmd);
      }

      ats.testcases.push(absTC);
    }

    let allTestEvents = {
      beforeAll: beforeAll,
      afterAll: afterAll,
      beforeFeature: beforeFeature,
      afterFeature: afterFeature,
      beforeEachScenario: beforeEachScenario,
      afterEachScenario: afterEachScenario
    };

    for (let e in allTestEvents) {
      let event = allTestEvents[e];

      if (!isDefined(event) || !isDefined(event.sentences) || event.sentences.length < 1) {
        continue;
      }

      ats[e] = new ATSEvent();
      ats[e].commands = this.convertTestEventSentencesToCommands(event, spec);
    }

    return ats;
  }

  sentenceToCommand(sentence, obj = new ATSCommand(), valuesOverwrite) {
    let cmd = obj;
    cmd.location = sentence.location;
    cmd.action = sentence.action;
    cmd.modifier = sentence.actionModifier;
    cmd.options = (sentence.actionOptions || []).slice(0);
    cmd.targets = (sentence.targets || []).slice(0);
    cmd.targetTypes = (sentence.targetTypes || []).slice(0);
    cmd.values = ((!valuesOverwrite ? sentence.values : valuesOverwrite) || []).slice(0);
    cmd.invalid = sentence.isInvalidValue;
    cmd.comment = sentence.comment;
    return cmd;
  }

  convertTestEventSentencesToCommands(event, spec) {
    const dbConversor = new DatabaseToAbstractDatabase();
    const COMMAND_OPTION = 'command';
    const dbNames = spec.databaseNames();
    const dbVarNames = dbNames.map(name => Symbols.CONSTANT_PREFIX + name + Symbols.CONSTANT_SUFFIX);

    const makeDbNameRegex = function makeDbNameRegex(dbName) {
      const r = '\\' + Symbols.CONSTANT_PREFIX + dbName + '\\' + Symbols.CONSTANT_SUFFIX + '\\.?';
      return new RegExp(r, 'gi');
    };

    let commands = [];

    for (let s of event.sentences || []) {
      if (s.action === Actions.CONNECT || s.action === Actions.DISCONNECT) {
        let dbRef = s.nlpResult.entities.find(e => e.entity === Entities.CONSTANT);

        if (!dbRef) {
          console.log('ERROR: database reference not found in:', s.content);
          continue;
        }

        const dbName = dbRef.value;

        if (s.action === Actions.CONNECT) {
          const db = spec.databaseWithName(dbName);

          if (!db) {
            console.log('ERROR: database not found with name:', dbName);
            continue;
          }

          const absDB = dbConversor.convertFromNode(db, spec.basePath);
          const values = [dbName, absDB];
          const cmd = this.sentenceToCommand(s, new ATSDatabaseCommand(), values);
          cmd.db = absDB;
          commands.push(cmd);
        } else {
          commands.push(this.sentenceToCommand(s, new ATSCommand(), [dbName]));
        }

        continue;
      }

      if (Actions.RUN !== s.action) {
        commands.push(this.sentenceToCommand(s));
        continue;
      }

      if ((s.values || []).length !== 1) {
        continue;
      }

      const options = s.actionOptions || [];

      if (options.indexOf(COMMAND_OPTION) >= 0) {
        let cmd = this.sentenceToCommand(s, new ATSConsoleCommand());
        commands.push(cmd);
        continue;
      }

      let sqlCommand = s.values[0];
      let found = false;

      for (let i in dbVarNames) {
        let dbVar = dbVarNames[i];

        if (sqlCommand.toString().toLowerCase().indexOf(dbVar.toLowerCase()) < 0) {
          continue;
        }

        found = true;
        let dbName = dbNames[i];
        let db = spec.databaseWithName(dbName);

        if (!db) {
          console.log('ERROR: database not found with name:', dbName);
          continue;
        }

        sqlCommand = sqlCommand.toString().replace(makeDbNameRegex(dbName), '');
        const absDB = dbConversor.convertFromNode(db, spec.basePath);

        if (!supportTablesInQueries(absDB.driverName)) {
          const uppercased = sqlCommand.toUpperCase().trim();

          if (uppercased.startsWith('DELETE FROM')) {
            sqlCommand = sqlCommand.replace(/( from)/ui, '');
          } else if (uppercased.startsWith('INSERT INTO')) {
            sqlCommand = sqlCommand.replace(/( into)/ui, '');
          }
        }

        let cmd = this.sentenceToCommand(s, new ATSDatabaseCommand(), [dbName, sqlCommand]);
        commands.push(cmd);
        break;
      }

      if (!found) {
        commands.push(this.sentenceToCommand(s));
      }
    }

    return commands;
  }

}

class TestResultAnalyzer {
  adjustResult(executionResult, abstractTestScripts) {
    const er = deepcopy(executionResult);

    for (let r of er.results || []) {
      let featureName = r.suite;

      for (let m of r.methods || []) {
        let ats = this.findAbstractTestCase(featureName, m.name, abstractTestScripts);

        if (!ats) {
          continue;
        }

        if (this.shouldAdjustMethodToPassed(ats, m)) {
          m.status = 'adjusted';

          if (undefined === er.total.adjusted) {
            er.total.adjusted = 1;
          } else {
            er.total.adjusted++;
          }

          if (!isNaN(er.total.failed) && er.total.failed > 0) {
            er.total.failed--;
          }
        }
      }
    }

    return er;
  }

  findAbstractTestCase(featureName, testCaseName, abstractTestScripts) {
    const name = testCaseName.indexOf('|') >= 0 ? testCaseName.split('|')[1].trim() : testCaseName;

    for (let ats of abstractTestScripts || []) {
      if (ats.feature.name !== featureName) {
        continue;
      }

      for (let tc of ats.testcases || []) {
        if (tc.name === name) {
          return tc;
        }
      }
    }

    return null;
  }

  shouldAdjustMethodToPassed(ats, methodResult) {
    return 'failed' === methodResult.status && ats.invalid;
  }

}

class FSDirSearcher {
  constructor(_fs, _promisify) {
    this._fs = _fs;
    this._promisify = _promisify;
  }

  async search(options) {
    const entryFilter = entry => {
      return entry.dirent.isDirectory() && options.regexp.test(entry.name);
    };

    const walkOptions = {
      fs: this._fs,
      followSymbolicLinks: true,
      throwErrorOnBrokenSymbolicLink: false,
      entryFilter: entryFilter,
      errorFilter: error => 'ENOTDIR' == error.code || 'ENOENT' == error.code,
      deepFilter: options.recursive ? undefined : entryFilter
    };

    const pWalk = this._promisify(fsWalk.walk);

    const entries = await pWalk(options.directory, walkOptions);
    return entries.map(e => e.path);
  }

}

function hasSomeOptionThatRequiresAPlugin(o) {
  return o.script || o.run || o.result;
}

function runApp(libs, options, listener) {
  const app = new App(libs.fs, libs.path, libs.promisify);
  return app.start(options, listener);
}
class App {
  constructor(_fs, _path, _promisify) {
    this._fs = _fs;
    this._path = _path;
    this._promisify = _promisify;
  }

  async start(options, listener) {
    var _options$scriptFile, _executionResult, _executionResult$tota, _executionResult2, _executionResult2$tot;

    const fs = this._fs;
    const path = this._path;
    const promisify = this._promisify;
    const fileHandler = new FSFileHandler(fs, promisify, options.encoding);
    let plugin;
    let isPluginLoaded = false;

    if (hasSomeOptionThatRequiresAPlugin(options) && options.plugin) {
      const dirSearcher = new FSDirSearcher(fs, promisify);
      const pluginFinder = new PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher);

      try {
        const all = await pluginFinder.find();
        const pluginData = await filterPluginsByName(all, options.plugin);

        if (!pluginData) {
          listener.announcePluginNotFound(options.plugin);
          return {
            success: false
          };
          ;
        }

        plugin = await loadPlugin(pluginData);
      } catch (err) {
        listener.showException(err);
        return {
          success: false
        };
      }

      if (!plugin) {
        listener.announcePluginCouldNotBeLoaded(options.plugin);
        return {
          success: false
        };
      } else {
        isPluginLoaded = true;
      }
    }

    if (!options.plugin && (options.script || options.run || options.result)) {
      listener.announceNoPluginWasDefined();
      return {
        success: false
      };
    }

    let hasErrors = false;
    let spec = null;
    listener.announceOptions(options);

    if (options.spec) {
      const compiler = new CompilerFacade(fs, promisify, listener, listener);

      try {
        [spec] = await compiler.compile(options);
      } catch (err) {
        hasErrors = true;
        listener.showException(err);
      }

      if (null === spec && options.file.length > 0) {
        return {
          success: !hasErrors
        };
      }
    }

    let abstractTestScripts = [];
    let generatedTestScriptFiles = [];
    let tseo;

    if (spec && options.script) {
      let docs = spec.docs;
      const atsGenerator = new AbstractTestScriptGenerator();
      abstractTestScripts = atsGenerator.generate(docs, spec);

      if (!!plugin.generateCode && abstractTestScripts.length > 0) {
        const startTime = Date.now();
        let errors = [];

        try {
          const r = await plugin.generateCode(abstractTestScripts, new TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory));
          generatedTestScriptFiles = (r == null ? void 0 : r.generatedFiles) || [];
          errors = (r == null ? void 0 : r.errors) || [];
        } catch (err) {
          hasErrors = true;
          listener.showException(err);
        }

        const durationMS = Date.now() - startTime;
        listener.showGeneratedTestScriptFiles(options.dirScript, generatedTestScriptFiles, durationMS);
        listener.showTestScriptGenerationErrors(errors);
      }
    }

    let executionResult;
    const shouldExecuteScripts = isPluginLoaded && !!plugin.executeCode && options.run && (((_options$scriptFile = options.scriptFile) == null ? void 0 : _options$scriptFile.length) > 0 || generatedTestScriptFiles.length > 0 || 'string' === typeof options.dirResult && options.dirResult != '');

    if (shouldExecuteScripts) {
      var _options$scriptFile2;

      const scriptFiles = ((_options$scriptFile2 = options.scriptFile) == null ? void 0 : _options$scriptFile2.length) > 0 ? options.scriptFile.join(',') : generatedTestScriptFiles.length > 0 ? generatedTestScriptFiles.join(',') : undefined;
      tseo = {
        dirScript: options.dirScript,
        dirResult: options.dirResult,
        file: scriptFiles || undefined,
        grep: options.scriptGrep || undefined,
        target: options.target || undefined,
        headless: options.headless || undefined,
        instances: options.instances || undefined
      };
      listener.announceTestScriptExecutionStarted();

      try {
        executionResult = await plugin.executeCode(tseo);
      } catch (err) {
        hasErrors = true;
        listener.announceTestScriptExecutionError(err);
      }

      listener.announceTestScriptExecutionFinished();
    }

    if (!hasErrors && (((_executionResult = executionResult) == null ? void 0 : (_executionResult$tota = _executionResult.total) == null ? void 0 : _executionResult$tota.failed) > 0 || ((_executionResult2 = executionResult) == null ? void 0 : (_executionResult2$tot = _executionResult2.total) == null ? void 0 : _executionResult2$tot.error) > 0)) {
      hasErrors = true;
    }

    if (options.result && !!plugin.defaultReportFile && !!plugin.convertReportFile) {
      let reportFile;

      if (!executionResult) {
        const defaultReportFile = path.join(options.dirResult, await plugin.defaultReportFile());

        if (!fs.existsSync(defaultReportFile)) {
          listener.announceReportFileNotFound(defaultReportFile);
          return {
            success: false,
            spec
          };
        }

        reportFile = defaultReportFile;
      } else {
        reportFile = executionResult.sourceFile;
      }

      if (reportFile) {
        listener.announceReportFile(reportFile);

        try {
          executionResult = await plugin.convertReportFile(reportFile);
        } catch (err) {
          hasErrors = true;
          listener.showException(err);
        }
      }
    }

    if (executionResult) {
      try {
        var _plugin, _plugin2, _reportedResult$total, _reportedResult$total2;

        const reportedResult = new TestResultAnalyzer().adjustResult(executionResult, abstractTestScripts);

        if (!!((_plugin = plugin) != null && _plugin.beforeReport)) {
          await plugin.beforeReport(reportedResult, tseo);
        }

        listener.showTestScriptAnalysis(reportedResult);
        const reporter = new JSONTestReporter(fileHandler);
        await reporter.report(reportedResult, {
          directory: options.dirResult,
          useTimestamp: false
        });

        if (!!((_plugin2 = plugin) != null && _plugin2.afterReport)) {
          await plugin.afterReport(reportedResult, tseo);
        }

        if (!hasErrors && ((reportedResult == null ? void 0 : (_reportedResult$total = reportedResult.total) == null ? void 0 : _reportedResult$total.failed) > 0 || (reportedResult == null ? void 0 : (_reportedResult$total2 = reportedResult.total) == null ? void 0 : _reportedResult$total2.error) > 0)) {
          hasErrors = true;
        }
      } catch (err) {
        hasErrors = true;
        listener.showException(err);
      }
    }

    return {
      success: !hasErrors,
      spec
    };
  }

}

function createPersistableCopy(source, defaultObject, useRelativePaths = false) {
  const unwantedProperties = ['debug', 'languageDir', 'appPath', 'processPath', 'isGeneratedSeed', 'realSeed', 'languageList', 'pluginList', 'pluginAbout', 'pluginInstall', 'pluginUninstall', 'pluginServe', 'headless', `dbList`, 'dbInstall', 'dbUninstall', 'databases', 'localeList', 'init', 'saveConfig', 'ast', 'verbose', 'stopOnTheFirstError', 'x', 'justSpec', 'justTestCase', 'justScript', 'justRun', 'justResult', 'tcSuppressHeader', 'help', 'about', 'version', 'newer'];
  const obj = Object.assign({}, source);

  if (obj.isGeneratedSeed) {
    unwantedProperties.push('seed');
  }

  if (useRelativePaths) {
    obj.directory = relative(obj.processPath, obj.directory);
    obj.dirResult = relative(obj.processPath, obj.dirResult);
    obj.dirScript = relative(obj.processPath, obj.dirScript);
  }

  for (const [k, d] of Object.entries(defaultObject)) {
    const o = obj[k];

    if (o === d || '' === o || '' === d) {
      delete obj[k];
    } else if (Array.isArray(o) && Array.isArray(d) && JSON.stringify(o) === JSON.stringify(d)) {
      delete obj[k];
    }
  }

  for (const p of unwantedProperties) {
    delete obj[p];
  }

  return obj;
}

function copyOptions(from, to) {
  const PARAM_SEPARATOR = ',';
  const errors = [];

  const isStringNotEmpty = text => isString(text) && text.trim() != '';

  const resolvePath = p => isAbsolute(p) ? p : resolve(to.processPath, p);

  const pathKeys = ['directory', 'dirScript', 'dirResult', 'config'];
  const lowerCased = ['plugin', 'language', 'encoding', 'pluginAbout', 'pluginInstall', 'pluginUninstall', 'pluginServe', 'dbInstall', 'dbUninstall'];
  const notTrimmed = ['tcIndenter'];
  const unsignedInt = ['instances', 'randomMinStringSize', 'randomMaxStringSize', 'randomTriesToInvalidValue', 'importance'];
  const assertBooleans = ['spec', 'testCase', 'script', 'run', 'result'];

  const addDashes = key => (1 === key.length ? '-' : '--') + key;

  for (let [k, v] of Object.entries(from)) {
    if (undefined === v) {
      continue;
    }

    if ('string' === typeof v) {
      if (assertBooleans.indexOf(k) >= 0) {
        const dashedK = addDashes(k);
        errors.push(`Option '${dashedK}' does not expect a value.`);
        continue;
      }

      if (v.startsWith('=')) {
        v = v.substr(1);
      }
    }

    if (Array.isArray(to[k])) {
      if ('string' === typeof v) {
        if (notTrimmed.indexOf(k) >= 0) {
          to[k] = v.split(PARAM_SEPARATOR);
        } else {
          to[k] = v.trim().split(PARAM_SEPARATOR);
        }
      } else if (Array.isArray(v)) {
        to[k] = [...v];
      } else {
        to[k] = v;
      }

      continue;
    }

    if (undefined === to[k]) {
      to[k] = v;
      continue;
    }

    if ('string' === typeof v) {
      if (notTrimmed.indexOf(k) >= 0) {
        to[k] = v;
      } else {
        to[k] = v.trim();
      }

      if (pathKeys.indexOf(k) >= 0) {
        to[k] = resolvePath(to[k]);
        continue;
      }

      if (lowerCased.indexOf(k) >= 0) {
        to[k] = to[k].toLowerCase();
        continue;
      }

      continue;
    }

    to[k] = v;

    if (unsignedInt.indexOf(k) >= 0) {
      const dashedK = addDashes(k);

      if (typeof to[k] !== 'number' && !/^[0-9]+$/.test(to[k])) {
        errors.push(`Option '${dashedK}' expects a number.`);
        continue;
      }

      to[k] = Math.trunc(Number(to[k]));

      if (to[k] < 0) {
        errors.push(`Option '${dashedK}' expects a number greater than or equal to zero.`);
        continue;
      }
    }
  }

  if (!to.plugin) {
    if (isStringNotEmpty(to.pluginAbout)) {
      to.plugin = to.pluginAbout;
    } else if (isStringNotEmpty(to.pluginInstall)) {
      to.plugin = to.pluginInstall;
    } else if (isStringNotEmpty(to.pluginUninstall)) {
      to.plugin = to.pluginUninstall;
    } else if (isStringNotEmpty(to.pluginServe)) {
      to.plugin = to.pluginServe;
    }
  }

  const justSpec = true === from.justSpec;
  const justTestCase = true === from.justTestCase;
  const justScript = true === from.justScript;
  const justRun = true === from.justRun;
  const justResult = true === from.justResult;

  if ([justSpec, justTestCase, justScript, justRun, justResult].filter(b => true === b).length > 1) {
    errors.push("Only one option with '--just' is allowed.");
  }

  const noTestCase = false === from.testCase;
  const noGenScript = false === from.script;
  const noRunScript = false == from.run || true === from.x;
  to.testCase = (!noTestCase || justTestCase) && !justSpec && !justScript && !justRun && !justResult;
  to.script = (!noGenScript || justScript) && !justSpec && !justTestCase && !justRun && !justResult;
  to.run = (!noRunScript || justRun) && !justSpec && !justTestCase && !justScript && !justResult;
  to.result = justResult;
  to.spec = justSpec || to.testCase || to.script;

  if (isString(from.combVariant)) {
    if (enumUtil.isValue(VariantSelectionOptions, from.combVariant)) {
      to.combVariant = from.combVariant;
    } else {
      errors.push("Option '--comb-variant' expects another value. See '--help'.");
    }
  }

  if (isString(from.combState)) {
    if (enumUtil.isValue(CombinationOptions, from.combState)) {
      to.combState = from.combState;
    } else {
      errors.push("Option '--comb-state' expects another value. See '--help'.");
    }
  }

  if (isNumber(from.combInvalid)) {
    const n = Number(from.combInvalid);

    if (n >= 0 && n <= 1) {
      to.combInvalid = from.combInvalid;
    } else {
      errors.push("Option '--comb-invalid' expects only 0 or 1 as numbers. See '--help'.");
    }
  } else if (isString(from.combInvalid)) {
    if (enumUtil.isValue(InvalidSpecialOptions, from.combInvalid)) {
      to.combInvalid = from.combInvalid;
    } else {
      errors.push("Option '--comb-invalid' expects another value. See '--help'.");
    }
  }

  if (isString(from.combData)) {
    if (enumUtil.isValue(CombinationOptions, from.combData)) {
      to.combData = from.combData;
    } else {
      errors.push("Option '--comb-data' expects another value. See '--help'.");
    }
  }

  fixInconsistences(to);
  return errors;
}

function fixInconsistences(to) {
  to.languageList = to.languageList && !to.help;
  to.pluginList = to.pluginList && !to.help;
  to.pluginAbout = to.pluginAbout && !to.pluginList;
  to.pluginInstall = to.pluginInstall && !to.pluginAbout && !to.pluginList;
  to.pluginUninstall = to.pluginUninstall && !to.pluginAbout && !to.pluginList;
  to.pluginServe = to.pluginServe && !to.pluginAbout && !to.pluginList;
  to.about = to.about && !to.help;
  to.version = to.version && !to.help;
  to.newer = to.newer && !to.help;
}

function makeAppOptions(appPath = __dirname, processPath = process.cwd()) {
  const languageDir = resolve(appPath, DEFAULT_DIR_LANGUAGE);
  const directory = resolve(processPath, DEFAULT_DIRECTORY);
  const dirScript = resolve(processPath, DEFAULT_DIR_SCRIPT);
  const dirResult = resolve(processPath, DEFAULT_DIR_RESULT);
  const o = {
    appPath,
    processPath,
    languageDir,
    recursive: true,
    directory,
    dirScript,
    dirResult,
    packageManager: 'npm',
    ignore: [],
    file: [],
    scriptFile: [],
    encoding: DEFAULT_ENCODING,
    extensionFeature: DEFAULT_EXTENSION_FEATURE,
    extensionTestCase: DEFAULT_EXTENSION_TEST_CASE,
    lineBreaker: DEFAULT_LINE_BREAKER,
    language: DEFAULT_LANGUAGE,
    spec: true,
    testCase: true,
    script: true,
    run: true,
    result: false,
    caseUi: DEFAULT_CASE_UI,
    tcIndenter: DEFAULT_TC_INDENTER,
    randomMinStringSize: DEFAULT_RANDOM_MIN_STRING_SIZE,
    randomMaxStringSize: DEFAULT_RANDOM_MAX_STRING_SIZE,
    randomTriesToInvalidValue: DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE,
    importance: DEFAULT_IMPORTANCE,
    combVariant: DEFAULT_VARIANT_SELECTION,
    combState: DEFAULT_STATE_COMBINATION,
    combInvalid: DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME,
    combData: DEFAULT_DATA_TEST_CASE_COMBINATION
  };
  return o;
}
function makeCliOnlyOptions(processPath) {
  return {
    config: resolve(processPath, DEFAULT_CONFIG)
  };
}
function makeAllOptions(appPath = __dirname, processPath = process.cwd()) {
  const obj = makeAppOptions(appPath, processPath);
  const cliOpt = makeCliOnlyOptions(processPath);

  for (const k in cliOpt) {
    obj[k] = cliOpt[k];
  }

  return obj;
}

async function allInstalledDatabases(baseDirectory, dirSearcher) {
  const options = {
    directory: baseDirectory,
    recursive: false,
    regexp: /database\-js\-(.+)$/
  };
  const directories = await dirSearcher.search(options);

  if (directories.length < 1) {
    return [];
  }

  const extractName = dir => options.regexp.exec(dir)[1];

  return directories.map(extractName);
}

async function installedDateLocales(baseDirectory, dirSearcher, path) {
  const options = {
    directory: path.join(baseDirectory, 'date-fns', 'locale'),
    recursive: false,
    regexp: /^[A-Za-z-]+$/
  };
  const directories = await dirSearcher.search(options);

  if (directories.length < 1) {
    return [];
  }

  const extractName = dir => /([A-Za-z-]+)$/.exec(dir)[1];

  return directories.map(extractName);
}

function parseArgs(args) {
  return parseWithGetOpts(args);
}

function parseWithGetOpts(inputArgs) {
  const options = makeGetOptsOptions();
  const unexpected = {};

  options['unknown'] = k => unexpected[k] = 1;

  const aliases = options.alias;
  const args = getopts(inputArgs, options);
  const allArgs = [];

  for (const k of Object.keys(args)) {
    if (unexpected[k]) {
      unexpected[k] = args[k];
      delete args[k];
    } else if (k !== '_') {
      allArgs.push(k);
    }
  }

  for (const [, v] of Object.entries(aliases)) {
    if ('string' === typeof v) {
      allArgs.push(v);
      delete args[v];
      continue;
    }

    for (const e of v || []) {
      allArgs.push(e);
      delete args[e];
    }
  }

  const input = args._;
  delete args["_"];
  return {
    input,
    flags: args,
    unexpected,
    allFlags: allArgs
  };
}

function makeGetOptsOptions() {
  const alias = {
    directory: 'd',
    dirScript: ['dir-script', 'o'],
    dirResult: ['dir-result', 'dir-output', 'O'],
    file: ['files', 'f'],
    ignore: 'i',
    scriptFile: ['script-file', 'script-files', 'F'],
    scriptGrep: ['script-grep', 'G'],
    config: 'c',
    saveConfig: 'save-config',
    language: 'l',
    languageList: 'language-list',
    localeList: 'locale-list',
    encoding: 'e',
    lineBreaker: 'line-breaker',
    extensionFeature: ['extension-feature', 'ext-feature'],
    extensionTestCase: ['extension-test-case', 'ext-test-case'],
    plugin: 'p',
    pluginAbout: ['plugin-about', 'plugin-info'],
    pluginInstall: 'plugin-install',
    pluginUninstall: 'plugin-uninstall',
    pluginServe: ['plugin-serve', 'S'],
    pluginList: 'plugin-list',
    target: ['targets', 'T'],
    headless: 'H',
    instances: 'I',
    dbInstall: 'db-install',
    dbUninstall: 'db-uninstall',
    dbList: 'db-list',
    stopOnTheFirstError: 'fail-fast',
    testCase: 'test-case',
    justSpec: 'just-spec',
    justTestCase: 'just-test-case',
    justScript: 'just-script',
    justRun: 'just-run',
    justResult: 'just-result',
    caseUi: 'case-ui',
    tcSuppressHeader: 'tc-suppress-header',
    tcIndenter: 'tc-indenter',
    randomMinStringSize: 'random-min-string-size',
    randomMaxStringSize: 'random-max-string-size',
    randomTriesToInvalidValue: 'random-tries',
    combVariant: 'comb-variant',
    combState: 'comb-state',
    combInvalid: 'comb-invalid',
    combData: 'comb-data',
    version: 'v'
  };
  const defaultValues = {
    recursive: true,
    seed: undefined,
    spec: true,
    testCase: true,
    script: true,
    run: true,
    result: true
  };
  const booleanKeys = ["debug", "recursive", "init", "saveConfig", "languageList", "localeList", "pluginList", "headless", "dbList", "verbose", "stopOnTheFirstError", "spec", "testCase", "script", "run", "result", "x", "justSpec", "justTestCase", "justScript", "justRun", "justResult", "tcSuppressHeader", "help", "about", "version", "newer"];
  return {
    alias,
    default: defaultValues,
    boolean: booleanKeys
  };
}

function helpContent() {
  const exeName = colors.magenta('concordia');
  return `
${colors.yellowBright('Usage:')} ${exeName} [<dir>] [options]

where <dir> is the directory that contains your specification files.

${colors.yellowBright('Options:')}

${colors.gray('Input directories and files')}

-d, --directory <value>                 Directory to search. Same as <dir>.
--no-recursive                          Disable recursive search.

-f, --file <"file1,file2,...">          Files to consider. Whether <dir> is
                                        informed, files are searched in it.

-i, --ignore <"file1,file2,...">        Files to ignore, when <dir> is informed.

${colors.gray('Output directories')}

-o, --dir-script                        Output directory for test scripts.
-O, --dir-result                        Output directory for reports and
                                        screenshots.

${colors.gray('Language and Locale')}

-l, --language <code>                   Set the default language.
                                        The default is "en" (english).
--language-list                         List available languages.

--locale-list                           List available locales.

${colors.gray('Plug-in')}

-p, --plugin [<name>]                   Plug-in to use.
-S, --plugin-serve [<name>]             Start a test server for a given plugin.
--plugin-list                           List installed plug-ins.
--plugin-install <name>                 Install a plug-in.
--plugin-uninstall <name>               Uninstall a plug-in.
--plugin-about [<name>]                 Show information about an installed
                                        plug-in.

-F, --script-file <"file1,file2,...">   Test script files to execute.
-G, --script-grep <"expression">        Expression to filter the test scripts to
                                        run. Some plug-ins may not support it.

-T, --target <"target1,target2,...">    Target browsers or platforms.
-H, --headless                          Enable headless execution (browsers).
                                        Some plug-ins may not support it.
-I, --instances                         Number of parallel instances to execute.

${colors.gray('Database support')}

--db-list                               List installed databases drivers.
--db-install <"db1,db2,...">            Install one or more database drivers.
--db-uninstall <"db1,db2,...">          Uninstall one or more database drivers.

${colors.gray('Configuration')}

--init                                  Init a guided, basic configuration.

-c, --config                            Configuration file to load.
                                        The default is ".concordiarc".

--save-config                           Save/overwrite a configuration file
                                        with other command line options.

${colors.gray('Processing and output')}

--verbose                               Show verbose output.

--no-spec                               Do not process specification files.
--no-test-case                          Do not generate test cases.
--no-script                             Do not generate test scripts.
-x, --no-run                            Do not run test scripts.

--just-spec                             Just process specification files.
--just-test-case                        Just generate test cases.
--just-script                           Just generate test scripts.
--just-run                              Just execute test scripts.
--just-result                           Just read the report file with the last
                                        execution results.

${colors.gray('Random generation')}

--seed <value>                          Random seed to use.
                                        The default is the current date and time.
--random-min-string-size <number>       Minimum random string size.
                                        The default is 0.
--random-max-string-size <number>       Minimum random string size.
                                        The default is ${DEFAULT_RANDOM_MAX_STRING_SIZE}.
--random-tries <number>                 Random tries to generate invalid values.
                                        The default is ${DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE}.

${colors.gray('Combination strategies')}

--comb-variant (random|first|fmi|all)
    Strategy to select variants to combine by their states:
      random  = random variant that has the state (default)
      first   = first variant that has the state
      fmi     = first most important variant that has the state
      all     = all variants that have the state

--comb-state (sre|sow|onewise|all)
    Strategy to combine states of a same variant:
      sre     = single random of each (default)
      sow     = shuffled one-wise
      ow      = one-wise
      all     = all

--comb-invalid (0|1|smart|random|all)
    How many input data will be invalid in each test case:
      0       = no invalid data
      1       = one invalid data per test case
      smart   = use algorithm to decide (default)
      random  = random invalid data per test case
      all     = all invalid

--comb-data (sre|sow|onewise|all)
    Strategy to combine data test cases of a variant:
      sre     = single random of each (default)
      sow     = shuffled one-wise
      ow      = one-wise
      all     = all

${colors.gray('Content generation format')}

--case-ui (camel|pascal|snake|kebab|none)
    String case to generate a UI Element locator when it is not defined.
    The default is "camel".

--tc-suppress-header                    Suppress header in generated
                                        Test Case files.
--tc-indenter <value>                   String used as indenter in generated
                                        Test Case files. The default is double
                                        spaces.

${colors.gray('Input formats and extensions')}

-e, --encoding <value>                  File encoding. The default is "utf8".
--line-breaker                          Character used for breaking lines.
--ext-feature                           File extension for Feature files.
                                        The default is ".feature".
--ext-test-case                         File extension for Test Case files.
                                        The default is ".testcase".

${colors.gray('Information')}

-v, --version                           Show current version.
--about                                 Show information about this application.
--help                                  Show this help.
--newer                                 Check for newer versions.

${colors.yellowBright('Examples')}

 $ ${exeName} features --language pt --plugin some-plugin --dir-script test --dir-result output
 $ ${exeName} --file "file1.feature,path/to/file2.feature" -l pt -p some-plugin
 $ ${exeName} --no-run --no-result
`;
}

const pluralS = (count, singular, plural) => {
  return 1 === count ? singular : plural || singular + 's';
};
class UI {
  constructor(_debugMode = false, _verboseMode = false) {
    this._debugMode = _debugMode;
    this._verboseMode = _verboseMode;
    this.symbolPointer = figures.pointerSmall;
    this.symbolItem = figures.line;
    this.symbolSuccess = logSymbols.success;
    this.symbolError = logSymbols.error;
    this.symbolWarning = logSymbols.warning;
    this.symbolInfo = logSymbols.info;
    this.colorSuccess = colors.greenBright;
    this.colorError = colors.redBright;
    this.colorCriticalError = colors.rgb(139, 0, 0);
    this.colorWarning = colors.yellow;
    this.colorDiscreet = colors.gray;
    this.highlight = colors.yellowBright;
    this.colorText = colors.white;
    this.colorCyanBright = colors.cyanBright;
    this.colorMagenta = colors.magentaBright;
    this.bgSuccess = colors.bgGreenBright;
    this.bgError = colors.bgRed;
    this.bgCriticalError = colors.bgRgb(139, 0, 0);
    this.bgWarning = colors.bgYellow;
    this.bgInfo = colors.bgBlackBright;
    this.bgHighlight = colors.bgYellowBright;
    this.bgText = colors.bgWhiteBright;
    this.bgCyan = colors.bgCyan;
  }

  clearLine() {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
  }

  write(...args) {
    process.stdout.write(args.join(' '));
  }

  writeln(...args) {
    process.stdout.write(args.join(' ') + '\n');
  }

  properColor(hasErrors, hasWarnings) {
    if (hasErrors) {
      return this.colorError;
    }

    if (hasWarnings) {
      return this.colorWarning;
    }

    return this.colorSuccess;
  }

  properBg(hasErrors, hasWarnings) {
    if (hasErrors) {
      return this.bgError;
    }

    if (hasWarnings) {
      return this.bgWarning;
    }

    return this.bgSuccess;
  }

  properSymbol(hasErrors, hasWarnings) {
    if (hasErrors) {
      return this.symbolError;
    }

    if (hasWarnings) {
      return this.symbolWarning;
    }

    return this.symbolSuccess;
  }

  setDebugMode(debugMode) {
    this._debugMode = debugMode;
  }

  success(...args) {
    this.writeln(this.symbolSuccess, ...args);
  }

  info(...args) {
    this.writeln(this.symbolInfo, ...args);
  }

  warn(...args) {
    this.writeln(this.symbolWarning, ...args);
  }

  error(...args) {
    this.writeln(this.symbolError, ...args);
  }

  showException(error) {
    if (this._debugMode) {
      this.error(error.message, this.formattedStackOf(error));
    } else {
      this.error(error.message);
    }
  }

  showHelp(content) {
    this.writeln(content);
  }

  showAbout({
    description,
    version,
    author,
    homepage
  }) {
    this.writeln(description, 'v' + version);
    this.writeln('Copyright (c)', author);
    this.writeln(homepage);
  }

  showVersion(version) {
    this.writeln(version);
  }

  announceOptions(options) {
    if (DEFAULT_LANGUAGE !== options.language) {
      this.info('Default language is', this.highlight(options.language));
    }

    if (!this._verboseMode) {
      return;
    }

    const disabledStr = this.highlight('disabled');

    if (!options.recursive) {
      this.info('Directory recursion', disabledStr);
    }

    if (!options.spec) {
      this.info('Specification compilation', disabledStr);
    } else {
      if (!options.testCase) {
        this.info('Test Case generation', disabledStr);
      }
    }

    if (!options.script) {
      this.info('Test script generation disabled', disabledStr);
    }

    if (!options.run) {
      this.info('Test script execution', disabledStr);
    }

    if (!options.result) {
      this.info('Test script results\' analysis', disabledStr);
    }

    if (!options.spec && !options.testCase && !options.script && !options.run && !options.result) {
      this.warn('Well, you have disabled all the interesting behavior. :)');
    }
  }

  announceUpdateAvailable(url, hasBreakingChange) {
    const fallback = (text, url) => {
      return url;
    };

    const link = terminalLink(url, url, {
      fallback: fallback
    });

    if (hasBreakingChange) {
      this.writeln(this.highlight('→'), this.bgHighlight('PLEASE READ THE RELEASE NOTES BEFORE UPDATING'));
      this.writeln(this.highlight('→'), link);
    } else {
      this.writeln(this.highlight('→'), 'See', link, 'for details.');
    }
  }

  announceNoUpdateAvailable() {
    this.info('No updates available.');
  }

  announceConfigurationFileAlreadyExists() {
    this.warn('You already have a configuration file.');
  }

  announcePluginNotFound(pluginName) {
    this.error(`A plugin named "${pluginName}" was not found.`);
  }

  announcePluginCouldNotBeLoaded(pluginName) {
    this.error(`Could not load the plugin: ${pluginName}.`);
  }

  announceNoPluginWasDefined() {
    this.warn('A plugin was not defined.');
  }

  announceReportFile(filePath) {
    this.info('Retrieving result from report file', this.highlight(filePath) + '...');
  }

  announceReportFileNotFound(filePath) {
    this.warn(`Could not retrieve execution results from "${filePath}".`);
  }

  drawLanguages(languages) {
    const highlight = this.highlight;
    this.info('Available languages:', languages.sort().map(l => highlight(l)).join(', '));
  }

  announceDatabasePackagesInstallationStarted(singular, command) {
    this.info(this.colorCyanBright('Installing database driver' + (singular ? '' : 's') + '...'));
    this.drawSeparationLine();
    this.info(this.highlight(command));
  }

  announceDatabasePackagesInstallationFinished(code) {
    this.drawSeparationLine();

    if (0 == code) {
      this.success(this.colorCyanBright('Installation successful.'));
    } else {
      this.warn(this.colorCyanBright('A problem occurred during installation.'));
    }
  }

  announceDatabasePackagesUninstallationStarted(singular, command) {
    this.info(this.colorCyanBright('Uninstalling database driver' + (singular ? '' : 's') + '...'));
    this.drawSeparationLine();
    this.info(this.highlight(command));
  }

  announceDatabasePackagesUninstallationFinished(code) {
    this.drawSeparationLine();

    if (0 == code) {
      this.success(this.colorCyanBright('Uninstallation successful.'));
    } else {
      this.warn(this.colorCyanBright('A problem occurred during uninstallation.'));
    }
  }

  drawDatabases(databases) {
    if (!databases || databases.length < 1) {
      this.info('No database drivers installed.');
      return;
    }

    const all = databases.map(d => this.highlight(d));
    this.info('Installed database drivers:', all.join(', '));
  }

  drawLocales(locales, localeType = '', note) {
    const locType = localeType ? (localeType || '') + ' ' : '';

    if (!locales || locales.length < 1) {
      this.info(`No ${locType}locales installed.`);
      return;
    }

    const all = locales.map(d => this.highlight(d));
    this.info(`Installed ${locType}locales:`, all.join(', '));

    if (note) {
      this.writeln(this.colorWarning('  Note: ' + note));
    }
  }

  showErrorSavingAbstractSyntaxTree(astFile, errorMessage) {
    this.error('Error saving', this.highlight(astFile), ': ' + errorMessage);
  }

  announceAbstractSyntaxTreeIsSaved(astFile) {
    this.info('Saved', this.highlight(astFile));
  }

  showGeneratedTestScriptFiles(scriptDir, files, durationMS) {
    const fileCount = files.length;
    const fileStr = pluralS(fileCount, 'file');
    this.info(this.highlight(fileCount), 'test script ' + fileStr, 'generated', this.formatDuration(durationMS));

    if (!this._verboseMode) {
      return;
    }

    const fallback = (text, url) => {
      return text;
    };

    for (const file of files) {
      const relPath = relative(dirname(scriptDir), file);
      const link = terminalLink(relPath, file, {
        fallback: fallback
      });
      this.success('Generated script', this.highlight(link));
    }
  }

  showTestScriptGenerationErrors(errors) {
    for (const err of errors || []) {
      this.showException(err);
    }
  }

  announceConfigurationFileSaved(filePath) {
    this.info('Saved', this.highlight(filePath));
  }

  announceCouldNotLoadConfigurationFile(errorMessage) {
    if (!this._verboseMode) {
      return;
    }

    const msg = 'Could not load the configuration file';

    if (this._debugMode) {
      this.warn(msg + ':', errorMessage);
      return;
    }

    this.warn(msg);
  }

  announceConfigurationFileLoaded(filePath, durationMS) {
    this.info('Configuration file loaded:', this.highlight(this._debugMode ? filePath : basename(filePath)), this._verboseMode ? this.formatDuration(durationMS) : '');
  }

  announceSeed(seed, generatedSeed) {
    this.info(generatedSeed ? 'Generated seed' : 'Seed', this.highlight(seed));
  }

  announceRealSeed(realSeed) {
    if (this._debugMode) {
      this.info('Real seed', this.highlight(realSeed));
    }
  }

  fileStarted(path) {
    if (!this._verboseMode) {
      return;
    }

    this.info('Compiling', this.highlight(path), '...');
  }

  fileFinished(path, durationMS) {}

  testCaseGenerationStarted(strategyWarnings) {
    if (!this._verboseMode) {
      return;
    }

    if (strategyWarnings.length > 0) {
      this.info('Test case generation started');
      this.showErrors(strategyWarnings, true);
    }
  }

  testCaseProduced(dirTestCases, filePath, testCasesCount, errors, warnings) {
    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;
    const successful = !hasErrors && !hasWarnings;
    const color = successful ? this.colorSuccess : this.properColor(hasErrors, hasWarnings);
    const symbol = successful ? this.symbolSuccess : this.properSymbol(hasErrors, hasWarnings);

    if (!this._verboseMode) {
      if (!hasErrors && !hasWarnings) {
        return;
      }

      this.writeln(color(symbol), this.highlight(relative(dirTestCases, filePath)) + ':');
      this.showErrors([...errors, ...warnings], true);
    } else {
      this.writeln(color(symbol), 'Generated', this.highlight(relative(dirTestCases, filePath)), 'with', this.highlight(testCasesCount), pluralS(testCasesCount, 'test case'));

      if (!hasErrors && !hasWarnings) {
        return;
      }

      this.showErrors([...errors, ...warnings], true);
    }
  }

  testCaseGenerationFinished(filesCount, testCasesCount, durationMs) {
    this.info(this.highlight(filesCount), 'test case', pluralS(filesCount, 'file'), 'generated,', this.highlight(testCasesCount), pluralS(testCasesCount, 'test case'), 'total', this.formatDuration(durationMs));
  }

  announceFileSearchStarted() {}

  announceFileSearchWarnings(warnings) {
    for (const w of warnings) {
      this.warn(w);
    }
  }

  announceFileSearchFinished(durationMS, filesFoundCount, filesIgnoredCount) {
    if (0 === filesFoundCount) {
      this.warn('No files found', this.formatDuration(durationMS));
      return;
    }

    if (!this._verboseMode) {
      return;
    }

    this.info(this.highlight(filesFoundCount), pluralS(filesFoundCount, 'file'), 'given,', this.highlight(filesIgnoredCount), 'test case', pluralS(filesIgnoredCount, 'file'), 'ignored', this.formatDuration(durationMS));
  }

  announceCompilerStarted(options) {
    if (!this._verboseMode && !this._debugMode) {
      return;
    }

    this.writeln(this.symbolInfo, 'Compiling...');
  }

  announceCompilerFinished(compiledFilesCount, featuresCount, testCasesCount, durationMS) {
    if (!this._verboseMode && !this._debugMode) {
      return;
    }

    this.clearLine();
    this.info(this.highlight(compiledFilesCount), pluralS(compiledFilesCount, 'file'), 'compiled:', this.highlight(featuresCount), 'feature', pluralS(featuresCount, 'file'), 'and', this.highlight(testCasesCount), 'testcase', pluralS(testCasesCount, 'file'), this.formatDuration(durationMS));
  }

  reportProblems(problems, basePath) {
    const genericErrors = problems.getGenericErrors();
    const genericWarnings = problems.getGenericWarnings();
    this.showErrors([...genericErrors, ...genericWarnings], false);

    const fallback = (text, url) => {
      return text;
    };

    const nonGeneric = problems.nonGeneric();

    for (const [filePath, problemInfo] of nonGeneric) {
      const hasErrors = problemInfo.hasErrors();
      const hasWarnings = problemInfo.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        return;
      }

      const color = this.properColor(hasErrors, hasWarnings);
      const symbol = this.properSymbol(hasErrors, hasWarnings);
      const text = relative(basePath, filePath);
      const link = terminalLink(text, filePath, {
        fallback: fallback
      });
      this.writeln(color(symbol), this.highlight(link));
      this.showErrors([...problemInfo.errors, ...problemInfo.warnings], true);
    }
  }

  drawPluginList(plugins) {
    if (plugins.length < 1) {
      this.info('No plugins found. Try to install a plugin with NPM.');
      return;
    }

    const highlight = this.highlight;
    const format = "%-15s";
    this.info('Installed Plugins:');

    for (let p of plugins) {
      this.writeln(' ');
      this.writeln(sprintf(format, '  Name'), highlight(p.name));
      this.writeln(sprintf(format, '  Version'), p.version);
      this.writeln(sprintf(format, '  Description'), p.description);
    }
  }

  drawSinglePlugin(p) {
    const format = "  - %-12s: %s";
    const formattedAuthors = p.authors.map((a, idx) => 0 === idx ? a : sprintf('%-17s %s', '', a));
    this.info(sprintf('Plugin %s', this.highlight(p.name)));
    this.writeln(sprintf(format, 'version', p.version));
    this.writeln(sprintf(format, 'description', p.description));
    this.writeln(sprintf(format, 'authors', formattedAuthors.join('\n')));
  }

  showMessagePluginNotFound(name) {
    this.error(sprintf('No plugins installed with the name "%s".', this.highlight(name)));
  }

  showMessagePluginAlreadyInstalled(name) {
    this.info(sprintf('The plugin %s is already installed.', this.highlight(name)));
  }

  showMessageTryingToInstall(name, tool) {
    this.info(sprintf('Trying to install %s with %s.', this.highlight(name), tool));
  }

  showMessageTryingToUninstall(name, tool) {
    this.info(sprintf('Trying to uninstall %s with %s.', this.highlight(name), tool));
  }

  showMessageCouldNoFindInstalledPlugin(name) {
    this.info(sprintf('Could not find installed plug-in %s. Please try again.', this.highlight(name)));
  }

  showMessagePackageFileNotFound(file) {
    this.warn(sprintf('Could not find %s. I will create it for you.', this.highlight(file)));
  }

  warnAboutOldPluginVersion() {
    this.warn(this.highlight('You are using an old plug-in version. Please update it or uninstall it and then install it again.'));
  }

  showPluginServeUndefined(name) {
    this.info(`Plug-in ${name} does not provide a serve command. Probably it does not need one.`);
  }

  showPluginServeStart(name) {
    this.info(sprintf('Serving %s...', this.highlight(name)));
  }

  showCommandStarted(command) {
    this.drawSeparationLine();
    this.writeln(' ', this.highlight(command));
  }

  showCommandFinished(code) {
    this.drawSeparationLine();

    if (0 === code) {
      this.success('Success');
    } else {
      this.error('Error during command execution.');
    }
  }

  drawSeparationLine() {
    const separationLine = '  ' + '_'.repeat(78);
    this.writeln(this.colorDiscreet(separationLine));
  }

  showError(e) {
    this.error(e.message);
  }

  announceTestScriptExecutionStarted() {
    this.info('Executing test scripts...');
    this.drawSeparationLine();
  }

  testScriptExecutionDisabled() {
    this.info('Script execution disabled.');
  }

  announceTestScriptExecutionError(error) {
    this.showException(error);
  }

  announceTestScriptExecutionFinished() {
    this.drawSeparationLine();
  }

  showTestScriptAnalysis(r) {
    if (!r || !r.total) {
      return;
    }

    let t = r.total;

    if (!t.tests) {
      this.info('No tests executed.');
      return;
    }

    this.info('Test execution result:\n');
    const passedStr = t.passed ? this.bgSuccess(t.passed + ' passed') : '';
    const failedStr = t.failed ? this.bgError(t.failed + ' failed') : '';
    const adjustedStr = t.adjusted ? this.bgCyan(t.adjusted + ' adjusted') : '';
    const errorStr = t.error ? this.bgCriticalError(t.error + ' with error') : '';
    const skippedStr = t.skipped ? t.skipped + ' skipped' : '';
    const totalStr = (t.tests || '0') + ' total';
    this.writeln('  ', [passedStr, adjustedStr, failedStr, errorStr, skippedStr, totalStr].filter(s => s.length > 0).join(', '), this.colorDiscreet('in ' + millisToString(r.durationMs, null, ' ')), "\n");

    if (0 == t.failed && 0 == t.error) {
      return;
    }

    const msgReason = this.colorDiscreet('       reason:');
    const msgScript = this.colorDiscreet('       script:');
    const msgDuration = this.colorDiscreet('     duration:');
    const msgTestCase = this.colorDiscreet('    test case:');

    for (let tsr of r.results) {
      for (let m of tsr.methods) {
        let e = m.exception;

        if (!e) {
          continue;
        }

        let color = this.cliColorForStatus(m.status);
        let sLoc = e.scriptLocation;
        let tcLoc = e.specLocation;
        this.writeln('  ', this.symbolItem, ' '.repeat(9 - m.status.length) + color(m.status + ':'), this.highlight(tsr.suite), this.symbolPointer, this.highlight(m.name), "\n", msgReason, e.message, "\n", msgScript, this.highlight(sLoc.filePath), '(' + sLoc.line + ',' + sLoc.column + ')', "\n", msgDuration, this.colorDiscreet(m.durationMs + 'ms'), "\n", msgTestCase, this.colorDiscreet(tcLoc.filePath, '(' + tcLoc.line + ',' + tcLoc.column + ')'), "\n");
      }
    }
  }

  cliColorForStatus(status) {
    switch (status.toLowerCase()) {
      case 'passed':
        return this.colorSuccess;

      case 'adjusted':
        return this.colorCyanBright;

      case 'failed':
        return this.colorError;

      case 'error':
        return this.colorCriticalError;

      default:
        return this.colorText;
    }
  }

  showErrors(errors, showSpaces) {
    if (!errors || errors.length < 1) {
      return;
    }

    const sortedErrors = sortErrorsByLocation(errors);
    const spaces = ' ';

    for (let e of sortedErrors) {
      const symbol = e.isWarning ? this.symbolWarning : this.symbolError;
      let msg = this._debugMode ? e.message + ' ' + this.formattedStackOf(e) : e.message;

      if (showSpaces) {
        this.writeln(spaces, symbol, msg);
      } else {
        this.writeln(symbol, msg);
      }
    }
  }

  formattedStackOf(err) {
    return "\n  DETAILS: " + err.stack.substring(err.stack.indexOf("\n"));
  }

  formatDuration(durationMs) {
    return this.colorDiscreet('(' + durationMs.toString() + 'ms)');
  }

}

function hasSomePluginAction(o) {
  return o.pluginList || !!o.pluginAbout || !!o.pluginInstall || !!o.pluginUninstall || !!o.pluginServe;
}

class GuidedConfig {
  async prompt(options) {
    const q = new ConcordiaQuestions();
    const questions = [q.directory(), q.language(), q.dirScript(), q.dirResult()];
    const hasPackageManager = options && !!options.packageManager;

    if (!hasPackageManager) {
      questions.push(q.packageManager());
    }

    questions.push(q.plugin());
    questions.push(q.pluginInstall());
    questions.push(q.databases());
    const r = await inquirer.prompt(questions);

    if (hasPackageManager) {
      r.packageManager = options.packageManager;
    }

    return r;
  }

}

class ConcordiaQuestions {
  language() {
    return {
      type: 'list',
      name: 'language',
      message: 'Which spoken language do you want to use in specification files?',
      choices: [{
        value: 'en',
        short: 'en',
        name: 'English (en)'
      }, {
        value: 'pt',
        short: 'pt',
        name: 'Portuguese (pt)'
      }]
    };
  }

  directory() {
    return {
      type: 'input',
      name: 'directory',
      message: 'Where do you store specification files?',
      default: './features'
    };
  }

  dirScript() {
    return {
      type: 'input',
      name: 'dirScript',
      message: 'Where do you want to save generated test scripts?',
      default: './test'
    };
  }

  dirResult() {
    return {
      type: 'input',
      name: 'dirResult',
      message: 'Where do you want to save logs, screenshots, and report files?',
      default: './output'
    };
  }

  packageManager() {
    const choices = packageManagers().map(tool => ({
      value: tool,
      short: tool,
      name: tool
    }));
    return {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: choices
    };
  }

  plugin() {
    return {
      type: 'list',
      name: 'plugin',
      message: 'Which plug-in do you want to use?',
      choices: [{
        value: 'codeceptjs-testcafe',
        short: 'codeceptjs-testcafe',
        name: 'CodeceptJS with TestCafé (web applications)'
      }, {
        value: 'codeceptjs-playwright',
        short: 'codeceptjs-playwright',
        name: 'CodeceptJS with Playwright (web applications)'
      }, {
        value: 'codeceptjs-webdriverio',
        short: 'codeceptjs-webdriverio',
        name: 'CodeceptJS with WebDriverIO (web applications)'
      }, {
        value: 'codeceptjs-appium',
        short: 'codeceptjs-appium',
        name: 'CodeceptJS with Appium (mobile or desktop applications)'
      }]
    };
  }

  pluginInstall() {
    return {
      type: 'confirm',
      name: 'pluginInstall',
      message: 'Do you want to download and install the plug-in?'
    };
  }

  databases() {
    const choices = [{
      value: 'database-js-csv',
      name: 'CSV files'
    }, {
      value: 'database-js-xlsx',
      name: 'Excel files'
    }, {
      value: 'database-js-firebase',
      name: 'Firebase databases'
    }, {
      value: 'database-js-ini',
      name: 'Ini files'
    }, {
      value: 'database-js-json',
      name: 'JSON files'
    }, {
      value: 'database-js-mysql',
      name: 'MySQL databases'
    }, {
      value: 'database-js-adodb',
      name: 'MS Access databases (Windows only)'
    }, {
      value: 'database-js-mssql',
      name: 'MS SQL Server databases'
    }, {
      value: 'database-js-postgres',
      name: 'PostgreSQL'
    }, {
      value: 'database-js-sqlite',
      name: 'SQLite'
    }];
    return {
      type: 'checkbox',
      name: 'databases',
      message: 'Which databases do you want to use in your tests?',
      choices: choices,
      pageSize: choices.length
    };
  }

}

async function processPluginOptions(options, pluginFinder, pluginController, drawer) {
  if (options.pluginList) {
    try {
      const plugins = sortPluginsByName(await pluginFinder.find());
      drawer.drawPluginList(plugins);
      return true;
    } catch (e) {
      drawer.showError(e);
      return false;
    }
  }

  if (!options.plugin || options.plugin.trim().length < 1) {
    drawer.showError(new Error('Empty plugin name.'));
    return false;
  }

  let pluginName = options.plugin;

  if (!pluginName.includes(PLUGIN_PREFIX)) {
    pluginName = PLUGIN_PREFIX + pluginName;
  }

  const all = await pluginFinder.find();
  let pluginData = await filterPluginsByName(all, pluginName, false);

  if (options.pluginInstall) {
    try {
      await pluginController.installByName(all, pluginData, pluginName);
    } catch (e) {
      drawer.showError(e);
    }

    return true;
  }

  if (!pluginData) {
    drawer.showMessagePluginNotFound(pluginName);
    return false;
  }

  if (options.pluginUninstall) {
    try {
      await pluginController.uninstallByName(pluginName);
    } catch (e) {
      drawer.showError(e);
    }

    return true;
  }

  if (options.pluginAbout) {
    drawer.drawSinglePlugin(pluginData);
    return true;
  }

  if (options.pluginServe) {
    try {
      await pluginController.serve(pluginData);
    } catch (e) {
      drawer.showError(e);
    }

    return true;
  }

  return true;
}

class PluginController {
  constructor(_packageManagerName, _pluginListener, _fileReader) {
    this._packageManagerName = _packageManagerName;
    this._pluginListener = _pluginListener;
    this._fileReader = _fileReader;
  }

  async installByName(all, pluginData, name) {
    if (pluginData) {
      let answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'install',
        message: 'Plug-in already installed. Do you want to try to install it again?'
      }]);

      if (!answer.install) {
        return;
      }
    } else {
      let mustGeneratePackageFile = false;

      try {
        const path = join(process.cwd(), PACKAGE_FILE);
        const content = await this._fileReader.read(path);

        if (!content) {
          mustGeneratePackageFile = true;

          this._pluginListener.showMessagePackageFileNotFound(PACKAGE_FILE);
        }
      } catch (err) {
        mustGeneratePackageFile = true;
      }

      if (mustGeneratePackageFile) {
        const cmd = makePackageInitCommand(this._packageManagerName);
        await this.runCommand(cmd);
      }
    }

    const command = makePackageInstallCommand(name, this._packageManagerName);
    const code = await this.runCommand(command);

    if (code !== 0) {
      return;
    }

    pluginData = await filterPluginsByName(all, name, false);

    if (!pluginData) {
      this._pluginListener.showMessageCouldNoFindInstalledPlugin(name);
    }
  }

  async uninstallByName(name) {
    const command = makePackageUninstallCommand(name, this._packageManagerName);
    return this.runCommand(command);
  }

  async serve(pluginData) {
    let serveCommand;
    const old = pluginData;
    const isOldPlugin = !!old.file;

    if (isOldPlugin) {
      serveCommand = old.serve;
    } else {
      const plugin = await loadPlugin(pluginData);

      if (!plugin) {
        throw new Error('Could not load the plug-in ' + ((pluginData == null ? void 0 : pluginData.name) || ''));
      }

      serveCommand = plugin.serveCommand;
    }

    if (!serveCommand) {
      this._pluginListener.showPluginServeUndefined(pluginData.name);

      return;
    }

    this._pluginListener.showPluginServeStart(pluginData.name);

    return this.runCommand(serveCommand);
  }

  async runCommand(command) {
    this._pluginListener.showCommandStarted(command);

    const code = await runCommand(command);

    this._pluginListener.showCommandFinished(code);

    return code;
  }

}

const {
  kebab
} = _case;
async function main(appPath, processPath) {
  let options = makeAllOptions(appPath, processPath);
  const args = parseArgs(process.argv.slice(2));
  const unexpectedKeys = args && args.unexpected ? Object.keys(args.unexpected) : [];

  if (unexpectedKeys.length > 0) {
    const simi = (a, b) => {
      const piecesA = a.split(/\-/g);
      const piecesB = b.split(/\-/g);
      const maxA = piecesA.length - 1;
      let i = 0;
      let totalDistance = 0.0000001;

      for (const pB of piecesB) {
        if (i > maxA) {
          break;
        }

        const pA = piecesA[i];

        if (pA === pB) {
          totalDistance += pA.length;
          ++i;
          continue;
        }

        let x = 0;
        const pALen = pA.length;
        const pBLen = pB.length;

        do {
          if (pA[x] === pB[x]) {
            totalDistance += 1;
          }

          ++x;
        } while (x < pALen && x < pBLen);

        totalDistance += pALen - distance(pA, pB);
        totalDistance *= i + 1;
        ++i;
      }

      return totalDistance;
    };

    const putDashes = t => '-'.repeat(1 === t.length ? 1 : 2) + t;

    const flags = Array.from(new Set(args.allFlags.map(kebab)));

    for (const k of unexpectedKeys) {
      const match = bestMatch(k, flags, simi);
      const dK = putDashes(k);

      if (!match) {
        console.log(`Invalid option: "${dK}"`);
        continue;
      }

      const dMatch = putDashes(match.value);
      console.log(`Invalid option: "${dK}". Did you mean "${dMatch}"?`);
    }

    return false;
  }

  const cliOptions = args.flags;

  try {
    const input = args.input;

    if (!cliOptions.directory && input && 1 === input.length) {
      cliOptions.directory = input[0];
    }

    const errors = copyOptions(cliOptions, options);

    for (const e of errors) {
      console.log(e);
    }

    if (errors.length > 0) {
      return false;
    }
  } catch (_unused) {}

  const ui = new UI(options.debug, options.verbose);

  if (options.help) {
    ui.showHelp(helpContent());
    return true;
  }

  const parentDir = path.dirname(appPath);
  const pkg = readPkgUp.sync({
    cwd: parentDir,
    normalize: false
  }).packageJson || {};

  if (options.about) {
    ui.showAbout({
      description: pkg.description || 'Concordia',
      version: pkg.version || '?',
      author: pkg.author['name'] || 'Thiago Delgado Pinto',
      homepage: pkg.homepage || 'https://concordialang.org'
    });
    return true;
  }

  if (options.version) {
    ui.showVersion(pkg.version || '?');
    return true;
  }

  const notifier = new UpdateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 12
  });
  notifier.notify();

  if (!!notifier.update) {
    const diff = semverDiff(notifier.update.current, notifier.update.latest);
    const hasBreakingChange = 'major' === diff;
    const url = 'https://github.com/thiagodp/concordialang/releases';
    ui.announceUpdateAvailable(url, hasBreakingChange);
  }

  if (options.newer) {
    if (!notifier.update) {
      ui.announceNoUpdateAvailable();
    }

    return true;
  }

  let fileOptions = null;

  try {
    const startTime = Date.now();
    const MODULE_NAME = 'concordia';
    const loadOptions = {
      stopDir: options.processPath
    };
    const explorer = cosmiconfig(MODULE_NAME, loadOptions);
    const cfg = await explorer.load(options.config);
    fileOptions = cfg.config;
    const optionsToConvert = [['dirResult', 'dirResults'], ['dirScript', 'dirScripts']];

    for (const [wanted, ...variations] of optionsToConvert) {
      for (const v of variations) {
        if (fileOptions[v]) {
          fileOptions[wanted] = fileOptions[v];
          delete fileOptions[v];
        }
      }
    }

    const durationMS = Date.now() - startTime;
    ui.announceConfigurationFileLoaded(cfg.filepath, durationMS);
  } catch (err) {
    ui.announceCouldNotLoadConfigurationFile(err.message);
  }

  const userOptions = Object.assign({}, fileOptions || {}, cliOptions || {});
  const errors = copyOptions(userOptions, options);

  for (const e of errors) {
    console.log(e);
  }

  if (errors.length > 0) {
    return false;
  }

  const fileHandler = new FSFileHandler(fs, promisify, options.encoding);

  if (options.init) {
    if (fileOptions) {
      ui.announceConfigurationFileAlreadyExists();
    } else {
      const pkgManagers = packageManagers();
      const lockFileIndex = pkgManagers.map(tool => path.join(processPath, makeLockFileName(tool))).findIndex(fileHandler.existsSync);
      let promptOptions;

      if (lockFileIndex >= 0) {
        promptOptions = {
          packageManager: pkgManagers[lockFileIndex]
        };
      }

      const guidedOptions = await new GuidedConfig().prompt(promptOptions);
      const errors = copyOptions(guidedOptions, options);

      for (const e of errors) {
        console.log(e);
      }

      options.saveConfig = true;
      const packages = guidedOptions.databases || [];

      if (packages.length > 0) {
        const cmd = makePackageInstallCommand(joinDatabasePackageNames(packages), options.packageManager);
        ui.announceDatabasePackagesInstallationStarted(1 === packages.length, cmd);
        let code;

        for (const pkg of packages) {
          const cmd = makePackageInstallCommand(pkg, options.packageManager);
          code = await runCommand(cmd);

          if (code !== 0) {
            break;
          }
        }

        ui.announceDatabasePackagesInstallationFinished(code);
      }
    }
  }

  if (options.saveConfig) {
    const writeF = promisify(fs.writeFile);
    const defaultOptions = makeAllOptions(appPath, processPath);
    const obj = createPersistableCopy(options, defaultOptions, true);
    const file = options.config;

    try {
      await writeF(file, JSON.stringify(obj, undefined, "\t"));
      ui.announceConfigurationFileSaved(file);
    } catch (err) {
      ui.showException(err);
    }
  }

  if (options.init && !options.pluginInstall) {
    return true;
  }

  if (options.dbInstall) {
    const databases = options.dbInstall.split(',').map(d => d.trim());
    const cmd = makePackageInstallCommand(joinDatabasePackageNames(databases), options.packageManager);
    ui.announceDatabasePackagesInstallationStarted(1 === databases.length, cmd);
    let code = 1;

    try {
      code = await runCommand(cmd);
    } catch (_unused2) {}

    ui.announceDatabasePackagesInstallationFinished(code);
    return 0 === code;
  }

  if (options.dbUninstall) {
    const databases = options.dbUninstall.split(',').map(d => d.trim());
    const cmd = makePackageUninstallCommand(joinDatabasePackageNames(databases), options.packageManager);
    ui.announceDatabasePackagesUninstallationStarted(1 === databases.length, cmd);
    let code = 1;

    try {
      code = await runCommand(cmd);
    } catch (_unused3) {}

    ui.announceDatabasePackagesUninstallationFinished(code);
    return 0 === code;
  }

  if (options.dbList) {
    let databases = [];

    try {
      const nodeModulesDir = path.join(processPath, 'node_modules');
      databases = await allInstalledDatabases(nodeModulesDir, new FSDirSearcher(fs, promisify));
      ui.drawDatabases(databases);
      return true;
    } catch (err) {
      ui.showError(err);
      return false;
    }
  }

  if (options.localeList) {
    try {
      const nodeModulesDir = path.join(processPath, 'node_modules');
      const dateLocales = await installedDateLocales(nodeModulesDir, new FSDirSearcher(fs, promisify), path);
      ui.drawLocales(dateLocales, 'date', 'Unavailable locales fallback to the their language. Example: "es-AR" fallbacks to "es".');
      return true;
    } catch (err) {
      ui.showError(err);
      return false;
    }
  }

  if (options.languageList) {
    try {
      ui.drawLanguages(availableLanguages);
    } catch (err) {
      ui.showException(err);
      return false;
    }

    return true;
  }

  if (hasSomePluginAction(options)) {
    const dirSearcher = new FSDirSearcher(fs, promisify);
    const pluginFinder = new PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher);
    const pluginController = new PluginController(options.packageManager, ui, fileHandler);

    try {
      await processPluginOptions(options, pluginFinder, pluginController, ui);
    } catch (err) {
      ui.showException(err);
      return false;
    }

    return true;
  }

  const {
    spec,
    success
  } = await runApp({
    fs,
    path,
    promisify
  }, options, ui);

  if (spec && options.ast) {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return value => {
        if ('object' === typeof value && value !== null) {
          if (seen.has(value)) {
            return;
          }

          seen.add(value);
        }

        return value;
      };
    };

    try {
      await fileHandler.write(options.ast, JSON.stringify(spec, getCircularReplacer(), "  "));
    } catch (e) {
      ui.showErrorSavingAbstractSyntaxTree(options.ast, e.message);
      return false;
    }

    ui.announceAbstractSyntaxTreeIsSaved(options.ast);
    return true;
  }

  return success;
}

const __dirname$1 = path__default.join(path__default.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");

process.on('uncaughtException', console.error);
process.on('SIGINT', () => {
  console.log('\nAborted. Bye!');
  process.exit(1);
});
main(__dirname$1, process.cwd()).then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
