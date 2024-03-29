import { KeywordDictionary } from '../KeywordDictionary';
import { LanguageDictionary } from '../LanguageDictionary';

export const englishKeywords: KeywordDictionary = {

    // Not available in Gherkin

    import: [ 'import' ],
    regexBlock: [ 'regexes', 'regular expressions' ],
    constantBlock: [ 'constants' ],
    variant: [ 'variant' ],
    variantBackground: [ 'variant background' ],
    testCase: [ 'test case' ],
    uiElement: [ 'ui element', 'user interface element' ],
    database: [ 'database' ],

    beforeAll: [ 'before all' ],
    afterAll: [ 'after all' ],
    beforeFeature: [ 'before feature' ],
    afterFeature: [ 'after feature' ],
    beforeEachScenario: [ 'before each scenario' ],
    afterEachScenario: [ 'after each scenario' ],

    i: [ 'I' ],
    is: [ 'is' ],
    with: [ 'with' ],
    valid: [ 'valid' ],
    invalid: [ 'invalid' ],
    random: [ 'random' ],
    from: [ 'from' ],

    tagGlobal: [ 'global' ],
    tagFeature: [ 'feature' ],
    tagScenario: [ 'scenario' ],
    tagVariant: [ 'variant' ],
    tagImportance: [ 'importance' ],
    tagIgnore: [ 'ignore' ],
    tagGenerated: [ 'generated' ],
    tagFail: [ 'fail' ],
    tagGenerateOnlyValidValues: [ 'generate-only-valid-values' ],

    // Also available in Gherkin

    language: [ 'language' ],

    feature: [ 'feature', 'story', 'user story' ],
    background: [ 'background' ],
    scenario: [ 'scenario' ],

    stepGiven: [ 'given that', 'given' ],
    stepWhen: [ 'when' ],
    stepThen: [ 'then' ],
    stepAnd: [ 'and', 'but' ],
    stepOtherwise: [ 'otherwise', 'when invalid', 'if invalid', 'whether invalid' ], // not in Gherkin

    table: [ 'table' ],
};


const englishDictionary: LanguageDictionary = {

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
                "not": [ "not", "no", "dont", "don't", "doesn't", "cannot", "shouldn't", "mustn't" ]
            },

            "ui_action": {
                "accept": [ "accept" ],
                "amOn": [ "am on", "am in", "am at", "visit" ],
                "append": [ "append", "add", "insert" ],
                "attachFile": [ "attach the file", "add the file", "insert the file", "overwrite the file" ],
                "cancel": [ "cancel", "reject", "dismiss" ],
                "check": [ "check" ],
                "clear": [ "clear" ],
                "click": [ "click", "activate", "trigger", "set" ],
                "close": [ "close", "leave" ],
                "connect": [ "connect" ],
                "disconnect": [ "disconnect" ],
                "doubleClick": [ "double click", "click twice" ],
                "drag": [ "drag" ],
                "fill": [ "fill", "enter", "inform", "type", "give" ],
                "hide": [ "hide" ],
                "install": [ "install" ],
                "maximize": [ "maximize" ],
                "move": [ "move" ],
                "mouseOut": [ "move the mouse out", "remove the mouse" ],
                "mouseOver": [ "put the mouse over", "place the mouse over", "set the mouse over" ],
                "open": [ "open", "navigate", "go" ],
                "press": [ "press", "hold", "hit" ],
                "pull": [ "pull", "extract" ],
                "refresh": [ "refresh", "reload", "update" ],
                "remove": [ "remove", "delete", "erase" ],
                "resize": [ "resize", "change the size" ],
                "rotate": [ "rotate" ],
                "rightClick": [ "right click" ],
                "run": [ "run", "execute", "launch" ],
                "saveScreenshot": [ "screenshot", "printscreen", "take a picture", "take a photo" ],
                "scrollTo": [ "scroll" ],
                "see": [ "see" ],
                "select": [ "select", "pick", "choose", "opt" ],
                "shake": [ "shake" ],
                "show": [ "show", "display", "present", "exhibit" ],
                "swipe": [ "swipe" ],
                "switch": [ "switch", "change to" ],
                "tap": [ "tap", "touch" ],
                "uncheck": [ "uncheck" ],
                "uninstall": [ "uninstall" ],
                "wait": [ "wait" ]
            },

            "ui_element_type": {
                "button": [ "button" ],
                "checkbox": [ "checkbox", "check" ],
                "cookie": [ "cookie" ],
                "cursor": [ "cursor", "mouse" ],
                "div": [ "div" ],
                "fileInput": [ "file input", "file", "attached file", "attachment" ],
                "frame": [ "frame", "iframe", "internal frame" ],
                "image": [ "image", "picture", "figure", "photo" ],
                "label": [ "label" ],
                "li": [ "list item", "li" ],
                "link": [ "link", "anchor" ],
                "ol": [ "ordered list", "ol" ],
                "paragraph": [ "paragraph" ],
                "radio": [ "radio", "radio button" ],
                "screen": [ "screen" ],
                "select": [ "select", "combo", "combobox", "combo box", "selection box" ],
                "slider": [ "slider" ],
                "span": [ "span" ],
                "tab": [ "tab" ],
                "table": [ "table" ],
                "text": [ "text" ],
                "textbox": [ "textbox", "input" ],
                "textarea": [ "textarea", "text area" ],
                "title": [ "title" ],
                "window": [ "window" ],
                "ul": [ "unordered list", "ul" ],
                "url": [ "url", "address", "ip", "domain", "website", "site" ]
            },

            "ui_property": {
                "backgroundColor": [ "background color" ],
                "color": [ "color", "foreground color" ],
                "height": [ "height" ],
                "width": [ "width" ]
            },

            "ui_action_option": {
                "alert": [ "alert" ],
                "app": [ "application", "app" ],
                "attribute": [ "attribute", "property" ],
                "checked": [ "checked" ],
                "class": [ "class" ],
                "command": [ "command" ],
                "confirm": [ "confirmation", "confirm" ],
                "cookie": [ "cookie" ],
                "currentActivity": [ "current activity" ],
                "currentPage": [ "current page", "page" ],
                "currentTab": [ "current tab" ],
                "database": [ "database" ],
                "device": [ "device", "phone", "tablet" ],
                "disabled": [ "disabled" ],
                "down": [ "down" ],
                "elements": [ "elements", "items" ],
                "enabled": [ "enabled" ],
                "field": [ "field" ],
                "file": [ "file" ],
                "hide": [ "hide" ],
                "hidden": [ "hidden" ],
                "inside": [ "inside", "in" ],
                "installed": [ "installed" ],
                "invisible": [ "invisible" ],
                "keyboard": [ "keyboard" ],
                "landscape": [ "landscape" ],
                "left": [ "left" ],
                "locked": [ "locked" ],
                "millisecond": [ "millisecond", "milliseconds" ],
                "mobileName": [ "mobile name" ],
                "native": [ "native" ],
                "newTab": [ "new tab" ],
                "next": [ "next" ],
                "notifications": [ "notifications", "notification", "notification panel" ],
                "otherTabs": [ "other tabs" ],
                "orientation": [ "orientation" ],
                "popup": [ "popup" ],
                "portrait": [ "portrait" ],
                "previous": [ "previous" ],
                "prompt": [ "prompt" ],
                "right": [ "right" ],
                "script": [ "script" ],
                "second": [ "second", "seconds" ],
                "slowly": [ "slowly", "leisurely" ],
                "style": [ "style" ],
                "tab": [ "tab" ],
                "unchecked": [ "unchecked" ],
                "uninstalled": [ "uninstalled" ],
                "unlocked": [ "unlocked" ],
                "up": [ "up" ],
                "value": [ "value" ],
                "visible": [ "visible" ],
                "web": [ "web" ],
                "window": [ "window" ],
                "with": [ "with", "containing", "contains" ]
            },

            "exec_action": {
                "execute": [ "have", "need", "require" ]
            }
        },


        "ui": {

            "ui_property": {
                "id": [ "id", "identification", "identificator", "locator", "selector" ],
                "type": [ "type" ],
                "editable": [ "editable" ],
                "datatype": [ "datatype", "data type" ],
                "value": [ "value" ],
                "minlength": [ "minlength", "min length", "minimum length" ],
                "maxlength": [ "maxlength", "max length", "maximum length" ],
                "minvalue": [ "minvalue", "min value", "minimum value" ],
                "maxvalue": [ "maxvalue", "max value", "maximum value" ],
                "format": [ "format" ],
                "required": [ "required", "mandatory", "obligatory", "necessary" ],
                "locale": [ "locale" ],
                "localeFormat": [ "locale format" ]
            },

            "ui_connector": {
                "in": [ "in", "included" , "is one of" ],
                "equalTo": [ "equal to", "same as", "similar to" ],
                "computedBy": [ "computed by" ]
            },

            "ui_connector_modifier": {
                "not": [ "not", "do not", "don't", "cannot", "can not", "can't" ]
            },

            "ui_data_type": {
                "string": [ "string", "text" ],
                "integer": [ "integer", "int" ],
                "double": [ "double", "float", "real", "floating point" ],
                "date": [ "date" ],
                "time": [ "time" ],
                "longtime": [ "longtime", "long time", "time with second", "time with seconds" ],
                "datetime": [ "datetime", "date and time" ],
                "longdatetime": [ "long datetime", "long date and time", "timestamp" ]
            },

            "bool_value": {
                "true": [ "true", "yes" ],
                "false": [ "false", "no" ]
            }
        },


        "database": {

            "db_property": {
                "type": [ "type" ],
                "path": [ "path", "name" ],
                "host": [ "host" ],
                "port": [ "port" ],
                "username": [ "username", "user" ],
                "password": [ "password" ],
                "charset": [ "charset", "encoding" ],
                "options": [ "options", "parameters" ]
            }

        }
    },



    "training": [
        {
            "intent": "testcase",
            "sentences": [
                "I {exec_action} the {state}",
                "I have {state}",
                "have {state}",
                "I {ui_action} in {ui_element}",
                "I {ui_action} in {ui_literal}",
                "I see {ui_element} inside {ui_element}",
                "I see {ui_element} inside {ui_literal}",
                "I see {ui_literal} inside {ui_element}",
                "I see {ui_literal} inside {ui_literal}",
                "I see {ui_literal} with {value}",
                "I see {ui_literal} with {number}",
                "I see {ui_literal} with {constant}",
                "I don't see url with {value}"
            ]
        },

        {
            "intent": "ui",
            "sentences": [
                "id is {value}",
                "maximum length is {number}",
                "value comes from the query {query}",
                "value comes is in {query}",
                "value comes is included in {query}",
                "value comes is on {query}",
                "value is {date}",
                "value is next year",
                "value is last year",
                "type is {ui_element_type}",
                "type is button"
            ]
        },

        {
            "intent": "database",
            "sentences": [
                "path is {value}",
                "name is {value}",
                "type is {value}",
                "port is {number}"
            ]
        }

    ]

};

export default englishDictionary;
